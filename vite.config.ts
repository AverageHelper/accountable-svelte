import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { visualizer } from "rollup-plugin-visualizer";
import analyze from "rollup-plugin-analyzer";
import path from "node:path";
import sveltePreprocess from "svelte-preprocess";
import tsconfigPaths from "vite-tsconfig-paths";
import typescript from "@rollup/plugin-typescript";

console.warn(`process.env.NODE_ENV: ${process.env.NODE_ENV ?? "undefined"}`);

export default defineConfig({
	plugins: [
		svelte({
			emitCss: true,
			preprocess: sveltePreprocess({
				typescript: {
					tsconfigFile: "./tsconfig.prod.json",
				},
			}),
			onwarn(warning, handler) {
				// Skip "Unused CSS selector" warnings.
				// We specify the same in settings and svelte-check CLI using "--compiler-warnings 'css-unused-selector:ignore'"
				if (warning.code === "css-unused-selector") return;

				// Skip "A form label must be associated with a control" warnings.
				// We specify the same in settings and svelte-check CLI using "--compiler-warnings 'a11y-label-has-associated-control:ignore'"
				// These are usually unnecessary when the control is a custom component, which isn't on the "list" of control elements.
				// See also https://github.com/sveltejs/svelte/issues/6469
				if (warning.code === "a11y-label-has-associated-control") return;

				// Handle all other warnings
				if (handler) handler(warning);
			},
		}),
		typescript({
			// VS Code uses `tsconfig.json` at dev time.
			// Vite uses `tsconfig.prod.json` in production builds:
			tsconfig: path.resolve(__dirname, "./tsconfig.prod.json"),
		}),
		tsconfigPaths({ projects: ["./tsconfig.prod.json"] }),
		analyze({
			onAnalysis: () => {
				// Add a newline before the analysis
				// for vanity
				process.stdout.write("\n");
			},
			filter: module => {
				// Decide which modules are important enough to warn about:
				return (
					// Only modules that themselves take >8% of the bundle
					module.percent > 8
				);
			},
		}),
		visualizer({
			gzipSize: true,
		}),
	],
	// See https://www.npmjs.com/package/svelte-navigator#faq
	optimizeDeps: { exclude: ["svelte-navigator"] },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "/src"),
			"~bootstrap": "bootstrap",
		},
	},
	// css: {
	// 	postcss:  // Vite automatically checks postcss.config.* for this config
	// },
});
