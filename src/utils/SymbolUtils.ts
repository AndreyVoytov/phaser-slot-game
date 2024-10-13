import { SymbolType } from "../enums/SymbolType";

export default class SymbolUtils{

    public static getMaxSymbolsShift() : number {
        return 15;
    }

    public static getMinSymbolsShift() : number {
        return 9;
    }

    public static getImageBySymbol(symbol:SymbolType): string{
        switch(symbol){
            case SymbolType.ACORN: 
                return 'symbol-1';
            case SymbolType.MUSHROOM:
                return 'symbol-2';
            case SymbolType.SNAIL: 
                return 'symbol-3';
            case SymbolType.CLAWS:
                return 'symbol-4';
            case SymbolType.BERRY:
                return 'symbol-5';
            case SymbolType.STONE:
                return 'symbol-6';
        }
    }

    public static getSymbolText(symbol: SymbolType) : string{
        switch(symbol){
            case SymbolType.ACORN: 
                return 'acorn';
            case SymbolType.MUSHROOM:
                return 'mushroom';
            case SymbolType.SNAIL: 
                return 'snail';
            case SymbolType.CLAWS:
                return 'beast';
            case SymbolType.BERRY:
                return 'berry';
            case SymbolType.STONE:
                return 'stone';

        }
    }
    
    public static getEnumValues<T extends { [key: string]: string | number }>(e: T): Array<T[keyof T]> {
        return Object.values(e).filter((value) => typeof value === 'number' || typeof value === 'string') as Array<T[keyof T]>;
    }
}


