import React, {PureComponent} from 'react';
import DataViewTable from 'lib/DataViewTable';

export default class AjxxInfo extends PureComponent {

  render() {
    const {ajxx} = this.props;

    return (
      <DataViewTable>
        <tbody>
        <tr>
          <th>承办人</th>
          <td>{ajxx.cbr}</td>
          <th>案件名称</th>
          <td>{ajxx.ajmc}</td>
          <th>部门受案号</th>
          <td>{ajxx.bmsah}</td>
          <th>移送案由</th>
          <td>{ajxx.ysay_aymc}</td>
        </tr>
        </tbody>
      </DataViewTable>
    );
  }
}
