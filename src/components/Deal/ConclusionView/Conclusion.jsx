import React, {PureComponent} from 'react';
import {Row, Col, Card} from 'antd';
import styles from './Conclusion.less';
import SingleConclusion from './SingleConclusion';
import SingleRuleName from './SingleRuleName';


export default class Conclusion extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      col: 3,
    }
  }

  render() {
    const {dispatch, ajxx, stage, type} = this.props;
    let option;
    if (this.props.option == null) {
      option = [];
    } else {
      option = this.props.option;
    }

    return (
      <div>
        {
          type === '0' ?
            <Row className={styles.fact}>
              {
                option.map((obj, index) => {
                  return (
                    <Col key={index} span={24 / this.state.col} className={styles.factItem}
                         style={{borderBottom: '1px #efefef solid'}}>
                      {
                        obj.label ?
                          <SingleConclusion key={index} option={obj} index={index} dispatch={dispatch} ajxx={ajxx}
                                            stage={stage}/> :
                          null
                      }
                    </Col>
                  );
                })
              }
            </Row> :
            <Row className={styles.fact}>
              {
                option.map((obj, index) => {
                  return (
                    <Col key={index} span={24 / this.state.col} className={styles.factItem}
                         style={{padding: '1rem', borderBottom: '1px #efefef solid'}}>
                      {
                        obj.title ?
                          <SingleRuleName key={index} option={obj} index={index} dispatch={dispatch} ajxx={ajxx}
                                          stage={stage}/> :
                          null
                      }
                    </Col>
                  );
                })
              }
            </Row>
        }
      </div>
    );
  }
}

