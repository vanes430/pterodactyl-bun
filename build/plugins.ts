import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import * as babel from "@babel/core";

export const postcssPlugin = {
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

export const babelPlugin = {
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
