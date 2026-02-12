const toCamelCase = (str: string): string =>
	str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

const parseValue = (value: string): any => {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
};

export function parseArgs(): Record<string, any> {
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
			if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
				value = parseValue(args[++i]);
			}
		}

		config[toCamelCase(key)] = value;
	}
	return config;
}

export function showHelp() {
	console.log(`
Pterodactyl Bun Build Script (Native API)

Usage: bun run build.ts [options]

Options:
  --minify      Enable minification (default: true in production)
  --production  Set NODE_ENV=production
  --hash        Enable file hashing (default: true in production)
  --split       Enable code splitting (default: true in production)
  --compress    Enable Gzip compression for assets
  --brotli      Enable Brotli compression for assets
  --archive     Create a panel.tar.gz archive after build
  --outdir      Output directory (default: public/assets)
`);
}
