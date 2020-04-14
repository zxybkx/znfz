import React, {Component} from 'react';
import _ from 'lodash';

export default  class SingleRuleName extends Component {
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
  };

  render() {
    const {option, index} = this.props;

    return (
      <div>
          {
            option.text ?
              <a onClick={this.onClick} style={{cursor: 'pointer'}}><span style={{paddingLeft: '2rem'}}>{index+1}.{option.text}</span></a>
              :
              <p style={{marginBottom: 0,color: 'rgba(0,0,0,0.5)'}}>无对应规则内容</p>
          }
      </div>
    );
  }
}

