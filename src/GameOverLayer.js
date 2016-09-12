/**
 * Created by hysen on 2016/3/29.
 */
var GameOverLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },
    init:function() {
        this._super(cc.color(0, 0, 0, 180));
        cc.audioEngine.stopMusic();
        if (Math.round(Math.random()) == 0) {
            cc.audioEngine.playEffect(res.Jlin_radiant_lose_mp3, false);
        } else {
            cc.audioEngine.playEffect(res.Jlin_dire_lose_mp3, false);
        }
        var winSize = cc.director.getWinSize();
        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
        cc.MenuItemFont.setFontSize(30);
        var menuItemRestart = new cc.MenuItemSprite(
            new cc.Sprite(res.restart_n_png),
            new cc.Sprite(res.restart_s_png),
            this.onRestart, this);
        var menu = new cc.Menu(menuItemRestart);
        menu.setPosition(centerPos);
        this.addChild(menu);
    },
    onRestart:function (sender) {
        cc.director.resume();
        // cc.director.popScene();
        var scene = new PlayScene();
        cc.director.runScene(new cc.TransitionFadeUp(1, scene));
        // cc.director.runScene(new PlayScene());
    }
});