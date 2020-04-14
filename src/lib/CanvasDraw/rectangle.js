

import Konva from 'konva';
import KonvaTool from './konvatool'

class Rectangle extends KonvaTool {
  configureStage(props) {
    this._width = props.lineWidth;
    this._color = props.lineColor;
    this._fill = props.fillColor;
  }

  doMouseDown(o) {
    let stage = this._stage;
    let layer = this._layer;
    let scaleX = stage.scaleX();
    let scaleY = stage.scaleY();
    this.isDown = true;
    let pointer = stage.getPointerPosition();
    this.startX = pointer.x / scaleX;
    this.startY = pointer.y / scaleY;
    this.rect = new Konva.Rect({
      x: this.startX,
      y: this.startY,
      width: 0,
      height: 0,
      stroke: this._color,
      strokeWidth: this._width,
      fill: this._fill,
      removable: true,
    });

    this.rect.on('contextmenu', (evt) => {
      evt.cancelBubble = true;
    });

    layer.add(this.rect);
  }

  doMouseMove(o) {
    if (!this.isDown) return;
    let stage = this._stage;
    let scaleX = stage.scaleX();
    let scaleY = stage.scaleY();
    let pointer = stage.getPointerPosition();
    let x = pointer.x / scaleX;
    let y = pointer.y / scaleY;
    if (this.startX > x) {
      this.rect.x(Math.abs(x));
    }
    if (this.startY > y) {
      this.rect.y(Math.abs(y));
    }
    this.rect.width(Math.abs(this.startX - x));
    this.rect.height(Math.abs(this.startY - y));
    stage.batchDraw();
  }

  doMouseUp(o) {
    this.isDown = false;
    return this.rect;
  }
}

export default Rectangle;
