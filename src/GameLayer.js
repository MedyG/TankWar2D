/**
 * Created by hysen on 2016/3/28.
 */
if (typeof StatusOfKeyDown == "undefined") {
    var StatusOfKeyDown = {};
    StatusOfKeyDown.up = false;
    StatusOfKeyDown.down = false;
    StatusOfKeyDown.left = false;
    StatusOfKeyDown.right = false;
    StatusOfKeyDown.fire = false;
}
var GameLayer = cc.LayerColor.extend({
    mapLayer: null,
    ipSprite: null,
    enemyLives: [],
    spriteOffset: 0,
    playerLifeLabel: null,
    playerLives: 0,
    enemyLeftLabel: null,
    enemyLives: 0,
    recognizer: null,
    btnSprite: null,
    firebtnSprite: null,
    mapBg: null,
    touchArea: null,
    timer:0,

    ctor: function (mapLayer) {
        this._super(cc.color(200, 200, 200, 200));
        this.mapLayer = mapLayer;
        this.init();
    },
    init: function () {
        this.enemyLives = [];
        this.spriteOffset = 32;
        this.timer = 0;
        this.recognizer = new SimpleRecognizer();
        this.drawBg();
        this.initStatus();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onFire,
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {
                StatusOfKeyDown.fire = false;
                event.getCurrentTarget().texture = res.fire_button_default_png;
                cc.log("touch fire end");
            }
        }, this.firebtnSprite);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this.mapBg);
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.keyPressed,
            onKeyReleased: this.KeyReleased
        }, this);
        // this.scheduleUpdate();
    },
    initStatus: function () {
        var ipFrame = cc.spriteFrameCache.getSpriteFrame("IP.png");
        this.ipSprite = new cc.Sprite(ipFrame);
        this.ipSprite.x = this.mapLayer.rightBoundary + this.spriteOffset;
        this.ipSprite.y = this.mapLayer.topBoundary - this.spriteOffset;
        this.addChild(this.ipSprite, 4);

        this.playerLifeLabel = new cc.LabelTTF(this.mapLayer.lives.toString(), "Arial", 20);
        this.playerLifeLabel.x = this.mapLayer.rightBoundary + this.spriteOffset * 2;
        this.playerLifeLabel.y = this.mapLayer.topBoundary - this.spriteOffset;
        this.playerLifeLabel.setFontFillColor(cc.color(0, 0, 0, 192));
        this.addChild(this.playerLifeLabel, 4);
        this.playerLives = this.mapLayer.lives;

        this.enemyLeftLabel = new cc.LabelTTF("enemies left: " + this.mapLayer.enemyAI.tankLeft, "Arial", 20);
        this.enemyLeftLabel.x = this.mapLayer.rightBoundary + this.spriteOffset * 5 / 2;
        this.enemyLeftLabel.y = this.mapLayer.topBoundary - this.spriteOffset * 2;
        this.enemyLeftLabel.setFontFillColor(cc.color(0, 0, 0, 192));
        this.addChild(this.enemyLeftLabel, 4);
        this.enemyLives = this.mapLayer.enemyAI.tankLeft;


    },
    drawBg: function () {
        // control button
        this.btnSprite = new cc.Sprite(res.control_bg_png);
        this.btnSprite.setVisible(false);
        this.btnSprite.scale = 0.5;
        this.addChild(this.btnSprite, 5);
        // fire button
        this.firebtnSprite = new cc.Sprite(res.fire_button_default_png);
        this.firebtnSprite.x = this.mapLayer.rightBoundary + this.spriteOffset * 4;
        this.firebtnSprite.y = cc.director.getWinSize().height / 3;
        this.firebtnSprite.scale = 0.8;
        this.addChild(this.firebtnSprite, 5);
        this.mapBg = new cc.DrawNode();
        var ltp = cc.p(this.mapLayer.leftBoundary + 1, this.mapLayer.topBoundary);
        var rbp = cc.p(this.mapLayer.rightBoundary + 1, this.mapLayer.bottomBoundary);
        this.mapBg.drawRect(ltp, rbp, cc.color(0, 0, 0));
        this.addChild(this.mapBg, 3);
    },
    onTouchBegan: function (touch, event) {
        var pos = touch.getLocation();
        var target = event.getCurrentTarget();
        if (pos.x > target.getParent().mapLayer.leftBoundary) {
            return false;
        }
        target.getParent().btnSprite.setVisible(true);
        target.getParent().btnSprite.x = pos.x;
        target.getParent().btnSprite.y = pos.y;

        event.getCurrentTarget().getParent().recognizer.beginPoint(pos.x, pos.y);
        return true;
    },
    onTouchMoved: function (touch, event) {
        var pos = touch.getLocation();
        var result = event.getCurrentTarget().getParent().recognizer.movePoint(pos.x, pos.y);
        switch (result) {
            case "up":
                StatusOfKeyDown.up = true;
                StatusOfKeyDown.down = false;
                break;
            case "down":
                StatusOfKeyDown.down = true;
                StatusOfKeyDown.up = false;
                break;
            case "right":
                StatusOfKeyDown.right = true;
                StatusOfKeyDown.left = false;
                break;
            case "left":
                StatusOfKeyDown.left = true;
                StatusOfKeyDown.right = false;
                break;
            default:
                break;
        }
    },
    onTouchEnded: function (touch, event) {
        // var pos = touch.getLocation();
        event.getCurrentTarget().getParent().recognizer.endPoint();
        StatusOfKeyDown.up = false;
        StatusOfKeyDown.down = false;
        StatusOfKeyDown.left = false;
        StatusOfKeyDown.right = false;
        event.getCurrentTarget().getParent().btnSprite.setVisible(false);
    },
    onFire: function (touch, event) {
        var target = event.getCurrentTarget();
        if (!target.isVisible() || (!target.getParent().isTouchInside(target, touch))) {
            return false;
        }
        event.getCurrentTarget().texture = res.fire_button_press_png;
        StatusOfKeyDown.fire = true;
        return true;
    },
    isTouchInside: function (owner, touch) {
        if (!owner || !owner.getParent()) {
            return false;
        }
        var touchLocation = touch.getLocation(); // Get the touch position
        touchLocation = owner.getParent().convertToNodeSpace(touchLocation);
        return cc.rectContainsPoint(owner.getBoundingBox(), touchLocation);
    },
    keyPressed: function (keyCode, event) {
        // event.getCurrentTarget().playerTank.isBlocked = false;
        switch (keyCode) {
            case 87:
                StatusOfKeyDown.up = true;
                break;
            case 83:
                StatusOfKeyDown.down = true;
                break;
            case 65:
                StatusOfKeyDown.left = true;
                break;
            case 68:
                StatusOfKeyDown.right = true;
                break;
            case 74:
                StatusOfKeyDown.fire = true;
                break;
            default:
                break;
        }
    },
    KeyReleased: function (keyCode, event) {
        switch (keyCode) {
            case 87:
                StatusOfKeyDown.up = false;
                break;
            case 83:
                StatusOfKeyDown.down = false;
                break;
            case 65:
                StatusOfKeyDown.left = false;
                break;
            case 68:
                StatusOfKeyDown.right = false;
                break;
            case 74:
                StatusOfKeyDown.fire = false;
                break;
            default:
                break;
        }
    },
    update: function (dt) {
        if (StatusOfKeyDown.up) {
            this.mapLayer.playerTank.moveUp();
        }
        if (StatusOfKeyDown.down) {
            this.mapLayer.playerTank.moveDown();
        }
        if (StatusOfKeyDown.left) {
            this.mapLayer.playerTank.moveLeft();
        }
        if (StatusOfKeyDown.right) {
            this.mapLayer.playerTank.moveRight();
        }
        if (StatusOfKeyDown.fire) {
            this.timer += dt;
            if (this.mapLayer.playerTank.fireDelay < this.timer || this.mapLayer.playerTank.bulletSprites.length == 0) {
                this.mapLayer.playerTank.fire(TagOfIssue.Allies);
                this.timer = 0;
            }
        }
        if (this.mapLayer.lives != this.playerLives && this.mapLayer.lives > 0) {
            this.playerLifeLabel.setString(this.mapLayer.lives.toString());
            this.playerLives = this.mapLayer.lives;
        }
        if (this.mapLayer.enemyAI.tankLeft != this.enemyLives && this.mapLayer.enemyAI.tankLeft >= 0) {
            this.enemyLeftLabel.setString("enemies left: " + this.mapLayer.enemyAI.tankLeft);
            this.enemyLives = this.mapLayer.enemyAI.tankLeft;
        }
    }
});