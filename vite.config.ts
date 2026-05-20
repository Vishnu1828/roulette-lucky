import { AssetPack } from "@assetpack/core";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
// @ts-expect-error - JavaScript config module
import assetPackConfig from "./.assetpack.js";
// @ts-expect-error - JavaScript helper module
import { generateAssetPackManifest } from "./src/scripts/generate-asset-pack-manifest.mjs";

function assetpackPlugin(): Plugin {
  let command: ResolvedConfig["command"] = "serve";
  let assetPack: AssetPack | null = null;

  return {
    name: "vite-plugin-assetpack",
    configResolved(config) {
      command = config.command;
    },
    configureServer(server) {
      server.httpServer?.once("close", async () => {
        if (assetPack) {
          await assetPack.stop();
          assetPack = null;
        }
      });
    },
    async buildStart() {
      if (command === "serve") {
        if (!assetPack) {
          assetPack = new AssetPack(assetPackConfig);
          await assetPack.watch(() => {
            void generateAssetPackManifest();
          });
          await generateAssetPackManifest();
        }
        return;
      }

      await new AssetPack(assetPackConfig).run();
      await generateAssetPackManifest();
    },
  };
}

export default defineConfig({
  plugins: [react(), assetpackPlugin()],
});
