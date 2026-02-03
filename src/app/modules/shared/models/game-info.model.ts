export class GameInfo {
    guessed: Map<string, number> = new Map<string, number>();
    tries: Map<string, number> = new Map<string, number>();
    dailyMap: Map<string, boolean> = new Map<string, boolean>();

    constructor(guessed: Map<string, number>, tries: Map<string, number> = new Map<string, number>(), 
        dailyMap: Map<string, boolean> = new Map<string, boolean>()) {
        this.guessed = guessed;
        this.tries = tries;
        this.dailyMap = dailyMap;
    }
}