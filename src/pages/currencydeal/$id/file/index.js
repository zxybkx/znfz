import React, {PureComponent} from 'react';
import {connect} from 'dva';
import FlowStep from 'components/currencydeal/FlowStep';
import Tools from 'components/currencydeal/Tools';
import File from 'components/xDeal/File';
import Authorized from 'utils/Authorized';
import {message} from "antd";

const {AuthorizedRoute} = Authorized;

@connect(({ global, znfz, zcjd, loading }) => ({
  global,
  znfz,
  zcjd,
}))
class Index extends PureComponent {

  onStepClick = (id) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'znfz/fillNLPData',
      payload: {
        bmsah: id,
      },
    }).then(() => {
      dispatch({
        type: 'znfz/reCalculate',
        payload: {
          bmsah: id,
        },
      });
    })
  };

  render() {
    const {dispatch, data,match, znfz,location: {query: {stage, ysay}}} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords, viewDocTree} = znfz;

    const flow = <FlowStep match={match}
                           dispatch={dispatch}
                           bmsah={id}
                           data={data}
                           stage={stage}
                           ysay={ysay}
                           ajxx={ajxx}
                           onStepClick={() => this.onStepClick(id)}
    />;
    const tools = <Tools stage={stage}
                         coords={coords}
                         dispatch={dispatch}
                         ajxx={ajxx}
                         docTree={viewDocTree}
    />;

    const side = [
      {
        "id": 1,
        "icon": "paper-clip",
        "tool": "element",
        "title": "要素提取",
        "show": true
      },
      {
        "id": 2,
        "icon": "tag",
        "tool": "marker",
        "title": "书签",
        "show": false
      },
      {
        "id": 3,
        "icon": "copy",
        "tool": "compare",
        "title": "捕诉合一",
        "show": false
      },
      {
        "id": 4,
        "icon": "desktop",
        "tool": "double",
        "title": "双屏",
        "show": true
      },
      {
        "id": 5,
        "icon": "gold",
        "tool": "Eyefinity",
        "title": "三屏",
        "show": true
      },
      {
        "id": 6,
        "icon": "appstore",
        "tool": "multi-screen",
        "title": "四屏",
        "show": true
      }
    ];
    const fileList = {
      dispatch, match, znfz, ajxx, stage, side, flow, tools, ysay,data
    };
    return (
      <File {...fileList}/>
    );
  }
}

@connect(({global, znfz, loading}) => ({
  global,
  znfz,
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Index {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
