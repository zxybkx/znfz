import React, { PureComponent,Fragment} from 'react';
import DataViewTable from 'lib/DataViewTable';

const cwlx = {
  A: '规则问题',
  B: '识别问题',
  C: '其它问题',
};

const zbjg = {
  A: '正确',
  B: '错误',
};

export default class XtwtInfo extends PureComponent {

  render() {
    const {model} = this.props;
    return (
      <DataViewTable>
        <tbody>
        <tr>
          <th>提出人</th>
          <td>{model.createdName}</td>
          <th>所在单位</th>
          <td>{model.cbdw_mc}</td>
        </tr>
        <tr>
          <th>对应分类</th>
          <td>{model.yjfl}</td>
          <th>对应规则</th>
          <td>{model.gzmc}</td>
        </tr>
        <tr>
          <th>甄别结果</th>
          <td>{zbjg[model.zbjg]}</td>
          {
            model.cwlx ?
              <Fragment>
                <th>错误类型</th>
                <td>{cwlx[model.cwlx]}</td>
              </Fragment> : null
          }
        </tr>
        </tbody>
      </DataViewTable>
    );
  }
}

