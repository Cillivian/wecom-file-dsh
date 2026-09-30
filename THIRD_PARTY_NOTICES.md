# 第三方资源声明

本仓库自身不依赖任何可运行时解析的 npm 包（客户端产物只 `require()` DSH 平台模块），但**内置**了来自腾讯内部包的静态图标资源。来源与许可见下；对外分发前请确认这些内部资源的授权范围。

## 腾讯文档文件类型图标（内置）

- 文件：`src/client/assets/WedocsFileIcons.tsx`（22 个字形）
- 来源包：`@tencent/wedocs-icons-svg@0.3.26092900`（`package/src/*.svg`），取自腾讯内网 npm 镜像（非公网可分发的地址）
- 上游贡献者：wendellhu（`package.json` 的 `contributors`）
- 上游许可证字段：**未声明**（`package.json` 无 `license`）。本仓库按内部资源共享处理；对外发布前需向资源所有者确认授权
- 提取方式：一次性转换器把 SVG 逐属性转成 JSX（保留全部 path/属性），仅用于把图标打进客户端产物、避免运行时依赖内部包
- 用到的源文件：

| 组件 | 源文件 | 用途 |
| --- | --- | --- |
| `Tdoc20` | `file-tdoc-20.svg` | 在线文档（`word`） |
| `Tsheet20` | `file-tsheet-20.svg` | 在线表格（`sheet`） |
| `Tslide20` | `file-tslide-20.svg` | 在线幻灯片（`ppt`） |
| `Tsmartsheet20` | `file-tsmartsheet-20.svg` | 智能表格（`smartsheet`） |
| `Smartdoc20` | `file-smartdoc-20.svg` | 智能文档（`smartpage`） |
| `Tmindmap20` | `file-tmindmap-20.svg` | 思维导图（`mind`） |
| `Tflowchart20` | `file-tflowchart-20.svg` | 流程图（`flow`） |
| `Tform20` | `file-tform-20.svg` | 收集表（`collect`） |
| `Treport20` | `file-treport-20.svg` | 汇报（`journal`） |
| `Tpdf20` | `file-tpdf-20.svg` | 在线 PDF（`pdf`） |
| `Folder20` | `file-folder-20.svg` | 文件夹 / 空间 |
| `Space20` | `file-space-20.svg` | 共享空间 |
| `LocalPdf16` | `file-pdf-default-inline.svg` | 本地 PDF |
| `LocalWord16` | `file-word-default-inline.svg` | 本地 Word |
| `LocalExcel16` | `file-excel-default-inline.svg` | 本地 Excel |
| `LocalPpt16` | `file-ppt-default-inline.svg` | 本地 PPT |
| `LocalImage16` | `file-image-default-inline.svg` | 图片 |
| `LocalVideo16` | `file-video-default-inline.svg` | 视频 / 音频 |
| `LocalAudio16` | `file-audio-default-inline.svg` | 音频扩展名 |
| `LocalZip16` | `file-zip-default-inline.svg` | 压缩包 |
| `LocalText16` | `file-text-default-inline.svg` | 文本 / 代码 |
| `LocalSketch16` | `file-sketch-default-inline.svg` | 设计稿 |
| `LocalOther16` | `file-other-default-inline.svg` | 其它二进制文件 |

## 启动按钮图标（内置）

- 文件：`src/client/assets/WedriveIcon.tsx`
- 来源：`@tencent/wedocs-icons@0.3.26091100`（同样来自内网镜像）的 `esm/components/wedrive-16.js`，取其 SVG path 数据（513 字符，逐字节校验一致）
- 上游许可证字段：同样未声明

## 运行时依赖（不随包分发）

| 依赖 | 说明 |
| --- | --- |
| `wecom-cli` ≥ 1.2.0 | 用户自行安装并授权；本仓库不再分发 |
| DSH / Cordis 平台包 | 由运行中的 DeepSeek Harness 提供（`peerDependencies`），本仓库不分发 |
| `react` / `react-dom` / `@deepseek-ai/dsh-client-ui-primitives` | 由 DSH 客户端的 module table 提供，产物里只保留 `require()` |

## 文档中提到的第三方名称

`企业微信`、`微盘`、`腾讯文档`、`WeDrive`、`macOS`、`Finder` 等为各自权利人的商标，仅用于说明兼容目标。
