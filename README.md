# wecom-file-dsh

DeepSeek Harness（DSH）插件：在对话输入条插入企业微信微盘选择器，把选中的文件 / 文档 / 文件夹写成官方 `@` 引用 chip，再按 id 前缀路由到对应的 `wecom-cli` 技能阅读。

仓库：[dsh-plugins/wecom-file-dsh](https://cnb.woa.com/dsh-plugins/wecom-file-dsh)

## 功能

- 输入条左侧工具栏增加「企业微信·微盘」按钮
- 弹出 `doc.weixin.qq.com` 微盘选择器 iframe，支持多选（最多 10 项）
- 确认后在草稿末尾插入 WeDrive chip，发给模型的文本是：
  - 文件 / 文档：`@<id>/<文件名>`，名称含空格时为 `@"<id>/<文件名>"`
  - 文件夹：`@<id>/<文件夹名>/`
- 运行时技能 `wecom-wedrive-ref` 识别这些 chip，先走 `wecomcli-shared`，再按 id 加载业务技能

## Chip 路由

| id 前缀 | 加载技能 | 查阅方式 |
| --- | --- | --- |
| `a1_` / `b1_` | `wecomcli-smartpage` | 智能文档正文 |
| `s3_` | `wecomcli-smartsheet` | 智能表格 |
| `d3_` 或其他不含 `.` 的 docid | `wecomcli-doc` | `wecom-cli doc contents get --json` |
| `s.` / `i.`（微盘条目，带点） | `wecomcli-disk` | 普通文件用 `disk files download` / `get`；在线文档不要 download，用返回的 `docid` 再走上行文档技能 |

`wecomcli-doc` 规定：`a1_` / `b1_` 不得当普通 doc 读。回复用户时用文档名，不要展示 id；有链接时写成 `[名称](url)`。

Chip 的 id 来源：

- 在线文档用 `doc_id`（`a1_` / `s3_` / `d3_` …）
- 普通文件和文件夹用列表条目 `id`（`s.xxx` / `i.xxx`）
- `fileId` 是加密 blob，不会写入 chip

## 结构

```
src/
  my-plugin.ts                 # 服务端：注册 greet 工具 + wecom-wedrive-ref 技能
  wecom-wedrive-ref-skill.ts   # chip → wecom-cli 路由说明
  client/
    index.ts                   # 浏览器侧入口：文案、chip source、输入条按钮
    WecomPickerButton.tsx      # 选择器按钮与 iframe 弹层
    selector.ts                # 选择器 URL / origin / postMessage 解析
    chips.ts                   # WeDrive chip 序列化与插入
    locales.ts                 # zh / en 文案
lib/client.js                  # 客户端打包产物（tsdown）
cordis.yml                     # DSH --patch 插入本插件
dev-proxy.mjs                  # 无 Whistle 时的本机 HTTPS 分流代理
whistle.rules                  # 推荐：Whistle / Whistle2 规则
```

插件 id：`wecom-picker`。客户端打包名仍为 `dsh-scratch-plugin`（见 `tsdown.config.ts`）。

## 接入

在 DSH 的 `cordis.yml` 里插入本插件（路径按本机仓库调整）：

```yaml
- insert:
    - id: wecom-picker
      name: '/path/to/wecom-file-dsh/src/my-plugin.ts'
```

当前仓库的 `cordis.yml` 仍指向旧目录 `workspace/dsh`，本地开发时请改成实际路径。

启动 DSH Web 时必须带上：

```bash
--patch /path/to/wecom-file-dsh/cordis.yml --trusted-host doc.weixin.qq.com
```

`--trusted-host` 让选择器 iframe 与 DSH 能共享 `https://doc.weixin.qq.com`，否则 `postMessage` 会被 origin 拦住。

## 本地开发

选择器页面在 `https://doc.weixin.qq.com`，DSH 开发服默认在 `127.0.0.1:3080`。要让 iframe 与宿主同源，需要把 DSH 挂到同一域名下。**Whistle 与本仓库的 `dev-proxy.mjs` 不要同时用。**

### 方式一：Whistle（推荐）

1. 删掉 `/etc/hosts` 里的 `127.0.0.1 doc.weixin.qq.com`
2. 把 `whistle.rules` 贴进 Whistle / Whistle2
3. 启动 DSH（带 `--trusted-host doc.weixin.qq.com --no-open`）
4. 打开 `https://doc.weixin.qq.com/dsh/?token=…`（token 用 `dsh web` 打印的那一段）

`403 forbidden` 通常是转发后 `Host` 变成了 `127.0.0.1:3080`，而浏览器 `Origin` 仍是 `https://doc.weixin.qq.com`。规则里的 `reqHeaders://host=doc.weixin.qq.com` 必须写在同一行转发上。

### 方式二：本机 HTTPS 代理

把 `doc.weixin.qq.com` 指到本机 443，再由 `dev-proxy.mjs` 分流：

| 路径 | 上游 |
| --- | --- |
| `/dsh` `/plugins` `/assets` `/api` 等 | `127.0.0.1:3080` |
| 其余（如 `/webdisk`） | 真实的 `doc.weixin.qq.com`（走公网 DNS，绕过 hosts） |

```bash
# 1. hosts
sudo sh -c 'grep -q "doc.weixin.qq.com" /etc/hosts || echo "127.0.0.1 doc.weixin.qq.com" >> /etc/hosts'

# 2. 本地证书（已加入 .gitignore）
mkcert -install
mkdir -p certs
mkcert -cert-file certs/doc.weixin.qq.com.pem \
  -key-file certs/doc.weixin.qq.com-key.pem \
  doc.weixin.qq.com

# 3. 启动 DSH
pnpm --dir /path/to/deepseek-harness dsh web \
  --patch /path/to/wecom-file-dsh/cordis.yml \
  --trusted-host doc.weixin.qq.com \
  --no-open

# 4. 启动代理（需要 443，一般要 sudo）
sudo node ./dev-proxy.mjs

# 5. 打开 https://doc.weixin.qq.com/dsh/?token=…
```

环境变量：

- `DSH_WECOM_PROXY_PORT`：代理监听端口，默认 `443`
- `DSH_WECOM_DSH_PORT`：DSH Web 端口，默认 `3080`

### 客户端打包

```bash
pnpm bundle
```

`package.json` 里的 `bundle` / `web` 脚本目前写死了本机 `deepseek-harness` 与旧的 `workspace/dsh` 路径，换机器或目录后需要改脚本或按上面的命令手跑。

## 依赖

- 运行时：DSH / Cordis 插件体系（`tools`、`skills`、客户端 `slots` / `locale` / `inputTriggers` / `sessions`）
- 客户端 UI：`@deepseek-ai/dsh-client-ui-*`、`@tencent/wedocs-icons`
- 阅读 chip：本机已安装并授权 `wecom-cli` ≥ 1.1.0，以及对应的 `wecomcli-*` 技能
