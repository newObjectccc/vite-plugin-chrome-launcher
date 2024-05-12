import { glob } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default {
  input: Object.fromEntries(
    glob
      .sync("src/**/*.ts")
      .map((file) => [
        path.relative(
          "src",
          file.slice(0, file.length - path.extname(file).length)
        ),
        fileURLToPath(new URL(file, import.meta.url)),
      ])
  ),
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json", // 指向你的 tsconfig.json 文件
    }),
    terser(),
  ],
};
