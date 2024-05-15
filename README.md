# vite-plugin-chrome-launcher

help you to open chrome-browser and goto chrome://extension, it is helpful when you are developing an extension for chrome.

## Feature

- 自动在沙盒环境中打开你的chrome并加载你的扩展程序.
- 自动导航到 chrome://extensions

## Usege

`npm install --save-dev vite-plugin-chrome-launcher`

```ts
// vite.config.ts
import {viteChromeDevPlugin} from 'vite-plugin-chrome-launcher'

{
  plugins: [viteChromeDevPlugin()]
}
```

## Configuration

```ts
interface IViteChromeDevHelperPlugin {
  /**
   * @description 设置chrome调试端口，若非冲突不用修改
   * @default 9222
   */
  port?: number;
  /**
   * @description 设置加载插件的路径，相对于vite.config.ts文件所在目录
   * @default 'dist'
   */
  loadPath?: string;
  /**
   * @description 设置打开chrome后要加载页面
   * @default 'chrome://extensions'
   */
  navigateUrl?: string;
  /**
   * @description 设置 serve 或 build，建议 build 配合 vite build --watch 使用，默认值为 build
   * @default 'build'
   */
  apply?: "serve" | "build";
  /**
   * @description chrome 默认 flags 过滤器，详细参考 https://peter.sh/experiments/chromium-command-line-switches/
   * @default ['--disable-extensions']
   */
  disableFilter?: string[];
  /**
   * @description 是否重新加载chrome，默认值为 false
   * @default false
   */
  reload?: boolean;
  /**
   * @description 用于判断当前命令是 serve 还是 build，不需要设置
   */
  _command?: "serve" | "build";
}
```
