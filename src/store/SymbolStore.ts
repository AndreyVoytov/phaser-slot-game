import { injectable } from "inversify";
import { SymbolType } from "../enums/SymbolType";
import SymbolUtils from "../utils/SymbolUtils";

@injectable()
export class SymbolStore{

    //stored data 
    private initialSymbols!: SymbolType[][];

    public setInitialSymbols(symbols: SymbolType[][]) : void {
        this.initialSymbols = symbols;
    }

    public getInitialSymbols() : SymbolType[][] {
        return this.initialSymbols;
    }

    //mock method for spin result request
    public fetchSpinResult() : Promise<number[]> {
        return this.delay(100).then( () =>{
                let min = SymbolUtils.getMinSymbolsShift();
                let max = SymbolUtils.getMaxSymbolsShift();
                return [
                    Phaser.Math.Between(min, max), 
                    Phaser.Math.Between(min, max), 
                    Phaser.Math.Between(min, max)
                ];
            }
        );
    }
    

    //mock method for inital symbols request
    public fetchInitialSymbols() : Promise<SymbolType[][]> {
        return this.delay(100).then( () =>{
                return [
                    [SymbolType.SYMBOL_1, SymbolType.SYMBOL_2, SymbolType.SYMBOL_3],
                    [SymbolType.SYMBOL_2, SymbolType.SYMBOL_3, SymbolType.SYMBOL_1],
                    [SymbolType.SYMBOL_1, SymbolType.SYMBOL_2, SymbolType.SYMBOL_3, SymbolType.SYMBOL_2]
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