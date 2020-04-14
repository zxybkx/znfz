import React, {PureComponent, Fragment} from 'react';
import classnames from 'classnames';
import {Spin, Button} from 'antd';
import _ from 'lodash';
import $ from 'jquery';
import qs from 'querystring';
import styles from './Frame.less';

export default class Frame extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      src: props.src,
      params: props.params,
      fullScreen: false,
      showHeader: false,
    };
  }

  componentDidMount() {
    this.iframe.onload = () =>{
      this.setState({loading: false, showHeader: true})
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      src: nextProps.src,
      params: nextProps.params,
    });
  }

  toggleFullScreen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({fullScreen: !this.state.fullScreen});
  };

  render() {
    const {src, params} = this.state;
    const {fixHeight, trigger, header} = this.props;
    const {fullScreen, loadText, showHeader} = this.state;

    return (
      <Fragment>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <div className={classnames(styles.default, fullScreen ? styles.fullScreen : '')}
             style={{height: fullScreen ? '98.5%' : fixHeight}}>
          <Spin style={{width: '100%', position: 'absolute', textAlign: 'center', marginTop: '60px'}}
                spinning={this.state.loading} tip={loadText || '正在加载...'}
                size="large"/>
          {
            showHeader && header
          }
          {
            trigger &&
            <span className={styles.trigger}>
              <Button type='ghost' className={styles.trigger}
                      icon={this.state.fullScreen ? 'shrink' : 'arrows-alt'}
                      onClick={this.toggleFullScreen}/>
            </span>
          }
          <iframe ref={c => this.iframe = c}
                  src={params && _.keys(params).length > 0 ? `${src}?${qs.stringify(params)}` : src}/>
        </div>
      </Fragment>
    );
  }
}
