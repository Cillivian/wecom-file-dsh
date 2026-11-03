# 架构

## 一句话

一个包、两半：

- **宿主半**（Node，跑在 DSH 进程里）负责一切需要机器能力的事：调用 `wecom-cli`、把结果规范化成 chip 载荷、暴露 HTTP 路由、注册运行时技能。
- **浏览器半**（React，跑在 DSH 页面里）只做 UI：启动按钮、选择器弹层、chip 插入，以及不可用时切换到官方 iframe 选择器。

两者通过 `src/shared/protocol.ts` 里的路由常量与 wire 类型耦合，没有任何共享运行时状态。

## 部署形态：desktop / web

同一份包在两种 profile 下都能跑，差别只在**页面 origin**，代码里没有任何 `if (desktop)` 分支：

| | 桌面版（推荐） | `dsh web` |
| --- | --- | --- |
| profile | `$DSH_HOME/profiles/desktop` | `$DSH_HOME/profiles/web` |
| 页面 origin | `dsh-app://app` | `http://127.0.0.1:<port>` |
| 宿主进程 | 与应用同机（`wecom-cli` 可用） | 与浏览器同机（`wecom-cli` 可用） |
| 插件路由 | 该 authority 的非 dist 路径被转发到宿主 HTTP | 同源直接命中宿主 HTTP |
| iframe 选择器 | 跨站 iframe，登录态进不来，只作浏览回退 | 若 DSH 与 `doc.weixin.qq.com` 同站（同站代理），官方选择器可正常登录 |

客户端一律用**文档相对路径**（`wecom-picker/status`）访问宿主路由，所以两种 origin 下都成立；宿主按绝对路径注册，两种形态共用一套路由。

## 选择器路由：CLI 优先，iframe 回退

```
点击微盘按钮
      │
      ▼
┌────────────────────┐   宿主返回 missing   ┌────────────────────────┐
│ CLI 选择器（默认）  │ ───────────────────▶ │ 官方 iframe 选择器     │
│ src/client/cli/    │                      │ src/client/iframe/     │
│                    │ ◀─────────────────── │ （CLI 不可用时不提供返回）│
└────────────────────┘   用户点击「改用 CLI」 └────────────────────────┘
      │                                             │
      │ 确认                                        │ postMessage confirm
      ▼                                             ▼
             insertWedriveChips() → @<id>/<名称> chip
```

- **默认 CLI**：`wecom-cli` 不需要浏览器会话，桌面版与浏览器一致可用。
- **自动回退**：宿主报 `state: 'missing'`（机器上没有 CLI）时，`CliPicker` 直接调 `onUseIframe(true)`，不展示死路页面。
- **手动回退**：`unauthorized`（授权过期）与 `error` 状态提供「改用官方选择器」；`missing` 时该按钮不出现，避免「回退 → 没有 CLI → 又回退」的循环。
- **授权失败可重来**：`unauthorized` 直接展示二维码；登录尝试失败、或二维码已过期时，同一处「重新授权」/「重新获取二维码」会重开一次 CLI 登录。`POST /auth/start?restart=1` 负责先终止正在等待扫码的进程再起新的（二维码不能原地刷新）；`error` 状态也保留「重新授权」入口，因为授权失败可能被归为普通错误。
- **关闭即复位**：`PickerButton.close()` 把模式重置为 `cli`，下次打开仍优先 CLI。
- 结果通道统一：`IframePicker` 校验 `event.origin === https://doc.weixin.qq.com` 后解析 `parseWecomSelectorMessage`，与 CLI 选择器输出同一种 `WecomSelectedFile`，chip 插入只有一条路径（`chips.ts`）。

## 两个入口，一个弹层

`placement` 配置决定入口，两条入口最终都落到同一个组件（`PickerButton.tsx`）：

```
placement: standalone ─┐
placement: both ───────┼─▶ conversation.input.left 槽位（工具行按钮，可渲染为 null）
placement: plusMenu ───┘            ▲
                                    │ PickerStore.open(sessionId)
placement: plusMenu ───▶ ctx.commandUi 贡献「+」菜单一行
```

- 槽位**在所有 placement 下都注册**：`plusMenu` 时它只渲染 `null`，但仍然承载弹层，是 `+` 菜单那一行唯一的 React 宿主。
- `ctx.commandUi` 是可选服务：没有它（`ctx.inject(['commandUi'], …)` 未激活）时只保留工具行按钮，插件不会因此不激活。
- 命令贡献的 `run(session)` 没有 React 上下文，所以它只把「为这个 session 打开」写进 `PickerStore`；`useInput`/chip 插入仍由槽位组件完成。
- 客户端 boot 行不携带配置（只有 `id`/`inject`/`immediately`），所以 placement 由宿主 `GET /wecom-picker/config` 提供；读不到时回落 `standalone`。
- DSH 把「+」菜单的分组成员硬编码在 `ui-commands` 的 `SECTION_ROWS`，插件贡献落在「命令」组；要进「添加」组需要平台侧支持（见 docs/SETUP.md）。

## 窗口：浮动而非固定

弹层是**可移动窗口**，不是钉在屏幕中央的固定模态：

- 拖动面是工具栏（标题 + 空白处）。按下后指针被 capture 到工具栏，所以拖出窗口、甚至拖到 iframe 回退的 `<iframe>` 上都不会断线；查看方式按钮、排序菜单、搜索框各自保留自己的指针手势，按下不会误触拖动。
- 偏移量是**相对居中位置**的平移（`transform: translate3d`），不是绝对坐标：没拖过的窗口在任何视口都自动居中，拖过的窗口随视口尺寸变化一起收敛。
- `window-geometry.ts` 的 `clampOffset` 保证窗口至少留 `WINDOW_MARGIN`（8px）在视口内，拖到边界就停住，不可能被丢到屏幕外；视口缩放时在**布局阶段**（`useLayoutEffect`）重新夹一次，不会先画到屏幕外再跳回来。
- 位置存 `localStorage`（`wecom-picker/window/v1`），下次打开还在原处；存储被禁用或值损坏时退回居中。
- **键盘等价路径**（WCAG 2.5.7：拖动不能是唯一操作方式）：标题是可聚焦手柄，方向键 16px 微调（`Shift` 4px），点击 / 回车 / 空格回到居中。指针拖动结束后的那次 `click` 会被吞掉，不会被误判成「回到居中」。

## 宿主路由

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/wecom-picker/config` | 入口位置（`placement`），不触碰 CLI |
| GET | `/wecom-picker/status` | 授权状态、`wecom-cli` 版本、当前登录尝试（含授权链接） |
| GET | `/wecom-picker/files?q=&cursor=&limit=` | `q` 空 → `disk files list`（最近浏览）；否则 `disk files search`；`limit` 上限 100 |
| POST | `/wecom-picker/auth/start` | 启动 `wecom-cli auth init --noninteractive --no-browser --output-qrcode qr.png`；`?restart=1` 先结束正在等待的登录再起新的 |
| GET | `/wecom-picker/auth/qr.png` | 上述登录尝试写出的二维码 |

失败统一 `{ ok: false, state: 'missing' | 'unauthorized' | 'error', message }`；`missing` 用 HTTP 503，其余 200（业务性失败）。所有路由先过 `connection.requestRejection` 的 Host/Origin 围栏。

## 宿主半的边界

`src/host/wecom-cli.ts` 只依赖 Node 内置模块 + 协议类型：

- 通过 `ctx.subprocess` 缝执行 CLI（不直接 `child_process`），因此进程生命周期、超时、终止都由 DSH 托管；
- argv 为固定数组（`['disk','files','list','--json', JSON.stringify(body)]`），**不经过 shell**，用户输入只出现在 JSON 参数里；
- stdout/stderr 有内存上限（2 MiB / 64 KiB）与单次调用超时；
- 状态目录固定为 `$DSH_HOME/storages/wecom-picker/`，只有二维码图片写在那里，文件名是常量 `qr.png`；
- 同一时间只保留一次登录尝试：普通 `startAuth` 复用等待中的那次，`restart` 会先终止旧进程；插件卸载时同样会终止它，不让等待扫码的进程留在机器上。

`src/host/routes.ts` 是唯一的 HTTP 面：方法校验、围栏、请求解析、错误分类。

## 目录结构

```
src/
  host/                     宿主半（Node，DSH 进程内）
    index.ts                Cordis 插件入口：工具 + 运行时技能 + 路由装配
    wecom-cli.ts            CLI 调用、输出规范化、auth 二维码中继
    routes.ts               webServer 路由（围栏 / 方法 / 错误分类）
    skill-wedrive-ref.ts    chip → wecomcli-* 路由说明（运行时技能）
    skill-picker-setup.ts   安装 / 配置 / 排查指引（运行时技能）
  shared/
    protocol.ts             路由常量 + wire 类型（前后端共享）
  client/                   浏览器半（React）
    index.ts                客户端插件入口：slot / locale / trigger 装配
    PickerButton.tsx        启动按钮 + CLI/iframe 模式路由 + chip 插入
    window-drag.ts          窗口拖动：指针拖动 / 键盘微调 / 视口夹取 / 位置持久化
    window-geometry.ts      纯几何：偏移上限、夹取、拖动位移、位置读写
    chips.ts                WeDrive chip 序列化与插入
    locales.ts              zh / en 文案
    glass.ts                唯一样式表（毛玻璃材质、布局、主题 token）
    cli/                    CLI 选择器
      CliPicker.tsx         弹层状态机：加载 / 选择 / 偏好 / 键盘 / 窗口拖动 / 状态栏
      Toolbar.tsx           统一工具栏：标题手柄 / 查看方式 / 排序菜单 / 搜索 / 关闭
      Views.tsx             列表 / 分栏 / 画廊 / 简介面板
      States.tsx            加载 / 空 / 未授权（含二维码 / 重新授权）/ 错误 / 回退入口
      auth.ts               纯逻辑：授权失败后展示哪些动作、何时轮询
      model.ts              纯逻辑：排序、分栏分组、格式化、图标键、偏好持久化
      scroll.ts             滚动加载更多（IntersectionObserver 哨兵）
      api.ts                宿主路由的浏览器侧调用
    iframe/                 官方选择器回退
      IframePicker.tsx      弹层与 postMessage 生命周期（同一套窗口拖动）
      selector.ts           选择器 URL / origin / 响应解析
    assets/                 内置资源（均不依赖 npm 包）
      WedriveIcon.tsx       启动按钮图标
      WedocsFileIcons.tsx   22 个腾讯文档文件类型字形
      UiIcons.tsx           界面线性图标
tools/
  bundle.mjs                解析 tsdown 并构建客户端产物
  dev-patch.mjs             生成 cordis.dev.yml（含本机绝对路径，不入库）
  dev-proxy.mjs             同站代理：让 iframe 回退在浏览器里可登录
  whistle.rules             Whistle 版同站规则（与 dev-proxy 二选一）
```

## 为什么宿主半不能有需要转译的语法

DSH 用 Node 的**类型擦除**加载 `src/host/*.ts`，没有编译步骤：`enum`、参数属性（`constructor(private x)`）、`namespace` 都会直接报错。宿主半因此只用可擦除语法（`interface` / `type` / `as` / 泛型）。

宿主半的**每个 `@deepseek-ai/*` 运行时 import 都必须在 `peerDependencies` 里声明**：DSH 的 profile 解析器按父包的 peer 列表决定是否拦截裸模块名并映射到运行时那份实例，没声明的会退回 Node 原生解析（仓库里没有 `@deepseek-ai/*`），结果是宿主行 `inactive`、路由 404、客户端半也不加载。`import type {}` 属于类型擦除，不需要声明。

浏览器半走 `tsdown` 打包成单个 CJS 产物 `lib/client.js`，只允许 `require()` 平台提供的模块（`react`、`react-dom`、`jsx-runtime`、`@deepseek-ai/dsh-client-ui-primitives`）；任何其它 `require` 都会在启动时炸掉整个客户端插件。

该产物**入库**：DSH 直接加载包的 `exports["./client"]`，安装时没有构建步骤，所以改完客户端源码必须 `pnpm bundle` 并把产物一起提交。
