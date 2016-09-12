/**
 * Created by hysen on 2016/3/24.
 */
var MapLayer = cc.Layer.extend({
    map1:null,
    // scaleR:1,
    spriteSheet:null,
    offsetX:0,
    playerTank:null,
    mapSize:null,
    rightBoundary:0,
    leftBoundary:0,
    topBoundary:0,
    bottomBoundary:0,
    bg1:null,
    bg2:null,
    bg3:null,
    enemyAI:null,
    playerFireDelay:0.5,
    lives:4,
    suppliesTag:0,
    supplies:[],
    ctor:function () {
        this._super();
        this.init();
    },
   init:function () {
       this.map1 = new cc.TMXTiledMap(res.map1_tmx);
       var winsize = cc.director.getWinSize();
       this.offsetX = winsize.width / 4;
       this.map1.x = this.offsetX;
       this.mapSize = this.map1.getContentSize();
       // this.scaleR = winsize.height / this.mapSize.height;
       // this.map1.scale = (this.scaleR);
       this.leftBoundary = this.offsetX;
       this.rightBoundary = this.offsetX + this.mapSize.width;
       this.topBoundary = this.mapSize.height;
       this.bottomBoundary = 0;
       this.bg1 = this.map1.getLayer("bg1");
       this.bg2 = this.map1.getLayer("bg2");
       this.bg3 = this.map1.getLayer("bg3");
       cc.log(this.bg1.getLayerSize());
       this.bg2.visible = false;
       this.bg3.visible = false;
       // this.enemySprite = [];
       // this.bulletSprites = [];
       this.playerFireDelay = 0.5;
       this.lives = 4;
       this.supplies = [];
       this.suppliesTag = 0;

       cc.spriteFrameCache.addSpriteFrames(res.images_plist);
       this.spriteSheet = new cc.SpriteBatchNode(res.images_png);
       this.addChild(this.map1, 2);
       this.addChild(this.spriteSheet, 1);
       this.playerBorn(this.map1);
       this.initEnemyAI();

       // this.scheduleUpdate();
   },
    playerBorn:function (map) {
        var playerGroup = map.getObjectGroup("player");
        var playerArray = playerGroup.getObjects();
        var winsize = cc.director.getWinSize();
        var tilesize = map.getTileSize();

        if (this.lives > 0) {
            this.playerTank = new Issue(this, TagOfIssue.Allies,
                cc.p((this.leftBoundary + playerArray[0]["x"] + 12),
                    (playerArray[0]["y"]) + 16));
            this.lives--;
        } else {
            this.lives--;
        }

        // this.spriteSheet.addChild(this.playerTank.sprite);
    },
    initEnemyAI:function () {
        this.enemyAI = new EnemyAI(this);
    },
    getTiledCoordinate:function (pos) {
        var cox = -1, coy = -1;
        var layersize = this.bg1.getLayerSize();
        var tilesize = this.map1.getTileSize();
        cox = parseInt((pos.x - this.leftBoundary) / (tilesize.width));
        coy = parseInt((layersize.height - pos.y / (tilesize.height)));
        if (cox >= 0 && cox < layersize.width && coy >= 0 && coy < layersize.height) {
            return cc.p(cox, coy);
        } else {
            return cc.p(-1, -1);
        }
    },
    getTiledIdFromPos:function (pos) {
        var point = this.getTiledCoordinate(pos);
        if (point.x < 0 || point.y < 0) {
            return -1;
        }
        return this.bg1.getTileGIDAt(point);
    },
    
    update:function (dt) {
        this.enemyAI.update(dt);
    },
    onExit:function () {
        // cc.eventManager.removeListeners(cc.EventListener.KEYBOARD);
        this._super();
    }
});