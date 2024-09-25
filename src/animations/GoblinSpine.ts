import BaseSpine, { SpineState } from "./BaseSpine";

export class GoblinSpine extends BaseSpine<GoblinSkinType, GoblinAnimationType> {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, 'goblin', x, y);
    }

    getDefaultSpineState(): SpineState<GoblinSkinType, GoblinAnimationType> {
        return {
            skin: GoblinSkinType.Goblin,
            animation: GoblinAnimationType.IIdle,
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

