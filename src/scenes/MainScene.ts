import "reflect-metadata";
import Phaser from 'phaser';
import gsap from 'gsap';
import Reel from '../components/Reel';
import { AudioManager } from '../managers/AudioManager';
import { lazyInject } from '../di-container';
import { TYPES } from '../di-types';
import { SymbolStore } from '../store/SymbolStore';
import { GoblinAnimationType, GoblinSkinType, GoblinSpine } from "../animations/GoblinSpine";
import { SymbolType } from "../enums/SymbolType";
import SymbolUtils from "../utils/SymbolUtils";


export default class MainScene extends Phaser.Scene {
    
    // indicates if reels still spinning (so player can not interact with spin button)
    private isSpinning: boolean = false; 

    // interactive scene objects
    private reels: Reel[] = [];
    private spinButton!: Phaser.GameObjects.Image;
    private goblin!: GoblinSpine;
    
    @lazyInject(TYPES.AudioManager)
    private audioManager!: AudioManager;

    @lazyInject(TYPES.SymbolStore)
    private symbolStore!: SymbolStore;

    constructor() {
        super('MainScene');
    }

    create() {
                
        // Add background, frame and goblin
        const centerX = this.scale.width/2;
        this.add.image(centerX, 430, 'background');
        this.add.image(centerX, 400, 'reel-frame');
        this.goblin = new GoblinSpine(this, centerX, 265);
        
        // Add reels
        const initialSymbols = this.symbolStore.getInitialSymbols();
        const reelPositions = [centerX - 145, centerX, centerX + 145];
        for (let i = 0; i < 3; i++) {
            const reel = new Reel(this, reelPositions[i], 400, initialSymbols[i]);
            this.reels.push(reel);
        }

        // Add spin button
        this.spinButton = this.add.image(centerX, 730, 'spin-button').setInteractive();
        this.spinButton.on('pointerup', () => {
            if(!this.isSpinning){
                this.isSpinning = true;
                this.spinButton.setTexture('spin-button-pressed');
                this.sound.play('click', {volume: 0.4});

                // Start reels animations
                this.spinReels();

                // Change goblin spine animation
                const state = this.goblin.getSpineState();
                if(state.animation != GoblinAnimationType.Walk){
                    this.goblin.getSpineState().animation = GoblinAnimationType.Walk;
                    this.goblin.getSpineState().skin = GoblinSkinType.Goblin;
                    this.goblin.updateAnimation();
                }          
            }  
        });

        // Add sound control button
        const soundImageKey = this.audioManager.getSoundEnabled()? 'sound-on' : 'sound-off';
        const soundButton = this.add.image(this.game.scale.width - 50, 50, soundImageKey).setInteractive();
        soundButton.setScale(0.7);
        soundButton.on('pointerup', () => {
            let soundOn = this.audioManager.switchSoundEnabled();
            soundButton.setTexture(soundOn? 'sound-on' : 'sound-off');
        });

        // Run audio on first touch
        const firstTouchAction = () => {
            this.audioManager.init(this);
            this.audioManager.playMainTheme();
            this.input.off('pointerdown', firstTouchAction);
        };
        this.input.on('pointerdown', firstTouchAction);
    }

    private spinReels() {
        // Get spin results from server
        this.symbolStore.fetchSpinResult().then(spinResults => {

            // Run spin animation for each reel
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

                // Process win
                if (this.reels.every((val) => val.getCurrentSymbolType() == this.reels[0].getCurrentSymbolType())) {
                    this.sound.play('win', {volume: 0.1});
                    this.showWinTextInfo(this.reels[0].getCurrentSymbolType());

                    // Change goblin spine animation
                    this.goblin.getSpineState().animation = GoblinAnimationType.IIdle;
                    this.goblin.getSpineState().skin = GoblinSkinType.GoblinGirl;
                    this.goblin.updateAnimation();

                    // Delay to enjoy win
                    this.time.delayedCall(700, () => {
                        this.isSpinning = false;
                        this.spinButton.setTexture('spin-button');
                    });

                // Process loose
                } else {
                    this.showLoseTextInfo();

                    // Change goblin spine animation
                    this.goblin.getSpineState().animation = GoblinAnimationType.IIdle;
                    this.goblin.updateAnimation();

                    this.isSpinning = false;
                    this.spinButton.setTexture('spin-button');
                }
            });
        })
    }

    // Show text info on win
    private showWinTextInfo(symbol: SymbolType) {
        const text = 'Bingo!\nYummy ' + SymbolUtils.getSymbolText(symbol);
        const winText = this.add.text(this.scale.width/2, 580, text, { fontSize: '40px', color: '#fff', align: 'center' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            winText.destroy();
        });
    }

    // Show text info on loose
    private showLoseTextInfo() {
        const text = 'No luck';
        const loseText = this.add.text(this.scale.width/2, 580, text, { fontSize: '40px', color: '#fff', align: 'center'}).setOrigin(0.5);
        this.time.delayedCall(1000, () => {
            loseText.destroy();
        });
    }
}
