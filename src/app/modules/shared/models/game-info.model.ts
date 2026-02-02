export class GameInfo {
    guessed: Map<string, number> = new Map<string, number>();
    tries: Map<string, number> = new Map<string, number>();

    constructor(guessed: Map<string, number>, tries: Map<string, number> = new Map<string, number>()) {
        this.guessed = guessed;
        this.tries = tries;
    }
}