import "reflect-metadata";
import Phaser from 'phaser';
import { gsap } from 'gsap';

export default class PreloadScene extends Phaser.Scene {

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('symbol1', 'assets/art/symbol-2.png');
  }

  create() {
    const centerX = this.scale.width/2;
    const centerY = this.scale.height/2;

    // Small animation
    const symbol = this.add.image(centerX, centerY, 'symbol1');
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
      this.scene.start('LoadingScene');
    })

    //for test TODO remove
    for (let i = 0; i < 1000; i++) {
      this.load.image(`dummy${i}`, `path/to/smallDummyImage.png`);
    }

    this.load.atlas('loading-atlas', 'assets/art/loading-atlas.png', 'assets/art/loading-atlas.json');
    
    // this.load.image('progress', 'assets/art/progress.png');
    // this.load.image('progress-bg', 'assets/art/progress-bg.png');

    this.load.start();
  }

}