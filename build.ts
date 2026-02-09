#!/usr/bin/env bun
import { $ } from "bun";
import path from "node:path";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import * as babel from "@babel/core";

// --- Argument Parsing ---
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(`
🏗️  Pterodactyl Bun Build Script (Native API)

Usage: bun run build.ts [options]

Options:
  --minify      Enable minification (default: true in production)
  --production  Set NODE_ENV=production
  --hash        Enable file hashing (default: true in production)
  --split       Enable code splitting (default: true in production)
  --archive     Create a panel.tar.gz archive after build
  --outdir      Output directory (default: public/assets)
`);
	process.exit(0);
}

const toCamelCase = (str: string): string =>
	str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

const parseValue = (value: string): any => {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
};

function parseArgs(): Record<string, any> {
	const config: Record<string, any> = {};
	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (!arg.startsWith("--")) continue;
		
		let key: string;
		let value: any = true;

		if (arg.includes("=")) {
			const [k, v] = arg.slice(2).split("=", 2);
			key = k;
			value = parseValue(v);
		} else {
			key = arg.slice(2);
			// Check if next arg is a value (not starting with --)
			if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
				value = parseValue(args[++i]);
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
			config = { plugins: [] };
		}
		const processor = postcss(config.plugins);

		build.onLoad({ filter: /\.css$/ }, async (args: any) => {
			const text = await Bun.file(args.path).text();
			const result = await processor.process(text, { from: args.path });
			return { contents: result.css, loader: "css" };
		});
	},
};

// --- Custom Babel Plugin for Macros ---
const babelPlugin = {
	name: "babel-loader",
	async setup(build: any) {
		build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, async (args: any) => {
			if (args.path.includes("node_modules")) return;
			const source = await Bun.file(args.path).text();
			if (!source.includes("/macro") && !source.includes("twin.macro")) return;

			try {
				const result = await babel.transformAsync(source, {
					filename: args.path,
					presets: [["@babel/preset-react", { runtime: "automatic" }], "@babel/preset-typescript"],
					plugins: ["babel-plugin-macros", "babel-plugin-styled-components"],
					babelrc: false,
					configFile: false,
				});
				if (!result?.code) return;
				return { contents: result.code, loader: args.path.endsWith("ts") ? "ts" : "tsx" };
			} catch (e) {
				console.error(`Babel error in ${args.path}:`, e);
				throw e;
			}
		});
	},
};

console.log("\n🚀 Starting Pterodactyl build process...\n");

const cliConfig = parseArgs();
const isProduction = cliConfig.production || process.env.NODE_ENV === "production";
const useMinify = cliConfig.minify !== undefined ? cliConfig.minify : isProduction;
// Auto-enable splitting if minify is on, unless explicitly disabled
const useSplit = cliConfig.split !== undefined ? cliConfig.split : (useMinify || isProduction);
// Auto-enable hashing if splitting is on, unless explicitly disabled
const useHash = cliConfig.hash !== undefined ? cliConfig.hash : (useSplit || isProduction);
const outdir = cliConfig.outdir || path.join(process.cwd(), "public/assets");

console.log(`🔧 Mode: ${isProduction ? "Production" : "Development"}`);
console.log(`✨ Minify: ${useMinify ? "Enabled" : "Disabled"}`);
console.log(`🔑 Hashing: ${useHash ? "Enabled" : "Disabled"}`);
console.log(`✂️  Splitting: ${useSplit ? "Enabled" : "Disabled"}`);
console.log(`📦 Archive: ${cliConfig.archive ? "Enabled" : "Disabled"}`);

// --- Bun Native: Cleaning Directory using Bun Shell ---
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

// 📄 Generate manifest.json using Bun.write
const manifest: Record<string, any> = {};
for (const output of result.outputs) {
	if (output.path.endsWith(".map")) continue;
	const fileName = path.basename(output.path);
	const publicPath = `/assets/${path.relative(outdir, output.path)}`;

	if (output.kind === "entry-point") {
		if (fileName.endsWith(".js")) manifest["main.js"] = { src: publicPath, integrity: "" };
		else if (fileName.endsWith(".css")) manifest["main.css"] = { src: publicPath, integrity: "" };
	}
	if (!manifest["main.css"] && fileName.startsWith("index") && fileName.endsWith(".css")) {
		manifest["main.css"] = { src: publicPath, integrity: "" };
	}
	manifest[fileName] = { src: publicPath, integrity: "" };
}

await Bun.write(path.join(outdir, "manifest.json"), JSON.stringify(manifest, null, 2));

const end = Bun.nanoseconds();
const durationMs = (Number(end - start) / 1e6).toFixed(2);

console.table(
	result.outputs.filter((o) => o.size > 0).map((o) => ({
		File: path.basename(o.path),
		Size: `${(o.size / 1024).toFixed(2)} KB`,
	})),
);
console.log(`\n✅ Build completed in ${durationMs}ms`);

// --- Bun Native: Archiving using Bun Shell ---
if (cliConfig.archive) {
	// Memberikan jeda singkat agar sistem benar-benar selesai menulis file ke disk
	console.log("\n⏳ Waiting for disk I/O to settle...");
	await Bun.sleep(1000);

	console.log("🗜️  Creating panel.tar.gz...");
	
	// Hapus file lama jika ada agar benar-benar fresh
	await $`rm -f panel.tar.gz`;
	
	const excludes = [
		'./node_modules', './vendor', '.git', '.github',
		'storage/framework/cache/*', 'storage/framework/sessions/*', 'storage/framework/views/*',
		'storage/logs/*', 'storage/*.key', 'storage/app/backups/*', 'storage/app/public/*',
		'bootstrap/cache/*', 'public/storage', '.env', '.env.*', '*.tar.gz', '*.zip',
		'.direnv', '.vscode', '.idea', '*.log', '_ide_helper*.php', '.phpstorm.meta.php',
		'.php-cs-fixer.cache', 'bun.lockb'
	];

	// Menggunakan Bun Shell ($) untuk eksekusi tar yang sangat efisien
	try {
		const excludeFlags = excludes.map(e => `--exclude=${e}`);
		await $`tar ${excludeFlags} -czf panel.tar.gz . || true`;
		
		const archiveFile = Bun.file("panel.tar.gz");
		console.log(`✅ Archive created successfully: panel.tar.gz (${(archiveFile.size / 1024 / 1024).toFixed(2)} MB)`);
	} catch (err) {
		console.error("❌ Failed to create archive:", err);
		process.exit(1);
	}
}