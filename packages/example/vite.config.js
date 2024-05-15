import { defineConfig } from "vite";
import { resolve } from "path";
import { viteChromeDevPlugin } from "vite-plugin-chrome-launcher";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: { background: resolve(__dirname, "background.js") },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "", // dist
        },
      ],
    }),
    viteChromeDevPlugin({
      navigateUrl: "http://github.com",
    }),
  ],
});
