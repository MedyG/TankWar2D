/**
 * Created by hysen on 2016/3/24.
 */
var PlayScene = cc.Scene.extend({
    mapLayer:null,
    gameLayer:null,
    delay:0,
    onEnter: function () {
        this._super();
        this.delay = 0;
        cc.audioEngine.stopMusic(true);
        cc.audioEngine.playMusic(res.Jlin_ui_main_mp3, true);
        this.mapLayer = new MapLayer();
        this.gameLayer = new GameLayer(this.mapLayer);
        this.addChild(this.mapLayer, 2, TagOfLayer.Map);
        this.addChild(this.gameLayer, 1, TagOfLayer.Game);
        this.scheduleUpdate();
    },

    update:function (dt) {
        this.mapLayer.update(dt);
        this.gameLayer.update(dt);
        if (this.mapLayer.lives < 0) {
            this.unscheduleUpdate();
            cc.director.pause();
            this.addChild(new GameOverLayer(), 4);
        }
        if (this.mapLayer.enemyAI.tankLeft <= 0) {
            this.delay += dt;
            if (this.delay > 4) {
                this.unscheduleUpdate();
                // cc.director.pause();
                this.addChild(new GameWinLayer(this.mapLayer), 3);
            }

        }
    }
});