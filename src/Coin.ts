import luck from "./luck.ts";
export default class Coin {
    serial: string;
    

    constructor(i: number, j: number, n: number) {
        this.serial = this.makeSerial(i, j, n);
    }

    makeSerial(i: number, j: number, n: number) {
        const inputs = `${i},${j},${n}`;
        const hash = (luck(inputs) * 10e17).toString(16).slice(0, 16);
        return hash;
    }

}