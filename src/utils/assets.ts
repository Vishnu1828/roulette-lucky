import { Assets, type BitmapFont } from "pixi.js";

type ManifestAsset = {
    alias: string | string[];
    src: string | Array<{ src: string; resolution: number }>;
};

type ManifestBundle = {
    name: string;
    assets: ManifestAsset[];
};

type AssetPackManifest = {
    bundles: ManifestBundle[];
};

let assetLoadPromise: Promise<void> | null = null;
const loadedBitmapFontFamilies = new Set<string>();
let loadedManifest: AssetPackManifest | null = null;
let assetsVersion = 0;

export const BITMAP_FONT_FAMILY = {
    roulette: {
        mobile: "roulette_main_font_mobile",
        desktop: "roulette_main_font",
    },
    spinButton: {
        mobile: "spin_button_font",
        desktop: "spin_button_font",
    },
} as const;

function getTextureResolution() {
    // Match manifest variants (1x/2x) using device characteristics.
    const dpr = window.devicePixelRatio || 1;
    const effectiveMaxSize = Math.max(window.innerWidth, window.innerHeight) * dpr;
    return dpr >= 1.5 || effectiveMaxSize >= 2200 ? 2 : 1;
}

/**
 * Loads all assets from the manifest and handles font registration.
 */
export async function loadAssets() {
    if (!assetLoadPromise) {
        assetLoadPromise = (async () => {
            try {
                const response = await fetch("/assets/assetPack.json");
                const manifest = (await response.json()) as AssetPackManifest;
                loadedManifest = manifest;

                await Assets.init({
                    manifest,
                    texturePreference: {
                        resolution: getTextureResolution(),
                    },
                });

                const bundles = manifest.bundles ?? [];

                // Separate font bundles for special handling
                const fontBundles = bundles.filter((bundle) => bundle.name === "fonts");
                const nonFontBundles = bundles.filter((bundle) => bundle.name !== "fonts");

                // Load all non-font bundles
                for (const bundle of nonFontBundles) {
                    await Assets.loadBundle(bundle.name);
                }

                // Special handling for fonts to register their family names
                for (const bundle of fontBundles) {
                    const aliases = bundle.assets
                        .map((asset) => toFirstAlias(asset.alias))
                        .filter((alias): alias is string => !!alias);

                    const results = await Promise.allSettled(
                        aliases.map(async (alias) => {
                            const loaded = (await Assets.load(alias)) as BitmapFont;
                            if (loaded?.fontFamily) {
                                console.log(`[FontLoad] Registered font: ${loaded.fontFamily}`);
                                loadedBitmapFontFamilies.add(loaded.fontFamily);
                            }
                        })
                    );

                    results.forEach((result) => {
                        if (result.status === "rejected") {
                            console.warn("[FontLoad] Bitmap font skipped:", result.reason);
                        }
                    });
                }

                const fontMode = loadedBitmapFontFamilies.size > 0
                    ? "BitmapText loaded"
                    : "Fallback to Text";

                console.log(
                    `[FontCheck] ${fontMode} (${Array.from(loadedBitmapFontFamilies).sort().join(", ") || "none"})`
                );

                assetsVersion += 1;
            } catch (error) {
                console.error("Failed to load assets:", error);
                assetLoadPromise = null; // Allow retry on failure
                throw error;
            }
        })();
    }

    await assetLoadPromise;
}

export function getBitmapFontFamilies() {
    return Array.from(loadedBitmapFontFamilies);
}

export function isBitmapTextReady() {
    return loadedBitmapFontFamilies.size > 0;
}

export function getAssetsVersion() {
    return assetsVersion;
}

export function findAssetAlias(
    namePart: string,
    extension?: ".json" | ".png" | ".fnt"
) {
    if (!loadedManifest) {
        return null;
    }

    const target = namePart.toLowerCase();
    for (const bundle of loadedManifest.bundles ?? []) {
        for (const asset of bundle.assets ?? []) {
            const alias = toFirstAlias(asset.alias);
            const src = toPrimarySrc(asset.src);
            if (!alias || !src) {
                continue;
            }

            const hasName = alias.toLowerCase().includes(target);
            const srcHasName = src.toLowerCase().includes(target);
            const matchesExt = extension
                ? src.toLowerCase().endsWith(extension)
                : true;

            if ((hasName || srcHasName) && matchesExt) {
                return alias;
            }
        }
    }

    return null;
}

function toFirstAlias(alias: string | string[]): string | null {
    if (Array.isArray(alias)) {
        return alias.length > 0 ? alias[0] : null;
    }
    return alias;
}

function toPrimarySrc(src: ManifestAsset["src"]): string | null {
    if (typeof src === "string") {
        return src;
    }

    if (Array.isArray(src) && src.length > 0) {
        const sorted = [...src].sort((a, b) => a.resolution - b.resolution);
        return sorted[0]?.src ?? null;
    }

    return null;
}
