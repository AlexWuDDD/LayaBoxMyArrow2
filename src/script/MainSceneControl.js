import BowScript from "./BowScript";
import BallScript from "./BallScript";

export default class MainSceneControl extends Laya.Script {
    constructor() {super();}

    onEnable(){
        this.mybow = this.owner.getChildByName('mybow');
        this.ground = this.owner.getChildByName('ground');

        //确认气球预制体加载完毕的标识
        this.ballPrefabReady = false;
        Laya.loader.load("prefab/ball.prefab", Laya.Handler.create(this, function(prefab){
            this.ballPrefabReady = true;
            this.ballPrefab = prefab;
        }))

        //延时统计
        this.deltaCount = 1000;
    }

    createBall(){
        if(this.ballPrefabReady == false) return
        //使用对象池创建气球
        console.log("create ball");
        let ball = Laya.Pool.getItemByCreateFun('ball', this.ballPrefab.create, this.ballPrefab);
        let rodomX = parseInt(Math.random() * 60) + 1;
        let rodomY = parseInt(Math.random()*5);
        ball.pos(rodomX * 11, 200 + rodomY * 64);
        this.ground.addChild(ball)
    }

    onUpdate(){
        this.deltaCount -= Laya.timer.delta;
        if(this.deltaCount < 0){
            this.deltaCount = 1000;
            this.createBall();
        }
        this.collide();
    }

    onStageClick(e){
        //停止事件冒泡，提高性能
        e.stopPropagation();
        console.log('this.owner ', this.owner, '\n');
        let bowScript = this.mybow.getComponent(BowScript);
        bowScript.fire();
    }

    /**碰撞检测 */
    collide(){
        for(let i = 0; i < this.ground.numChildren; ++i){
            if(this.ground.getChildAt(i).name === 'arrow'){
                let arrow = this.ground.getChildAt(i);
                let point = new Laya.Point(arrow.x, arrow.y);
                for(let j = 0; j < this.ground.numChildren; ++j){
                    if(i == j) continue; //忽略与自身的碰撞
                    let target = this.ground.getChildAt(j);
                    if(target.name === 'arrow') continue;
                    if(target.boom === true) continue;
                    let distance = point.distance(target.x, target.y);
                    if(distance <= 35){
                        if(target.name === "ball"){
                            let ballScript = target.getComponent(BallScript);
                            if(ballScript && ballScript.boom === false){
                                ballScript.boom = true;
                            }
                        }
                        break;
                    }
                }
            }
            else{
                continue;
            }
        }
    }
}