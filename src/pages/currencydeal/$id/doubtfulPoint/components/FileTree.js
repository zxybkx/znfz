import React, {PureComponent} from 'react';
import DocumentTree from 'components/xDeal/DocumentTree';

export default class FileTree extends PureComponent{

  buildTreeData = () => {
    const {data} = this.props;
    const root = {
      id: -1,
      name: '相关文书列表',
      children: [],
    };

    const jsondata = data.jsondata ? (data.jsondata.data || []) : [];
    jsondata && jsondata.forEach((d, idx) => {
      root.children.push({
        id: idx,
        name: d.title,
        data: d
      })
    });

    return [root];
  };

  onSelect = (data) => {
    if(data && data.id >= 0){
      this.props.onSelect && this.props.onSelect(data.id);
    }
  };

  render(){
    const {currentIndex} = this.props;
    const treeProps = {
      tree: this.buildTreeData(),
      expandRoot: false,
      expandKeys: [-1],
      expandAll: false,
      onSelect: this.onSelect,
      selectedKeys: [`node-${currentIndex}`]
    };

    return (
      <DocumentTree showSearch={false} {...treeProps}/>
    );
  }
}
