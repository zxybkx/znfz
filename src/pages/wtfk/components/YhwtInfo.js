import React, {PureComponent} from 'react';
import DataViewTable from 'lib/DataViewTable';
import moment from 'moment';
import ImageModal from './ImageModal';

export default class YhwtInfo extends PureComponent {

  render() {
    const {model} = this.props;
    return (
      <DataViewTable>
        <tbody>
        <tr>
          <th>问题类型</th>
          <td>{model.wtlx}</td>
          <th>提出时间</th>
          <td>{moment(model.createdDate).format('YYYY-MM-DD  HH:mm:ss')}</td>
        </tr>
        <tr>
          <th>提出人</th>
          <td>{model.createdName}</td>
          <th>问题描述</th>
          <td>{model.advice}</td>
        </tr>
        <tr>
          <th>系统截图</th>
          <td colSpan={3}>
            {model.has_snapshot ? <ImageModal src={model.jsondata.snapshot}><a>查看</a></ImageModal> : '无'}
          </td>
        </tr>
        </tbody>
      </DataViewTable>
    );
  }
}
