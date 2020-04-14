import React, {PureComponent} from 'react';
import _ from 'lodash';

export default  class SingleConclusion extends PureComponent {
  constructor(props) {
    super(props);
  };

  onClick = () => {
    const {dispatch, option, ajxx, stage} = this.props;
    const basePath = stage === 'ZJ' ? 'zcjd': 'gsjd';
    const keyid = _.join(_.result(option,"label"), '_');
    dispatch({
      type: `${basePath}/openResultViewModal`,
      payload: {
        stage: stage,
        bmsah: ajxx.bmsah,
        keyid: keyid
      }
    });
  }

  render() {
    const {option, index} = this.props;
    const num = option.label.length;

    return (
      <div>
        <label>{index+1}.{option.label[num-1]}:</label>
        {
          (option.label[num-1] == '死亡人数' || option.label[num-1] == '重伤人数') &&
          <label style={{marginLeft:'0.5rem'}}>{option.value + '人'}</label>
        }
        {
          option.label[num-1] == '是否造成公私财产直接损失30万元以上并无力赔偿' &&
          <label style={{marginLeft:'0.5rem'}}>{option.value + '万元'}</label>
        }
        <br/>
        <div style={{height: '3rem'}}>
          <a onClick={this.onClick} style={{cursor: 'pointer'}}><span style={{paddingLeft: '2rem',marginTop: '0.5rem'}}>{option.text || '未处理'}</span></a>
        </div>
      </div>
    );
  }
}

