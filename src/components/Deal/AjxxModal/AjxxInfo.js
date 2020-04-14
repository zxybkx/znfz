import React from 'react';
import moment from 'moment';
import styles from './AjxxInfo.less'

function Info({ajxx}) {

  return (
    <table className={styles.default}>
      <tbody>
      <tr>
        <th>部门受案号:</th>
        <td>{ajxx.bmsah}</td>
        <th>统一受案号:</th>
        <td>{ajxx.tysah}</td>
      </tr>
      <tr>
        <th>承办单位:</th>
        <td>{ajxx.cbdw_mc}</td>
        <th>创建时间</th>
        <td>{ajxx.cjsj ? moment(ajxx.cjsj).format('YYYY-MM-DD HH:mm') : ''}</td>
      </tr>
      <tr>
        <th>案件名称:</th>
        <td>{ajxx.ajmc}</td>
        <th>受理日期:</th>
        <td>{ajxx.slrq ? moment(ajxx.slrq).format('YYYY-MM-DD') : ''}</td>
      </tr>
      <tr>
        <th>案件类别:</th>
        <td>{ajxx.ajlb_mc}</td>
        <th>侦查机关</th>
        <td>{ajxx.zcjg_dwmc}</td>
      </tr>
      <tr>
        <th>移送文书文号:</th>
        <td>{ajxx.yswswh}</td>
        <th>移送案由</th>
        <td>{ajxx.ysay_aymc}</td>
      </tr>
      <tr>
        <th>承办人工号:</th>
        <td>{ajxx.cbrgh}</td>
        <th>承办人:</th>
        <td>{ajxx.cbr}</td>
      </tr>
      <tr>
        <th>承办部门:</th>
        <td>{ajxx.cbbm_mc}</td>
        <th>案情:</th>
        <td>{ajxx.aqzy}</td>
      </tr>
      <tr>
        <th>当前阶段:</th>
        <td>{ajxx.dqjd}</td>
        <th>到期日期:</th>
        <td>{moment(ajxx.dqrq).format('YYYY-MM-DD HH:mm')}</td>
      </tr>
      <tr>
        <th>办结日期:</th>
        <td>{ajxx.bjrq ? moment(ajxx.bjrq).format('YYYY-MM-DD HH:mm') : ''}</td>
        <th>移送意见:</th>
        <td>{ajxx.ysyj_mc}</td>
      </tr>
      </tbody>
    </table>
  );
}


export default Info;
