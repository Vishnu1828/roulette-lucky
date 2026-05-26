import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.resolve("src/assets");
const OUTPUT_ROOT = path.resolve("public/assets");

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rootDir, fullPath)));
      continue;
    }

    files.push(path.relative(rootDir, fullPath).replaceAll(path.sep, "/"));
  }

  return files;
}

async function safeListFiles(rootDir) {
  try {
    return await listFiles(rootDir);
  } catch {
    return [];
  }
}

function baseAliasFromPath(relativePath) {
  const parsed = path.posix.parse(relativePath);
  // Remove resolution indicators like _4k or _mobile
  let name = parsed.name
    .replace(/_4k$/i, "")
    .replace(/_mobile$/i, "")
    .replaceAll("_", "-")
    .toLowerCase();

  // For textures, the parent directory might be part of the alias if it's not the resolution folder
  const parts = parsed.dir.split("/");
  const filteredParts = parts.filter(
    (p) => !["1080p", "4k", "texture", "."].includes(p),
  );

  if (filteredParts.length > 0) {
    return `${filteredParts.join("-")}-${name}`;
  }
  return name;
}

function fontAliasFromPath(relativePath) {
  const parsed = path.posix.parse(relativePath);
  const dirPrefix = parsed.dir
    .split("/")
    .filter((p) => !["fonts", "."].includes(p))
    .join("-");
  const fontName = parsed.name.replaceAll("_", "-").toLowerCase();
  return dirPrefix ? `${dirPrefix}-${fontName}` : `fonts-${fontName}`;
}

function animationAliasFromPath(relativePath, ext) {
  const parsed = path.posix.parse(relativePath);
  const base = parsed.name.replaceAll("_", "-").toLowerCase();
  if (ext === ".json") {
    return `animation-${base}-json`;
  }
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return `animation-${base}-image`;
  }
  return `animation-${base}`;
}

function loadingAliasFromPath(relativePath, ext) {
  const parsed = path.posix.parse(relativePath);
  const dirPrefix = parsed.dir
    .split("/")
    .filter((p) => !["loading", "1080p", "4k", "."].includes(p))
    .join("-");
  const base = parsed.name
    .replace(/_4k$/i, "")
    .replaceAll("_", "-")
    .toLowerCase();
  const prefix = dirPrefix ? `${dirPrefix}-` : "";

  if (ext === ".json") {
    return `loading-${prefix}${base}-json`;
  }
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return `loading-${prefix}${base}-image`;
  }
  return `loading-${prefix}${base}`;
}

function loadingResolutionKeyFromPath(relativePath) {
  const parsed = path.posix.parse(relativePath);
  const dirPrefix = parsed.dir
    .split("/")
    .filter((p) => !["loading", "1080p", "4k", "."].includes(p))
    .join("-");
  const base = parsed.name
    .replace(/_4k$/i, "")
    .replaceAll("_", "-")
    .toLowerCase();

  return dirPrefix ? `${dirPrefix}-${base}` : base;
}

function makeUniqueAlias(baseAlias, usedAliases) {
  let alias = baseAlias;
  let index = 2;
  while (usedAliases.has(alias)) {
    alias = `${baseAlias}-${index}`;
    index += 1;
  }
  usedAliases.add(alias);
  return alias;
}

export async function generateAssetPackManifest() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  const manifestPath = path.join(OUTPUT_ROOT, "assetPack.json");

  const allFiles = await safeListFiles(SRC_ROOT);

  const bundles = {
    main: [],
    loading: [],
    fonts: [],
    sounds: [],
    animation_texture: [],
    textures: [], // Consolidated texture bundle
  };

  const resolutionAssetsByKey = new Map();
  const loadingResolutionAssetsByKey = new Map();
  const usedAliases = new Set();

  for (const relativePath of allFiles) {
    const parsed = path.posix.parse(relativePath);
    const ext = parsed.ext.toLowerCase();

    // Skip hidden files
    if (parsed.name.startsWith(".")) continue;

    const src = `/assets/${relativePath}`;

    // Determine resolution
    let resolution = 1;
    if (
      relativePath.includes("/4k/") ||
      parsed.name.toLowerCase().endsWith("_4k")
    ) {
      resolution = 2;
    } else if (relativePath.includes("/1080p/")) {
      resolution = 1;
    }

    // Determine destination bundle
    let bundleName = "main";
    if (relativePath.startsWith("sounds/")) {
      bundleName = "sounds";
    } else if (relativePath.startsWith("animation-texture/")) {
      bundleName = "animation_texture";
    } else if (relativePath.startsWith("loading/")) {
      bundleName = "loading";
    } else if (relativePath.startsWith("fonts/")) {
      bundleName = "fonts";
    } else if (relativePath.startsWith("texture/")) {
      // All textures (1080p and 4k) will be grouped in the "textures" bundle
      bundleName = "textures";
      const key = baseAliasFromPath(relativePath);
      const sourceMap = resolutionAssetsByKey.get(key) ?? {};
      sourceMap[resolution] = src;
      resolutionAssetsByKey.set(key, sourceMap);
      continue;
    }

    if (
      bundleName === "loading" &&
      (relativePath.startsWith("loading/1080p/") ||
        relativePath.startsWith("loading/4k/"))
    ) {
      const key = loadingResolutionKeyFromPath(relativePath);
      const sourceMap = loadingResolutionAssetsByKey.get(key) ?? {};
      sourceMap[resolution] = src;
      loadingResolutionAssetsByKey.set(key, sourceMap);
      continue;
    }

    // Skip font images as they are handled by the .fnt file
    if (bundleName === "fonts" && [".png", ".jpg", ".jpeg"].includes(ext)) {
      continue;
    }

    // Standard asset
    let baseAlias = baseAliasFromPath(relativePath);
    if (bundleName === "fonts") {
      baseAlias = fontAliasFromPath(relativePath);
    } else if (bundleName === "animation_texture") {
      baseAlias = animationAliasFromPath(relativePath, ext);
    } else if (bundleName === "loading") {
      baseAlias = loadingAliasFromPath(relativePath, ext);
    }
    const alias = makeUniqueAlias(baseAlias, usedAliases);
    bundles[bundleName].push({ alias, src });
  }

  // Add grouped textures to the consolidated textures bundle
  for (const [key, sources] of resolutionAssetsByKey.entries()) {
    const alias = makeUniqueAlias(key, usedAliases);
    const asset = {
      alias,
      src: Object.entries(sources)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([res, src]) => ({
          src,
          resolution: Number(res),
        })),
    };
    bundles.textures.push(asset);
  }

  // Add grouped loading scenario textures to loading bundle
  for (const [key, sources] of loadingResolutionAssetsByKey.entries()) {
    const alias = makeUniqueAlias(`loading-${key}`, usedAliases);
    const asset = {
      alias,
      src: Object.entries(sources)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([res, src]) => ({
          src,
          resolution: Number(res),
        })),
    };
    bundles.loading.push(asset);
  }

  // Keep fonts as explicit entries (no adaptive merge) so UI can select
  // exact font families per screen type.

  const bundleOrder = [
    "loading",
    "textures",
    "animation_texture",
    "sounds",
    "main",
    "fonts",
  ];

  const finalBundles = bundleOrder
    .map((name) => ({ name, assets: bundles[name] ?? [] }))
    .filter((bundle) => bundle.assets.length > 0);

  await writeFile(
    manifestPath,
    JSON.stringify({ bundles: finalBundles }, null, 2),
  );

  console.log(`Manifest generated at ${manifestPath}`);
}
