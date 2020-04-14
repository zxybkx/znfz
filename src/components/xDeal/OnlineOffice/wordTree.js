/**
 * 文书推送modal
 */
import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import DocumentTree from '../DocumentTree';
import Table from './Table';

export default class TsModal extends Component {

  /**
   * 构建树
   */
  buildTreeData = (value) => {
    let treeNode = [];
    if (value) {
      let nodeMap = {};
      value.map(v => {
        const mlh = v.jzfmlh;
        let node = {};
        if (mlh === -1) {
          node = {
            name: v.jzmlmc,
            value: v.jzmlh,
            id: v.jzmlh,
          }
        } else {
          node = {
            name: v.jzmlmc,
            value: v.jzmlh,
            id: v.jzmlh,
          }
        }
        nodeMap[node.value] = node;
      });

      value.map(v => {
        let parent = nodeMap[v.jzfmlh];
        let node = nodeMap[v.jzmlh];
        if (parent) {
          if (!parent.children) {
            let nodel = {
              name: parent.name,
              value: parent.value,
              id: parent.id,
            };
            //parent.children = [nodel];
            parent.children = [];
          }
          parent.children.push(node);
        }

        if (v.jzfmlh === -1) {
          treeNode.push(node);
        }
      });
    }
    return treeNode;
  };

  render() {
    const {treeData, onFileSelect, match, code, info} = this.props;

    const FileTree = {
      tree: this.buildTreeData(treeData),
      expandRoot: [],
      showSearch: false,
      showIcon: false,
      onSelect: onFileSelect,
    };


    const selectList = {
      selectData: this.props.selectData,
      match: match,
      onClick: this.props.onClick,
      info
    };

    //code=1 公用文书 code=2 非公用文书多条配置
    const modalContent = code === 1 ? <DocumentTree {...FileTree}/> : code === 2 ? <Table {...selectList}/> : '';
    const modalWidth = code === 1 ? '30%' : code === 2 ? '40%' : '';

    return (
      <Modal
        title={this.props.title}
        visible={this.props.visible}
        destroyOnClose={true}
        bodyStyle={{padding: '0px 24px'}}
        footer={
          <div>
            {
              info === '' ? '' : <span style={{color: 'red', float: 'left'}}>{info}</span>
            }
            <Button size='small' onClick={this.props.onCancel}>取消</Button>
            <Button size='small' type='primary' onClick={this.props.onOk}>确定</Button>
          </div>

          }
        closable={false}
        >
        <DocumentTree {...FileTree}/>
      </Modal>
    )
  }
}
