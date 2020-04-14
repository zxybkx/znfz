import React from 'react';
import {
  EditorState,
  draftToHtml,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  Modifier,
} from 'draft-js';
import {Spin, Modal, message} from 'antd';
import Immutable from 'immutable';
import {Editor} from 'react-draft-wysiwyg';
import {editorStateFromRaw} from 'lib/megadraft';
import uid from 'uuid/v4';
import _ from 'lodash';
import classnames from 'classnames';
import getLinkDecorator from './Decorators/MouseLink';
import styles from './index.less';
import CopyButton from './Controls/Copy';
import CutButton from './Controls/Cut';
import PasteButton from './Controls/Paste';
import SaveButton from './Controls/Save';
import ExportButton from './Controls/Export';
import ViewButton from './Controls/View';
import FullScreenButton from './Controls/FullScreen';
import ViewModal from './ViewModal';

const confirm = Modal.confirm;

class ReactEditor extends React.Component {

  rebuildDocData = (doc) => {
    let newBlock = [];
    let newEntityMap = {};
    let entityKey = 0;
    doc && doc.blocks && doc.blocks.map(block => {
      if (block.type === 'atomic') {
      } else if (block.type === 'unstyled') {
        block.entityRanges = [];
        newBlock.push(block);
      } else if (block.type === 'LinkedBlock') {
        block.entityRanges = [];
        const keys = block.data.keys;
        if (keys && keys.length > 0) {
          keys.map((key, idx) => {
            let offset = parseInt(key.offset);
            let length = parseInt(key.length);

            block.entityRanges.push({
              offset: offset,
              length: length,
              key: entityKey,
            });

            newEntityMap[entityKey] = {
              type: 'MouseLink',
              'mutability': 'MUTABLE',
              data: {
                key: key,
              },
            };
            entityKey++;
          });
        }
        newBlock.push(block);
      } else if (block.type === 'ListBlock') {
        let text = block.text;
        if (text.indexOf('@') >= 0) {
          let bs = text.split('@');
          bs.map(b => {
            newBlock.push({
              key: uid(8),
              text: b,
              type: 'unstyled',
            })
          })
        }
      } else {
        newBlock.push(block);
      }
    });

    doc.blocks = newBlock;
    doc.entityMap = newEntityMap;

    return doc;
  };

  constructor(props) {
    super(props);
    const doc = this.rebuildDocData(props.doc || require('./sample.js').default);
    const editorState = editorStateFromRaw(doc);
    this.state = {
      readOnly: false,
      fullScreen: false,
      modalVisible: false,
      editorState,
      loading: props.loading,
      scale: 1,
    };
    this.hasSave = false;
    this.hasChange = false;
    this.selectionBlock = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.doc, nextProps.doc)) {
      const doc = this.rebuildDocData(nextProps.doc || require('./sample.js').default);
      const editorState = editorStateFromRaw(doc);
      this.setState({
        loading: nextProps.loading,
        fullScreen: this.state.fullScreen,
        editorState,
      });
    }
  }

  onEditorStateChange = (editorState) => {
    this.hasChange = true;
    this.setState({
      editorState,
    });
  };

  saveData = () => {
    const content = convertToRaw(this.state.editorState.getCurrentContent());
    if (this.props.onSave) {
      this.props.onSave(content);
      this.hasChange = false;
      this.hasSave = true;
    }
  };

  exportData = () => {
    const content = convertToRaw(this.state.editorState.getCurrentContent());
    if (!this.hasSave) {
      message.warning('请先保存文档再导出。');
      return false;
    }
    if (this.props.onExport) {
      this.props.onExport(content)
    }
  };

  viewData = () => {
    this.setState({
      modalVisible: true,
      content: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()), null, 4),
    });
  };

  reloadData = () => {
    confirm({
      title: '确认重新生成文书吗?',
      content: '重新生成文书内容会将当前文书重置到初始状态，已经编辑保存的内容将丢失。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        if (this.props.onReload) {
          this.props.onReload();
        }
      },
      onCancel: () => {
      },
    });
  };

  toggleFullScreen = () => {
    this.setState({
      fullScreen: !this.state.fullScreen,
    })
  };

  cut = () => {
    const {editorState} = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const _contentState = Modifier.removeRange(contentState, selection);
    const _editorState = EditorState.createWithContent(_contentState);
    this.selectionBlock = this.getSelectionBlock();
    this.setState({editorState: _editorState});

  };

  copy = () => {
    this.selectionBlock = this.getSelectionBlock();
    this.selectionBlock.map(b => console.log(b.getText()))
  };

  paste = () => {
    const {editorState} = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const _contentState = Modifier.replaceWithFragment(contentState, selection, this.selectionBlock);
    const _editorState = EditorState.createWithContent(_contentState);
    this.setState({editorState: _editorState});

  };

  scale = (s) => {
    let {scale} = this.state;
    scale = scale + s;
    scale = _.round(scale, 1);
    scale = scale > 1.7 ? 1.7 : scale;
    scale = scale < 1 ? 1 : scale;
    this.setState({scale});
  };

  getSelectionBlock = () => {
    const {editorState} = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const blocks = contentState.getBlockMap();
    let lastWasEnd = false;
    const selectedBlock = blocks.skipUntil(block => {
      return block.getKey() === startKey;
    }).takeUntil(block => {
      const result = lastWasEnd;
      if (block.getKey() === endKey) {
        lastWasEnd = true;
      }
      return result;
    });

    return selectedBlock.map(block => {
      const key = block.getKey();
      let text = block.getText();

      let start = 0;
      let end = text.length;

      if (key === startKey) {
        start = selection.getStartOffset();
      }
      if (key === endKey) {
        end = selection.getEndOffset();
      }

      text = text.slice(start, end);
      const _block = block.merge({text: text, key: uid(8)});
      return _block;
    });

  };
  /**
   * Get current selected text
   * @param  {String} blockDelimiter
   * @return {Object}
   */
  getSelectionText = blockDelimiter => {

    const {editorState} = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const blocks = contentState.getBlockMap();

    let lastWasEnd = false;
    const selectedBlock = blocks.skipUntil(block => {
      return block.getKey() === startKey;
    }).takeUntil(block => {
      const result = lastWasEnd;

      if (block.getKey() === endKey) {
        lastWasEnd = true;
      }

      return result;
    });

    blockDelimiter = blockDelimiter || '\n';
    return selectedBlock.map(block => {
      const key = block.getKey();
      let text = block.getText();

      let start = 0;
      let end = text.length;

      if (key === startKey) {
        start = selection.getStartOffset();
      }
      if (key === endKey) {
        end = selection.getEndOffset();
      }

      text = text.slice(start, end);
      return text;
    }).join(blockDelimiter);
  };


  getCustomToolbar = () => {
    const toolbarCustomButtons = [
      <CutButton editorState={this.state.editorState} onClick={this.cut} config={{}}/>,
      <CopyButton editorState={this.state.editorState} onClick={this.copy} config={{}}/>,
      <PasteButton editorState={this.state.editorState} onClick={this.paste} config={{}}/>,
      <SaveButton editorState={this.state.editorState} onClick={this.saveData} config={{}}/>,
      <ExportButton editorState={this.state.editorState} onClick={this.exportData} config={{}}/>,
    ];
    const {customTools} = this.props;
    customTools && customTools.map(tool => {
      tool === 'view' && toolbarCustomButtons.push(<ViewButton editorState={this.state.editorState}
                                                               onClick={this.viewData} config={{}}/>);
    });
    toolbarCustomButtons.push(<FullScreenButton editorState={this.state.editorState} fullScreen={this.state.fullScreen}
                                                onClick={this.toggleFullScreen} config={{}}/>);

    return toolbarCustomButtons;
  };

  render() {

    const {scale} = this.state;

    const wrapperStyle = {
      background: '#eee',
      overflow: 'auto',
      height: '100%',
    };

    const editStyle = {
      minHeight: '297mm',
      height: 'auto',
      width: '210mm',
      background: '#fff',
      margin: `100px auto 50px`,
      padding: '4rem',
      boxShadow: '5px 5px 10px #ccc',
      fontSize: '18px',
      color: '#111'
    };

    const toolbarCustomButtons = this.getCustomToolbar();
    const customDecorators = [
      getLinkDecorator({linkClickHandler: this.props.linkClickHandler}),
    ];

    const blockRenderMap = Immutable.Map({
      'LinkedBlock': {
        element: 'div',
      },
      'ListBlock': {
        element: 'div',
      },
    });

    const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


    const {fullScreen, modalVisible, content} = this.state;
    const {fullScreen: initFullScreen} = this.props;

    return (
      <div
        className={classnames(styles.ReactEditor, fullScreen ? styles.fullScreen : '', initFullScreen ? styles.initFullScreen : '')}>
        <Spin style={{width: '100%', position: 'absolute', textAlign: 'center', marginTop: '60px'}}
              spinning={this.state.loading} tip="正在加载文档..." size="large"/>
        {
          !this.state.loading &&
          <Editor stripPastedStyles={true}
                  editorState={this.state.editorState}
                  onEditorStateChange={this.onEditorStateChange}
                  blockRenderMap={extendedBlockRenderMap}
                  customDecorators={customDecorators}
                  wrapperStyle={wrapperStyle}
                  editorStyle={editStyle}
                  localization={{locale: 'zh'}}
                  readOnly={this.state.readOnly}
                  toolbar={{
                    options: ['history', 'blockType', 'fontFamily', 'fontSize', 'inline', 'textAlign'],
                    fontFamily: {
                      options: ['Arial', 'Microsoft Yahei', '黑体', '宋体', 'sans-serif'],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    },
                    inline: {
                      options: ['bold', 'italic', 'underline', 'strikethrough'],
                    },
                    blockType: {
                      inDropdown: true,
                      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    },
                  }}
                  toolbarCustomButtons={toolbarCustomButtons}
          />
        }
        <ViewModal visible={modalVisible} content={content} close={() => {
          this.setState({modalVisible: false})
        }}/>
      </div>
    );
  }
}

export default ReactEditor;
