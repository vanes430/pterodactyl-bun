import path from "node:path";
import zlib from "node:zlib";
import type { BuildOutput } from "bun";
import { $ } from "bun";

export async function generateManifest(
	outputs: BuildOutput[],
	outdir: string,
): Promise<Record<string, any>> {
	const manifest: Record<string, any> = {};
	for (const output of outputs) {
		if (output.path.endsWith(".map")) continue;
		const fileName = path.basename(output.path);
		const publicPath = `/assets/${path.relative(outdir, output.path)}`;

		const contents = await output.arrayBuffer();
		const integrity = `sha384-${new Bun.CryptoHasher("sha384").update(contents).digest("base64")}`;

		if (output.kind === "entry-point") {
			if (fileName.endsWith(".js"))
				manifest["main.js"] = { src: publicPath, integrity };
			else if (fileName.endsWith(".css"))
				manifest["main.css"] = { src: publicPath, integrity };
		}
		if (
			!manifest["main.css"] &&
			fileName.startsWith("index") &&
			fileName.endsWith(".css")
		) {
			manifest["main.css"] = { src: publicPath, integrity };
		}
		manifest[fileName] = { src: publicPath, integrity };
	}
	return manifest;
}

export async function compressAssets(outputs: BuildOutput[]) {
	console.log("Compressing assets with Gzip...");
	for (const output of outputs) {
		if (output.path.endsWith(".map")) continue;
		const contents = await output.arrayBuffer();
		const compressed = Bun.gzipSync(new Uint8Array(contents));
		await Bun.write(`${output.path}.gz`, compressed);
	}
}

export async function compressAssetsBrotli(outputs: BuildOutput[]) {
	console.log("Compressing assets with Brotli...");
	for (const output of outputs) {
		if (output.path.endsWith(".map")) continue;
		const contents = await output.arrayBuffer();
		const compressed = zlib.brotliCompressSync(Buffer.from(contents), {
			params: {
				[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
			},
		});
		await Bun.write(`${output.path}.br`, compressed);
	}
}

export function showSummary(
	outputs: BuildOutput[],
	useCompress: boolean,
	useBrotli: boolean,
) {
	const validOutputs = outputs.filter((o) => o.size > 0 && !o.path.endsWith(".map"));
	
	const outputSummary = validOutputs.map((o) => {
			const fileName = path.basename(o.path);
			const size = `${(o.size / 1024).toFixed(2)} KB`;
			let gzippedSize = "-";
			let brotliSize = "-";

			if (useCompress) {
				const gzFile = Bun.file(`${o.path}.gz`);
				if (gzFile.size > 0) {
					gzippedSize = `${(gzFile.size / 1024).toFixed(2)} KB`;
				}
			}

			if (useBrotli) {
				const brFile = Bun.file(`${o.path}.br`);
				if (brFile.size > 0) {
					brotliSize = `${(brFile.size / 1024).toFixed(2)} KB`;
				}
			}

			return {
				File: fileName,
				Size: size,
				...(useCompress ? { "Gzip Size": gzippedSize } : {}),
				...(useBrotli ? { "Brotli Size": brotliSize } : {}),
			};
		});

	console.table(outputSummary);

	if (useCompress || useBrotli) {
		const categories: Record<string, { original: number; gzip: number; brotli: number }> = {};
		
		for (const o of validOutputs) {
			const ext = path.extname(o.path).slice(1).toUpperCase() || "OTHER";
			let category = ext;
			
			if (ext === "JS") {
				category = o.kind === "entry-point" ? "JS (Main)" : "JS (Chunk)";
			}

			if (!categories[category]) {
				categories[category] = { original: 0, gzip: 0, brotli: 0 };
			}
			
			categories[category].original += o.size;
			if (useCompress) {
				const gzFile = Bun.file(`${o.path}.gz`);
				categories[category].gzip += gzFile.size;
			}
			if (useBrotli) {
				const brFile = Bun.file(`${o.path}.br`);
				categories[category].brotli += brFile.size;
			}
		}

		console.log("\n--- Compression Summary ---");
		
		const sortedCategories = Object.keys(categories).sort((a, b) => {
			// Sort JS (Main) first, then JS (Chunk), then others
			if (a.startsWith("JS (Main)")) return -1;
			if (b.startsWith("JS (Main)")) return 1;
			if (a.startsWith("JS (Chunk)")) return -1;
			if (b.startsWith("JS (Chunk)")) return 1;
			return a.localeCompare(b);
		});
		const formatSize = (bytes: number) => (bytes / 1024).toFixed(2) + " KB";
		const totalOriginal = validOutputs.reduce((acc, o) => acc + o.size, 0);

		if (useCompress) {
			console.log("\n-- Gzip " + "-".repeat(40));
			for (const cat of sortedCategories) {
				const data = categories[cat];
				const ratio = ((1 - data.gzip / data.original) * 100).toFixed(1);
				console.log(`${cat.padEnd(10)} : ${formatSize(data.original).padStart(10)} -> ${formatSize(data.gzip).padStart(10)} (${ratio}% reduction)`);
			}
			const totalGzipped = Object.values(categories).reduce((acc, c) => acc + c.gzip, 0);
			const totalRatio = ((1 - totalGzipped / totalOriginal) * 100).toFixed(1);
			console.log(`TOTAL      : ${(totalOriginal / 1024 / 1024).toFixed(2)} MB -> ${(totalGzipped / 1024 / 1024).toFixed(2)} MB (${totalRatio}% reduction)`);
		}

		if (useBrotli) {
			console.log("\n-- Brotli " + "-".repeat(38));
			for (const cat of sortedCategories) {
				const data = categories[cat];
				const ratio = ((1 - data.brotli / data.original) * 100).toFixed(1);
				console.log(`${cat.padEnd(10)} : ${formatSize(data.original).padStart(10)} -> ${formatSize(data.brotli).padStart(10)} (${ratio}% reduction)`);
			}
			const totalBrotli = Object.values(categories).reduce((acc, c) => acc + c.brotli, 0);
			const totalRatio = ((1 - totalBrotli / totalOriginal) * 100).toFixed(1);
			console.log(`TOTAL      : ${(totalOriginal / 1024 / 1024).toFixed(2)} MB -> ${(totalBrotli / 1024 / 1024).toFixed(2)} MB (${totalRatio}% reduction)`);
		}
		console.log("");
	}
}

export async function createArchive() {
	console.log("\nWaiting for disk I/O to settle...");
	await Bun.sleep(1000);

	console.log("Creating panel.tar.gz...");
	await $`rm -f panel.tar.gz`;

	const excludes = [
		"./node_modules",
		"./vendor",
		".git",
		".github",
		"storage/framework/cache/*",
		"storage/framework/sessions/*",
		"storage/framework/views/*",
		"storage/logs/*",
		"storage/*.key",
		"storage/app/backups/*",
		"storage/app/public/*",
		"bootstrap/cache/*",
		"public/storage",
		".env",
		".env.*",
		"*.tar.gz",
		"*.zip",
		".direnv",
		".vscode",
		".idea",
		"*.log",
		"_ide_helper*.php",
		".phpstorm.meta.php",
		".php-cs-fixer.cache",
		"bun.lockb",
	];

	try {
		const excludeFlags = excludes.map((e) => `--exclude=${e}`);
		await $`tar ${excludeFlags} -czf panel.tar.gz . || true`;
		const archiveFile = Bun.file("panel.tar.gz");
		console.log(
			`Archive created successfully: panel.tar.gz (${(archiveFile.size / 1024 / 1024).toFixed(2)} MB)`,
		);
	} catch (err) {
		console.error("Failed to create archive:", err);
		process.exit(1);
	}
}
