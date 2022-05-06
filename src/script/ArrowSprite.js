export default class ArrowSprite extends Laya.Sprite{
    constructor(){super()}

    onEnable(){
        this.speed = 2; //每秒移动2000像素
        this.startPoint = new Laya.Point(this.x, this.y);
        this.x_speed = this.speed * Math.cos(this.rotation * Math.PI / 180);
        this.y_speed = this.speed * Math.sin(this.rotation * Math.PI / 180);
        this.alpha = 0;

        Laya.timer.frameLoop(1, this, this.onUpdate);
    }

    onUpdate(){
        this.x += this.x_speed * Laya.timer.delta;
        this.y += this.y_speed * Laya.timer.delta;
        let distance = this.startPoint.distance(this.x, this.y);
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