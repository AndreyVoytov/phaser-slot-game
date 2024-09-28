import { ATLAS_BY_IMAGE_MAPPING, ATLAS_LIST_BY_SCENE, IMAGE_LIST_BY_SCENE } from "../config/ImageConfig";

export default class SpriteUtils{

    public static addImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(ATLAS_BY_IMAGE_MAPPING.has(key)) {
            return scene.add.image(x, y, ATLAS_BY_IMAGE_MAPPING.get(key)!, key);
        }
        return scene.add.image(x, y, key);
    }

    public static createImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(ATLAS_BY_IMAGE_MAPPING.has(key)) {
            return new Phaser.GameObjects.Sprite(scene, x, y, ATLAS_BY_IMAGE_MAPPING.get(key)!, key);
        }
        return new Phaser.GameObjects.Sprite(scene, x, y, key);
    }

    public static loadArtForScene(scene: Phaser.Scene, sceneKey: string) : void {
        
        let imagesMap = IMAGE_LIST_BY_SCENE.get(sceneKey)!;
        //TODO check for scenes vs art folders names [right here]
        for(let key of imagesMap.keys()){
            scene.load.image(key, imagesMap.get(key));
        }

        let atlasesMap = ATLAS_LIST_BY_SCENE.get(sceneKey)!;
        for(let key of atlasesMap.keys()){
            scene.load.atlas(key, atlasesMap.get(key) + '.png', atlasesMap.get(key) + '.json');
        }
    }

}
