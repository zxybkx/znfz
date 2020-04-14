import React, {PureComponent} from 'react';
import {Form, Button, Input} from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.less';

const {Search} = Input;

@Form.create()
export default class MySearch extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      clearVisible: false,
    }
  }

  onChange = (e) =>{
    this.setState({clearVisible: !_.isEmpty(e.target.value)});
  };

  onSearch = (value) => {
    if(!_.isEmpty(value)){
      this.props.onSearch && this.props.onSearch(value);
    }
  };

  onClear = ()=> {
    this.setState({
      clearVisible: false,
    },()=> {
      const {form: {setFieldsValue}} = this.props;
      setFieldsValue({searchKey: ''});
      this.props.onSearch && this.props.onSearch('');
    })
  };

  render(){
    const {form: {getFieldDecorator}} = this.props;
    return (
      <div className={styles.default}>
        <Button className={classnames(styles.clear, this.state.clearVisible ? '' : styles.hidden)} type={'ghost'} shape={'circle'} icon={'close'} onClick={this.onClear}/>
        {
          getFieldDecorator('searchKey', {})(
            <Search className={styles.search} placeholder={'输入关键字查询'} onSearch={value => this.onSearch(value)} onChange={value => this.onChange(value)} />
          )
        }
      </div>
    )
  }
}
