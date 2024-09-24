import "reflect-metadata";
import Phaser from 'phaser';
import { lazyInject } from '../di-container';
import { TYPES } from '../di-types';
import { SymbolStore } from '../store/SymbolStore';

export default class PreloadScene extends Phaser.Scene {

    @lazyInject(TYPES.SymbolStore)
    private symbolStore!: SymbolStore;
    
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Display a loading progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
          x: width / 2,
          y: height / 2 - 50,
          text: 'Loading...',
          style: {
            font: '20px monospace',
            color: '#ffffff',
          },
        });
        loadingText.setOrigin(0.5, 0.5);

        this.symbolStore.fetchInitialSymbols().then(res => {
          this.symbolStore.setInitialSymbols(res);
        });

        this.load.on('progress', (value: number) => {
          progressBar.clear();
          progressBar.fillStyle(0xffffff, 1);
          progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
          progressBar.destroy();
          progressBox.destroy();
          loadingText.destroy();
        });

        // art
        this.load.image('background', 'assets/art/background.png');
        this.load.image('reel-frame', 'assets/art/reel-frame.png');
        this.load.image('reel-frame-hand', 'assets/art/reel-frame-hand.png');
        this.load.image('spin-button', 'assets/art/spin-button.png');
        this.load.image('symbol-1', 'assets/art/symbol-1.png');
        this.load.image('symbol-2', 'assets/art/symbol-2.png');
        this.load.image('symbol-3', 'assets/art/symbol-3.png');

        // sound
        this.load.audio('main-theme', 'assets/audio/main-theme.mp3');
        this.load.audio('win', 'assets/audio/win.mp3');
        
        // spine
        this.load.spine('goblin', 'assets/spine/goblins.json', 'assets/spine/goblins.atlas')
    }

    create() {
       this.scene.start('MainScene');
    }
}