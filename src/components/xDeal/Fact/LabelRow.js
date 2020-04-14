import React, { Component } from 'react';
import { Row, Col, Form,Input } from 'antd';
import Ellipsis from 'lib/Ellipsis';
import _ from 'lodash';

export default class LabelRow extends Component {

  render() {
    const {label,content} = this.props;

    return (
      <Row style={{marginBottom: '10px'}}>
        <Col span={8} style={{background: '#ddd',color: 'black',height: '34px',lineHeight: '34px',textAlign: 'center'}}>
          {label}
        </Col>
        <Col span={16} style={{border: '1px solid #b0b0b0',borderLeft: '0px',height: '34px',lineHeight: '34px',paddingLeft: '10px'}}>
          <Ellipsis lines={1} tooltip>{Array.isArray(content) ? _.join(content,'、') : content}</Ellipsis>
        </Col>
      </Row>
    );
  }
}
