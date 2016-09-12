var MenuLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
    },
    init : function(){
        this._super();
        cc.audioEngine.playMusic(res.Jlin_ui_startup_mp3, true);
        var winsize = cc.director.getWinSize();
        var titlePos = cc.p(winsize.width / 2, winsize.height  * 3 / 4);
        var spriteTittle = cc.Sprite.create(res.BattleCity_png);
        spriteTittle.setPosition(titlePos);
        this.addChild(spriteTittle);

        cc.MenuItemFont.setFontSize(60);

        // var menuLabelStart = cc.LabelTTF.create("Start Game", "Arial", 45);
        // var menuItemPlay = cc.MenuItemLabel.create(menuLabelStart, this.onPlay, this);
        var menuItemPlay = new cc.MenuItemFont("Start Game", this.onPushScene, this);
        var menu = new cc.Menu(menuItemPlay);
        var menuPos = cc.p(winsize.width / 2, winsize.height / 4);
        menu.setPosition(menuPos);
        this.addChild(menu);
        var menuLabelStart = cc.LabelTTF.create("Created by MeDy", "Arial", 15);
        menuLabelStart.y = 16;
        menuLabelStart.x = cc.director.getWinSize().width - 200;
        this.addChild(menuLabelStart);
    },
    onPushScene:function (sender) {
        var scene = new PlayScene();
        // cc.director.runScene(scene);
        cc.director.runScene(new cc.TransitionSlideInB(1, scene));
    },
    onPlay:function (){
        cc.log("--onplay clicked");
    }
});
var MenuScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new MenuLayer();
        layer.init();
        this.addChild(layer);
    }
})