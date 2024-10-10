import "reflect-metadata";
import Phaser from 'phaser';
import { gsap } from 'gsap';
import SpriteUtils from "../utils/SpriteUtils";

export default class PreloadScene extends Phaser.Scene {

  constructor() {
    super('preload');
  }

  preload() {
    SpriteUtils.loadArtForScene(this, 'preload')
  }

  create() {
    const centerX = this.scale.width/2;
    const centerY = this.scale.height/2;

    // Small animation
    const symbol = SpriteUtils.addImage(this, centerX, centerY, 'symbol-2a');
    gsap.to(symbol, {
      y: centerY + 10, 
      scaleX: 1.1,
      scaleY: 0.9,
      yoyo: true, 
      repeat: -1, 
      ease: 'sine.inOut',
      duration: 0.5
    });

    // Loading assets
    this.load.on('complete', () => {
      this.scene.start('loading');
    })

    /*** Loading assets ***/

    SpriteUtils.loadArtForScene(this, 'loading');

    this.load.start();
  }

}