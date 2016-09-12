/**
 * Created by hysen on 2016/3/25.
 */
if (typeof TagOfDirection == "undefined") {
    var TagOfDirection = {};
    // ↑→↓←
    TagOfDirection.up = 0;
    TagOfDirection.right = 1;
    TagOfDirection.down = 2;
    TagOfDirection.left = 3;
}
// set four bool to solve the collisions between tanks
var Issue = cc.Class.extend({
    sprite:null,
    mapLayer:null,
    moveSpeed:1,
    isBlocked:false,
    adjustErr:1.5,
    maxBullet:2,
    bulletNum:0,
    isEnemy:false,
    fireDelay:0,
    alreadyFire:0,
    bulletSprites:[],
    carrySupp:false,
    canMove:false,
    supplyType:0,
    direction:0,
    onGuard:false,
    reactionTime:0,
    spotTime:0,
    stopAttack:false,
    shieldTime:0,
    shielded:false,
    shieldSprite:null,
    enemyType:0,
    // direction:0,
    /** constructor
     * @param {cc.Layer *}
     * @param {TagOfIssue *}
     * @param {cc.p}
     **/
    ctor:function (mapLayer, type, pos) {
        this.mapLayer = mapLayer;
        switch (type) {
            case TagOfIssue.Allies:
                // cc.spriteFrameCache.addSpriteFrames(res.images_plist);
                this.initWithTankName("p1.png", TagOfIssue.Allies, pos);
                this.carrySupp = false;
                break;
            case TagOfIssue.Enemies:
                var rand = parseInt(Math.random() * 8);
                this.enemyType = rand;

                this.initWithTankName(enemyFrameName[rand], this.mapLayer.enemyAI.tankTag, pos);
                if (rand == TypeOfEnemy.en1r || rand == TypeOfEnemy.en2r || rand == TypeOfEnemy.en7) {
                    this.carrySupp = true;
                } else {
                    this.carrySupp = false;
                }
                this.isEnemy = true;
                this.maxBullet = 1;
                this.sprite.setRotation(90 * TagOfDirection.down);
                break;
            // case TagOfIssue.Bullet:
            //     var issueFrame = cc.spriteFrameCache.getSpriteFrame("bullet.png");
            //     this.sprite = new cc.Sprite(issueFrame);
            //     this.sprite.setPosition(pos);
            //     this.moveSpeed = 2;
            //     break;
            case TagOfIssue.Supplies:
                var rand = parseInt(Math.random() * 3);
                switch (rand) {
                    case TagOfSupp.addBullet:
                        this.initWithSuppliesName("props-start.png", this.mapLayer.suppliesTag++, pos);
                        this.supplyType = TagOfSupp.addBullet;
                        break;
                    case TagOfSupp.speedUp:
                        this.initWithSuppliesName("props-tank.png", this.mapLayer.suppliesTag++, pos);
                        this.supplyType = TagOfSupp.speedUp;
                        break;
                    case TagOfSupp.shield:
                        this.initWithSuppliesName("props-protect.png", this.mapLayer.suppliesTag++, pos);
                        this.supplyType = TagOfSupp.shield;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    },
    initWithTankName:function (frameName, tag, pos) {
        this.initActionSet();
        this.shielded = true;
        var issueFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
        this.sprite = new cc.Sprite(issueFrame);
        this.sprite.setPosition(pos);
        this.sprite.setTag(tag);
        this.canMove = false;
        this.mapLayer.spriteSheet.addChild(this.sprite, 1);

        // born animation
        var animation = cc.animationCache.getAnimation("tankBorn");
        var bornAction = new cc.Animate(animation);
        var done = new cc.CallFunc(function() {
            this.bornDone(frameName);
        }.bind(this));
        var sequence = cc.sequence(bornAction, done);
        this.sprite.runAction(sequence);
    },
    bornDone:function (frameName) {
        this.sprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frameName));
        this.shieldSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("shield1.png"));
        this.shieldSprite.x += 16;
        this.shieldSprite.y += 16;
        this.createShield(10);

        this.canMove = true;
        if (this.isEnemy) {
            if (this.enemyType == TypeOfEnemy.en2r || this.enemyType == TypeOfEnemy.en2) {
                this.moveSpeed = 1.5;
            } else {
                this.moveSpeed = 1;
            }
        } else {
            this.moveSpeed = 1;
        }
        this.bulletSprites = [];
        this.fireDelay = 0.5;
        this.alreadyFire = 0;

        this.onGuard = false;
        this.reactionTime = 1.0;
        this.spotTime = 0;
        this.direction = 0;
        this.shieldTime = 3.0;
        this.isBlocked = false;
        this.stopAttack = false;
        // this.isUpBlocked = false;
        // this.isRightBlocked = false;
        // this.isDownBlocked = false;
        // this.isLeftBlocked = false;
    },
    createShield:function (duration) {
        this.shielded = true;
        this.shieldSprite.visible = true;
        if (this.sprite.getChildrenCount() == 0) {
            this.sprite.addChild(this.shieldSprite);
            var animation = cc.animationCache.getAnimation("tankShield");
            animation.setLoops(duration);
            var boomAction = new cc.Animate(animation);
            var done = new cc.CallFunc(this.shieldDone, this);
            var sequence = cc.sequence(boomAction, done);
            this.shieldSprite.runAction(sequence);
        } else {
            this.shieldDone();
            this.shielded = true;
            this.shieldSprite.visible = true;
            this.sprite.addChild(this.shieldSprite);
            var animation = cc.animationCache.getAnimation("tankShield");
            animation.setLoops(duration);
            var boomAction = new cc.Animate(animation);
            var done = new cc.CallFunc(this.shieldDone, this);
            var sequence = cc.sequence(boomAction, done);
            this.shieldSprite.runAction(sequence);
        }

    },
    shieldDone:function () {
        this.shielded = false;
        this.shieldSprite.visible = false;
        this.shieldSprite.removeFromParent();
    },
    initWithSuppliesName:function (frameName, tag, pos) {
        var issueFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
        this.sprite = new cc.Sprite(issueFrame);
        this.sprite.setPosition(pos);
        this.sprite.setTag(tag);
        this.canMove = false;
        this.mapLayer.addChild(this.sprite, 4);
    },
    initActionSet:function () {
        var animFrames = [];
        for (var i = 1; i <= 2; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("explode" + i + ".png");
            animFrames.push(frame);
        }
        var animation = new cc.Animation(animFrames, 0.1, 2);
        var action = new cc.Animate(animation);
        cc.animationCache.addAnimation(animation, "playerBoom");

        animFrames = [];
        for (var i = 1; i <= 3; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("explode-" + i + ".png");
            animFrames.push(frame);
        }
        animation = new cc.Animation(animFrames, 0.1, 1);
        cc.animationCache.addAnimation(animation, "enemyBoom");

        animFrames = [];
        for (var i = 1; i <= 4; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("xing" + i + ".png");
            animFrames.push(frame);
        }
        animation = new cc.Animation(animFrames, 0.15, 3);
        cc.animationCache.addAnimation(animation, "tankBorn");

        animFrames = [];
        for (var i = 1; i <= 2; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("shield" + i + ".png");
            animFrames.push(frame);
        }
        animation = new cc.Animation(animFrames, 0.15, 10);
        cc.animationCache.addAnimation(animation, "tankShield");
    },
    getDirection:function () {
        return this.direction;
    },
    setDirection:function (d) {
        this.direction = d;
    },
    moveUp:function () {
        this.sprite.setRotation(90 * TagOfDirection.up);
        // cc.log("tank moved up!");
        // if (this.isBlocked) {
        //     return;
        // }
        if (!this.canMove) {
            return;
        }
        this.collisionSups();
        var p = this.sprite.getPosition();
        var box = this.sprite.getBoundingBox();
        var toP = cc.p(p.x, p.y + box.height / 2 + 1);
        // boundary detect
        if (p.y + box.height / 2 + 1 > this.mapLayer.topBoundary) {
            this.isBlocked = true;
            return;
        }
        // top
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // topLeft
        toP = cc.p(p.x - box.width / 2 + this.adjustErr, p.y + box.height / 2 + 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // top and 1/3 left
        toP = cc.p(p.x - box.width / 3, p.y + box.height / 2 + 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // topRight
        toP = cc.p(p.x + box.width / 2 - this.adjustErr, p.y + box.height / 2 + 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // top and 1/3 right
        toP = cc.p(p.x + box.width / 3, p.y + box.height / 2 + 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        this.sprite.y = p.y + this.moveSpeed;
    },
    moveDown:function () {
        this.sprite.setRotation(90 * TagOfDirection.down);
        // cc.log("tank moved down!");
        // if (this.isBlocked) {
        //     return;
        // }
        if (!this.canMove) {
            return;
        }
        this.collisionSups();
        var p = this.sprite.getPosition();
        var box = this.sprite.getBoundingBox();
        var toP = cc.p(p.x, p.y - box.height / 2 - 1);
        // boundary detect
        if (p.y - box.height / 2 - 1 < 0) {
            this.isBlocked = true;
            return;
        }
        // bottom
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottomLeft
        toP = cc.p(p.x - box.width / 2 + this.adjustErr, p.y - box.height / 2 - 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottom and 1/3 left
        toP = cc.p(p.x - box.width / 3, p.y - box.height / 2 - 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottomRight
        toP = cc.p(p.x + box.width / 2 - this.adjustErr, p.y - box.height / 2 - 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottom and 1/3 right
        toP = cc.p(p.x + box.width / 3, p.y - box.height / 2 - 1);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        this.sprite.y = p.y - this.moveSpeed;
    },
    moveLeft:function () {
        this.sprite.setRotation(90 * TagOfDirection.left);
        // cc.log("tank moved left!");
        // if (this.isBlocked) {
        //     return;
        // }
        if (!this.canMove) {
            return;
        }
        this.collisionSups();
        var p = this.sprite.getPosition();
        var box = this.sprite.getBoundingBox();
        var toP = cc.p(p.x - box.width / 2 - 1, p.y);
        // boundary detect
        if (p.x - box.height / 2 - 1 - this.mapLayer.leftBoundary < 0) {
            this.isBlocked = true;
            return;
        }
        // left
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottomLeft
        toP = cc.p(p.x - box.width / 2 - 1, p.y - box.height / 2 + this.adjustErr);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // left and 1/3 bottom
        toP = cc.p(p.x - box.width / 2 - 1, p.y - box.height / 3);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // topLeft
        toP = cc.p(p.x - box.width / 2 - 1, p.y + box.height / 2 - this.adjustErr);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // left and 1/3 top
        toP = cc.p(p.x - box.width / 2 - 1, p.y + box.height / 3);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        this.sprite.x = p.x - this.moveSpeed;
    },
    moveRight:function(){
        this.sprite.setRotation(90 * TagOfDirection.right);
        // cc.log("tank moved right!");
        // if (this.isBlocked) {
        //     return;
        // }
        if (!this.canMove) {
            return;
        }
        this.collisionSups();
        var p = this.sprite.getPosition();
        var box = this.sprite.getBoundingBox();
        var toP = cc.p(p.x + box.width / 2 + 1, p.y);
        // boundary detect
        if (p.x + box.height / 2 + 1 > this.mapLayer.rightBoundary) {
            this.isBlocked = true;
            return;
        }
        // Right
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // bottomRight
        toP = cc.p(p.x + box.width / 2 + 1, p.y - box.height / 2 + this.adjustErr);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // Right and 1/3 bottom
        toP = cc.p(p.x + box.width / 2 + 1, p.y - box.height / 3);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // topRight
        toP = cc.p(p.x + box.width / 2 + 1, p.y + box.height / 2 - this.adjustErr);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        // Right and 1/3 top
        toP = cc.p(p.x + box.width / 2 + 1, p.y + box.height / 3);
        if (this.checkPoint(toP) || this.collisionTanks(toP)) {
            this.isBlocked = true;
            return;
        }
        this.sprite.x = p.x + this.moveSpeed;
    },
    checkPoint:function (pos) {
        var toP = pos;
        var tid = this.mapLayer.getTiledIdFromPos(pos);
        var _tid = tid;
        while(_tid >= 28) {
            _tid -= 28;
        }
        var type = Math.ceil(_tid / 4); // 32/8=4
        if (type == TiledType.grass || type == TiledType.ground) {
            return false;
        } else {
            return true;
        }
        return false;
    },
    fire:function (tag) {
        if (this.bulletSprites.length < this.maxBullet) {
            cc.audioEngine.playEffect(res.bullet_mp3, false);
            var bullet = new BulletSprite(this.alreadyFire++, this);
            if (this.alreadyFire > 100) {
                this.alreadyFire = 0; //reset
            }
            this.bulletSprites.push(bullet);
            bullet.bulletFire();
            // cc.log("player " + this.sprite.getTag() + " fire " + this.bulletNum + " bullet");
        } else {
            return;
        }
    },
    collisionTanks:function (pos) {
        for (var i = 0; i < this.mapLayer.enemyAI.enemyIssues.length; i++) {
            if (cc.rectContainsPoint(this.mapLayer.enemyAI.enemyIssues[i].sprite.getBoundingBox(), pos)) {
                return true;
            }
        }

        if (this.isEnemy && cc.rectContainsPoint(this.mapLayer.playerTank.sprite.getBoundingBox(), pos)) {
            return true;
        }
        return false;
    },
    collisionSups:function () {
        for (var i = 0; i < this.mapLayer.supplies.length; i++) {
            if (this.isIntersect(this.sprite.getBoundingBox(), this.mapLayer.supplies[i].sprite.getBoundingBox())) {
                var _type = this.mapLayer.supplies[i].supplyType;
                this.mapLayer.supplies[i].sprite.removeFromParent(true);
                this.mapLayer.supplies.splice(i, 1);
                switch (_type) {
                    case TagOfSupp.addBullet:
                        if (this.maxBullet < 5) {
                            this.maxBullet++;
                            this.fireDelay -= 0.08;
                        }
                        break;
                    case TagOfSupp.speedUp:
                        if (this.moveSpeed < 2) {
                            this.moveSpeed += 0.25;
                        }
                        break;
                    case TagOfSupp.shield:
                        if (this.isEnemy) {
                            this.createShield(10);
                        } else {
                            this.createShield(50);
                        }
                        break;
                    default:
                        break;
                }
                return true;
            }
        }
        return false;
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
    generateSupp:function () {
        var suppGroup = this.mapLayer.map1.getObjectGroup("t");
        var suppArray = suppGroup.getObjects();
        var rand = parseInt(Math.random() * 10);
        var supp = new Issue(this.mapLayer, TagOfIssue.Supplies, cc.p((this.mapLayer.leftBoundary + suppArray[rand]["x"] + 12),
            (suppArray[rand]["y"] + 12)));
        this.mapLayer.supplies.push(supp);
        cc.log("===========supply created! Now have " + this.mapLayer.supplies.length + " supplies ");
    },
    tankBoom:function () {
        if (this.isEnemy) {
            var tag = this.sprite.getTag();
            cc.log("enemy " + tag + " destroyed!");
            if (this.carrySupp) {
                this.generateSupp();
            }
            for (var i = 0; i < this.mapLayer.enemyAI.enemyIssues.length; i++) {
                if (tag == this.mapLayer.enemyAI.enemyIssues[i].sprite.getTag()) {
                    this.mapLayer.enemyAI.enemyIssues.splice(i, 1);
                }
            }
            var animation = cc.animationCache.getAnimation("enemyBoom");
            var boomAction = new cc.Animate(animation);
            var done = new cc.CallFunc(this.boomDone, this);
            var sequence = cc.sequence(boomAction, done);
            this.sprite.runAction(sequence);
        } else {
            cc.log("player defeated!");
            var animation = cc.animationCache.getAnimation("playerBoom");
            var boomAction = new cc.Animate(animation);
            var done = new cc.CallFunc(this.boomDone, this);
            var sequence = cc.sequence(boomAction, done);
            this.sprite.runAction(sequence);
        }
    },
    boomDone:function () {
        this.sprite.setVisible(false);
        this.sprite.removeFromParent();
        if (!this.isEnemy) {
            this.mapLayer.playerBorn(this.mapLayer.map1);
        } else {
            this.mapLayer.enemyAI.tankLeft--;
        }
    },
    alliesSpotted:function () {
        var pos = this.sprite.getPosition();
        var radius = 5 * this.sprite.getBoundingBox().width;
        var rectangle = new cc.rect(pos.x - radius, pos.y - radius, radius * 2, radius * 2);
        if (cc.rectContainsPoint( rectangle, this.mapLayer.playerTank.sprite.getPosition())) {
            return true;
        }
        return false;
    },
    homeSpotted:function () {
        var pos = this.sprite.getPosition();
        var radius = 4 * this.sprite.getBoundingBox().width;
        if (cc.rectContainsPoint(new cc.rect(pos.x - radius, pos.y - radius, radius * 2, radius * 2),
                cc.p((this.mapLayer.leftBoundary + this.mapLayer.rightBoundary) / 2, 16))) {
            return true;
        }
        return false;
    },
    attackingAllies:function () {
        var alliesPos = this.mapLayer.playerTank.sprite.getPosition();
        var pos = this.sprite.getPosition();
        if (alliesPos.x - pos.x > 0) {
            this.moveRight();
        } else if (alliesPos.x - pos.x < 0){
            this.moveLeft();
        }
        if (alliesPos.y - pos.y > 0) {
            this.moveUp();
        } else if (alliesPos.y - pos.y < 0){
            this.moveDown();
        }
    },
    attackingHome:function () {
        var alliesPos = cc.p((this.mapLayer.leftBoundary + this.mapLayer.rightBoundary) / 2, 16);
        var pos = this.sprite.getPosition();
        if (alliesPos.y - pos.y > 0) {
            this.moveUp();
        } else if (alliesPos.y - pos.y < 0){
            // cc.log(pos.y);
            this.moveDown();
        }
        if (alliesPos.x - pos.x > 0) {
            this.moveRight();
        } else if (alliesPos.x - pos.x < 0){
            this.moveLeft();
        }
    },
    autoChangeDirection:function () {
        var direction = this.sprite.getRotation() / 90;
        var pos = this.sprite.getPosition();
        // simplified behavior tree
        if (this.alliesSpotted() && !this.stopAttack) {
            this.onGuard = true;
            if (this.reactionTime < this.spotTime) {
                if (this.spotTime > 10) {
                    this.spotTime = 0;
                    this.stopAttack = true;
                    return;
                }
                this.attackingAllies();
                return;
            }
        } else if (this.homeSpotted() && !this.stopAttack) {
            this.onGuard = true;
            if (this.reactionTime * 3 < this.spotTime) {
                if (this.spotTime > 10) {
                    this.spotTime = 0;
                    this.stopAttack = true;
                    return;
                }
                this.attackingHome();
                return;
            }
        } else if (!this.stopAttack){
            this.spotTime = 0;
        }
        this.onGuard = false;
        //var up = 0.2, down = 0.4, left = 0.2, right = 0.2;
         if (!this.isBlocked) {
            return;
        } else {
            var r = parseInt(Math.random() * 10);
            if (r < 2) {
                if (direction != TagOfDirection.up) {
                    this.isBlocked = false;
                    this.moveUp();
                }
            } else if (r < 4) {
                if (direction != TagOfDirection.left) {
                    this.isBlocked = false;
                    this.moveLeft();
                }
            } else if (r < 8) {
                if (direction != TagOfDirection.down) {
                    this.isBlocked = false;
                    this.moveDown();
                }
            } else if (r < 10) {
                if (direction != TagOfDirection.right) {
                    this.isBlocked = false;
                    this.moveRight();
                }
            }
        }
    }
});