import React, {PureComponent} from 'react';
import _ from 'lodash';
import FormComponent from './FormComponent';

export default class Contents extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      importVisible: false,
      factSelect: false,
      path: '',
    }
  };

  componentWillReceiveProps(nextProps) {

  };

  save = (item, value) => {
    const _item = _.cloneDeep(item);
    const {form: {getFieldValue}} = this.props;
    if (value === undefined) {
      if (_item && _item.path) {
        const value = getFieldValue(_item.path);
        if (!_.isEmpty(value)) {
          _item.content = Array.isArray(value) ? value.join(',') : value;
          item.content = _item.content;
          delete _item.label;
          this.props.saveNLP && this.props.saveNLP(_item);
        }
      }
    } else {
      if (_item && _item.path) {
        if (_.isBoolean(value)) {
          value = value ? '是' : '否';
        }
        _item.content = Array.isArray(value) ? value.join(',') : value;
        item.content = _item.content;
        delete _item.label;
        this.props.saveNLP && this.props.saveNLP(_item);
      }
    }
  };

  render = () => {
    const {docType, type, data, dictionaries, importData, dropData, enumerate, names, facts, xyrJbxx, docNlp} = this.props;
    return <FormComponent data={data} type={type} docType={docType}
                          dictionaries={dictionaries}
                          importData={importData}
                          dropData={dropData}
                          enumerate={enumerate}
                          names={names}
                          facts={facts}
                          xyrJbxx={xyrJbxx}
                          docNlp={docNlp}
                          renameTab={this.props.renameTab}
                          getNLP={this.props.getNLP}
                          addNLP={this.props.addNLP}
                          deleteNLP={this.props.deleteNLP}
                          saveNLP={this.props.saveNLP}
                          ifSave={this.props.ifSave}
                          onMenuClick={this.props.onMenuClick}
                          onDropdownClick={this.props.onDropdownClick}/>
  }
}
