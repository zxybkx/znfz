import React, {PureComponent} from 'react';
import classnames from 'classnames';
import styles from './CategoryTab.less';


export default class CategoryTab extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      active: '程序',
    }
  }

  onTabClick = (key) => {
    this.setState({
      active: key
    }, ()=> {
      const {onTabClick} = this.props;
      onTabClick && onTabClick(key);
    });
  };

  render() {
    const {data} = this.props;
    const {active} = this.state;
    return (
      <div className={styles.default}>
        {
          data && data.map((o, i) => {
            return (
              <div key={o.title} className={classnames(styles.item, active === o.title ? styles.active : '')}>
                <a onClick={() => this.onTabClick(o.title)}>{o.title}</a>
              </div>
            )
          })
        }
      </div>
    );
  }
}
