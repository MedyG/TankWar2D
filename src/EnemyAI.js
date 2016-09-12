/**
 * Created by hysen on 2016/3/27.
 */
var EnemyAI = cc.Class.extend({
    mapLayer: null,
    maxTanks: 4,
    tankNums: 0,
    bornPlace: [],
    enemyIssues: [],
    addDelay: 0,
    enFireDelay: 0,
    tankTag:0,
    tankLeft:0,
    count:0,
    area:0,
    ctor: function (mapLayer) {
        this.mapLayer = mapLayer;
        this.init();
    },
    init: function () {
        this.enemyIssues = [];
        this.bornPlace = [];
        var bornGroup = this.mapLayer.map1.getObjectGroup("en");
        var bornArray = bornGroup.getObjects();
        var born1 = cc.p(bornArray[0]["x"], bornArray[0]["y"]);
        var born2 = cc.p(bornArray[1]["x"], bornArray[1]["y"]);
        var born3 = cc.p(bornArray[2]["x"], bornArray[2]["y"]);
        this.bornPlace.push(cc.p(born1.x + 8 + this.mapLayer.leftBoundary, born1.y + 8));
        this.bornPlace.push(cc.p(born2.x + 8 + this.mapLayer.leftBoundary, born2.y + 8));
        this.bornPlace.push(cc.p(born3.x + 8 + this.mapLayer.leftBoundary, born3.y + 8));

        this.maxTanks = 8;
        this.tankNums = 0;
        this.tankLeft = 20;
        this.tankTag = 0;
        this.count = this.tankLeft;
    },
    addTank: function (dt) {
        this.addDelay += dt;
        if (this.addDelay >= 1) {
            this.addDelay = 0;
            if (this.tankLeft > 0 && this.tankNums < this.count) {
                if (this.enemyIssues.length < this.maxTanks) {
                    if (this.tankNums < 3) {
                        var enemy = new Issue(this.mapLayer, TagOfIssue.Enemies, this.bornPlace[this.enemyIssues.length]);
                        // enemy.maxBullet = 1;
                        this.enemyIssues.push(enemy);
                        this.tankNums++;
                    } else {
                        var r = Math.floor(Math.random() * 3);
                        var enemy = new Issue(this.mapLayer, TagOfIssue.Enemies, this.bornPlace[r]);
                        // enemy.maxBullet = 1;
                        cc.log("new enemy born at" + enemy.sprite.getPosition().x + " " + enemy.sprite.getPosition().y);
                        this.enemyIssues.push(enemy);
                        this.tankNums++;
                    }
                    this.tankTag++;
                    // if (this.tankTag > 10000) {
                    //     this.tankTag = 0; // reset
                    // }
                }
            }
        }

    },
    tankAction: function (dt) {
        for (var i = 0; i < this.enemyIssues.length; i++) {
            if (!this.enemyIssues[i].onGuard) {
                var direction = this.enemyIssues[i].sprite.getRotation() / 90;
                switch (direction) {
                    case TagOfDirection.up:
                        this.enemyIssues[i].moveUp();
                        break;
                    case TagOfDirection.down:
                        this.enemyIssues[i].moveDown();
                        break;
                    case TagOfDirection.left:
                        this.enemyIssues[i].moveLeft();
                        break;
                    case TagOfDirection.right:
                        this.enemyIssues[i].moveRight();
                        break;
                    default:
                        break;
                }
            }
            this.enFireDelay += dt;
            if (this.enFireDelay > this.enemyIssues[i].fireDelay
                || this.enemyIssues[i].bulletSprites.length == 0) {
                this.enemyIssues[i].fire(TagOfIssue.Enemies);
                this.enFireDelay = 0;
            }
            // this.collisionTest();
            this.enemyIssues[i].spotTime += dt;
            if (this.enemyIssues[i].stopAttack && this.enemyIssues[i].spotTime > 5) {
                this.enemyIssues[i].stopAttack = false;
            }
            this.enemyIssues[i].autoChangeDirection();
        }
    },

    collisionTest: function () {
        // between allies and enemies
        for (var i = 0; i < this.enemyIssues.length; i++) {
            if (this.isIntersect(this.mapLayer.playerTank.sprite.getBoundingBox(),
                    this.enemyIssues[i].sprite.getBoundingBox())) {
                this.enemyIssues[i].isBlocked = true;
                this.mapLayer.playerTank.isBlocked = true;
            }
        }
        // between enemies
        for (var i = 0; i < this.enemyIssues.length; i++) {
            for (var j = i + 1; j < this.enemyIssues.length; j++) {
                if (this.isIntersect(this.enemyIssues[i].sprite.getBoundingBox(),
                        this.enemyIssues[j].sprite.getBoundingBox())) {
                    this.enemyIssues[i].isBlocked = true;
                    this.enemyIssues[j].isBlocked = true;
                }
            }
        }
    },
    isIntersect: function (box1, box2) {
        if (Math.max(cc.rectGetMinX(box1), cc.rectGetMinX(box2)) > Math.min(cc.rectGetMaxX(box1), cc.rectGetMaxX(box2))) {
            return false;
        }
        if (Math.max(cc.rectGetMinY(box1), cc.rectGetMinY(box2)) > Math.min(cc.rectGetMaxY(box1), cc.rectGetMaxY(box2))) {
            return false;
        }
        return true;
    },
    update: function (dt) {
        this.addTank(dt);
        this.tankAction(dt);
    }
});