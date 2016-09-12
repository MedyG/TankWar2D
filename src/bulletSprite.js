/**
 * Created by hysen on 2016/3/27.
 */
var BulletSprite = cc.Sprite.extend({
    mapLayer: null,
    tank: null,
    isFlying: false,
    stepX: 0,
    stepY: 0,
    bulletSpeed: 5,
    direct:0,
    /** constructor
     * @param {TagOfIssue *}
     * @param {Issue of tank *}
     **/
    ctor: function (tag, tankIssue) {
        this.mapLayer = tankIssue.mapLayer;
        this.tank = tankIssue;
        var bulletFrame = cc.spriteFrameCache.getSpriteFrame("bullet.png");
        this._super(bulletFrame);
        this.tank.mapLayer.addChild(this, 3);
        this.bulletSpeed = this.tank.moveSpeed + 1;
        this.direct = this.tank.sprite.getRotation() / 90;
        this.setTag(tag);


    },
    bulletFire: function () {
        if (!this.isFlying) {
            this.isFlying = true;
            this.setVisible(true);
            this.setPosition(this.tank.sprite.getPosition());
            var direction = this.tank.sprite.getRotation() / 90;
            switch (direction) {
                case TagOfDirection.up:
                    this.setRotation(90 * TagOfDirection.up);
                    this.stepX = 0;
                    this.stepY = this.bulletSpeed;
                    break;
                case TagOfDirection.down:
                    this.setRotation(90 * TagOfDirection.down);
                    this.stepX = 0;
                    this.stepY = 0 - this.bulletSpeed;
                    break;
                case TagOfDirection.left:
                    this.setRotation(90 * TagOfDirection.left);
                    this.stepX = 0 - this.bulletSpeed;
                    this.stepY = 0;
                    break;
                case TagOfDirection.right:
                    this.setRotation(90 * TagOfDirection.right);
                    this.stepX = this.bulletSpeed;
                    this.stepY = 0;
                    break;
                default:
                    break;
            }
            this.scheduleUpdate();
        }
        return true;
    },
    isCollision: function () {
        var bulletBox = this.getBoundingBox();
        var gid = 0;
        var mapSize = this.tank.mapLayer.getContentSize();
        var tileSize = this.tank.mapLayer.map1.getTileSize();
        if (cc.rectGetMinX(bulletBox) <= this.tank.mapLayer.leftBoundary + 0.1 ||
            cc.rectGetMaxX(bulletBox) >= this.tank.mapLayer.rightBoundary ||
            cc.rectGetMinY(bulletBox) <= this.tank.mapLayer.bottomBoundary + 0.1 ||
            cc.rectGetMaxY(bulletBox) >= this.tank.mapLayer.topBoundary) {
            return true;
        }
        if (this.checkTidIsHome(this.mapLayer.getTiledIdFromPos(this.getPosition()))) {
            this.mapLayer.bg3.visible = true;
            // game over
            this.mapLayer.lives = -1;
            return true;
        }

        // hit the Allies
        if (this.tank.isEnemy) {
            // bullets
            for (var j = 0; j < this.tank.mapLayer.playerTank.bulletSprites.length; j++) {
                if (this.isIntersect(this.getBoundingBox(),
                        this.tank.mapLayer.playerTank.bulletSprites[j].getBoundingBox())) {

                    this.tank.mapLayer.playerTank.bulletSprites[j].unscheduleUpdate();
                    this.tank.mapLayer.playerTank.bulletSprites[j].setVisible(false);
                    this.tank.mapLayer.playerTank.bulletSprites[j].isFlying = false;
                    this.tank.mapLayer.playerTank.bulletSprites[j].tank.bulletNum--;
                    this.tank.mapLayer.playerTank.bulletSprites[j].bulletBoom();
                    return true;
                }
            }
            // Allies tank
            if (this.isIntersect(this.getBoundingBox(), this.mapLayer.playerTank.sprite.getBoundingBox())) {
                if (!this.mapLayer.playerTank.shielded) {
                    this.mapLayer.playerTank.tankBoom();
                }
                return true;
            }
        } else {
            for (var i = 0; i < this.tank.mapLayer.enemyAI.enemyIssues.length; i++) {
                for (var j = 0; j < this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites.length; j++) {
                    if (this.isIntersect(this.getBoundingBox(), this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].getBoundingBox())) {
                        this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].unscheduleUpdate();
                        this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].setVisible(false);
                        this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].isFlying = false;
                        this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].tank.bulletNum--;
                        this.tank.mapLayer.enemyAI.enemyIssues[i].bulletSprites[j].bulletBoom();
                        return true;
                    }
                }
                if (this.isIntersect(this.getBoundingBox(), this.tank.mapLayer.enemyAI.enemyIssues[i].sprite.getBoundingBox())) {
                    if (!this.tank.mapLayer.enemyAI.enemyIssues[i].shielded) {
                        this.tank.mapLayer.enemyAI.enemyIssues[i].tankBoom();
                    }
                    return true;
                }
            }

        }
        // crash at the map tile
        // adjust the y-axis coordinate
        var minY = mapSize.height - cc.rectGetMinY(bulletBox);
        var maxY = mapSize.height - cc.rectGetMaxY(bulletBox);
        var gid = this.tank.mapLayer.getTiledIdFromPos(this.getPosition());
        while (gid >= 28) {
            gid -= 28;
        }
        var type = Math.ceil(gid / 4);
        if (type != TiledType.grass && type != TiledType.ground && type != TiledType.water
            && type != TiledType.water2 && type != TiledType.homeRuined) {
            return true;
        }
        return false;
    },
    bulletBoom: function () {
        // this.tank.fireDelay = 0.5;
        this.removeFromParent();
        var tag = this.getTag();
        for (var i = 0; i < this.tank.bulletSprites.length; i++) {
            if (tag == this.tank.bulletSprites[i].getTag()) {
                this.tank.bulletSprites.splice(i, 1);
            }
        }
        var bulletBox = this.getBoundingBox();
        var mapSize = this.tank.mapLayer.map1.getContentSize();
        if (cc.rectGetMinX(bulletBox) <= this.tank.mapLayer.leftBoundary + 0.1 ||
            cc.rectGetMaxX(bulletBox) >= this.tank.mapLayer.rightBoundary ||
            cc.rectGetMinY(bulletBox) <= this.tank.mapLayer.bottomBoundary + 0.1 ||
            cc.rectGetMaxY(bulletBox) >= this.tank.mapLayer.topBoundary) {
            return;
        }
        var tileSize = this.tank.mapLayer.bg1.getMapTileSize();
        // adjust the y-axis coordinate
        var minY = mapSize.height - cc.rectGetMinY(bulletBox);
        var maxY = mapSize.height - cc.rectGetMaxY(bulletBox);
        var bulletPoint = cc.p(parseInt((cc.rectGetMinX(bulletBox)
            - this.tank.mapLayer.leftBoundary) / tileSize.width), parseInt(minY / tileSize.height));
        if (this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(bulletPoint))) {
            this.tank.mapLayer.bg1.setTileGID(TiledType.ground, bulletPoint);
            if (this.direct == TagOfDirection.left &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x, bulletPoint.y + 1)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x, bulletPoint.y + 1));
            } else if (this.direct == TagOfDirection.down &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x - 1, bulletPoint.y)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x - 1, bulletPoint.y));
            }
        }
        bulletPoint = cc.p(parseInt((cc.rectGetMinX(bulletBox)
            - this.tank.mapLayer.leftBoundary) / tileSize.width), parseInt(maxY / tileSize.height));
        if (this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(bulletPoint))) {
            this.tank.mapLayer.bg1.setTileGID(TiledType.ground, bulletPoint);
            if (this.direct == TagOfDirection.left &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x, bulletPoint.y - 1)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x, bulletPoint.y - 1));
            } else if (this.direct == TagOfDirection.up &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x - 1, bulletPoint.y)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x - 1, bulletPoint.y));
            }
        }
        bulletPoint = cc.p(parseInt((cc.rectGetMaxX(bulletBox)
            - this.tank.mapLayer.leftBoundary) / tileSize.width), parseInt(minY / tileSize.height));
        if (this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(bulletPoint))) {
            this.tank.mapLayer.bg1.setTileGID(TiledType.ground, bulletPoint);
            if (this.direct == TagOfDirection.right &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x, bulletPoint.y + 1)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x, bulletPoint.y + 1));
            } else if (this.direct == TagOfDirection.down &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x + 1, bulletPoint.y)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x + 1, bulletPoint.y));
            }
        }
        bulletPoint = cc.p(parseInt((cc.rectGetMaxX(bulletBox)
            - this.tank.mapLayer.leftBoundary) / tileSize.width), parseInt(maxY / tileSize.height));
        if (this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(bulletPoint))) {
            this.tank.mapLayer.bg1.setTileGID(TiledType.ground, bulletPoint);
            if (this.direct == TagOfDirection.right &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x, bulletPoint.y - 1)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x, bulletPoint.y - 1));
            } else if (this.direct == TagOfDirection.up &&
                this.checkTidIsWall(this.tank.mapLayer.bg1.getTileGIDAt(cc.p(bulletPoint.x + 1, bulletPoint.y)))) {
                this.tank.mapLayer.bg1.setTileGID(TiledType.ground, cc.p(bulletPoint.x + 1, bulletPoint.y));
            }
        }

    },
    checkTidIsWall: function (tid) {
        var _tid = tid;
        while (_tid >= 28) {
            _tid -= 28;
        }
        var type = Math.ceil(_tid / 4); // 32/8=4
        if (type == TiledType.wall) {
            return true;
        } else {
            return false;
        }
        return false;
    },
    checkTidIsHome: function (tid) {
        var _tid = tid;
        while (_tid >= 28) {
            _tid -= 28;
        }
        var type = Math.ceil(_tid / 4); // 32/8=4
        if (type == TiledType.home) {
            return true;
        } else {
            return false;
        }
        return false;
    },
    update: function (dt) {
        // cc.Sprite.update(dt);
        this.setPosition(cc.p(this.getPosition().x + this.stepX, this.getPosition().y + this.stepY));
        if (this.isCollision()) {
            this.unscheduleUpdate();
            this.setVisible(false);
            this.isFlying = false;
            this.tank.bulletNum--;
            this.bulletBoom();
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
    }
});