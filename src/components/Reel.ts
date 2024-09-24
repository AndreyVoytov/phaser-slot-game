import Phaser from 'phaser';
import SymbolUtils from '../utils/SymbolUtils';
import { SymbolType } from '../enums/SymbolType';

export default class Reel {
    private scene: Phaser.Scene;
    private positionX: number;
    private positionY: number;
    private pattern: SymbolType[];
    private container!: Phaser.GameObjects.Container;
    private symbolHeight: number;
    private symbolWidth: number;
    private currentSymbol!: number;

    //TODO inherit class from Container?
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
        let reelSymbolsCount = (Math.ceil(SymbolUtils.getMaxSymbolsShift() / pattern.length) + 1) * pattern.length; 
        
        for (let i = 0; i < this.pattern.length * reelSymbolsCount; i++) {
            const symbol = this.pattern[i % this.pattern.length];
            const symbolSprite = this.scene.add.sprite(0, i * this.symbolHeight, SymbolUtils.getImageBySymbol(symbol));
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
            let toSymbolPosition = this.currentSymbol + shiftSymbols;
            let toY = this.getYBySymbolPosition(toSymbolPosition);
            let duration = 1000 + shiftSymbols * 75; // Adjust duration based on shift symbols
    
            this.scene.tweens.add({
                targets: this.container,
                y: toY,
                ease: 'Cubic.easeOut',
                duration: duration,
                onComplete: () => {
                    //spin reel back secretly
                    this.container.y = this.getYBySymbolPosition(toSymbolPosition % this.pattern.length);
                    this.currentSymbol = toSymbolPosition % this.pattern.length;
                    resolve();
                },
            });
        });
    }

    private getYBySymbolPosition(symbolPosition: number) : number {
        return -symbolPosition * this.symbolHeight + this.positionY; //TODO remove this.positionY?
    }

    private applyMask() : void {
        let maskHeight = 210;
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
