// The Ask panel is mounted once; anything on the page opens it with a window event.
export const ASK_OPEN = "ask:open";
export const ASK_PRELOAD = "ask:preload";

export type AskOpenDetail = { question?: string };

export const openAsk = (question?: string) => window.dispatchEvent(new CustomEvent<AskOpenDetail>(ASK_OPEN, { detail: { question } }));
/** Start loading the search index (first focus of a prompt box), so the first answer is instant. */
export const preloadAsk = () => window.dispatchEvent(new Event(ASK_PRELOAD));
