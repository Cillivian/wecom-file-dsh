/** Runtime skill that routes WeDrive composer chips to wecom-cli skills. */

export const WECOM_WEDRIVE_REF_SKILL = {
  name: 'wecom-wedrive-ref',
  source: 'runtime'         ,
  description:
    '用户消息里出现微盘选择器 chip（@<id>/<文件名> 或 @"<id>/<文件名>"）时加载。按 id 前缀路由到 wecomcli-* 并用 wecom-cli 阅读查阅。',
  whenToUse:
    '用户粘贴或发送了企微微盘/文档 chip，或要阅读刚选中的企微文档/文件。',
  content: `# 微盘选择 chip → wecom-cli

输入条微盘选择器发出的 chip，发给模型的文本是官方 \`@\` 引用：

- 文件 / 文档：\`@<id>/<文件名>\`，空格文件名是 \`@"<id>/<文件名>"\`
- 文件夹：\`@<id>/<文件夹名>/\`

第一条 \`/\` 之前是 id，之后是名称（文件夹再去掉末尾 \`/\`）。

## 阅读前

先加载并完成 \`wecomcli-shared\`（检查 \`wecom-cli\` ≥ 1.1.0 且已授权）。再按 id 加载对应业务技能，不要凭记忆拼命令。

## 按 id 路由

| id | 加载技能 | 查阅 |
|---|---|---|
| \`a1_\` / \`b1_\` | \`wecomcli-smartpage\` | 智能文档正文 |
| \`s3_\` | \`wecomcli-smartsheet\` | 智能表格 |
| \`d3_\` 或其他不含 \`.\` 的 docid | \`wecomcli-doc\` | \`wecom-cli doc contents get --json\`，参数 \`docid\` |
| \`s.\` / \`i.\`（微盘条目，带点） | \`wecomcli-disk\` | 普通文件：\`disk files download\` / \`get\`，\`file_id\` 用整段 id；在线文档不要 download，用返回的 \`docid\` 再走上行文档技能 |

\`wecomcli-doc\` 规定：\`a1_\` / \`b1_\` 不得当普通 doc 读。

## 对用户

回复里用文档名，不要展示 id。有链接时用 \`[名称](url)\`。
`,
}         


//# sourceURL=/Users/cillivian/Documents/workspace/wecom-file-dsh/src/host/skill-wedrive-ref.ts