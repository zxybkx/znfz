import BasicLayout from './BasicLayout';
import UserLayout from './UserLayout';
import BlankLayout from './BlankLayout';
import {config} from 'utils';
import _ from 'lodash';
import {INTEGRATE} from '../constant';

const {layoutConfig} = config;

export default (props) => {
  if(INTEGRATE){
    return <BlankLayout  {...props}/>;
  }

  const {location} = props;
  let {pathname, query} = location;
  pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  let type = layoutConfig[pathname];
  if(!type){
    type = _.find(layoutConfig, (v, k) => new RegExp(k).test(pathname));
  }
  let layout;
  let showHeader = !(/\/xdeal.*\/document.*/.test(pathname));

  if(showHeader){
    showHeader = _.isEmpty(query.modal);
  }

  if(type){
    switch (type) {
      case 'user':
        layout = <UserLayout {...props}/>;
        break;
      case 'blank':
        layout = <BlankLayout showHeader={showHeader} {...props}/>;
      default:
        layout = <BlankLayout showHeader={showHeader} {...props}/>;
        break;
    }
    return layout;
  }else{
    return <BasicLayout {...props}/>;
  }
}
