import "reflect-metadata";
import Phaser from 'phaser';
import { lazyInject } from '../di-container';
import { TYPES } from '../di-types';
import { SymbolStore } from '../store/SymbolStore';
import { gsap } from 'gsap';

export default class PreloadScene extends Phaser.Scene {

  @lazyInject(TYPES.SymbolStore)
  private symbolStore!: SymbolStore;

  constructor() {
    super('LoadingScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const centerX = width / 2;
    const centerY = height / 2;

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

    // Display a loading progress bar
    let progressWidth = this.textures.get('progress-bg').source[0].width;
    this.add.image(centerX - progressWidth/2, centerY + 100, 'progress-bg').setOrigin(0, 0.5);
    const progressBar = this.add.image(centerX - progressWidth/2, centerY + 100, 'progress').setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      const cropWidth = progressBar.width * value;
      progressBar.setCrop(0, 0, cropWidth, progressBar.height);
    });

    this.load.on('complete', () => {
      this.scene.start('MainScene');
    });

    // Display 'Loading...' text
    const loadingText = this.make.text({
      x: width / 2,
      y: height - 50,
      text: 'Loading...',
      style: {
        font: '25px monospace',
        color: '#595959',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    // Fetch initial symbols for MainScene from server
    this.symbolStore.fetchInitialSymbols().then(res => {
      this.symbolStore.setInitialSymbols(res);
    });

    for (let i = 0; i < 1000; i++) {
      this.load.image(`dummy${i}`, `path/to/smallDummyImage.png`);
    }


    /*** Loading assets ***/

    // art
    this.load.image('background', 'assets/art/background.png');
    this.load.image('reel-frame', 'assets/art/reel-frame.png');
    this.load.image('reel-frame-hand', 'assets/art/reel-frame-hand.png');
    this.load.image('spin-button', 'assets/art/spin-button.png');
    this.load.image('spin-button-pressed', 'assets/art/spin-button-pressed.png');
    this.load.image('sound-on', 'assets/art/sound-on.png');
    this.load.image('sound-off', 'assets/art/sound-off.png');
    this.load.image('symbol-1', 'assets/art/symbol-1.png');
    this.load.image('symbol-2', 'assets/art/symbol-2.png');
    this.load.image('symbol-3', 'assets/art/symbol-3.png');

    // sound
    this.load.audio('main-theme', 'assets/audio/main-theme.mp3');
    this.load.audio('win', 'assets/audio/win.mp3');
    this.load.audio('click', 'assets/audio/click.mp3');

    // spine
    this.load.spine('goblin', 'assets/spine/goblins.json', 'assets/spine/goblins.atlas')

    this.load.start();
  }

}