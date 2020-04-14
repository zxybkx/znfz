import React, {PureComponent} from 'react';
import {Modal, Icon, Button, Spin} from 'antd';
import _ from 'lodash';
import qs from 'querystring';
import styles from './FrameModal.less';

export default class Frame extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: true,
      src: '',
      params: {},
    };
  }

  componentDidMount() {
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation();
    this.setState({
      visible: true,
    });
    setTimeout(() => this.setState({loading: false}), 1500);
  };

  hideModelHandler = () => {
    this.setState({visible: false}, ()=> {
      this.props.onClose && this.props.onClose();
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      src: nextProps.src,
      params: nextProps.params,
    });
  }

  close = () => {
    this.setState({
      visible: false,
    }, ()=> {
      this.props.onClose && this.props.onClose();
    });
  };

  render() {
    const {title, icon, src, params} = this.props;
    const {visible} = this.state;

    return (
      <span>
            <span onClick={this.showModelHandler}>
              {this.props.children}
            </span>
            <Modal width='calc(100vw - 20px)'
                   className={styles.default}
                   title={
                     <span>
                       <span><Icon type={icon || 'form'}/> {title} </span>
                       <Button className="modal-close"
                               icon="close"
                               onClick={this.hideModelHandler}
                               type='ghost'>关闭</Button>
                     </span>
                   }
                   visible={visible}
                   maskClosable={false}
                   closable={false}
                   destroyOnClose
                   onCancel={this.hideModelHandler}
                   footer={null}>
              <Spin style={{width: '100%', position: 'absolute', textAlign: 'center', marginTop: '60px'}} spinning={this.state.loading} tip="正在加载..."
                    size="large"/>
                <iframe src={!_.isEmpty(params) ? `${src}?${qs.stringify(params)}` : src}/>
            </Modal>
      </span>
    );
  }
}
