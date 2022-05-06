export default class BowScript extends Laya.Script{
    /** @prop {name: arrow, tips:"箭预制体对象", type:Prefab} */

    constructor(){super()}
    onEnable(){
        let xOffset = 30;
        this.sp_fired = this.owner.getChildByName('sp_fired');
        this.sp_fired.graphics.drawLine(20+xOffset, -145, 20+xOffset, 145, '#ffffff', 1);

        this.sp_ready = this.owner.getChildByName('sp_ready');
        this.sp_ready.graphics.drawLine(20+xOffset, -145, -16+xOffset, 0, '#ffffff', 1);
        this.sp_ready.graphics.drawLine(20+xOffset, 145, -16+xOffset, 0, '#ffffff', 1);

        this.sp_arrow = this.owner.getChildByName('sp_arrow');
        this.init();
    }
}

BowScript.prototype.init = function(){
    this.sp_arrow.alpha = 1;
    this.sp_fired.alpha = 0;
    this.sp_ready.alpha = 1;
    this.isReady = 1;
}

BowScript.prototype.fire = function(){
    if(this.isReady == false) return;
    this.isReady = false;
    this.sp_arrow.alpha = 0;
    this.sp_fired.alpha = 1;
    this.sp_ready.alpha = 0;

    //每0.1秒装填一次
    Laya.timer.once(100, this, this.init);

    //箭的方向垂直向上
    // let rotation = -90;
    let rotation = getAngle(this.owner.x, this.owner.y, Laya.stage.mouseX, Laya.stage.mouseY);
    this.owner.rotation = rotation;
    let ground = this.owner.parent.getChildByName('ground');
    let flyer = Laya.Pool.getItemByCreateFun('arrow', this.arrow.create, this.arrow);
    let arrow_globalPos = this.owner.localToGlobal(new Laya.Point(this.sp_arrow.x, this.sp_arrow.y));
    flyer.pos(arrow_globalPos.x, arrow_globalPos.y);
    flyer.rotation = rotation;
    ground.addChild(flyer);

    Laya.SoundManager.playSound('sound/bow.ogg', 1);

}

function getAngle(x1, y1, x2, y2){
    let x = x2 - x1;
    let y = y2 - y1;

    let angle = Math.round(Math.atan(y/x)/Math.PI*180);
    //规格化角度
    if(x>=0 && y >= 0) return angle;
    else if(x<0 && y >= 0) return 180 + angle;
    else if(x<0 && y < 0) return 180 + angle;
    else return 360 + angle;
}