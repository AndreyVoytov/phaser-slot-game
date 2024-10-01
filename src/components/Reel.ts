import Phaser from 'phaser';
import SymbolUtils from '../utils/SymbolUtils';
import { SymbolType } from '../enums/SymbolType';
import { gsap } from 'gsap';
import SpriteUtils from '../utils/SpriteUtils';

export default class Reel {
    private scene: Phaser.Scene;
    private positionX: number;
    private positionY: number;
    private pattern: SymbolType[];
    private container!: Phaser.GameObjects.Container;
    private symbolHeight: number;
    private symbolWidth: number;
    private currentSymbol!: number;

    constructor(scene: Phaser.Scene, x: number, y: number, pattern: SymbolType[]) {
        this.scene = scene;
        this.positionX = x;
        this.positionY = y;
        this.pattern = pattern;
        this.symbolHeight = 170;
        this.symbolWidth = 120;
        this.currentSymbol = 0;
        this.container = this.scene.add.container(this.positionX, this.positionY);
    
        //big enough number of symbols for one spin
        const reelSymbolsCount = (Math.ceil(SymbolUtils.getMaxSymbolsShift() / pattern.length) + 1) * pattern.length; 
        
        for (let i = 0; i < this.pattern.length * reelSymbolsCount; i++) {
            const symbol = this.pattern[i % this.pattern.length];
            const symbolSprite = SpriteUtils.addImage(scene, 0, i * this.symbolHeight, SymbolUtils.getImageBySymbol(symbol));
            this.container.add(symbolSprite);
        }
        this.applyMask();
    }

    public getCurrentSymbolType() : SymbolType {
        return this.pattern[this.currentSymbol % this.pattern.length];
    }
    
    //spin logic
    public spin(shiftSymbols: number): Promise<void> {

        return new Promise((resolve) => {
            const toSymbolPosition = this.currentSymbol + shiftSymbols;
            const toY = this.getYBySymbolPosition(toSymbolPosition);
            const duration = 1000 + shiftSymbols * 75; // Adjust duration based on shift symbols
    
            const self = this;
            gsap.to(this.container, {
                y: toY,
                ease: 'power1.out',
                duration: duration / 1000,
                onComplete: function() {
                    //spin reel back secretly
                    self.container.y = self.getYBySymbolPosition(toSymbolPosition % self.pattern.length);
                    self.currentSymbol = toSymbolPosition % self.pattern.length;
                    resolve();
                }
            });
        });
    }

    private getYBySymbolPosition(symbolPosition: number) : number {
        return -symbolPosition * this.symbolHeight + this.positionY;
    }

    private applyMask() : void {
        const maskHeight = 210;
        const maskShape = this.scene.add.rectangle(
            this.positionX,
            this.positionY,
            this.symbolWidth,
            maskHeight,
            0xffffff
        );
        const mask = maskShape.createGeometryMask();
        this.container.setMask(mask);
        maskShape.visible = false;
    }
}
