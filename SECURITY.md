# 安全策略

## 报告问题

请勿在公开 issue 中提交漏洞细节。通过仓库所在平台的私密渠道联系维护者，或在工单中说明影响面与复现步骤，我们会先评估再协调披露。

## 这个插件接触什么

- 它在 DSH 宿主的 **loopback HTTP 服务**上注册四个路由（`/wecom-picker/*`），并由浏览器半调用。
- 它通过 `ctx.subprocess` 执行本机 `wecom-cli`，**argv 是固定数组，不经过 shell**；用户输入只作为 `--json` 参数值出现。
- 它唯一落盘的内容是登录二维码 `$DSH_HOME/storages/wecom-picker/qr.png`（常量文件名）。
- 它不做任何出站网络请求；所有外部访问都由 `wecom-cli` 以本机已授权的机器人身份发起。

## 已实施的防护

| 面 | 措施 |
| --- | --- |
| 路由可达性 | 每个路由先过 DSH `connection.requestRejection` 的 Host/Origin 围栏；**围栏缺失时一律拒绝**（fail closed），不给"无围栏即放行"的默认 |
| 命令执行 | 不使用 shell；`limit` 在 HTTP 层与宿主层双重限制（1–100）；方法不匹配返回 405 |
| 资源上限 | 单次调用超时（列表 20s / 探测 15s / 登录 10min）、stdout 2 MiB、stderr 64 KiB、二维码读取上限 1 MiB |
| 路径 | 不接收任何路径参数；状态目录由 `$DSH_HOME` 推导，文件名是常量 |
| 浏览器侧 | iframe 回退只接受 `origin === https://doc.weixin.qq.com` 的 `postMessage` |

## 已知边界

- 拒绝消息会把本机 CLI 的诊断文本回给**已通过围栏的调用方**（即同一台机器上的 DSH 页面），便于自助排障；不含凭据。
- `wecom-cli` 自身的授权材料由该 CLI 管理，本插件不读取、不存储、不转发。
- 插件依赖 DSH 提供的服务（`webServer` / `subprocess` / `connection` / `skills`）；缺少 `connection` 时路由会全部拒绝，而不是降级放行。
