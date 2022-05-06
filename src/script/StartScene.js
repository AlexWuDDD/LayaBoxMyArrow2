export default class StartScence extends Laya.Scene{
    constructor(){super()}
    onEnable(){
        this.BTN_start.on(Laya.Event.CLICK, this, function(e){
            e.stopPropagation();
            Laya.Scene.open('mainScene.scene');
        })
    }
}