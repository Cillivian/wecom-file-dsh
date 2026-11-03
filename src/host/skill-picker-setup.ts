/**
 * Runtime skill that tells an Agent how to install, configure, and diagnose
 * this plugin for a user — prerequisites, both deployment shapes (desktop
 * bundle and `dsh web`), the CLI-first / iframe-fallback routing, and the
 * failure modes worth checking first.
 */

export const WECOM_PICKER_SETUP_SKILL = {
  name: 'wecom-wedrive-picker-setup',
  source: 'runtime' as const,
  description:
    '安装、配置或排查「企业微信·微盘」输入条选择器插件时加载。覆盖 wecom-cli 前置安装与授权、桌面版 bundle 与 dsh web 两种接入方式、CLI 优先 / iframe 回退的选择逻辑，以及常见故障定位。',
  whenToUse:
    '用户要装/升级/配置这个微盘选择器插件，或反馈「选择器打不开 / 一直要登录 / 提示找不到 wecom-cli / 跳外部浏览器」。',
  content: `# 微盘选择器插件：安装与排查

插件 id \`wecom-picker\`，仓库 \`wecom-file-dsh\`。宿主半跑 \`wecom-cli\`，浏览器半只负责 UI；**优先 CLI，CLI 不可用才回退官方 iframe 选择器**。

## 一、前置：wecom-cli（必须）

选择器与后续阅读都依赖它，先做这三步：

\`\`\`bash
wecom-cli --version              # 需 ≥ 1.2.0
wecom-cli auth show --status     # 期望输出 authorized
wecom-cli auth init --noninteractive   # 未授权时执行，用企业微信扫码
\`\`\`

- 版本低或未安装 → \`npm install -g @wecom/cli\`（内网 registry 见 \`wecomcli-shared\` 技能）。
- \`auth show --status\` 输出 \`authorized\` **不代表 token 未过期**：运行时返回 \`errcode 853004\` 才算过期，此时重新 \`auth init\`。
- 插件里也能重新授权：授权失效或授权失败时，选择器弹层会直接显示二维码，并可点「重新授权」/「重新获取二维码」重开一次登录（会先结束上一次等待扫码的进程）。CLI 的授权文件在宿主进程的 \`$DSH_HOME/storages/wecom-picker/\` 之外，插件只往该目录写二维码图片。

## 二、安装插件（按运行方式二选一）

### A. 桌面版（DeepSeek Harness.app，推荐）

profile 目录 \`$DSH_HOME/profiles/desktop\`，把仓库 link 进 profile：

\`\`\`bash
cd "$DSH_HOME/profiles/desktop"
pnpm add wecom-dsh-plugins@link:/abs/path/to/wecom-file-dsh
\`\`\`

再把包加进 \`package.json\` 的 \`dsh.profile.bundles\`（已有则跳过），重启应用。桌面版页面 origin 是 \`dsh-app://app\`，插件路由走该 authority 的转发，无需额外 \`--trusted-host\`。

### B. \`dsh web\`（浏览器）

用仓库自带的 standalone overlay：

\`\`\`bash
dsh web --patch /abs/path/to/wecom-file-dsh/cordis.yml --no-open
\`\`\`

浏览器打开打印出的 \`http://127.0.0.1:<port>/...\`。这条路径下页面是 \`http://127.0.0.1:<port>\`，宿主仍是同一台机器，\`wecom-cli\` 照常可用。

## 三、两种选择器模式

| 模式 | 何时用 | 说明 |
| --- | --- | --- |
| CLI 选择器（默认） | \`wecom-cli\` 可用 | 搜索 + 最近浏览 + 排序 + 列表/分栏/画廊，不依赖浏览器登录 |
| 官方 iframe 选择器（回退） | 插件检测到 \`wecom-cli\` 缺失，或用户手动切换 | 加载 \`doc.weixin.qq.com/webdisk/index?t=wedriveFileSelectorForWework\`，靠 \`postMessage\` 回收结果 |

**iframe 回退要能登录，DSH 页面必须与 \`doc.weixin.qq.com\` 同站**（浏览器 + 本仓库 \`tools/dev-proxy.mjs\` 或 Whistle 把 DSH 挂到该域名下）。桌面版是 \`dsh-app://app\`，属跨站 iframe，WeCom 的 \`SameSite=Lax\` 会话 cookie 种不下，登录面板又会导航顶层窗口、被桌面版围栏转交系统浏览器——所以在桌面版里 iframe 只能看不能登录，别把它当主路径。

## 四、常见故障

| 现象 | 先查 |
| --- | --- |
| 弹层显示「未找到 wecom-cli」 | \`which wecom-cli\`；宿主进程 PATH 是否含 nvm/homebrew bin |
| 显示「授权已失效」/ \`errcode 853004\` | 点弹层里的「重新授权」扫码，或 \`wecom-cli auth init --noninteractive\` |
| 显示「授权失败」/ 二维码一直不动 | 点「重新授权」/「重新获取二维码」重开一次登录，或 \`wecom-cli auth init --noninteractive\` |
| 点开直接跳外部浏览器 | 说明走的是登录流程：桌面版请改用 CLI 模式；浏览器请确认同站代理已生效 |
| 列表空但 CLI 正常 | 该机器人没有「最近浏览」记录；用搜索框按关键词找，或先在微盘里打开一次文件 |
| iframe 里点不动 / 结果不回来 | 检查 \`postMessage\` origin 是否为 \`https://doc.weixin.qq.com\`，以及页面是否被浏览器拦截第三方 iframe |

## 五、边界

- 微盘没有「列出指定文件夹子项」的接口（\`disk\` 只有 \`list\` 最近 / \`search\` / \`get\` / \`download\` / \`upload\` / \`rename\` + \`folders create\`），所以 CLI 模式的分栏视图是用搜索结果里的 \`space_name\` / \`folder_name\` 合成的层级，不是真实目录树；要浏览完整目录请用官方客户端或 iframe 模式。
- 回复用户时不要展示 id（\`wecomcli-shared\` 的通用约束）。
`,
} as const
