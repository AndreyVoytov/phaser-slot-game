import BaseSpine, { SpineState } from "./BaseSpine";

export class GoblinSpine extends BaseSpine<GoblinSkinType, GoblinAnimationType, GoblinAttachmentType, GoblinSlotType> {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, 'goblin', x, y);
    }

    getDefaultSpineState(): SpineState<GoblinSkinType, GoblinAnimationType, GoblinAttachmentType, GoblinSlotType> {
        return {
            skin: GoblinSkinType.Goblin,
            animation: GoblinAnimationType.Walk,
            attachment: GoblinAttachmentType.Dagger,
            slot: GoblinSlotType.RightHand,
        }; 
    }
}

export enum GoblinSkinType {
    Goblin = 'goblin',
    GoblinGirl = 'goblingirl',
}

export enum GoblinAnimationType {
    Walk = 'walk',
    IIdle = 'idle',
}

export enum GoblinAttachmentType {
    Dagger = 'dagger',
    Spear = 'spear',
}

export enum GoblinSlotType {
    LeftHand = 'left hand item',
    RightHand = 'right hand item',
}

