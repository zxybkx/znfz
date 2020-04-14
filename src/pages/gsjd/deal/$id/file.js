import React, {PureComponent} from 'react';
import {connect} from 'dva';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import File from 'components/xDeal/File';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;
const stage = 'GS';

class Index extends PureComponent {

  render() {
    const {dispatch, match, znfz,ysay} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords} = znfz;

    const flow = <FlowStep match={match}
                           dispatch={dispatch}
                           bmsah={id}
                           ajxx={ajxx}
                           stage={stage}/>;
    const tools = <Tools stage={stage}
                         coords={coords}
                         dispatch={dispatch}
                         ajxx={ajxx}
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
                      "icon": "desktop",
                      "tool": "Eyefinity",
                      "title": "三屏",
                      "show": true
                    },
                    {
                      "id": 6,
                      "icon": "desktop",
                      "tool": "multi-screen",
                      "title": "四屏",
                      "show": true
                    }
                  ];

    const fileList = {
      dispatch, match, znfz, ajxx, stage, side, flow, tools,ysay
    };

    return (
      <File {...fileList} />
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
