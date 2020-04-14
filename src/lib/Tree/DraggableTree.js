import React from 'react';
import {Tree, Input} from 'antd';
import Fontawesome from 'react-fontawesome';
import classnames from 'classnames';
import _ from 'lodash';
import _ from 'lodash';
import styles from './Tree.less';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;


const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.id === key)) {
        parentKey = node.id;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

let dataList = [];
const generateList = (tree) => {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const key = `node-${node.id}`;
    const name = node.name;
    dataList.push({key, name});
    if (node.children) {
      generateList(node.children);
    }
  }
};

const loopExpand = (result, data) => data.map((item) => {
  if (item && item.children) {
    loopExpand(result, item.children)
  }
  result.push(`node-${item.id}`);
});

const generateExpandKeys = (tree, expandRoot, expandKeys, expandAll) => {
  let keys = [];
  if (expandRoot) {
    tree.map((node, index) => {
      keys.push(`node-${node.id}`);
    });
  }

  if (expandKeys) {
    expandKeys.map((k, i) => {
      if (expandAll) {
        let expandNode = tree.filter((node, index) => {
          return node.id === k;
        });
        loopExpand(keys, expandNode);
      } else {
        keys.push(`node-${k}`);
      }
    });
  }

  return keys;
};

class DraggableTree extends React.Component {
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
    generateList(props.tree);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      treeData: nextProps.tree,
      expandedKeys: [...this.state.expandedKeys, ...generateExpandKeys(nextProps.tree, this.state.expandRoot, this.state.initExpand, this.state.expandAll)],
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
    const expandedKeys = dataList.map((item) => {
      if (item.name.indexOf(value) > -1) {
        return getParentKey(item.key, this.state.treeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);

    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  onSelect = (selectedKeys, e) => {
    this.props.onSelect(e.node.props.data);
  };

  onDragStart = ({event, node}) => {
    event.dataTransfer.setData("node", JSON.stringify(node.props.data));
  };

  render() {

    const {treeData, searchValue, expandedKeys, autoExpandParent} = this.state;

    const filteredData = data => data.filter(item => item && item.name);

    const loop = data => data.map((item) => {
        const index = item.name.search(searchValue);
        const beforeStr = item.name.substr(0, index);
        const afterStr = item.name.substr(index + searchValue.length);
        const folderOpen = expandedKeys.filter((key) => key === `node-${item.id}`).length > 0;
        const title = index > -1 ? (
          <span>{beforeStr}
            <span style={{color: '#f50'}}>{searchValue}</span>
            {afterStr}
        </span>
        ) : <span>{item.name}</span>;
        if (item.children) {
          const isFile = item.isFile;
          return (
            <TreeNode key={`node-${item.id}`}
                      title={
                        <span style={{fontWeight: 'bold'}}>
                                      <Fontawesome
                                        className={classnames(styles.Icon, styles.Folder, item.children.length > 0 ? '' : styles.empty)}
                                        name={isFile ? "file-image-o" : (folderOpen ? "folder-open" : "folder")}/>
                          {title}
                                  </span>
                      }
                      data={item}>
              {loop(filteredData(item.children))}
            </TreeNode>
          );
        }

        const isProblem = item.isProblem;
        return <TreeNode key={`node-${item.id}`}
                         title={<span><Fontawesome className={classnames(styles.Icon, styles.File)}
                                                   name={isProblem ? "question-circle" : "file-image-o"}/>{title}</span>}
                         data={item}/>;
    });

    return (
      <div className={styles.Tree}>
        <Search style={{width: '99%'}} placeholder="查找..." onChange={this.onChange}/>
        <Tree showLine={true}
              onExpand={this.onExpand}
              defaultExpandedKeys={expandedKeys}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onSelect={this.onSelect}
              draggable={true}
              onDragStart={this.onDragStart}
        >
          {loop(treeData)}
        </Tree>
      </div>
    );
  }
}

export default DraggableTree;
