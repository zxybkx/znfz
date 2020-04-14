import React, {Component, Fragment} from 'react';
import _ from 'lodash';
import ReactJson from 'react-json-view';
import {message, Button} from 'antd';
import styles from './OcrPreview.less';

export default class DocPreview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      txt: true,
    };
  }

  jsonClick = () => {

  };

  txtClick = () => {

  };


  render() {
    const {ocrData} = this.props;
    const {txt} = this.state;
    return (
      <div className={styles.DocPreview} tabIndex={-1}>
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <Button onClick={() => this.setState({txt: true}) } type='ghost'>
              TXT
            </Button>
            <Button onClick={() => this.setState({txt: false}) } type='ghost'>
              Json
            </Button>
          </div>
        </div>
        <div className={styles.Container}>
          <div>
            {
              txt ?
                ocrData && ocrData.content && ocrData.content.map((obj, idx) => {
                  return (
                    <p key={idx} style={{color: 'black'}}>
                      {
                        obj.map((o, i) => {
                          return (
                            <p key={i} style={{color: 'black'}}>
                              {o}
                            </p>
                          )
                        })
                      }
                    </p>
                  )
                })
                : <ReactJson src={ocrData}/>
            }
          </div>
        </div>
      </div>
    );
  }

}
