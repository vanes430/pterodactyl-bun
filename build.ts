#!/usr/bin/env bun
import { $ } from "bun";
import path from "node:path";
import { parseArgs, showHelp } from "./build/args";
import { babelPlugin, postcssPlugin } from "./build/plugins";
import { compressAssets, createArchive, generateManifest, showSummary } from "./build/post-build";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	showHelp();
	process.exit(0);
}

console.log("\n🚀 Starting Pterodactyl build process...\n");

const cliConfig = parseArgs();
const isProduction = cliConfig.production || process.env.NODE_ENV === "production";
const useMinify = cliConfig.minify !== undefined ? cliConfig.minify : isProduction;
const useSplit = cliConfig.split !== undefined ? cliConfig.split : false;
const useHash = cliConfig.hash !== undefined ? cliConfig.hash : (useSplit || isProduction);
const useCompress = cliConfig.compress !== undefined ? cliConfig.compress : false;
const outdir = cliConfig.outdir || path.join(process.cwd(), "public/assets");

console.log(`🔧 Mode: ${isProduction ? "Production" : "Development"}`);
console.log(`✨ Minify: ${useMinify ? "Enabled" : "Disabled"}`);
console.log(`🔑 Hashing: ${useHash ? "Enabled" : "Disabled"}`);
console.log(`✂️  Splitting: ${useSplit ? "Enabled" : "Disabled"}`);
console.log(`🗜️  Compression: ${useCompress ? "Enabled" : "Disabled"}`);
console.log(`📦 Archive: ${cliConfig.archive ? "Enabled" : "Disabled"}`);

await $`rm -rf ${outdir} && mkdir -p ${outdir}`;

const start = Bun.nanoseconds();

const result = await Bun.build({
	entrypoints: ["./resources/scripts/index.tsx"],
	outdir,
	target: "browser",
	loader: { ".woff": "file", ".woff2": "file", ".svg": "file", ".png": "file", ".jpg": "file" },
	minify: useMinify,
	sourcemap: isProduction ? "none" : (useMinify ? "external" : "external"),
	splitting: useSplit,
	publicPath: "/assets/",
	naming: useHash ? { entry: "[name].[hash].[ext]", chunk: "[name].[hash].[ext]", asset: "[name].[hash].[ext]" } 
	                : { entry: "[name].[ext]", chunk: "[name].[ext]", asset: "[name].[ext]" },
	env: "inline",
	define: {
		"process.env.DEBUG": JSON.stringify(!isProduction),
		"process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
		"process.env.WEBPACK_BUILD_HASH": JSON.stringify(Bun.hash(Date.now().toString()).toString(16)),
	},
	plugins: [babelPlugin, postcssPlugin],
	external: ["resolve-from"],
});

if (!result.success) {
	console.error("\n❌ Build failed");
	for (const message of result.logs) console.error(message);
	process.exit(1);
}

const manifest = await generateManifest(result.outputs, outdir);
await Bun.write(path.join(outdir, "manifest.json"), JSON.stringify(manifest, null, 2));

if (useCompress) {
	await compressAssets(result.outputs);
}

const end = Bun.nanoseconds();
const durationMs = (Number(end - start) / 1e6).toFixed(2);

showSummary(result.outputs, useCompress);
console.log(`\n✅ Build completed in ${durationMs}ms`);

if (cliConfig.archive) {
	await createArchive();
}
