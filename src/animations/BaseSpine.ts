export default abstract class BaseSpine<SkinType, AnimationType, AttachmentType, SlotType> {
    protected spineState: SpineState<SkinType, AnimationType, AttachmentType, SlotType>;
    protected spineObject: SpineGameObject;

    constructor(scene: Phaser.Scene, key: string, x: number, y: number) {
        this.spineObject = scene.make.spine({x: x, y: y, key: key, loop: true});//, scene.sys.plugins.get('SpinePlugin') as SpinePlugin, x, y, key, '', true);
        this.spineState = this.getDefaultSpineState();
        this.updateParameters();
    }

    public updateParameters(): void {
        this.spineObject.setAttachment(this.spineState.slot as any, this.spineState.attachment as any);
        this.spineObject.play(this.spineState.animation as any, true);
        this.spineObject.setSkinByName(this.spineState.skin as any);
    }

    public getSpineState() : SpineState<SkinType, AnimationType, AttachmentType, SlotType> {
        return this.spineState;
    }

    abstract getDefaultSpineState() : SpineState<SkinType, AnimationType, AttachmentType, SlotType>;
}

export interface SpineState<SkinType, AnimationType, AttachmentType, SlotType> {
    skin: SkinType;
    animation: AnimationType;
    attachment: AttachmentType;
    slot: SlotType;
}
