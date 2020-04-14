import React, {Component, Fragment} from 'react';
import {Select, Tooltip} from 'antd';
import _ from 'lodash';

const Option = Select.Option;

export default class ConclusionSelect extends Component {

  render() {
    const {getFieldDecorator, object, initialValue, djl, xjlOptions, detailInitialValue} = this.props;
    return (
      <Fragment>
        {getFieldDecorator(`${object}-xjldata`, {
          initialValue: initialValue ? initialValue : djl
        })(
          <Select
            style={{width: '200px', display: initialValue ? djl === initialValue ? 'none' : 'block' : 'none'}}
          >
            {
              _.get(xjlOptions, djl, []).map((o) => {
                return (
                  <Option key={o}>
                    <Tooltip placement='left' title={o} tooltip>{o}</Tooltip>
                  </Option>
                )
              })
            }
          </Select>
        )}
        {djl === '构成其他罪名，提起公诉' ?
          <Fragment>
            {getFieldDecorator(`${object}-xjlDetail`, {
              initialValue: detailInitialValue ? detailInitialValue : []
            })(
              <Select
                mode="tags"
                tokenSeparators={[',']}
                style={{width: '200px', marginRight: '55px', border: '1px solid lightGrey', borderRadius: '5px'}}
              >
                <Option key={1}/>
              </Select>
            )}
          </Fragment>
          : ''}
      </Fragment>
    )
  }
}
