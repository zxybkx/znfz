
export const pointerPosition = (event) => {
    event = event || window.event;
    var target = event.target || event.srcElement,
        style = target.currentStyle || window.getComputedStyle(target, null),
        borderLeftWidth = parseInt(style['borderLeftWidth'], 10),
        borderTopWidth = parseInt(style['borderTopWidth'], 10),
        rect = target.getBoundingClientRect(),
        _x = event.clientX - borderLeftWidth - rect.left,
        _y = event.clientY - borderTopWidth - rect.top,
        _touchX = event.changedTouches ? event.changedTouches[0].clientX - borderLeftWidth - rect.left : null,
        _touchY = event.changedTouches ? event.changedTouches[0].clientY - borderTopWidth - rect.top : null;
    return [(_x || _touchX), (_y || _touchY)];
};










export const linearDistance = (point1, point2) => {
    let xs = point2.x - point1.x;
    let ys = point2.y - point1.y;
    return Math.sqrt(xs * xs + ys * ys);
};


export const uuid4 = () => {
    let uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
        switch (ii) {
            case 8:
            case 20:
                uuid += '-';
                uuid += (Math.random() * 16 | 0).toString(16);
                break;
            case 12:
                uuid += '-';
                uuid += '4';
                break;
            case 16:
                uuid += '-';
                uuid += (Math.random() * 4 | 8).toString(16);
                break;
            default:
                uuid += (Math.random() * 16 | 0).toString(16);
        }
    }
    return uuid;
};
