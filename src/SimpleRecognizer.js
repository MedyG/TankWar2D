/**
 * Created by hysen on 2016/4/8.
 */
function Point(x, y) {
    this.X = x;
    this.Y = y;
}

function SimpleRecognizer() {
    // this.points = [];
    this.currentPoint = new Point(0, 0);
    this.centerPoint = new Point(0, 0);
    this.result = "";
}
// called in onTouchBegin
SimpleRecognizer.prototype.beginPoint = function (x, y) {
    // this.points = [];
    this.currentPoint = new Point(x, y);
    this.centerPoint = new Point(x, y);
    this.result = "";
}
// called in onTouchMoved
SimpleRecognizer.prototype.movePoint = function (x, y) {
    this.currentPoint = new Point(x, y);

    var newRtn = "";

    var dx = this.currentPoint.X - this.centerPoint.X;
    var dy = this.currentPoint.Y - this.centerPoint.Y;
    if (!(dx == 0 && dy == 0)) {
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                newRtn = "right";
            } else {
                newRtn = "left";
            }
        } else {
            if (dy > 0) {
                newRtn = "up";
            } else {
                newRtn = "down";
            }
        }
    }
    cc.log(newRtn + ": " + dx + " - " + dy);

    this.result = newRtn;
    return this.result;
}

// called in onTouchEnded
SimpleRecognizer.prototype.endPoint = function () {

}