import "reflect-metadata";
import Phaser from 'phaser';
import { gsap } from 'gsap';
import SpriteUtils from "../utils/SpriteUtils";

export default class PreloadScene extends Phaser.Scene {

  constructor() {
    super('preload');
  }

  preload() {
    this.load.image('symbol1', 'assets/art/symbol-2.png');
  }

  create() {
    const centerX = this.scale.width/2;
    const centerY = this.scale.height/2;

    // Small animation
    const symbol = SpriteUtils.addImage(this, centerX, centerY, 'symbol1');
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