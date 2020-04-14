import React from 'react';
import {Tree, Input, Icon} from 'antd';
import Fontawesome from 'react-fontawesome';
import classnames from 'classnames';
import styles from './index.less';
import _ from 'lodash';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

const generateExpandKeys = (tree, expandRoot, expandKeys, expandAll) => {
  let keys = [];
  if (expandRoot) {
    tree.map((node, index) => {
      keys.push(`node-${node.id}`);
    });
  }

  if (expandAll) {
    if (tree.length > 0) {
      tree[0].children.filter((node, index) => {
        keys.push(`node-${node.id}`);
      });
    }
  }
  return keys;
};

class DocumentTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initExpand: props.expandKeys,
      expandRoot: props.expandRoot,
      expandAll: props.expandAll,
      expandedKeys: generateExpandKeys(props.tree, props.expandRoot, props.expandKeys, props.expandAll),
      searchValue: '',
      autoExpandParent: true,
      treeData: props.tree,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      treeData: nextProps.tree,
      expandedKeys: [...generateExpandKeys(nextProps.tree, this.state.expandRoot, this.state.initExpand, this.state.expandAll)],
    })
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onChange = (e) => {
    const value = e.target.value;
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  };

  onSelect = (selectedKeys, e) => {
    this.props.onSelect(e.node.props.data);
  };

  onDragStart = ({event, node}) => {
    event.dataTransfer.setData('node', JSON.stringify(node.props.data));
  };

  renderTitle = (index, item, beforeStr, searchValue, afterStr) => {
    /**
     * visit === '1' && index > -1 || item.id === '1-1' 文件点击过且文件被搜索或文件是第一份  （蓝加红）
     * visit === '1' && !index > -1 || item.id === '1-1' 文件点击过但未被搜索或文件是第一份   （蓝）
     * visit === '2' && index > -1  文件摘录过且文件被搜索  （绿加红）
     * visit === '2' && !index > -1  文件摘录过且未被搜索   （绿）
     * ！visit === '1' && !visit === '2' && index > -1   文件没点击且没摘录，但被搜索  （红加normal）
     * ！visit === '1' && !visit === '2' && !index > -1   文件什么操作都没有  （normal）
     */
    if ((item.visit && item.visit === '1') || ((item && item.id === '1-1') && (item.visit && item.visit === '0'))) {  // //文件打开过 | 文件是第一份
      if (index > -1) {   // 文件被搜索
        return (
          <span>
            <span style={{color: 'blue'}}>{beforeStr}</span>
            <span style={{color: 'red'}}>{searchValue}</span>
            <span style={{color: 'blue'}}>{afterStr}</span>
          </span>
        )
      } else {
        return (
          <span style={{color: 'blue'}}>{item.name}</span>
        )
      }
    } else if (item.visit && item.visit === '2') { // 文件摘录过
      if (index > -1) {     // 文件被搜索
        return (
          <span>
            <span style={{color: '#58a62d'}}>{beforeStr}</span>
            <span style={{color: 'red'}}>{searchValue}</span>
            <span style={{color: '#58a62d'}}>{afterStr}</span>
          </span>
        )
      } else {
        return (<span style={{color: 'blue'}}>{item.name}</span>)
      }
    } else if (index > -1) {
      return (
        <span>
            {beforeStr}
            <span style={{color: 'red'}}>{searchValue}</span>
            {afterStr}
          </span>
      )
    } else {
      return (<span>{item.name}</span>)
    }
  };

  render() {
    const {treeData, searchValue, expandedKeys, autoExpandParent} = this.state;
    const filteredData = data => data.filter(item => item && item.name);
    const loop = data => data.map((item) => {
      const index = item.name.search(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const folderOpen = expandedKeys.filter((key) => key === `node-${item.id}`).length > 0;
      // const titleType = index > -1 ? item.visit && item.visit === '1' ? 'SearchAndClick' : item.visit && item.visit === '2' ? 'SearchAndZl' : 'search' : item.visit && item.visit === '1' ? 'click' : item.visit && item.visit === '2' ? 'zl' : 'noMark' ;

      const title = this.renderTitle(index, item, beforeStr, searchValue, afterStr);

      if (item.children) {
        const isFile = item.isFile;
        if (item.id === '0-1') {
          return (
            <TreeNode key={`node-${item.id}`}
                      title={
                        <span style={{fontWeight: 'bold'}}>
                  <Fontawesome
                    className={classnames(styles.Icon, styles.Folder, item.children.length > 0 ? '' : styles.empty)}
                    name={isFile ? 'file-image-o' : (folderOpen ? 'folder-open' : 'folder')}/>
                          {title}
                </span>
                      }
                      data={item}>
              {loop(filteredData(item.children))}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={`node-${item.id}`}
                      title={
                        <span style={{fontWeight: 'bold'}}>
                  <Fontawesome
                    className={classnames(styles.Icon, styles.Folder, item.children.length > 0 ? '' : styles.empty)}
                    name={isFile ? 'file-image-o' : (folderOpen ? 'folder-open' : 'folder')}/>
                          {title}
                </span>
                      }
                      data={item}>
              {loop(filteredData(item.children))}
            </TreeNode>
          );
        }
      }
      if (index > -1) {
        return (
          <TreeNode key={`node-${item.id}`}
                    title={
                      <span style={{color: 'inherit'}}>
                <Fontawesome className={classnames(styles.Icon, styles.File)} name="file-image-o"/>
                        {
                          _.map(this.props.wwcTitle, (o) => {
                            if (item.img === o) {
                              return (
                                <Icon type="exclamation-circle" key={item.name} style={{color: 'red', marginRight: 5}}/>
                              )
                            }
                          })
                        }
                        <span className="title">{title}</span>
              </span>
                    }
                    data={item}/>
        );
      }
    });

    return (
      <div className={styles.Tree}>
        <Search style={{width: '90%'}} placeholder="查找..." onChange={this.onChange}/>
        <div className={styles.treeNode}>
          <Tree showLine={true}
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={this.onSelect}
                selectedKeys={this.props.selectedKeys}
                onDragStart={this.onDragStart}
                draggable={true}
          >
            {loop(treeData)}
          </Tree>
        </div>

      </div>
    );
  }
}

export default DocumentTree;
