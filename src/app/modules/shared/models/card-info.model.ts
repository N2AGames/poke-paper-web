import { EventEmitter } from "@angular/core";

export class CardInfo {
    imgSrc: string;
    title: string;
    cryUrl: string;
    color: string;
    flipped: boolean;
    
    constructor(imgSrc: string = '', title: string = '', cryUrl: string = '', color: string = '', flipped: boolean = false) {
        this.imgSrc = imgSrc;
        this.title = title;
        this.cryUrl = cryUrl;
        this.color = color;
        this.flipped = flipped;
    }
}