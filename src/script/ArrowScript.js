export default class ArrowScript extends Laya.Script{
    constructor(){super()}

    onEnable(){
        this.speed = 2; //每秒移动2000像素
        this.startPoint = new Laya.Point(this.owner.x, this.owner.y);
        this.x_speed = this.speed * Math.cos(this.owner.rotation * Math.PI / 180);
        this.y_speed = this.speed * Math.sin(this.owner.rotation * Math.PI / 180);
        this.alpha = 0;
    }

    onUpdate(){
        this.owner.x += this.x_speed * Laya.timer.delta;
        this.owner.y += this.y_speed * Laya.timer.delta;
        let distance = this.startPoint.distance(this.owner.x, this.owner.y);
        if(distance > 100) this.alpha = 1;
        if(distance > 2000){
            this.owner.removeSelf();
        }
    }

    onDisable(){
        //当箭被移除时，回收箭到对象池，从而方便复用，减少创建对象的开销
        Laya.Pool.recover('arrow', this.owner);
    }
}