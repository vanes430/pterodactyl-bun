import { $ } from "bun";
import path from "node:path";
import type { BuildOutput } from "bun";

export async function generateManifest(outputs: BuildOutput[], outdir: string): Promise<Record<string, any>> {
	const manifest: Record<string, any> = {};
	for (const output of outputs) {
		if (output.path.endsWith(".map")) continue;
		const fileName = path.basename(output.path);
		const publicPath = `/assets/${path.relative(outdir, output.path)}`;
		
		const contents = await output.arrayBuffer();
		const integrity = `sha384-${new Bun.CryptoHasher("sha384").update(contents).digest("base64")}`;

		if (output.kind === "entry-point") {
			if (fileName.endsWith(".js")) manifest["main.js"] = { src: publicPath, integrity };
			else if (fileName.endsWith(".css")) manifest["main.css"] = { src: publicPath, integrity };
		}
		if (!manifest["main.css"] && fileName.startsWith("index") && fileName.endsWith(".css")) {
			manifest["main.css"] = { src: publicPath, integrity };
		}
		manifest[fileName] = { src: publicPath, integrity };
	}
	return manifest;
}

export async function compressAssets(outputs: BuildOutput[]) {
	console.log("🗜️  Compressing assets with Gzip...");
	for (const output of outputs) {
		if (output.path.endsWith(".map")) continue;
		const contents = await output.arrayBuffer();
		const compressed = Bun.gzipSync(new Uint8Array(contents));
		await Bun.write(`${output.path}.gz`, compressed);
	}
}

export function showSummary(outputs: BuildOutput[], useCompress: boolean) {
	const outputSummary = outputs
		.filter((o) => o.size > 0 && !o.path.endsWith(".map"))
		.map((o) => {
			const fileName = path.basename(o.path);
			const size = `${(o.size / 1024).toFixed(2)} KB`;
			let gzippedSize = "-";

			if (useCompress) {
				const gzFile = Bun.file(`${o.path}.gz`);
				if (gzFile.size > 0) {
					gzippedSize = `${(gzFile.size / 1024).toFixed(2)} KB`;
				}
			}

			return {
				File: fileName,
				Size: size,
				...(useCompress ? { "Gzip Size": gzippedSize } : {}),
			};
		});

	console.table(outputSummary);

	if (useCompress) {
		const totalOriginal = outputs.reduce((acc, o) => acc + (o.path.endsWith(".map") ? 0 : o.size), 0);
		let totalGzipped = 0;
		for (const o of outputs) {
			if (o.path.endsWith(".map")) continue;
			const gzFile = Bun.file(`${o.path}.gz`);
			totalGzipped += gzFile.size;
		}
		const ratio = ((1 - totalGzipped / totalOriginal) * 100).toFixed(1);
		console.log(`
🗜️  Total Size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB -> ${(totalGzipped / 1024 / 1024).toFixed(2)} MB (${ratio}% reduction)`);
	}
}

export async function createArchive() {
	console.log("\n⏳ Waiting for disk I/O to settle...");
	await Bun.sleep(1000);

	console.log("🗜️  Creating panel.tar.gz...");
	await $`rm -f panel.tar.gz`;
	
	const excludes = [
		'./node_modules', './vendor', '.git', '.github',
		'storage/framework/cache/*', 'storage/framework/sessions/*', 'storage/framework/views/*',
		'storage/logs/*', 'storage/*.key', 'storage/app/backups/*', 'storage/app/public/*',
		'bootstrap/cache/*', 'public/storage', '.env', '.env.*', '*.tar.gz', '*.zip',
		'.direnv', '.vscode', '.idea', '*.log', '_ide_helper*.php', '.phpstorm.meta.php',
		'.php-cs-fixer.cache', 'bun.lockb'
	];

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
