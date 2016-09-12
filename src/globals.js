/**
 * Created by hysen on 2016/3/25.
 */
if (typeof TagOfLayer == "undefined") {
    var TagOfLayer = {};
    TagOfLayer.Map = 0;
    TagOfLayer.Game = 1;
}
if (typeof TagOfSupp == "undefined") {
    var TagOfSupp = {};
    TagOfSupp.addBullet = 0;
    TagOfSupp.speedUp = 1;
    TagOfSupp.shield = 2;
}
if (typeof TypeOfEnemy == "undefined") {
    var TypeOfEnemy = {};
    TypeOfEnemy.en1 = 0;
    TypeOfEnemy.en1r = 1;
    TypeOfEnemy.en2 = 2;
    TypeOfEnemy.en2r = 3;
    TypeOfEnemy.en3 = 4;
    TypeOfEnemy.en5 = 5;
    TypeOfEnemy.en6 = 6;
    TypeOfEnemy.en7 = 7;
}
if (typeof enemyFrameName == "undefined") {
    var enemyFrameName = ["en1.png", "en1r.png", "en2.png", "en2r.png", "en3.png", "en5.png", "en6.png", "en7.png"];
}

if (typeof TagOfIssue == "undefined") {
    var TagOfIssue = {};
    TagOfIssue.Allies = 0;
    TagOfIssue.Enemies = 1;
    TagOfIssue.Supplies = 2;
    TagOfIssue.Bullet = 3;
}
var tiledNums = 7;

if (typeof TiledType == "undefined") {
    var TiledType = {};
    TiledType.ground = 0;
    TiledType.wall = 1;
    TiledType.steel = 2;
    TiledType.grass = 3;
    TiledType.water = 4;
    TiledType.water2 = 5;
    TiledType.home = 6;
    TiledType.homeRuined = 7;
}