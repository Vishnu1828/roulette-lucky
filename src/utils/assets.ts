/**
 * Asset Loading System with Resolution-Based Texture Loading
 *
 * This module handles loading all game assets (textures, fonts, sounds) with
 * automatic resolution selection based on screen size and device characteristics.
 *
 * **Resolution System:**
 * - 1080p textures (resolution: 1) - For standard displays
 * - 4K textures (resolution: 2) - For high-resolution displays (Retina, 4K, etc.)
 *
 * **Auto-Detection:**
 * The system automatically selects the appropriate texture quality based on:
 * - Device pixel ratio (DPR)
 * - Screen dimensions (width × height)
 * - Total pixel count
 *
 * **Asset Structure:**
 * All texture assets in assetPack.json are defined with both resolutions:
 * ```json
 * {
 *   "alias": "background-bg-desktop",
 *   "src": [
 *     { "src": "/assets/texture/1080p/background/bg_desktop.png", "resolution": 1 },
 *     { "src": "/assets/texture/4k/background/bg_desktop_4k.png", "resolution": 2 }
 *   ]
 * }
 * ```
 *
 * PixiJS automatically loads the appropriate version based on the texturePreference.
 */

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

/**
 * Determines the optimal texture resolution based on screen size and device pixel ratio.
 * Returns:
 * - 2 for 4K textures (high resolution devices with large screens)
 * - 1 for 1080p textures (mobile devices and standard displays)
 */
function getTextureResolution(): 1 | 2 {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const maxDimension = Math.max(width, height);

  // Calculate the effective screen resolution (physical pixels)
  const effectiveWidth = width * dpr;
  const effectiveHeight = height * dpr;
  const effectiveMaxDimension = Math.max(effectiveWidth, effectiveHeight);

  // Mobile devices detection - even with high DPR, they should use 1080p
  // Most mobile devices are < 1024px in their largest dimension
  const isMobile = maxDimension < 1024;

  // Desktop/Tablet logic: Use 4K only for large screens with high quality
  // Case 1: Large Retina displays (MacBook Pro 16", iMac Retina, etc.)
  //         - Screen size >= 1024px AND DPR >= 2
  // Case 2: True 4K monitors (3840×2160 or 2560×1440 at DPR 1)
  //         - Effective resolution >= 2160px in any dimension
  const isLargeRetinaDisplay = !isMobile && maxDimension >= 1024 && dpr >= 2;
  const is4KMonitor = effectiveMaxDimension >= 2160;

  const use4K = isLargeRetinaDisplay || is4KMonitor;

  return use4K ? 2 : 1;
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
        const resolution = getTextureResolution();
        const resolutionLabel = resolution === 2 ? "4K (2x)" : "1080p (1x)";

        await Assets.init({
          manifest,
          texturePreference: {
            resolution,
          },
        });

        const dpr = window.devicePixelRatio || 1;
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        const isMobile = maxDim < 1024;

        console.log(
          `[AssetLoader] Loading textures at ${resolutionLabel} resolution`,
        );
        console.log(
          `[AssetLoader] Screen: ${window.innerWidth}×${window.innerHeight}px, DPR: ${dpr}x`,
        );
        console.log(
          `[AssetLoader] Device type: ${isMobile ? "Mobile/Tablet" : "Desktop/Large tablet"} (${maxDim < 768 ? "Portrait mobile" : maxDim < 1024 ? "Landscape mobile/tablet" : "Desktop"})`,
        );

        const bundles = manifest.bundles ?? [];

        // Separate font bundles for special handling
        const fontBundles = bundles.filter((bundle) => bundle.name === "fonts");
        const nonFontBundles = bundles.filter(
          (bundle) => bundle.name !== "fonts",
        );

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
            }),
          );

          results.forEach((result) => {
            if (result.status === "rejected") {
              console.warn("[FontLoad] Bitmap font skipped:", result.reason);
            }
          });
        }

        const fontMode =
          loadedBitmapFontFamilies.size > 0
            ? "BitmapText loaded"
            : "Fallback to Text";

        console.log(
          `[FontCheck] ${fontMode} (${Array.from(loadedBitmapFontFamilies).sort().join(", ") || "none"})`,
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

/**
 * Get the current texture resolution quality being used.
 * @returns Object with resolution value and human-readable label
 */
export function getCurrentTextureResolution() {
  const resolution = getTextureResolution();
  return {
    resolution,
    label: resolution === 2 ? "4K" : "1080p",
    quality: resolution === 2 ? "High" : "Standard",
  };
}

export function findAssetAlias(
  namePart: string,
  extension?: ".json" | ".png" | ".fnt",
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
