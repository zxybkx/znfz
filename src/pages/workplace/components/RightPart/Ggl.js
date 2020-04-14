import React from 'react';
import {Link} from 'dva/router';
import NoticeList from '../NoticeList';


export default class Ggl extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {dispatch, Topfile, Bottomfile} = this.props;

    return (
       <div></div>
    )
  }
}
