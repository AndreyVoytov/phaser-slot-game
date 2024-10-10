import { ATLAS_BY_IMAGE_MAPPING, ATLAS_LIST_BY_SCENE, IMAGE_LIST_BY_SCENE } from "../config/ImageConfig";

export default class SpriteUtils{

    private static BLANK_KEY = 'cloud';

    /// Loading all scene art by scene key
    public static loadArtForScene(scene: Phaser.Scene, sceneKey: string) : void {
        let imagesMap = IMAGE_LIST_BY_SCENE.get(sceneKey)!;
        for(let key of imagesMap.keys()){
            scene.load.image(key, imagesMap.get(key));
        }

        // for(let i=0; i< 2000; i++){
        //     scene.load.image('azaza'+i, 'azaza'+i);
        // }

        let atlasesMap = ATLAS_LIST_BY_SCENE.get(sceneKey)!;
        for(let key of atlasesMap.keys()){
            scene.load.atlas(key, atlasesMap.get(key)?.replace('json', 'png'), atlasesMap.get(key));
        }
    }

    /// ADD IMAGE wrap method
    public static addImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(this.isArtLoadedForKey(scene, key)) {
            return this.doAddImage(scene, x, y, key);
        } 

        let image = this.doAddImage(scene, x, y, this.BLANK_KEY);
        this.loadArtForKey(scene, key).then(()=>{
            this.doSetTexture(image, key);
        });
        return image;
    }
        
    /// CREATE IMAGE wrap method
    public static createImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(this.isArtLoadedForKey(scene, key)) {
            return this.doCreateImage(scene, x, y, key);
        } 

        let image = this.doCreateImage(scene, x, y, this.BLANK_KEY);
        this.loadArtForKey(scene, key).then(()=>{
            this.doSetTexture(image, key);
        });
        return image;
    }
    
    /// SET TEXTURE wrap method
    public static setTexture(scene: Phaser.Scene, image: Phaser.GameObjects.Image, key: string) : void{
        if(this.isArtLoadedForKey(scene, key)) {
            this.doSetTexture(image, key);
            return;
        } 

        this.doSetTexture(image, this.BLANK_KEY);
        this.loadArtForKey(scene, key).then(()=>{
            this.doSetTexture(image, key);
        });
    }


    private static isArtLoadedForKey(scene: Phaser.Scene, key: string) : boolean{
        let atlasKey = ATLAS_BY_IMAGE_MAPPING.get(key);
        if(atlasKey) {
            return scene.textures.exists(atlasKey);
        }
        return scene.textures.exists(key);
    }

    private static doCreateImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(ATLAS_BY_IMAGE_MAPPING.has(key)) {
            return new Phaser.GameObjects.Sprite(scene, x, y, ATLAS_BY_IMAGE_MAPPING.get(key)!, key);
        }
        return new Phaser.GameObjects.Sprite(scene, x, y, key);
    }

    private static doAddImage(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
        if(ATLAS_BY_IMAGE_MAPPING.has(key)) {
            return scene.add.image(x, y, ATLAS_BY_IMAGE_MAPPING.get(key)!, key);
        }
        return scene.add.image(x, y, key);
    }

    private static doSetTexture(image: Phaser.GameObjects.Image, key: string) : void{
        if(ATLAS_BY_IMAGE_MAPPING.has(key)) {
            image.setTexture(ATLAS_BY_IMAGE_MAPPING.get(key)!, key);
            return;
        }
        image.setTexture(key);
    }
    
    private static loadArtForKey(scene:Phaser.Scene, key: string) : Promise<void> {

        return new Promise((resolve, reject) => {
            let atlasKey = ATLAS_BY_IMAGE_MAPPING.get(key);
            if(atlasKey) {
                let path = this.getAtlasPathByKey(atlasKey);
                scene.load.atlas(atlasKey, path.replace('json', 'png'), path);
            } else {
                let path = this.getImagepathByScene(key);
                scene.load.image(key, path);
            }

            const onFileComplete = (loadedKey: any, type: any, data: any) => {
                if (loadedKey === key || loadedKey == atlasKey) {
                    scene.load.off('filecomplete', onFileComplete);
                    resolve();
                }
            };
            scene.load.on('filecomplete', onFileComplete);
            scene.load.start();
        });
    }

    private static getAtlasPathByKey(key:string) : string {
        for(let sceneKey of ATLAS_LIST_BY_SCENE.keys()) {
            let path = ATLAS_LIST_BY_SCENE.get(sceneKey)?.get(key);
            if(path) return path;
        };
        return '';
    }

    private static getImagepathByScene(key:string) : string {
        for(let sceneKey of IMAGE_LIST_BY_SCENE.keys()) {
            let path = IMAGE_LIST_BY_SCENE.get(sceneKey)?.get(key);
            if(path) return path;
        };
        return '';
    }

}
