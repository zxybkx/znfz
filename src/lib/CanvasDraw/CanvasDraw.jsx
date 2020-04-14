import React, { PureComponent } from 'react'
import Konva from 'konva';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import $ from 'jquery';
import Rectangle from './rectangle'
import Tool from './tools';
import basicContext from 'basiccontext';
import { Modal, message, Button, Icon } from 'antd';
import ReactDom from 'react-dom';

class CanvasDraw extends PureComponent {
  static defaultProps = {
    lineColor: 'black',
    lineWidth: 10,
    fillColor: 'transparent',
    backgroundColor: 'transparent',
    opacity: 1.0,
    undoSteps: 25,
    tool: Tool.Pencil,
    widthCorrection: 2,
    heightCorrection: 0,
    forceValue: false,
  };

  state = {
    action: true,
    ocrcopy: false
  };

  componentDidMount = () => {
    let {
      tool,
      value,
      defaultValue,
    } = this.props;

    let stage = this._stage = new Konva.Stage({ container: this._container, draggable: false });
    let layer = this._layer = new Konva.Layer({ draggable: false });
    stage.add(layer);
    this._initTools(stage, layer);
    let selectedTool = this._tools[tool];
    selectedTool.configureStage(this.props);
    this._selectedTool = selectedTool;
    window.addEventListener('resize', this._resize, false);
    this.bindStageEvent();
    this._initContextMenu();
    if (this._container.childNodes[0]) {
      this._container.childNodes[0].style.margin = 'auto';
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this._resize);
    window.ocrListener = null;

  };

  componentWillReceiveProps = (nextProps) => {
    if (this.props.tool !== nextProps.tool) {
      this._selectedTool = this._tools[nextProps.tool] || this._tools[Tool.Pencil]
    }


    this._stage.defaultCursor = 'default';
    this._selectedTool.configureStage(nextProps);

    if (this.props.backgroundColor !== nextProps.backgroundColor) {
      this._backgroundColor(nextProps.backgroundColor)
    }
  };

  render = () => {
    let {
      className,
      style,
      tool
    } = this.props;
    let { ocrcopy } = this.state;
    // let {ocrcopy}= this.defaultProps
    let canvasDivStyle = Object.assign({}, style ? style : {},
      { textAlign: 'center', margin: 'auto' });
    return (
      <div style={{ position: 'relative' }}>
        <div tabIndex={-1}
          className={className}
          ref={(c) => this._container = c}
          style={canvasDivStyle}>
        </div>
        {
          canvasDivStyle && ocrcopy ?
            <Button
              style={{ position: 'absolute', bottom: '0' }}
              type="primary" ref="tip" onClick={() => { this.ocrcopy(event) }} >
              <Icon type="copy" />
              复制</Button>
            : null
        }
      </div>
    )
  };
  ocrcopy(e) {
    this.activeRect = this._selectedTool.doMouseUp(e);
    this._initContextMenu();
    this.props.onChange && this.props.onChange(e.evt);
    if (this.activeRect && this.activeRect.width() > 10 || this.activeRect && this.activeRect.height() > 0) {
      this.crop();
      this.removeActiveRect();
      return false;
    }
  }
  _initTools = (stage, layer) => {
    this._tools = {};
    this._tools[Tool.Rectangle] = new Rectangle(stage, layer);
  };


  _initContextMenu = () => {
    const onContextMenu = (e, key) => {
      switch (key) {
        case 'delete':
          this.removeActiveRect();
          break;
        case 'copy':
          this.crop();
          this.removeActiveRect();
          break;
        default:
          break;
      }
    };

    let menus = [
      { title: '解析文字', icon: 'ion-plus-round', fn: e => onContextMenu(e, 'copy'), key: 'analyse' },
      { title: '删除选中', icon: 'ion-plus-round', fn: e => onContextMenu(e, 'delete'), key: 'delete' },
    ];

    let layer = this._layer;
    let rects = layer.getChildren(node => node.getClassName() === 'Rect');

    $(this._container).bind('contextmenu', e => false);


    rects && rects.forEach(rect => {
      rect.off('contextmenu').on('contextmenu', (ev) => {
        this.activeRect = rect;
        if (!rect.attrs.removable) {
          menus = menus.map(m => {
            if (m.key === 'delete') {
              return { ...m, visible: false }
            } else {
              return m;
            }
          });
        }
        basicContext.show(menus, ev.evt);
        ev.cancelBubble = true;
        ev.evt.stopPropagation();
      });
    });
  };
  /**
   * @description: ocr文字框选
   * @param {type} 
   * @return: 
   */
  crop = () => {
    this._imageClone = this._image.clone();
    const { scaleX, scaleY } = this.getImageScale();
    const x = this.activeRect.x() / scaleX,
      y = this.activeRect.y() / scaleY,
      width = this.activeRect.width() / scaleX,
      height = this.activeRect.height() / scaleY;
    this._imageClone.crop({
      x: x,
      y: y,
      width: width,
      height: height,
    });
    this._imageClone.width(width);
    this._imageClone.height(height);
    const dataURL = this._imageClone.toDataURL();
    const params = {
      img: dataURL.substr(dataURL.indexOf(',') + 1)
    };
    // originalSize: [this.naturalHeight, this.naturalWidth],
    // scaleSize: [this._image.height(), this._image.width()],
    // cropSize: [height, width],
    this.props.onCopy && this.props.onCopy(params);
    this._imageClone.destroy();

  };
  //取消框选
  removeActiveRect = () => {
    if (this.activeRect && this.activeRect.attrs
      && this.activeRect.attrs.removable) {
      this.activeRect.destroy();
      this.reDraw();
      this.setState({
        ocrcopy: false
      })
    }
  };

  clear = () => {
    this._layer && this._layer.clear();
    this.reDraw();
  };


  draggable = (flag) => {
    let stage = this._stage;
    stage.draggable(flag);
    if (!flag) {
      stage.x(0);
      stage.y(0);
      document.body.style.cursor = 'default';
    } else {
      document.body.style.cursor = 'move';
    }
    stage.batchDraw();
  };



  addImage = (dataUrl, options = {}, cb) => {
    const img = new window.Image();
    img.src = dataUrl;
    img.onload = () => {
      let layer = this._layer;
      let stage = this._stage;
      this.naturalWidth = img.naturalWidth;
      this.naturalHeight = img.naturalHeight;

      const { width, height } = this.getWidthBasedRenderSize();

      this._image = new Konva.Image({
        x: 0,
        y: 0,
        width: width,
        height: height,
        image: img,
        ...options,
      });
      stage.width(width);
      stage.height(height);
      this._originalWidth = width;
      this._originalHeight = height;
      layer.add(this._image);
      this._image.draw();
      if (cb) {
        cb();
      }
    };
  };


  addRect = (json) => {
    if (!json) return;
    let layer = this._layer;

    let image = this._image;
    let nw = image.getImage().naturalWidth;
    let nh = image.getImage().naturalHeight;
    let width = image.width();
    let height = image.height();
    let scaleX = width / nw;
    let scaleY = height / nh;

    json.forEach(item => {
      let _attrs = item.attrs;
      let x = _attrs.x * scaleX;
      let y = _attrs.y * scaleX;
      let width = _attrs.width * scaleX;
      let height = _attrs.height * scaleY;
      const attrs = {
        ..._attrs,
        x,
        y,
        width,
        height,
        removable: false,
      };

      let rect = new Konva.Rect({ className: 'Rect', attrs: attrs });
      layer.add(rect);
      rect.draw();
    });
    this._initContextMenu();
  };

  _onMouseDown = (e) => {
    if (this._stage.draggable()) {
      return false;
    }
    if (e && e.evt && e.evt.button === 0) {
      this._selectedTool.doMouseDown(e);
    }
  };

  _onMouseMove = (e) => {
    if (this._stage.draggable()) {
      return false;
    }
    this._selectedTool.doMouseMove(e);
  };

  _onMouseUp = (e) => {
    if (this._stage.draggable()) {
      return false;
    }
    if (e && e.evt && e.evt.button === 0) {
      this.activeRect = this._selectedTool.doMouseUp(e);
      this._initContextMenu();
      this.props.onChange && this.props.onChange(e.evt);
      if (this.activeRect && this.activeRect.width() > 10 || this.activeRect && this.activeRect.height() > 0) {
        if (window.ocrListener) {
          this.crop();
          this.removeActiveRect();
        }
      }
    } else if (e && e.evt && e.evt.button === 2) {
      this.activeRect = this._selectedTool.doMouseUp(e);
      this._initContextMenu();
      this.props.onChange && this.props.onChange(e.evt);
      if (this.activeRect && this.activeRect.width() > 10 || this.activeRect && this.activeRect.height() > 0) {
        this.crop();
        e.evt.preventDefault();
        this.setState({
          ocrcopy: true
        });
        var msg = ReactDom.findDOMNode(this.refs.tip);
        $(msg).bind('contextmenu', e => false);//window自带右击事件去除
        msg.style.left = e.evt.offsetX + 'px';
        msg.style.top = e.evt.offsetY + "px";
        return false;
      }
    }
  };

  @Bind()
  @Debounce(2000)
  _resize = (e) => {
    if (e) e.preventDefault();




    // let stageScaleY = stage.scaleY();
    // stage.width(width * stageScaleX);
    // stage.height(height * stageScaleY);
    // this.reDraw();
    this.props.onResize && this.props.onResize();
  };

  _backgroundColor = (color) => {
    if (!color) return;
    let stage = this._stage;
    stage.fill(color);
    this.reDraw();
  };

  zoom = (factor) => {
    let preFactor = this._preFactor || 1;
    if (factor === preFactor) {
      return false;
    }
    this._stage.scale({
      x: factor,
      y: factor,
    });
    let width = this._originalWidth * factor;
    let height = this._originalHeight * factor;
    this._stage.width(width);
    this._stage.height(height);
    this.props.onResize && this.props.onResize();
    this.reDraw();
    this._preFactor = factor;
  };

  toDataURL = (options) => this._stage.toDataURL(options);

  toJSON = (propertiesToInclude) => this._stage.toJSON(propertiesToInclude);

  fromJSON = (json) => {
  };

  @Debounce(400)
  reDraw = () => {
    if (this._image) {
      this._layer.batchDraw();
    }
  };

  beginStageDrag = () => {
    if (this._stage) {
      this._stage.draggable(true);
      this._stage.off('contentMousedown contentMousemove contentMouseup')
    }
  };

  endStageDrag = () => {
    this.bindStageEvent();
  };

  /*
    * bind events to the node. KonvaJS supports mouseover, mousemove,
    mouseout, mouseenter, mouseleave, mousedown, mouseup, wheel, contextmenu, click, dblclick, touchstart, touchmove,
    touchend, tap, dbltap, dragstart, dragmove, and dragend events. The Konva Stage supports
    contentMouseover, contentMousemove, contentMouseout, contentMousedown, contentMouseup, contentWheel, contentContextmenu
    contentClick, contentDblclick, contentTouchstart, contentTouchmove, contentTouchend, contentTap,
    and contentDblTap. Pass in a string of events delimited by a space to bind multiple events at once
    such as 'mousedown mouseup mousemove'. Include a namespace to bind an
    event by name such as 'click.foobar'.
    */
  bindStageEvent = () => {
    const stage = this._stage;
    stage.off('contentMousedown').on('contentMousedown', this._onMouseDown);
    stage.off('contentMousemove').on('contentMousemove', this._onMouseMove);
    stage.off('contentMouseup').on('contentMouseup', this._onMouseUp);
  };

  getImageScale = () => {
    const scaleX = this._image.width() / this._image.getImage().naturalWidth;
    const scaleY = this._image.height() / this._image.getImage().naturalHeight;
    return { scaleX, scaleY };
  };

  getWidthBasedRenderSize = () => {
    if (this._container) {
      let { offsetWidth: w } = this._container;
      let nw = this.naturalWidth;
      let nh = this.naturalHeight;
      let nRate = nw / nh;
      let width = w * 0.9;
      let height = width / nRate;
      return { width, height };
    }
    return { width: this._originalWidth || 595, height: this._originalHeight || 842 }
  };

  getHeightBasedRenderSize = () => {
    if (this._container) {
      let { clientHeight: h } = this._container;
      let nw = this.naturalWidth;
      let nh = this.naturalHeight;
      let nRate = nw / nh;
      let height = h;
      let width = height * nRate;
      return { width, height };
    }
    return { width: this._originalWidth || 595, height: this._originalHeight || 842 }
  };

  getWidth = () => {
    return this._stage ? this._stage.width() : 0;
  };

  getHeight = () => {
    return this._stage ? this._stage.height() : 0;
  };
}

export default CanvasDraw
