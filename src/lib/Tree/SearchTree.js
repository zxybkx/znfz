import React from 'react';
import {Tree, Input, Popover} from 'antd';
import Fontawesome from 'react-fontawesome';
import classnames from 'classnames';
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

const generateExpandKeys = (tree, expandRoot) => {
  let expandKeys = [];
  if (!expandRoot) return expandKeys;

  tree.map((node, index) => {
    expandKeys.push(`node-${node.id}`);
  });
  return expandKeys;
};

class SearchTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandRoot: props.expandRoot,
      showSearch: props.showSearch === undefined ? true : props.showSearch,
      expandedKeys: generateExpandKeys(props.tree, props.expandRoot),
      searchValue: '',
      autoExpandParent: true,
      treeData: props.tree,
      defaultSelectKeys: props.defaultSelectKeys ? props.defaultSelectKeys.map(key => `node-${key}`) : [],
    };
    generateList(props.tree);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      treeData: nextProps.tree,
      defaultSelectKeys: nextProps.defaultSelectKeys ? nextProps.defaultSelectKeys.map(key => `node-${key}`) : [],
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

  render() {
    const {showSearch, treeData, searchValue, expandedKeys, autoExpandParent, defaultSelectKeys} = this.state;
    const loop = data => data.map((item) => {
      const index = item.name.search(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const folderOpen = expandedKeys.filter((key) => key === `node-${item.id}`).length > 0;
      const title = index > -1 ? (
        <span>
                        {beforeStr}
          <span style={{color: '#f50'}}>{searchValue}</span>
          {afterStr}
                    </span>
      ) : <span>{item.name}</span>;
      if (item.children) {
        return (
          <TreeNode key={`node-${item.id}`} title={<span style={{fontWeight: 'bold'}}><Fontawesome
            className={classnames(styles.Icon, styles.Folder)}
            name={folderOpen ? "folder-open" : "folder"}/>{title}</span>} data={item}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      const popContent = item.description;
      if (popContent) {
        return <TreeNode key={`node-${item.id}`}
                         title={<Popover placement="right" content={popContent} title="详细信息"><Fontawesome
                           className={classnames(styles.Icon, styles.File)} name="file-image-o"/>{title}</Popover>}
                         data={item}/>;
      }
      return <TreeNode key={`node-${item.id}`}
                       title={<span><Fontawesome className={classnames(styles.Icon, styles.File)}
                                                 name="file-image-o"/>{title}</span>} data={item}/>;
    });

    return (
      <div className={styles.Tree}>
        {showSearch ? <Search style={{width: '99%'}} placeholder="查找..." onChange={this.onChange}/> : null}
        <Tree showLine
              onExpand={this.onExpand}
              deaultSelectKeys={defaultSelectKeys}
              defaultExpandedKeys={expandedKeys}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onSelect={this.onSelect}
        >
          {loop(treeData)}
        </Tree>
      </div>
    );
  }
}

export default SearchTree;
