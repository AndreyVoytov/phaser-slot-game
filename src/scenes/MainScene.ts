import "reflect-metadata";
import Phaser from 'phaser';
import gsap from 'gsap';
import Reel from '../components/Reel';
import { AudioManager } from '../managers/AudioManager';
import { lazyInject } from '../di-container';
import { TYPES } from '../di-types';
import { SymbolStore } from '../store/SymbolStore';
import { GoblinSpine } from "../animations/GoblinSpine";


export default class MainScene extends Phaser.Scene {
    private reels: Reel[] = [];
    private spinButton!: Phaser.GameObjects.Image;
    private isSpinning: boolean = false;
    
    @lazyInject(TYPES.AudioManager)
    private audioManager!: AudioManager;

    @lazyInject(TYPES.SymbolStore)
    private symbolStore!: SymbolStore;

    // @lazyInject(TYPES.AnimationManager)
    // private animationManager!: AnimationManager;

    constructor() {
        super('MainScene');
    }

    create() {
        this.add.image(400, 300, 'background');
        this.add.image(400, 300, 'reel-frame');

        // this.animationManager.addGoblin(this, 400, 600, 'goblin', 'walk', true);
        let goblin = new GoblinSpine(this, 400, 200);

        
        // Reels
        const initialSymbols = this.symbolStore.getInitialSymbols();
        const reelPositions = [260, 405, 550];
        for (let i = 0; i < 3; i++) {
            const reel = new Reel(this, reelPositions[i], 300, initialSymbols[i]);
            this.reels.push(reel);
        }

        // Spin Button
        this.spinButton = this.add.image(400, 500, 'spin-button').setInteractive();
        this.spinButton.on('pointerdown', () => {
            //TODO вынести музыку?
            this.audioManager.playMainTheme(this);
            this.spinReels();
        });

        // Sound Control
        //TODO move to AudioManager somehow
        const soundButton = this.add.text(700, 50, 'Sound ON', { fontSize: '20px', color: '#fff' }).setInteractive();
        let soundOn = true;
        soundButton.on('pointerdown', () => {
            this.audioManager.switchSound(this);
            soundButton.setText(soundOn ? 'Sound ON' : 'Sound OFF');
        });
    }

    private spinReels() {
        if (this.isSpinning) return;
        this.isSpinning = true;

        // get results from server
        this.symbolStore.fetchSpinResult().then(spinResults => {

            const spinAnimationPromises: Promise<void>[] = [];

            this.reels.forEach((reel, index) => {
                const delay = index * Phaser.Math.Between(100, 200); // Random delay for spin start
                const promise = new Promise<void>((resolve) => {
                    this.time.delayedCall(delay, () => {
                        reel.spin(spinResults[index]).then(() => {
                            resolve();
                        });
                    });
                });
                spinAnimationPromises.push(promise);
            });
            
            // Wait for all reels to finish spinning
            Promise.all(spinAnimationPromises).then(() => {

                // Check for win
                if (this.reels.every((val) => val.getCurrentSymbolType() == this.reels[0].getCurrentSymbolType())) {
                    this.sound.play('win');
                    this.showWinAnimation();
                } else {
                    this.showLoseAnimation();
                }
    
                this.isSpinning = false;
            });
        })
        
    }

    private showWinAnimation() {
        const winText = this.add.text(400, 150, 'You Win!', { fontSize: '40px', color: '#fff' })
        .setOrigin(0.5);
        this.time.delayedCall(2000, () => {
        winText.destroy();
        });
    }

    private showLoseAnimation() {
        const loseText = this.add.text(400, 150, 'Try Again!', { fontSize: '40px', color: '#fff' })
        .setOrigin(0.5);
        this.time.delayedCall(2000, () => {
        loseText.destroy();
        });
    }
}
