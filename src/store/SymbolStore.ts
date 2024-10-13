import { injectable } from "inversify";
import { SymbolType } from "../enums/SymbolType";
import SymbolUtils from "../utils/SymbolUtils";
import Reel from "../components/Reel";

@injectable()
export class SymbolStore{

    /***  Stored data  ***/

    // Start symbols for each reel obtained from server
    private initialSymbols!: SymbolType[][];

    public setInitialSymbols(symbols: SymbolType[][]) : void {
        this.initialSymbols = symbols;
    }

    public getInitialSymbols() : SymbolType[][] {
        return this.initialSymbols;
    }


    /***  Mock methods for server requests  ***/

    // Mock method for spin result request
    public fetchSpinResult(reels: Reel[], spinsCount: number) : Promise<number[]> {
        return this.delay(100).then(() =>{
            switch(spinsCount){
                case 0: return this.getRotationsForSymbols(reels, [SymbolType.ACORN, SymbolType.CLAWS, SymbolType.MUSHROOM]);
                case 1: return this.getRotationsForSymbols(reels, [SymbolType.SNAIL, SymbolType.SNAIL, SymbolType.SNAIL]);
                case 3: return this.getRotationsForSymbols(reels, [SymbolType.STONE, SymbolType.STONE, SymbolType.STONE]);
                default:
            } 

            const min = SymbolUtils.getMinSymbolsShift();
            const max = SymbolUtils.getMaxSymbolsShift();
            return [
                Phaser.Math.Between(min, max), 
                Phaser.Math.Between(min, max), 
                Phaser.Math.Between(min, max)
            ];
        });
    }

    private getRotationsForSymbols (reels:Reel[], symbols: SymbolType[]) : number[]{
        return[
            this.getRotationsForSymbol(this.initialSymbols[0], reels[0], symbols[0]),
            this.getRotationsForSymbol(this.initialSymbols[1], reels[1], symbols[1]),
            this.getRotationsForSymbol(this.initialSymbols[2], reels[2], symbols[2]),
        ];
    }

    private getRotationsForSymbol (initialSymbols:SymbolType[], r:Reel, symbol: SymbolType) : number{
        let k = initialSymbols.length;
        return ((initialSymbols.indexOf(symbol) + 100 * k) - r.getCurrentSymbolIndex()) % k + k;
    }
    

    // Mock method for inital symbols request
    public fetchInitialSymbols() : Promise<SymbolType[][]> {
        return this.delay(100).then( () =>{
                return [
                    [SymbolType.ACORN, SymbolType.MUSHROOM, SymbolType.SNAIL, SymbolType.STONE, SymbolType.CLAWS, SymbolType.BERRY],
                    [SymbolType.MUSHROOM, SymbolType.SNAIL, SymbolType.ACORN, SymbolType.STONE, SymbolType.CLAWS, SymbolType.BERRY],
                    [SymbolType.ACORN, SymbolType.MUSHROOM, SymbolType.SNAIL, SymbolType.MUSHROOM, SymbolType.STONE, SymbolType.CLAWS, SymbolType.BERRY]
                ];
            }
        );
    }

    
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
}