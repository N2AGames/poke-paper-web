import { EventEmitter } from "@angular/core";

export class CardInfo {
    imgSrc: string;
    title: string;
    flipped: boolean;
    
    constructor(imgSrc: string = '', title: string = '', flipped: boolean = false) {
        this.imgSrc = imgSrc;
        this.title = title;
        this.flipped = flipped;
    }
}