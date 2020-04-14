import React, {PureComponent} from 'react';

const rebuildPageData = (source) => {
  source = source || [];

  let pageData = [];
  source.map((page) => {
    if (!page || !page.image || page.image === "null" || page.image === "") {
      return;
    }
    const index = pageData.findIndex(n => n.image === page.image);
    if (index < 0) {
      let p = {
        image: page.image,
        pos: [],
      };
      if (page.pos && page.pos.length > 0 && !(/^0\s0\s.+$/.test(page.pos))) {
        p.pos.push(page.pos);
      }
      pageData.push(p);
    } else {
      if (page.pos && page.pos.length > 0 && !(/^0\s0\s.+$/.test(page.pos))) {
        pageData[index].pos.push(page.pos);
      }
    }
  });

  return pageData;
};

const buildPages = (source) => {
  if (source === null || source === undefined) {
    return [{image: ''}];
  }
  const pageData = rebuildPageData(source);
  const pages = pageData.map((page, index) => {
    return {
      id: `img-${index}`,
      image: page.image,
      pos: page.pos,
    };
  });

  return pages;
};

class ImageItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: props.page,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      page: nextProps.page,
    });
  }

  componentDidUpdate() {
  }

  componentDidMount() {
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <img ref={this.state.page.id} src={this.state.page.image} style={{width: '100%'}}/>
      </div>
    );
  }
}

export default class ImagePreview extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      pages: buildPages(props.source),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      pages: buildPages(nextProps.source),
    });
  }

  render() {
    return (
      <div style={{width: '100%', position: 'relative'}}>
        {
          this.state.pages.map((page, index) => {
            return (
                <ImageItem key={index} page={page}/>
            );
          })
        }
      </div>
    );
  }

}
