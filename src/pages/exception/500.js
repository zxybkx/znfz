import React, {createElement} from 'react';
import { Link } from 'dva/router';
import { Button } from 'antd';
import Exception from 'lib/Exception';

export default () => (
  <Exception type="500"
             style={{ minHeight: 500, height: '80vh' }}
             actions={createElement(Link, {
               to: '/',
               href: '/',
             }, <Button type="primary">返回首页</Button>)} />
);
