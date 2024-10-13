export default class Utils{

    public static getEnumValues<T extends { [key: string]: string | number }>(e: T): Array<T[keyof T]> {
        return Object.values(e).filter((value) => typeof value === 'number' || typeof value === 'string') as Array<T[keyof T]>;
    }
}

