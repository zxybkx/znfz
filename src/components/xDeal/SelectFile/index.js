import React, {Component} from 'react';
import {Button, Row, Col} from 'antd';
import styles from './index.less';

export default class FilePhoto extends Component {
  render() {
    const {source, stage} = this.props;
    let wsmc;
    stage === 'GS' ? wsmc = '起诉意见书' : wsmc = '提请批准逮捕书';
    return (
      <div>
        <Row>
          <Col span={12} offset={1}>
            <div >
              <span className={styles.txt}>{'该案件有多份'+ wsmc + ',请选择其中一份' }</span>
            </div>
          </Col>
        </Row>
        <div>
          <Row type="flex" align="middle">
            {
              source.map((item, index) => {
                return (
                  <Col span={10} offset={1} key={index}>
                    <div className={styles.contain}>
                      <div className={styles.default} style={{textAlign: 'center'}}>
                        <img src={`/dzws/${item.image}`}
                             ref={c => this.img = c}
                             style={{width: '90%'}}
                        />
                      </div>
                      <Button
                        type="primary"
                        className={styles.selectBtn}
                        onClick={() => this.props.onClick(item)}
                      >
                        选择文书
                      </Button>
                    </div>
                  </Col>
                )
              })
            }
          </Row>
        </div>
      </div>
    )
  }
}
