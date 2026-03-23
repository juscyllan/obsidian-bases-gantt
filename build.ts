const prod = Bun.argv.includes("production");

const jsBuild = Bun.build({
	entrypoints: ["src/main.ts"],
	outdir: ".",
	naming: "main.js",
	format: "cjs",
	target: "browser",
	minify: prod,
	sourcemap: prod ? "none" : "inline",
	external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
	plugins: [
		{
			name: "css-stub",
			setup(build) {
				build.onResolve({ filter: /\.css$/ }, (args) => ({
					path: args.path,
					namespace: "css-stub",
				}));
				build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
					contents: "",
					loader: "js",
				}));
			},
		},
	],
});

const cssBuild = Bun.build({
	entrypoints: ["src/styles/main.css"],
	outdir: ".",
	naming: "styles.css",
	minify: prod,
});

Promise.all([jsBuild, cssBuild]).then(() => {
	console.log(prod ? "✓ Production build" : "✓ Dev build");
}).catch(err => {
	console.error(err);
	process.exit(1);
})
