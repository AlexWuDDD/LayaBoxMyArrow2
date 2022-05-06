(function () {
    'use strict';

    class BowScript extends Laya.Script{
        /** @prop {name: arrow, tips:"箭预制体对象", type:Prefab} */

        constructor(){super();}
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
    };

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

    };

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

    class MainSceneControl extends Laya.Script {
        constructor() {super();}

        onEnable(){
            this.mybow = this.owner.getChildByName('mybow');
            this.ground = this.owner.getChildByName('ground');

            //确认气球预制体加载完毕的标识
            this.ballPrefabReady = false;
            Laya.loader.load("prefab/ball.prefab", Laya.Handler.create(this, function(prefab){
                this.ballPrefabReady = true;
                this.ballPrefab = prefab;
            }));

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
            this.ground.addChild(ball);
        }

        onUpdate(){
            this.deltaCount -= Laya.timer.delta;
            if(this.deltaCount < 0){
                this.deltaCount = 1000;
                this.createBall();
            }
        }

        onStageClick(e){
            //停止事件冒泡，提高性能
            e.stopPropagation();
            console.log('this.owner ', this.owner, '\n');
            let bowScript = this.mybow.getComponent(BowScript);
            bowScript.fire();
        }
    }

    class StartScence extends Laya.Scene{
        constructor(){super();}
        onEnable(){
            this.BTN_start.on(Laya.Event.CLICK, this, function(e){
                e.stopPropagation();
                Laya.Scene.open('mainScene.scene');
            });
        }
    }

    class ArrowScript extends Laya.Script{
        constructor(){super();}

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

    class BallScript extends Laya.Script{
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
                console.log("boom is true");
                this.owner.graphics.clear();
                this.radioRaise *= 2;
                let radio = this.radio + this.radioRaise;
                this.owner.graphics.drawCircle(0, 0, radio, null,'#9cdb5a', 1);
                if(radio >= 80) this.owner.removeSelf();
            }
            else{
                console.log("boom is false");
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

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/BowScript.js",BowScript);
    		reg("script/MainSceneControl.js",MainSceneControl);
    		reg("script/StartScene.js",StartScence);
    		reg("script/ArrowScript.js",ArrowScript);
    		reg("script/BallScript.js",BallScript);
        }
    }
    GameConfig.width = 720;
    GameConfig.height = 1280;
    GameConfig.scaleMode ="showall";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "center";
    GameConfig.startScene = "startScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError(true);

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
