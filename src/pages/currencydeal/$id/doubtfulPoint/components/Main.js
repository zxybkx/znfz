/**
 * 案件审查
 */
import React, {PureComponent} from 'react';
import _ from 'lodash';
import Ellipsis from 'lib/Ellipsis';
import DealForm from 'components/xDeal/DealForm';
import FileGrid from './FileGrid';
import styles from './main.less';

export default class Main extends PureComponent {

  render() {
    const {dispatch, match, ajxx, flfg, subProblemCurrent, reload, stage, facts, getFacts, ysay} = this.props;
    const head =
      <Ellipsis style={{display: 'inline', width: 'auto'}} length={60} tooltip>
        {`问题描述-${subProblemCurrent && subProblemCurrent.wtms ? subProblemCurrent.wtms + '材料如下：' : '材料如下：'}`}
      </Ellipsis>;

    return (
      <div className={styles.main}>
        <div className={styles.item}>
          <div className={styles.head}>{head}</div>
          <div className={styles.content}>
            <FileGrid data={subProblemCurrent}
                      loading={false}
                      title={subProblemCurrent && subProblemCurrent.wtms}
                      dispatch={dispatch}
                      match={match}
                      ajxx={ajxx}
                      facts={facts}
                      onClose={reload}
                      getFacts={getFacts}
                      ysay={ysay}
            />
          </div>
        </div>

        <div className={styles.item}>
          {/*<div className={styles.head}>处理</div>*/}
          <div className={styles.content}>
            <DealForm dispatch={dispatch}
                      stage={stage}
                      ajxx={ajxx}
                      tab={this.props.tab}
                      problem={subProblemCurrent}
                      reload={reload}
            />
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.head}>法律法规</div>
          <div className={styles.content}>
            {
              flfg && flfg.length > 0 ? flfg.map((o, i) => {
                return (
                  <div key={i}>
                    <p>{o.lawname}</p>
                    <p>{o.laworder}</p>
                    <p>{o.lawcontent}</p>
                  </div>
                )
              }) : '无'
            }
          </div>
        </div>
      </div>
    );
  }
}

