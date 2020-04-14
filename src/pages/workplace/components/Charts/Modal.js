import React, {Component} from 'react';
import {Modal, Form, Table} from 'antd';
import {PROCESS_MULTIPLE} from '../../../../constant/index';
import {routerRedux} from 'dva/router';
import {CONTEXT} from '../../../../constant/index';

class HsModal extends Component {

  hideModal = () => {
    this.props.hideModal();
  };

  onClick = (record) => {
    let path = '';
    const {dispatch, ajlb, buttonA} = this.props;
    if (record && record.bmsah) {
      let basePath = ajlb === 'ZJ' ? 'zcjd' : ajlb === 'GS' ? 'gsjd' : 'spjd';
      let dealPath = ajlb === 'SP' ? 'spdeal' : 'deal';
      dealPath = PROCESS_MULTIPLE.indexOf(record.ysay) >= 0 ? 'xdeal' : dealPath;
      path = `${basePath}/${dealPath}/${record.bmsah}`;
    }
    dispatch(routerRedux.push({pathname: path, query: {bmsah:record.bmsah,stage: record.ajlb, ysay: record.ysay}}));
  };

  render() {
    const columns = [
      {
        title: '案件名称',
        width: '35%',
        dataIndex: 'ajmc',
        key: 'ajmc',
      }, {
        title: '承办人',
        width: '10%',
        dataIndex: 'cbrxm',
        key: 'cbrxm',
      }, {
        title: '部门受案号',
        dataIndex: 'bmsah',
        key: 'bmsah',
        width: '35%',
      }, {
        title: '处理结果',
        dataIndex: 'cljg',
        key: 'cljg',
        width: '20%',
      }
    ];
    const {title, visible, detailData} = this.props;

    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={this.hideModal}
        width={'60%'}
        footer={null}
      >
        <Table columns={columns}
               dataSource={detailData}
               onRow={(record) => {
                 return {
                   onClick: () => {
                     this.onClick(record)
                   },
                 };
               }}
        />
      </Modal>
    );
  }
}

export default Form.create()(HsModal);
