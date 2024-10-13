import { injectable, postConstruct } from "inversify";
import { SymbolType } from "../enums/SymbolType";
import { AnimationMain } from "../config/AnimationConfig";

@injectable()
export class CombinationManager {

    private ALL_COMBINATIONS: Map<SymbolType[], string> = new Map();
    
    @postConstruct()
    public init(){
        for(let symbolType of Object.values(SymbolType)){
            this.ALL_COMBINATIONS.set([symbolType, symbolType, symbolType], AnimationMain.WIGGLE_ROW);
        }
    }

    public getSpecialAnimation(symbols: SymbolType[]): string {
        if(this.allSame(symbols)){
            return AnimationMain.WIGGLE_ROW;
        }

        if(this.hasSymbol(symbols, SymbolType.ACORN) && this.hasSymbol(symbols, SymbolType.CLAWS)){
            return AnimationMain.CRACK_ACORN;
        }

        if(this.hasSymbol(symbols, SymbolType.BERRY) && this.hasSymbol(symbols, SymbolType.SNAIL)){
            return AnimationMain.FEED_SNAIL;
        }

        return '';
    }

    private hasSymbol(symbols: SymbolType[], symbol):boolean {
        for(let s of symbols){
            if (s == symbol) return true;
        }
        return false;
    }

    private allSame(symbols: SymbolType[]):boolean {
        for(let s of symbols){
            if (s != symbols[0]) return false;
        }
        return true;
    }

}