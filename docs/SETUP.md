# 安装与配置

按顺序做三件事：装 `wecom-cli` 并授权 → 把插件装进目标 profile → 重启/刷新。

## 0. 前置

| 需要 | 检查命令 | 说明 |
| --- | --- | --- |
| Node ≥ 22.18 | `node -v` | 宿主半靠 Node 的类型擦除直接加载 `.ts` |
| DeepSeek Harness | `dsh --version` 或桌面版应用 | 桌面版与 `dsh web` 都可以 |
| `wecom-cli` ≥ 1.2.0 | `wecom-cli --version` | 选择器与后续阅读都靠它 |
| 企业微信授权 | `wecom-cli auth show --status` | 期望输出 `authorized` |

`wecom-cli` **不在公网 npm 上**，需要通过内部源安装（内网 registry 与安装步骤见 `wecomcli-shared` 技能）。没有它，插件只剩 iframe 回退可用。

```bash
# 未安装或版本过低
npm install -g @wecom/cli

# 未授权 / token 过期
wecom-cli auth init --noninteractive     # 扫码，成功后会自动退出
wecom-cli auth show --status             # 复查
```

> `auth show --status` 输出 `authorized` 只说明配置存在；运行时返回 `errcode 853004`（cli token expired）才是真的过期，两类情况都可以在插件弹层里扫码重授权。

## 1. 安装插件

插件以 **bundle** 形式装进 profile，这是 desktop 与 web 唯一推荐的方式。

### 桌面版

```bash
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
cd "$DSH_HOME/profiles/desktop"
pnpm add wecom-dsh-plugins@link:/abs/path/to/wecom-file-dsh
```

确认 `package.json` 的 `dsh.profile.bundles` 数组里有 `wecom-dsh-plugins`（`pnpm add` 不一定自动加，手工补一行即可），然后重启 DeepSeek Harness。

### `dsh web`（浏览器）

```bash
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
cd "$DSH_HOME/profiles/web"
pnpm add wecom-dsh-plugins@link:/abs/path/to/wecom-file-dsh
# 同样把 wecom-dsh-plugins 加进 dsh.profile.bundles
dsh web --no-open
```

打开打印出来的 `http://127.0.0.1:<port>/?token=...`。

### 开发态 overlay（可选，有限制）

`cordis.yml` 是 standalone `--patch` 模板。它只适合「包已经在 profile 树或它的 linked root 里」的场景：overlay 直接引用的插件路径解析不到 `@deepseek-ai/*`。

```bash
pnpm web        # 生成 cordis.dev.yml（含本机绝对路径，已被 .gitignore）后启动
```

## 1.5 配置入口位置

默认插件只加一个独立的工具栏按钮。想改成「+」菜单入口，把配置写进 profile 的 patch 层（`$DSH_HOME/profiles/<profile>/cordis.patch.yml`，它在 bundle 层之后应用）：

```yaml
- id: wecom-picker
  name: wecom-dsh-plugins
  config:
    placement: plusMenu     # standalone（默认）| plusMenu | both
```

`id` 要和 bundle 层插入的行一致（见本包的 `cordis.patch.yml`，那里是 `id: wecom-picker`）。

- `standalone`：输入条左侧工具栏的独立按钮（默认，行为不变）
- `plusMenu`：只在「+」菜单里出现一行「企业微信-微盘」
- `both`：两处都有，点哪个都开同一个弹层

改完要重启应用 / 重新加载客户端插件。客户端启动时会读一次 `/wecom-picker/config`，读不到就按 `standalone` 处理。

自检：宿主侧可以直接请求该路由，确认配置已生效——

```bash
curl -s "http://127.0.0.1:<dsh web 端口>/wecom-picker/config" -H 'accept: application/json'
# {"placement":"plusMenu"}
```

### 菜单里的分组位置

客户端贡献的行会落在菜单的**「命令」**分组末尾，「添加」分组的成员是 DSH 硬编码的 `['file','goal','plan','feedback']`。所以默认效果是：

```
添加            命令
  文件            压缩 / 权限 / 模型 / 导出
  目标            企业微信-微盘   ← 这里
  ...
```

### 让它紧跟「文件」（可选）

要在「添加」分组里紧跟 `文件`，需要给 DSH 的客户端贡献契约加一个可选的 `section` 提示，共三处小改：

1. `packages/client/ui-commands/src/client/contract.ts`：`CommandContribution` 增加 `readonly section?: 'add' | 'commands'`；
2. 同包 `src/client/service.ts` 的 `candidates()`：把 `contribution.section` 透传到候选行；
3. 同包 `src/client/presentation.ts` 的 `sectionRows()`：在按名字表分组前先看行上的 `section`。

然后本插件的贡献带上 `section: 'add'` 即可。这三处是平台改动，会影响所有 profile，需要重新构建 Web 产物并重启；插件本身不改也能用，只是位置在「命令」组。

## 2. 选择器模式

打开输入条左侧的「企业微信·微盘」按钮：

- **CLI 选择器（默认）**：搜索、最近浏览、排序、列表 / 分栏 / 画廊，不依赖浏览器登录。
- **官方 iframe 选择器（回退）**：宿主找不到 `wecom-cli` 时自动进入；授权过期或出错时可点「改用官方选择器」。它加载 `doc.weixin.qq.com` 的官方页面。

iframe 回退要能**登录**，DSH 页面必须与 `doc.weixin.qq.com` 同站。仓库自带两种同站方案（二选一，不要同时用）：

```bash
# A. 本机 HTTPS 代理：把 doc.weixin.qq.com 指到本机 443
mkcert -install
mkcert -cert-file certs/doc.weixin.qq.com.pem -key-file certs/doc.weixin.qq.com-key.pem doc.weixin.qq.com
sudo sh -c 'grep -q "doc.weixin.qq.com" /etc/hosts || echo "127.0.0.1 doc.weixin.qq.com" >> /etc/hosts'
pnpm proxy                       # 需要 443 端口
dsh web --trusted-host doc.weixin.qq.com --no-open
# 浏览器打开 https://doc.weixin.qq.com/dsh/?token=...

# B. Whistle：见 tools/whistle.rules（先删 hosts 里的那条）
```

桌面版 origin 是 `dsh-app://app`，永远与 `doc.weixin.qq.com` 跨站，iframe 里的 WeCom 会话 cookie（`SameSite=Lax`）既种不下也不会发送；再加上登录面板会导航顶层窗口、被桌面版围栏转交系统浏览器——所以在桌面版里 iframe 只作浏览兜底，请用 CLI 模式。

## 3. 构建（改代码时）

```bash
node --run test      # 零依赖测试，不需要 DSH 包或 wecom-cli
node --run bundle    # 重建 lib/client.js（等价于 pnpm bundle）
```

`tools/bundle.mjs` 按顺序找 tsdown：`$DSH_TSUDOWN` → `$DSH_CHECKOUT/node_modules/.bin/tsdown` → 仓库本身及其上两级目录下的 `node_modules/.bin/tsdown` 与 `deepseek-harness/node_modules/.bin/tsdown` → PATH。找不到时报错并说明。

改完客户端产物后需要让 DSH 重新加载：桌面版重启应用最稳妥（`pnpm run dev:web` 在跑时客户端插件会热重载）；宿主半改动由 DSH HMR 决定，必要时同样重启。

## 4. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 弹层提示「未找到 wecom-cli」 | 宿主进程 PATH 里没有它；`which wecom-cli` 确认，或用绝对路径加进 PATH 后重启应用 |
| 提示「企业微信授权已失效」/ `errcode 853004` | 点弹层里的「重新授权」扫码，或 `wecom-cli auth init --noninteractive` |
| 点开就跳外部浏览器 | 走的是官方登录流程：桌面版请留在 CLI 模式；浏览器确认同站代理已生效 |
| 列表空白但 CLI 正常 | 该机器人没有「最近浏览」记录；用搜索框按关键词找，或先在微盘里打开一次文件 |
| 客户端插件加载失败、`web boot: … did not activate` | 产物里出现了非平台的 `require()`；重跑 `pnpm bundle`，不要引入需要运行时解析的 npm 包 |
| 分栏视图层级很浅 | 微盘没有「列出文件夹子项」接口；分栏是按搜索结果的 `space_name` / `folder_name` 合成的，不是真实目录树 |
