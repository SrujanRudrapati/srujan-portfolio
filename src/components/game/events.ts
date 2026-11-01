// Opening the game from anywhere (the command palette). The dialog lives once in the layout.
export const GAME_OPEN = "game:open";
export const openGame = () => window.dispatchEvent(new Event(GAME_OPEN));
