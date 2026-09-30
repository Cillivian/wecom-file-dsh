# 参与开发

## 先读这两个

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)：宿主半 / 浏览器半的边界、两种 profile、CLI 优先 + iframe 回退的路由
- [docs/SETUP.md](docs/SETUP.md)：`wecom-cli` 前置、安装、同站代理、故障排查

## 环境现实（先看这段再动手）

这个插件目前无法脱离内部环境构建或运行：

- `@deepseek-ai/*`（DSH / Cordis 平台包）**不在公网 npm**，只能由运行中的 DeepSeek Harness 提供；
- `wecom-cli` 同样只在内网源分发，而它是宿主半唯一的外部依赖；
- 因此 `pnpm install` 在这台机器之外无法完整跑通，`tools/bundle.mjs` 默认从已有的 DSH checkout 里取 `tsdown`。

如果你在内部环境里：装好 DSH 与 `wecom-cli` 后，`node --run test` 与 `node --run bundle` 都应该直接可用。

## 常用命令

```bash
node --run test       # 零依赖测试（node:test），不需要 DSH 包或 wecom-cli
node --run bundle     # 重建 lib/client.js（产物入库，改动后必须一起提交）
node --run web        # 生成 cordis.dev.yml 并起 dsh web（开发态 overlay）
node --run proxy      # 同站 HTTPS 代理，让 iframe 回退在浏览器里可登录
```

## 改代码时的硬约束

1. **宿主半只能用可擦除语法**：DSH 用 Node 的类型擦除直接加载 `src/host/*.ts`，`enum` / 参数属性（`constructor(private x)`）/ `namespace` 都会在加载时炸掉。
2. **浏览器半不能引入需要运行时解析的 npm 包**：客户端产物只允许 `require()` 平台模块（`react`、`react-dom`、`jsx-runtime`、`@deepseek-ai/dsh-client-ui-primitives`）。图标、工具函数请内联或打进 bundle，否则表现为 `web boot: … did not activate`。
3. **新增 HTTP 路由必须过围栏**：`fenceOff(ctx, req, res)` 是每条路由的第一道判断，且围栏缺失时视为拒绝；同时补方法校验与输入上限。
4. **CLI 调用只走 `ctx.subprocess.spawn({ argv: [...] })`**：不要拼 shell 字符串，不要引入新的可写路径。
5. **宿主半新增 `@deepseek-ai/*` 运行时 import 时，必须同时加进 `peerDependencies`**：DSH 的 profile 解析器只对「父包 `peerDependencies` 里声明过」的裸模块名做拦截并映射到运行时自带的那一份（`packages/boot/app-boot/src/profile-resolution/resolver.ts` 的 `routeLinked`），否则会退回 Node 原生解析——插件在仓库里找不到 `@deepseek-ai/*`，表现为宿主行 `inactive`、路由 404、客户端半也不会加载。`import type {}` 会被类型擦除，不受影响。

## 提交前

```bash
node --run test        # 必须全绿
node --run bundle      # 客户端源码改动后
```

- 测试放在 `test/`，用 `node:test`，保持**零依赖、离线可跑**（对 CLI 用假 subprocess，不要真的调用 `wecom-cli`）
- 客户端 UI 改动请手动过一遍：浅色/深色主题、窄窗口（< 720px）、键盘路径（`Esc` / `Enter` / `⌘F` / 方向键）
- 改了行为请同步更新 `README.md`、`docs/` 与相关运行时技能（`src/host/skill-*.ts`）
- 不要提交 `lib/*.map`、`cordis.dev.yml`、`certs/`、`.tmp/`（已在 `.gitignore`）
