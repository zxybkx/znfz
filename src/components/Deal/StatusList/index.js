import React, {PureComponent, Fragment} from 'react';
import {Divider} from 'antd';
import Fontawesome from 'react-fontawesome';

export default class StatusList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      mainActive: ['全部'],
    };
  }

  onChange = (openKeys) => {
    this.setState({mainActive: openKeys || []})
  };

  handleButtonClick = (dqzt) => {
    this.props.clickHandler(dqzt);
    this.setState({
      mainActive: [dqzt],
    })
  };

  render() {
    const {list} = this.props;
    const {mainActive} = this.state;
    return (
      <div className={'cm-status'}>
        {
          list && list.map((zt, idx) => {
            return (
              <Fragment key={zt.title}>
              <a onClick={()=>this.handleButtonClick(zt.title)}
                 className={mainActive.indexOf(zt.title) !== -1 ? 'active' : ''}>
                <Fontawesome name={zt.title === '全部' ? 'profile' : zt.iconConfig.icon}
                             style={{color: zt.iconConfig.color}}/> {zt.title}({zt.count})
              </a>
              { idx !== list.length - 1 && <Divider type="vertical"/>}
              </Fragment>
            );
          })
        }
      </div>
    );
  }
}
