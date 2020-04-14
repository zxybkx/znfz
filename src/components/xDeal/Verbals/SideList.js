import React, {PureComponent} from 'react';
import {Menu} from 'antd';
import _ from 'lodash';

const {SubMenu, Item} = Menu;

export default class SideList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: '',
      openKeys: [],
    };
    this.menuItemKeyIndex = 0;
    this.firstItem = null;
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.data, this.props.data)) {
      let params = {};
      if(this.props.location && !_.isEmpty(this.props.location.query)){
        params = this.props.location.query;
        const {type, owner, cs} = params;
        _.set(params, 'data', _.get(this.props.data, `${type}.${owner}.${cs}`, {}))
      }else{
        if(this.firstItem){
          params = this.firstItem;
        }
      }

      if(!_.isEmpty(params)){
        const {type, owner, cs, data, showAll} = params;
        let title = `${owner}的全部${type}`;
        let current = `${type}-${owner}`;
        let openKeys = [`${type}`];
        if(!showAll){
          title = `${owner}的${cs}${type}`;
          current = `${type}-${owner}-${cs}`;
          openKeys = [`${type}`, `${type}-${owner}`];
        }

        this.setState({current, openKeys}, ()=> {
          this.props.onClick && this.props.onClick({
            title, owner, type, cs, data
          })
        });
      }
    }
  }

  handleClick = ({item, key}) => {
    this.setState({
      current: key,
    }, () => {
      this.props.onClick && this.props.onClick(item.props);
    });
  };

  loopSubMenus = (type) => {
    const {data, showAll = true} = this.props;
    const menuData = data[type];
    if (showAll) {
      return menuData && _.map(menuData, (v, owner) => (
          <SubMenu key={`${type}-${owner}`} title={owner}>
            {
              _.map(v, (v1, cs) => {
                const title = `${owner}的${cs}${type}`;
                if (this.menuItemKeyIndex === 0) {
                  this.firstItem = {
                    title,
                    data: v1,
                    owner: owner,
                    type: type,
                    cs: cs,
                  };
                }
                this.menuItemKeyIndex ++;
                return <Item key={`${type}-${owner}-${cs}`}
                             type={type}
                             title={title}
                             owner={owner}
                             data={v1}
                             cs={cs}>{cs}</Item>;
              })
            }
          </SubMenu>
        ),
      )
    } else {
      return menuData && _.map(menuData, (v, owner) => {
        const title = `${owner}的全部${type}`;
        if (this.menuItemKeyIndex === 0) {
          this.firstItem = {
            title,
            owner: owner,
            type: type,
          };
        }
        this.menuItemKeyIndex++;
        return <Item key={`${type}-${owner}`}
                     type={type}
                     title={title}
                     owner={owner}>{owner}</Item>;
      })
    }
  };

  render() {
    this.menuItemKeyIndex = 0;
    return (
      <Menu theme="dark"
            mode="inline"
            onClick={this.handleClick}
            onOpenChange={(openKeys)=> this.setState({openKeys})}
            openKeys={this.state.openKeys}
            selectedKeys={[this.state.current]}>
        <SubMenu key='犯罪嫌疑人供述' title={'犯罪嫌疑人供述'}>
          {
            this.loopSubMenus('犯罪嫌疑人供述')
          }
        </SubMenu>
        <SubMenu key={'证人证言'} title={'证人证言'}>
          {
            this.loopSubMenus('证人证言')
          }
        </SubMenu>
        <SubMenu key={'被害人陈述'} title={'被害人陈述'}>
          {
            this.loopSubMenus('被害人陈述')
          }
        </SubMenu>
        <SubMenu key={'其它言辞证据'} title={'其它言辞证据'}>
          {
            this.loopSubMenus('其它言辞证据')
          }
        </SubMenu>
      </Menu>
    )
  }

}
