// https://github.com/GoogleChrome/chrome-launcher
import * as ChromeLauncher from "chrome-launcher";
import CDP from "chrome-remote-interface";
import { resolve } from "path";

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
   * @description 设置打开chrome后要加载页面，默认会加载扩展管理页面，此参数会额外加载一个tab页
   * @example 'chrome://extensions'
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
   * [description] 设置chrome窗口大小
   */
  size?: [number, number];
  /**
   * @description 用于判断当前命令是 serve 还是 build，不需要设置
   */
  _command?: "serve" | "build";
}

const defaultConfig: IViteChromeDevHelperPlugin = {
  port: 9222,
  loadPath: "dist",
  apply: "build",
  disableFilter: ["--disable-extensions"],
  reload: false,
  size: [1920, 1080],
};

export const viteChromeDevPlugin = (
  userConfig?: IViteChromeDevHelperPlugin
) => {
  const innerConfig: IViteChromeDevHelperPlugin = Object.assign(
    defaultConfig,
    userConfig ?? {}
  );
  let chrome: ChromeLauncher.LaunchedChrome | null = null;

  const runLauncher = async () => {
    if (!Array.isArray(innerConfig.disableFilter)) {
      return console.error(`
        Err: disableFilter must be an Array that contains String type. 
        Example: ['--disable-extensions', '--disable-popup-blocking'].
        For more information, please refer to https://peter.sh/experiments/chromium-command-line-switches/.
      `);
    }
    if (chrome) {
      if (!innerConfig.reload) return;
      await chrome.kill();
      chrome = null;
    }
    const rewriteDefaultFlags = ChromeLauncher.Launcher.defaultFlags()
      .filter((flag: string) => !innerConfig.disableFilter!.includes(flag))
      .concat([
        `--load-extension=${innerConfig.loadPath}`,
        `--auto-open-devtools-for-tabs`,
        `--enable-extension-activity-logging`,
        `--enable-extension-activity-log-testing`,
        `--window-size=${innerConfig.size!.join(",")}`,
      ]);
    const launchOptions = {
      ignoreDefaultFlags: true,
      port: innerConfig.port ?? 9222,
      // https://peter.sh/experiments/chromium-command-line-switches/
      chromeFlags: rewriteDefaultFlags,
    };
    chrome = await ChromeLauncher.launch(launchOptions);
    await goToChromeExtensionCtlPage();
  };

  const goToChromeExtensionCtlPage = async () => {
    let client;
    try {
      client = await CDP();
      const { Network, Page } = client;
      await Network.enable();
      await Page.enable();
      await Page.navigate({ url: "chrome://extensions" });
      if (innerConfig.navigateUrl) {
        await CDP.New({ url: innerConfig.navigateUrl! });
      }
      await Page.loadEventFired();
    } catch (err) {
      console.error(err);
    } finally {
      if (client) {
        await client.close();
      }
    }
  };

  return {
    name: "vite-chrome-launcher-plugin",
    sequential: true,
    order: "post",
    apply: innerConfig.apply,
    configResolved(config: { root: string; command: "serve" | "build" }) {
      innerConfig.loadPath = resolve(config.root, innerConfig.loadPath!);
      innerConfig._command = config.command;
    },
    async buildStart() {
      if (innerConfig._command === "build") return;
      await runLauncher();
    },
    closeBundle() {
      if (innerConfig._command === "serve") return;
      setTimeout(() => {
        runLauncher();
      }, 20);
    },
  };
};
