var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { AssetPack } from "@assetpack/core";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// @ts-expect-error - JavaScript config module
import assetPackConfig from "./.assetpack.js";
// @ts-expect-error - JavaScript helper module
import { generateAssetPackManifest } from "./src/scripts/generate-asset-pack-manifest.mjs";
function assetpackPlugin() {
    var command = "serve";
    var assetPack = null;
    return {
        name: "vite-plugin-assetpack",
        configResolved: function (config) {
            command = config.command;
        },
        configureServer: function (server) {
            var _this = this;
            var _a;
            (_a = server.httpServer) === null || _a === void 0 ? void 0 : _a.once("close", function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!assetPack) return [3 /*break*/, 2];
                            return [4 /*yield*/, assetPack.stop()];
                        case 1:
                            _a.sent();
                            assetPack = null;
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
        },
        buildStart: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(command === "serve")) return [3 /*break*/, 4];
                            if (!!assetPack) return [3 /*break*/, 3];
                            assetPack = new AssetPack(assetPackConfig);
                            return [4 /*yield*/, assetPack.watch(function () {
                                    void generateAssetPackManifest();
                                })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, generateAssetPackManifest()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                        case 4: return [4 /*yield*/, new AssetPack(assetPackConfig).run()];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, generateAssetPackManifest()];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
export default defineConfig({
    plugins: [react(), assetpackPlugin()],
});
