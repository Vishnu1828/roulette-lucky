export type LayoutMode =
    | "mobile-portrait"
    | "mobile-landscape"
    | "desktop";

export function getLayoutMode() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    if (aspect < 1) {
        return "mobile-portrait";
    }

    if (w < 1024) {
        return "mobile-landscape";
    }

    return "desktop";
}