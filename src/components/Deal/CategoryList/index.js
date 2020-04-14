import React, {PureComponent} from 'react';
import {Dropdown, Menu} from 'antd';

export default class CategoryList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      mainActive: props.stage === 'SP' ? ['诉讼程序'] : ['程序'],
      subActive: ['全部'],
    };
  }

  onChange = (openKeys) => {
    this.setState({mainActive: openKeys || []})
  };

  handleButtonClick = (categoryName) => {
    this.props.clickHandler(1, categoryName);
    this.setState({
      mainActive: [categoryName]
    })
  };

  handleMenuClick = (categoryName, parent) => {
    if(!categoryName){
      return false;
    }
    let _categoryName = categoryName;
    let level = 2;
    if (categoryName === '全部') {
      _categoryName = parent;
      level = 1;
    }
    this.props.clickHandler(level, _categoryName);
    this.setState({
      mainActive: [parent],
      subActive: categoryName === '程序' || categoryName === '证据' || categoryName === '事实' ? ['全部'] : [categoryName],
    });
  };

  render() {
    const {categories} = this.props;
    const {mainActive, subActive} = this.state;
    return (
      <div className={'cm-categories'}>
        {
          categories && categories.map((main, i) => {
            const menu = (
              <Menu onClick={({key})=> this.handleMenuClick(key, main.categoryName)}>
                {
                  main && main.children && main.children.map((sub, i) => {
                    return <Menu.Item className={subActive.indexOf(sub.categoryName) !== -1 ? 'active' : ''}
                                      key={sub.categoryName}>{sub.categoryName}</Menu.Item>
                  })
                }
              </Menu>
            );

            return (
              <Dropdown.Button key={main.categoryName} placement="bottomCenter"
                               onClick={()=> this.handleButtonClick(main.categoryName)}
                               overlay={menu}
                               className={mainActive.indexOf(main.categoryName) !== -1 ? 'active' : ''}>
                {main.categoryName}
              </Dropdown.Button>
            );
          })
        }
      </div>
    );
  }
}
