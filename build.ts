#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import * as babel from "@babel/core";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(`
🏗️  Pterodactyl Bun Build Script (with Babel & PostCSS)

Usage: bun run build.ts [options]
`);
	process.exit(0);
}

const toCamelCase = (str: string): string =>
	str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

const parseValue = (value: string): any => {
	if (value === "true") return true;
	if (value === "false") return false;
	if (/^\d+$/.test(value)) return parseInt(value, 10);
	if (/^\d*\.\d+$/.test(value)) return parseFloat(value);
	if (value.includes(",")) return value.split(",").map((v) => v.trim());
	return value;
};

const formatFileSize = (bytes: number): string => {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

function parseArgs(): Record<string, any> {
	const config: Record<string, any> = {};
	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (!arg.startsWith("--")) continue;
		let key: string, value: any;
		if (arg.includes("=")) {
			[key, value] = arg.slice(2).split("=", 2);
			value = parseValue(value);
		} else {
			key = arg.slice(2);
			if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
				value = parseValue(args[++i]);
			} else {
				value = true;
			}
		}
		config[toCamelCase(key)] = value;
	}
	return config;
}

// --- PostCSS Plugin ---
const postcssPlugin = {
	name: "postcss",
	async setup(build: any) {
		let config: any;
		try {
			config = await postcssLoadConfig();
		} catch (e) {
			console.warn("PostCSS config not found, using defaults");
			config = { plugins: [] };
		}
		const processor = postcss(config.plugins);

		build.onLoad({ filter: /\.css$/ }, async (args: any) => {
			const text = await Bun.file(args.path).text();
			const result = await processor.process(text, { from: args.path });
			return {
				contents: result.css,
				loader: "css",
			};
		});
	},
};

// --- Custom Babel Plugin for Macros ---
const babelPlugin = {
	name: "babel-loader",
	async setup(build: any) {
		build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, async (args: any) => {
			// Skip node_modules to keep it fast, unless we really need to process them
			if (args.path.includes("node_modules")) {
				return; // Let Bun handle node_modules natively
			}

			const source = await Bun.file(args.path).text();

			// Only invoke babel if the file actually uses macros or likely needs it
			// This is a simple optimization.
			if (!source.includes("/macro") && !source.includes("twin.macro")) {
				return; // Let Bun handle it natively
			}

			try {
				const result = await babel.transformAsync(source, {
					filename: args.path,
					presets: [
						["@babel/preset-react", { runtime: "automatic" }],
						"@babel/preset-typescript",
					],
					plugins: [
						"babel-plugin-macros",
						"babel-plugin-styled-components",
						// Add other plugins from your babel.config.js if needed
					],
					babelrc: false,
					configFile: false,
				});

				if (!result || !result.code) {
					return;
				}

				return {
					contents: result.code,
					loader: args.path.endsWith("ts") ? "ts" : "tsx",
				};
			} catch (e) {
				console.error(`Babel error in ${args.path}:`, e);
				throw e;
			}
		});
	},
};

console.log("\n🚀 Starting Pterodactyl build process (Babel + PostCSS)...\n");

const cliConfig = parseArgs();
const isProduction =
	cliConfig.production || process.env.NODE_ENV === "production";
const outdir = cliConfig.outdir || path.join(process.cwd(), "public/assets");

if (existsSync(outdir)) {
	console.log(`🗑️ Cleaning previous build at ${outdir}`);
	await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();
const { outdir: _, external: cliExternal, ...remainingCliConfig } = cliConfig;

const result = await Bun.build({
	entrypoints: ["./resources/scripts/index.tsx"],
	outdir,
	target: "browser",
	minify: isProduction,
	sourcemap: isProduction ? "none" : "external",
	splitting: false, // Splitting is currently disabled due to CSS chunking collisions in Bun with PostCSS
	publicPath: cliConfig.publicPath || "/assets/",
	naming: isProduction ? "[name].[hash].[ext]" : "[dir]/[name].[ext]",
	env: "inline",
	define: {
		"process.env.DEBUG": JSON.stringify(!isProduction),
		"process.env.WEBPACK_BUILD_HASH": JSON.stringify(
			Bun.hash(Date.now().toString()).toString(16),
		),
	},
	plugins: [babelPlugin, postcssPlugin],
	external: [
		"resolve-from",
		...(Array.isArray(cliExternal)
			? cliExternal
			: cliExternal
				? [cliExternal]
				: []),
	],
	...remainingCliConfig,
});

if (!result.success) {
	console.error("❌ Build failed");
	for (const message of result.logs) {
		console.error(message);
	}
	process.exit(1);
}

// 📄 Generate manifest.json
const manifest: Record<string, string> = {};
for (const output of result.outputs) {
	const fileName = path.basename(output.path);
	const relativePath = path.relative(outdir, output.path);
	const publicPath = `/assets/${relativePath}`;

	// Map entry points to Pterodactyl's expected names
	if (fileName.startsWith("index") && fileName.endsWith(".js"))
		manifest["bundle.js"] = publicPath;
	if (fileName.startsWith("index") && fileName.endsWith(".css"))
		manifest["bundle.css"] = publicPath;

	// Store all hashed versions
	manifest[fileName] = publicPath;
}

await Bun.write(
	path.join(outdir, "manifest.json"),
	JSON.stringify(manifest, null, 2),
);

const end = performance.now();
console.table(
	result.outputs.map((o) => ({
		File: path.basename(o.path),
		Size: formatFileSize(o.size),
	})),
);
console.log(`\n✅ Build completed in ${(end - start).toFixed(2)}ms`);
