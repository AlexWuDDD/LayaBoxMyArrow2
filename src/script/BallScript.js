export default class BallScript extends Laya.Script{
    constructor(){super();}

    onEnable(){
        this.img_ball = this.owner.getChildByName('img_ball');

        //复位图形的表现
        if(this.boom === true){
            // this.img_ball.texture = 'img/ball_red.png';
            this.img_ball.alpha = 1;
            this.owner.graphics.clear();
        }

        this.y_speed = 0;
        //每秒加速10像素
        this.Acceleration = 0.001;
        this.boom = false;
        this.radio = 30;
        this.radioRaise = 2;
    }

    onUpdate(){
        if(this.boom === true){
            console.log("boom is true")
            Laya.SoundManager.playSound('sound/papa.ogg', 1);
            this.owner.graphics.clear();
            this.radioRaise *= 2;
            let radio = this.radio + this.radioRaise;
            this.owner.graphics.drawCircle(0, 0, radio, null,'#9cdb5a', 1);
            if(radio >= 80) this.owner.removeSelf();
        }
        else{
            console.log("boom is false")
            this.y_speed += this.Acceleration * Laya.timer.delta;
            this.owner.y += this.y_speed;
            console.log(this.owner.y);
            if(this.owner.y > 1250){
                this.boom = true;
                this.img_ball.alpha = 0;
                this.radio = 30;
                this.radioRaise = 2;
            }
        }
    }

    onDisable(){
        //当被气球移除时，回收气球到对象池，从而方便复用，减少创建对象的开销
        Laya.Pool.recover('ball', this.owner);
    }
}