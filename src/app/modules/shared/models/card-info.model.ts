import { EventEmitter } from "@angular/core";
import { PokemonApiResponse } from "./pokemon-api.model";

export class CardInfo {
    imgsSrc: string[];
    title: string;
    criesUrl: string[];
    colors: string[];
    pokeData: PokemonApiResponse[] = [];
    flipped: boolean;
    shadowed: boolean[];
    
    constructor(imgsSrc: string[] = [], title: string = '', criesUrl: string[] = [], colors: string[] = [], pokeData: PokemonApiResponse[] = [], flipped: boolean = false, shadowed: boolean[] = []) {
        this.imgsSrc = imgsSrc;
        this.title = title;
        this.criesUrl = criesUrl;
        this.colors = colors;
        this.pokeData = pokeData;
        this.flipped = flipped;
        this.shadowed = shadowed;
    }
}