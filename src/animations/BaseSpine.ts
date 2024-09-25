export default abstract class BaseSpine<SkinType, AnimationType> {
    protected spineState: SpineState<SkinType, AnimationType>;
    protected spineObject: SpineGameObject;

    constructor(scene: Phaser.Scene, key: string, x: number, y: number) {
        this.spineObject = scene.make.spine({x: x, y: y, key: key, loop: true, scale: 0.7});
        this.spineState = this.getDefaultSpineState();
        this.updateAnimation();
    }

    public updateAnimation(): void {
        this.spineObject.play(this.spineState.animation as any, true);
        this.spineObject.setSkinByName(this.spineState.skin as any);
    }

    public getSpineState() : SpineState<SkinType, AnimationType> {
        return this.spineState;
    }

    abstract getDefaultSpineState() : SpineState<SkinType, AnimationType>;
}

export interface SpineState<SkinType, AnimationType> {
    skin: SkinType;
    animation: AnimationType;
}
