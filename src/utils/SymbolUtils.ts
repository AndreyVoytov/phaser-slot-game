export default class SymbolUtils{

    public static getImageBySymbol(symbol:SymbolType): string{
        switch(symbol){
            case SymbolType.SYMBOL_1: 
                return 'symbol-1';
            case SymbolType.SYMBOL_2:
                return 'symbol-2';
            case SymbolType.SYMBOL_3: 
                return 'symbol-3';
        }
    }

    public static getMaxSymbolsShift() : number {
        return 15;
    }

    public static getMinSymbolsShift() : number {
        return 9;
    }
}

export enum SymbolType{
    SYMBOL_1 = 'SYMBOL_1',
    SYMBOL_2 = 'SYMBOL_2',
    SYMBOL_3 = 'SYMBOL_3'
}