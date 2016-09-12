/**
 * Created by hysen on 2016/4/18.
 */
var GameWinLayer = cc.LayerColor.extend( {
    mapLayer:null,
    del:0,

    ctor:function (mapLayer) {
        this._super();
        this.init(mapLayer);
    },
    onEnter:function () {
        this._super();
        // var actionTint = cc.tintBy(2, 255, 255, 255);
        var winSize = cc.director.getWinSize();
        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
        this.setPosition(centerPos);
        this.ignoreAnchorPointForPosition(false);
        var actionFade = cc.fadeIn(2.0);
        this.runAction(cc.sequence(actionFade));
    },
    init:function (mapLayer) {
        this._super(cc.color(0, 0, 0, 180));
        cc.audioEngine.stopMusic();
        if (Math.round(Math.random()) == 0) {
            cc.audioEngine.playEffect(res.Jlin_radiant_win_mp3, false);
        } else {
            cc.audioEngine.playEffect(res.Jlin_dire_win_mp3, false);
        }
        this.mapLayer = mapLayer;
        this.del = 0;
        var winLabel = new cc.LabelTTF("YOU WIN!", "Arial", 50);
        winLabel.x = (this.mapLayer.rightBoundary + this.mapLayer.leftBoundary) / 2;
        winLabel.y = this.mapLayer.topBoundary / 2;
        winLabel.setFontFillColor(cc.color(255, 255, 255, 192));
        this.addChild(winLabel, 4);
        this.scheduleUpdate();
    },
    update:function (dt) {
        this.del += dt;
        if (this.del > 8) {
            // cc.director.resume();
            cc.director.runScene(new cc.TransitionCrossFade(1, new MenuScene()));
        }
    }
});