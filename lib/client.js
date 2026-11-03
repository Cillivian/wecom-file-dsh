window.__ModuleLoader__.load({
	id: "wecom-dsh-plugins",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region src/client/assets/WedriveIcon.tsx
		/**
		* The WeDrive cube glyph, byte-identical to the icon package's path data.
		* @param props - optional class name.
		* @returns a 16×16 current-color SVG sized to the surrounding font.
		*/
		function Wedrive16({ size, className }) {
			const edge = size === void 0 ? "1em" : size;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: edge,
				height: edge,
				fill: "none",
				"aria-hidden": "true",
				...className === void 0 ? {} : { className },
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					fillRule: "evenodd",
					clipRule: "evenodd",
					d: "M7 .48a2 2 0 012 0l5 2.9a2 2 0 011 1.73v5.79a2 2 0 01-1 1.73l-5 2.9a2 2 0 01-2 0l-5-2.9a2 2 0 01-1-1.73V5.1a2 2 0 011-1.72l5-2.9zm1.5.87a1 1 0 00-1 0L5 2.8l3.37 1.95a1 1 0 01.13.06l2 1.16c.31.18.5.51.5.87v1.74l3-1.73V5.1a1 1 0 00-.5-.87l-5-2.9zM14 8l-3.4 1.97a1 1 0 01-.1.06l-2 1.16a1 1 0 01-1 0L6 10.32v3.47l1.5.87a1 1 0 001 0l5-2.9a1 1 0 00.5-.86V8zm-9 5.21V6.84a1 1 0 01.5-.87l1.49-.86-3-1.73-1.5.86a1 1 0 00-.49.87v5.79a1 1 0 00.5.86L5 13.21zM7.99 5.7L6 6.84v2.32l2 1.16 1-.58 1-.58V6.84l-1-.58v.01l-1.01-.58z"
				})
			});
		}
		//#endregion
		//#region src/client/chips.ts
		/** Trigger-source name; also the chip `source` and serialize routing key. */
		const WEDRIVE_SOURCE = "wedrive";
		/**
		* Official `@` mention the message bubble already paints as a chip.
		* Path is `<id>/<filename>` so the last segment is the label and the model
		* still sees the WeDrive / doc id. Folders keep a trailing slash.
		* @param file - parsed selector entry.
		*/
		function wedriveModelText(file) {
			const name = file.name.replace(/[\u0000-\u001f\u007f-\u009f"/]/gu, "_").trim() || file.id;
			const path = file.kind === "folder" ? `${file.id}/${name}/` : `${file.id}/${name}`;
			return /\s/u.test(path) ? `@"${path}"` : `@${path}`;
		}
		/**
		* Detect-projection length of a clipboard draft: each chip occupies one
		* U+FFFC, while `draft` stores the full clipboard form.
		*/
		function detectLength(draft, occurrences) {
			let n = draft.length;
			for (const occurrence of occurrences) n -= occurrence.length - 1;
			return n;
		}
		/**
		* Register the WeDrive source so submit serializes chip `ref` as an `@` mention.
		* @param ctx - client root that owns `inputTriggers`.
		* @returns disposer that unregisters the source.
		*/
		function registerWedriveSource(ctx) {
			const source = {
				trigger: "@",
				name: WEDRIVE_SOURCE,
				showGroupTitle: false,
				order: 1e3,
				candidates: async () => [],
				onPick: () => void 0,
				codec: {
					clipboardText: (ref) => ref,
					serialize: (ref) => Promise.resolve(ref)
				}
			};
			return ctx.get("inputTriggers").registerSource(source);
		}
		/**
		* Append one WeDrive chip per selected file at the draft end.
		* @param ctx - client root (sessions live here).
		* @param sessionId - composer session.
		* @param files - parsed selector confirm list.
		* @param input - live input snapshot used for the first span CAS.
		*/
		function insertWedriveChips(ctx, sessionId, files, input) {
			if (files.length === 0) return;
			const actx = ctx.get("sessions").scope(sessionId);
			if (actx === void 0) return;
			let draftRev = input.draftRev;
			let detectEnd = detectLength(input.draft, input.occurrences);
			for (const file of files) {
				const modelText = wedriveModelText(file);
				if (actx.bail(actx, "slash/input-insert-reference", {
					reference: {
						source: "wedrive",
						ref: modelText,
						label: file.name,
						appearance: file.kind === "folder" ? "folder" : "file",
						clipboardText: modelText
					},
					span: {
						start: detectEnd,
						end: detectEnd,
						draftRev
					}
				}) !== true) return;
				draftRev += 1;
				detectEnd += 2;
			}
		}
		/** Browser-relative form of {@link PICKER_STATUS_PATH}. */
		const PICKER_STATUS_ROUTE = "/wecom-picker/status".slice(1);
		/** Browser-relative form of {@link PICKER_FILES_PATH}. */
		const PICKER_FILES_ROUTE = "/wecom-picker/files".slice(1);
		/** Browser-relative form of {@link PICKER_AUTH_START_PATH}. */
		const PICKER_AUTH_START_ROUTE = "/wecom-picker/auth/start".slice(1);
		/** Browser-relative form of {@link PICKER_AUTH_QR_PATH}. */
		const PICKER_AUTH_QR_ROUTE = "/wecom-picker/auth/qr.png".slice(1);
		/** Browser-relative form of {@link PICKER_CONFIG_PATH}. */
		const PICKER_CONFIG_ROUTE = "/wecom-picker/config".slice(1);
		//#endregion
		//#region src/client/config.ts
		/**
		* Placement lookup for the browser half.
		*
		* The client boot graph carries no per-row config (rows are `id` / `inject` /
		* `immediately` only), so the placement configured on the plugin's Loader row
		* is read back over the host's config route. One memoized read per page is
		* enough: placement cannot change without a reload.
		*/
		/** Placement assumed when the host half cannot answer (older host, fence refusal). */
		const FALLBACK = "standalone";
		let pending;
		/** Read (once) where the composer should expose the picker. */
		function loadPlacement() {
			pending ??= (async () => {
				try {
					const response = await fetch(PICKER_CONFIG_ROUTE, { headers: { accept: "application/json" } });
					if (!response.ok) return FALLBACK;
					return (await response.json()).placement ?? FALLBACK;
				} catch {
					return FALLBACK;
				}
			})();
			return pending;
		}
		//#endregion
		//#region src/client/locales.ts
		/** Dictionary namespace for the WeCom picker. */
		const NS = "wecom.picker";
		/** Simplified Chinese copy. */
		const zh = {
			"button.label": "企业微信·微盘",
			"menu.label": "企业微信-微盘",
			"menu.description": "从微盘选择文件或文件夹，插入为引用",
			"panel.title": "微盘",
			"panel.drag": "拖动窗口位置；方向键微调，点击回到居中",
			"panel.close": "关闭",
			"panel.cancel": "取消",
			"panel.confirm": "插入",
			"panel.more": "加载更多",
			"cli.useIframe": "改用官方选择器",
			"iframe.title": "企业微信微盘选择器",
			"iframe.hint": "官方选择器需要企业微信网页登录态：只有在 DSH 页面与 doc.weixin.qq.com 同站时才能登录（浏览器 + 同站代理），桌面版里通常只能浏览、无法登录。",
			"iframe.loading": "正在加载官方选择器…",
			"iframe.useCli": "改用 CLI 选择器",
			"panel.retry": "重试",
			"search.placeholder": "搜索微盘文件",
			"search.label": "搜索微盘文件",
			"search.clear": "清空搜索",
			"view.label": "查看方式",
			"view.list": "列表",
			"view.columns": "分栏",
			"view.gallery": "画廊",
			"sort.label": "排序",
			"sort.name": "名称",
			"sort.kind": "种类",
			"sort.updatedAt": "修改日期",
			"sort.size": "大小",
			"sort.location": "位置",
			"sort.ascending": "升序",
			"sort.descending": "降序",
			"sort.direction": "排序方向",
			"column.spaces": "位置",
			"column.folders": "文件夹",
			"column.items": "项目",
			"column.preview": "简介",
			"column.root": "未归档",
			"preview.emptyTitle": "未选择项目",
			"preview.emptyHint": "选择左侧的项目查看详情。",
			"preview.type": "种类",
			"preview.size": "大小",
			"preview.location": "位置",
			"preview.modified": "修改日期",
			"preview.identifier": "标识",
			"preview.open": "打开链接",
			"row.add": "加入选择",
			"row.remove": "移出选择",
			"panel.loading": "正在读取微盘…",
			"panel.empty": "还没有最近浏览的文件",
			"panel.emptyHint": "在企业微信里打开过微盘文件后，这里就会出现。",
			"panel.emptySearch": "没有匹配的文件",
			"panel.emptySearchHint": "换个关键词，或清空搜索查看最近浏览。",
			"panel.recent": "最近浏览",
			"panel.results": "搜索结果",
			"state.missing": "未找到 wecom-cli",
			"state.missingHint": "请先安装企业微信 CLI（版本 ≥ 1.2.0），再重试。",
			"state.unauthorized": "企业微信授权已失效",
			"state.unauthorizedHint": "重新扫码授权后即可继续选择文件。",
			"state.error": "读取微盘失败",
			"state.errorHint": "检查网络或 CLI 状态后重试。",
			"auth.action": "重新授权",
			"auth.restart": "重新获取二维码",
			"auth.waiting": "用企业微信扫码授权",
			"auth.link": "或在浏览器中打开授权页",
			"auth.failed": "授权失败",
			"status.count": "个项目",
			"status.selected": "已选",
			"status.max": "最多 10 项",
			"status.searching": "搜索中…",
			"type.file": "文件",
			"type.folder": "文件夹",
			"type.space": "空间",
			"type.sheet": "在线表格",
			"type.word": "在线文档",
			"type.ppt": "在线幻灯片",
			"type.smartsheet": "智能表格",
			"type.smartpage": "智能文档",
			"type.collect": "收集表",
			"type.journal": "汇报",
			"type.flow": "流程图",
			"type.mind": "思维导图"
		};
		/** English copy, same keys as the Chinese source. */
		const en = {
			"button.label": "WeCom WeDrive",
			"menu.label": "WeCom WeDrive",
			"menu.description": "Pick a WeDrive file or folder and insert it as a reference",
			"panel.title": "WeDrive",
			"panel.drag": "Drag to move this window; arrow keys nudge, click to re-center",
			"panel.close": "Close",
			"panel.cancel": "Cancel",
			"panel.confirm": "Insert",
			"panel.more": "Load more",
			"cli.useIframe": "Use the official selector",
			"iframe.title": "WeCom WeDrive file selector",
			"iframe.hint": "The official selector needs a WeCom web session: it can only sign in when the DSH page shares a site with doc.weixin.qq.com (a browser plus a same-site proxy). Inside the desktop app it is browse-only.",
			"iframe.loading": "Loading the official selector…",
			"iframe.useCli": "Use the CLI picker",
			"panel.retry": "Retry",
			"search.placeholder": "Search WeDrive",
			"search.label": "Search WeDrive files",
			"search.clear": "Clear search",
			"view.label": "View as",
			"view.list": "List",
			"view.columns": "Columns",
			"view.gallery": "Gallery",
			"sort.label": "Sort",
			"sort.name": "Name",
			"sort.kind": "Kind",
			"sort.updatedAt": "Date modified",
			"sort.size": "Size",
			"sort.location": "Location",
			"sort.ascending": "Ascending",
			"sort.descending": "Descending",
			"sort.direction": "Sort direction",
			"column.spaces": "Locations",
			"column.folders": "Folders",
			"column.items": "Items",
			"column.preview": "Info",
			"column.root": "Unfiled",
			"preview.emptyTitle": "Nothing selected",
			"preview.emptyHint": "Pick an item on the left to see its details.",
			"preview.type": "Kind",
			"preview.size": "Size",
			"preview.location": "Location",
			"preview.modified": "Modified",
			"preview.identifier": "Identifier",
			"preview.open": "Open link",
			"row.add": "Add to selection",
			"row.remove": "Remove from selection",
			"panel.loading": "Reading WeDrive…",
			"panel.empty": "No recently viewed files",
			"panel.emptyHint": "Files you open in WeCom show up here.",
			"panel.emptySearch": "No matching files",
			"panel.emptySearchHint": "Try another keyword, or clear the search to browse recent files.",
			"panel.recent": "Recently viewed",
			"panel.results": "Search results",
			"state.missing": "wecom-cli was not found",
			"state.missingHint": "Install the WeCom CLI (version ≥ 1.2.0), then retry.",
			"state.unauthorized": "WeCom authorization expired",
			"state.unauthorizedHint": "Scan the QR code again to keep picking files.",
			"state.error": "Reading WeDrive failed",
			"state.errorHint": "Check the network or the CLI, then retry.",
			"auth.action": "Re-authorize",
			"auth.restart": "Get a new QR code",
			"auth.waiting": "Scan this QR code in WeCom",
			"auth.link": "Or open the authorization page",
			"auth.failed": "Authorization failed",
			"status.count": "items",
			"status.selected": "Selected",
			"status.max": "up to 10",
			"status.searching": "Searching…",
			"type.file": "File",
			"type.folder": "Folder",
			"type.space": "Space",
			"type.sheet": "Online sheet",
			"type.word": "Online doc",
			"type.ppt": "Online slides",
			"type.smartsheet": "Smart sheet",
			"type.smartpage": "Smart doc",
			"type.collect": "Form",
			"type.journal": "Report",
			"type.flow": "Flowchart",
			"type.mind": "Mind map"
		};
		//#endregion
		//#region src/client/glass.ts
		/**
		* The picker's one scoped stylesheet.
		*
		* Client plugins bundle to a single CJS artifact with no CSS pipeline, so every
		* rule lives here as one namespaced (`wcp-`) string injected by the window.
		* Colors come from DSH theme tokens through `color-mix`, so the glass materials
		* follow the host's light/dark themes instead of hard-coding either one.
		*
		* Material model (macOS 26 Finder): the window is the only blurred surface; the
		* toolbar, panes and status bar are translucent token fills layered on top of
		* it, separated by hairline seams and a single specular top edge.
		*/
		/** Injected once per mounted window. */
		const PICKER_STYLE = `.wcp-overlay{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px}
.wcp-scrim{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}
.wcp-window{
  --wcp-h:28px;
  /* DSH's brand-primary is a neutral (near-white in dark, near-black in light).
     Filled selection needs the blue accent, with a static fallback so a token
     rename cannot blank every selected control. */
  --wcp-accent:var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--dsw-static-deepseek-500, #4176e6));
  --wcp-accent-fill:color-mix(in srgb, var(--wcp-accent) 82%, #000);
  /* Text-only accent: nudged toward the label color so the blue keeps ~4.5:1
     on both the light and the dark glass. */
  --wcp-accent-text:color-mix(in srgb, var(--wcp-accent) 88%, var(--dsw-alias-label-primary));
  --wcp-on-accent:#fff;
  position:relative;z-index:1;display:flex;flex-direction:column;
  width:min(780px,100%);height:min(580px,80vh);min-height:320px;overflow:hidden;
  color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.45;
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 50%, transparent);
  border-radius:16px;
  background:color-mix(in srgb, var(--dsw-alias-bg-overlay) 78%, transparent);
  backdrop-filter:blur(30px) saturate(180%);
  box-shadow:0 24px 64px -16px rgb(0 0 0 / 42%),0 2px 6px rgb(0 0 0 / 10%),inset 0 1px 0 rgb(255 255 255 / 26%);
  /* The window is moved by translating it from the overlay's centered rest
     position, so re-centering and resize correction can ease into place. */
  transition:transform .18s cubic-bezier(.22,.61,.36,1);
}
/* A drag tracks the pointer 1:1: easing it would lag behind the grab point. */
.wcp-window--dragging{transition:none;will-change:transform}
.wcp-window,.wcp-window *,.wcp-window *::before,.wcp-window *::after{box-sizing:border-box}
.wcp-window :focus-visible{outline:2px solid var(--wcp-accent);outline-offset:1px;border-radius:6px}
.wcp-window .wcp-search input,.wcp-window .wcp-search input:hover,
.wcp-window .wcp-search input:focus,.wcp-window .wcp-search input:focus-visible{
  outline:none;box-shadow:none;
}
.wcp-window button{font:inherit;color:inherit}

/* Toolbar: also the window's drag surface, so the grab cursor and the
   selection lockdown belong here. The search field takes selection back. */
.wcp-toolbar{
  display:flex;align-items:center;gap:8px;flex:none;padding:8px 10px;
  border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 38%, transparent);
  cursor:grab;touch-action:none;user-select:none;
}
.wcp-toolbar input{user-select:text}
/* Two classes, because every chrome control carries its own cursor:pointer. */
.wcp-window.wcp-window--dragging,.wcp-window.wcp-window--dragging *{cursor:grabbing}
/* The title is the window's keyboard handle: a button that looks like the
   title it always was, at a target size that is comfortable to click. Scoped to
   the window, so the window's own button reset cannot flatten its weight. */
.wcp-window .wcp-title{
  display:flex;align-items:center;flex:none;min-height:var(--wcp-h);padding:0 6px;margin:0;
  border:0;border-radius:7px;background:transparent;color:inherit;
  font:inherit;font-weight:600;letter-spacing:.01em;white-space:nowrap;cursor:grab;
}
.wcp-title:active{cursor:grabbing}
.wcp-spacer{flex:1 1 auto;min-width:8px}
.wcp-segmented{
  display:inline-flex;align-items:center;gap:2px;height:var(--wcp-h);box-sizing:border-box;padding:2px;border-radius:9px;
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 70%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-base) 45%, transparent);
}
.wcp-segmented button{
  display:grid;place-items:center;width:30px;height:calc(var(--wcp-h) - 6px);padding:0;cursor:pointer;
  border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);
  transition:background-color .12s ease,color .12s ease;
}
.wcp-segmented button:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent)}
.wcp-segmented button[aria-pressed="true"]{
  color:var(--wcp-accent-text);
  background:color-mix(in srgb, var(--wcp-accent) 16%, transparent);
  box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--wcp-accent) 34%, transparent);
}
.wcp-iconbtn{
  display:grid;place-items:center;width:var(--wcp-h);height:var(--wcp-h);padding:0;cursor:pointer;
  border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);
  transition:background-color .12s ease,color .12s ease;
}
.wcp-iconbtn:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent);color:var(--dsw-alias-label-primary)}
.wcp-iconbtn[aria-expanded="true"]{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 82%, transparent);color:var(--dsw-alias-label-primary)}
.wcp-iconbtn--wide{display:inline-flex;align-items:center;justify-content:center;width:auto;gap:6px;padding:0 10px}
.wcp-toolbar__label{white-space:nowrap}

/* Sort menu */
.wcp-menu-anchor{position:relative}
.wcp-menu{
  position:absolute;top:calc(100% + 6px);left:0;z-index:5;min-width:172px;padding:5px;
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 55%, transparent);
  border-radius:10px;
  background:color-mix(in srgb, var(--dsw-alias-bg-overlay) 94%, transparent);
  backdrop-filter:blur(18px) saturate(160%);
  box-shadow:0 12px 30px -8px rgb(0 0 0 / 35%);
}
.wcp-menu__item{
  display:flex;align-items:center;gap:8px;width:100%;padding:5px 8px;cursor:pointer;
  border:0;border-radius:7px;background:transparent;text-align:left;
}
.wcp-menu__item:hover{background:color-mix(in srgb, var(--wcp-accent) 12%, transparent)}
.wcp-menu__check{flex:none;width:12px;color:var(--wcp-accent-text)}
.wcp-menu__sep{height:1px;margin:4px 6px;background:color-mix(in srgb, var(--dsw-alias-border-l1) 70%, transparent)}

/* Search */
.wcp-search{
  display:flex;align-items:center;gap:6px;flex:0 1 260px;min-width:150px;
  height:var(--wcp-h);box-sizing:border-box;padding:0 8px;
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 75%, transparent);
  border-radius:9px;
  background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
}
.wcp-search:focus-within{
  border-color:var(--wcp-accent);
  box-shadow:0 0 0 3px color-mix(in srgb, var(--wcp-accent) 20%, transparent);
}
.wcp-search input{
  flex:1 1 auto;min-width:0;height:100%;padding:0;margin:0;
  border:0;background:transparent;color:var(--dsw-alias-label-primary);
  font:inherit;line-height:1;outline:none;
  appearance:none;-webkit-appearance:none;
}
.wcp-search input::placeholder{color:var(--dsw-alias-label-secondary)}
/* Chromium's native searchfield chrome would double the clear affordance. */
.wcp-search input::-webkit-search-decoration,
.wcp-search input::-webkit-search-cancel-button,
.wcp-search input::-webkit-search-results-button,
.wcp-search input::-webkit-search-results-decoration{display:none;-webkit-appearance:none}
.wcp-search__icon,.wcp-search__clear{flex:none;display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}
.wcp-search__clear{display:grid;place-items:center;width:18px;height:18px;padding:0;border:0;border-radius:999px;background:transparent;cursor:pointer}
.wcp-search__clear:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 80%, transparent)}

/* Content frame */
.wcp-content{position:relative;flex:1 1 auto;min-height:0;display:flex}

/* List view */
.wcp-list{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}
.wcp-list__head{
  display:flex;align-items:flex-end;gap:0;flex:none;padding:0 8px;
  border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 65%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 26%, transparent);
}
.wcp-list__head button{
  display:flex;align-items:center;gap:4px;padding:6px 8px;cursor:pointer;
  border:0;background:transparent;font-size:11px;color:var(--dsw-alias-label-secondary);
}
.wcp-list__head button:hover{color:var(--dsw-alias-label-primary)}
.wcp-list__head button[aria-sort="ascending"],.wcp-list__head button[aria-sort="descending"]{color:var(--dsw-alias-label-primary)}
.wcp-col{flex:0 0 auto;min-width:0}
.wcp-col--name{flex:1 1 auto}
.wcp-col--kind{width:96px}
.wcp-col--modified{width:104px}
.wcp-col--size{width:76px;justify-content:flex-end}
.wcp-col--place{width:150px}
.wcp-col--toggle{width:36px;flex:0 0 36px}
.wcp-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.wcp-row{
  display:flex;align-items:center;gap:0;width:100%;padding:0 8px;cursor:pointer;
  border:0;border-radius:0;background:transparent;text-align:left;
}
.wcp-row:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 60%, transparent)}
.wcp-row[aria-selected="true"]{
  background:color-mix(in srgb, var(--wcp-accent) 15%, transparent);
  box-shadow:inset 2px 0 0 var(--wcp-accent);
}
.wcp-row__cell{display:flex;align-items:center;gap:6px;min-width:0;padding:5px 8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wcp-row__name{font-weight:450}
.wcp-row__sub{color:var(--dsw-alias-label-secondary);font-size:11px}
.wcp-num{font-variant-numeric:tabular-nums}
.wcp-toggle{
  display:grid;place-items:center;flex:none;width:20px;height:20px;padding:0;cursor:pointer;
  border:1.5px solid color-mix(in srgb, var(--dsw-alias-label-secondary) 65%, transparent);
  border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 70%, transparent);
  color:transparent;
  box-shadow:inset 0 1px 1px rgb(0 0 0 / 8%);
  transition:background-color .12s ease,border-color .12s ease,box-shadow .12s ease,transform .1s ease;
}
.wcp-row:hover .wcp-toggle,.wcp-pane__item:hover .wcp-toggle,.wcp-thumb:hover .wcp-toggle{
  border-color:var(--wcp-accent);
}
.wcp-toggle:active{transform:scale(.9)}
.wcp-toggle[aria-pressed="true"]{
  border-color:var(--wcp-accent-fill);
  background:var(--wcp-accent-fill);color:var(--wcp-on-accent);
  box-shadow:0 0 0 2px color-mix(in srgb, var(--wcp-accent) 26%, transparent);
}
.wcp-toggle:focus-visible{outline:2px solid var(--wcp-accent);outline-offset:2px}
.wcp-glyph{flex:none;display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}

/* Column view */
.wcp-columns{display:flex;flex:1 1 auto;min-width:0;overflow-x:auto;overscroll-behavior-x:contain}
.wcp-pane{
  display:flex;flex-direction:column;flex:1 1 0;min-width:168px;
  border-right:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 30%, transparent);
}
.wcp-pane:last-child{border-right:0}
.wcp-pane--preview{flex:0 0 232px;background:transparent}
.wcp-pane__head{
  flex:none;padding:6px 10px;font-size:11px;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary);
  border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 45%, transparent);
}
.wcp-pane__list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px}
.wcp-pane__item{
  display:flex;align-items:center;gap:6px;width:100%;padding:4px 6px;cursor:pointer;
  border:0;border-radius:6px;background:transparent;text-align:left;
}
.wcp-pane__item:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 62%, transparent)}
.wcp-pane__item[aria-current="true"]{
  background:color-mix(in srgb, var(--wcp-accent) 16%, transparent);
  color:var(--dsw-alias-label-primary);
  box-shadow:inset 2px 0 0 var(--wcp-accent);
}
.wcp-pane__item[aria-current="true"] .wcp-caret,.wcp-pane__item[aria-current="true"] svg{color:var(--wcp-accent-text)}
.wcp-pane__item[aria-selected="true"] .wcp-pane__label{font-weight:600}
.wcp-pane__label{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wcp-pane__count{flex:none;color:var(--dsw-alias-label-secondary);font-size:11px}
.wcp-caret{flex:none;color:var(--dsw-alias-label-secondary)}

/* Preview */
.wcp-preview{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 14px;text-align:center}
.wcp-preview__stage{
  display:grid;place-items:center;width:64px;height:64px;border-radius:14px;
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 55%, transparent);
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent);
  color:var(--dsw-alias-label-secondary);
}
.wcp-preview__name{font-weight:600;overflow-wrap:anywhere}
.wcp-preview__kind{color:var(--dsw-alias-label-secondary);font-size:11px}
.wcp-preview__rows{width:100%;margin-top:6px;text-align:left;font-size:11px}
.wcp-def{display:flex;gap:8px;padding:3px 0;border-top:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 40%, transparent)}
.wcp-def dt{flex:0 0 62px;color:var(--dsw-alias-label-secondary)}
.wcp-def dd{flex:1 1 auto;min-width:0;margin:0;overflow-wrap:anywhere}
.wcp-link{color:var(--wcp-accent-text)}

/* Gallery */
.wcp-gallery{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}
.wcp-gallery__stage{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  flex:1 1 auto;min-height:0;padding:20px;
}
.wcp-gallery__glyph{
  display:grid;place-items:center;width:132px;height:132px;border-radius:20px;
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 46%, transparent);
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 50%, transparent);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / 22%);
  color:var(--dsw-alias-label-secondary);
}
.wcp-gallery__name{font-size:15px;font-weight:600;max-width:80%;overflow-wrap:anywhere}
.wcp-gallery__meta{color:var(--dsw-alias-label-secondary);font-size:11px}
.wcp-filmstrip{
  display:flex;gap:8px;flex:none;padding:10px 12px;overflow-x:auto;overscroll-behavior-x:contain;
  border-top:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 50%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 26%, transparent);
}
.wcp-thumb{
  position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;flex:none;
  width:84px;padding:8px 6px;cursor:pointer;
  border:1px solid transparent;border-radius:9px;background:transparent;
}
.wcp-thumb:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 60%, transparent)}
.wcp-thumb[aria-current="true"]{
  border-color:color-mix(in srgb, var(--wcp-accent) 65%, transparent);
  background:color-mix(in srgb, var(--wcp-accent) 12%, transparent);
}
.wcp-thumb__label{width:100%;font-size:11px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wcp-thumb__badge{
  position:absolute;top:4px;right:4px;display:grid;place-items:center;width:16px;height:16px;
  border-radius:999px;background:var(--wcp-accent-fill);color:var(--wcp-on-accent);font-size:10px;
}

/* Official selector fallback */
.wcp-iframe__hint{
  flex:none;margin:0;padding:8px 12px;font-size:11px;
  color:var(--dsw-alias-label-secondary);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 26%, transparent);
  border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 45%, transparent);
}
.wcp-iframe__frame{position:relative;flex:1 1 auto;min-height:0;background:transparent}
.wcp-iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.wcp-iframe__frame .wcp-state{position:absolute;inset:0;z-index:1;pointer-events:none}

/* States */
.wcp-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;flex:1 1 auto;padding:28px 24px;text-align:center}
.wcp-state__title{font-weight:600}
.wcp-state__hint{max-width:44ch;color:var(--dsw-alias-label-secondary)}
.wcp-state__detail{
  max-width:60ch;max-height:120px;overflow:auto;margin-top:2px;padding:8px 10px;text-align:left;
  border-radius:8px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent);
  color:var(--dsw-alias-label-secondary);font-size:11px;overflow-wrap:anywhere;
}
.wcp-qr{width:190px;height:190px;padding:6px;border-radius:10px;background:#fff}
.wcp-state__qr{display:flex;flex-direction:column;align-items:center;gap:8px}
.wcp-state__actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.wcp-state--error .wcp-state__title{color:var(--dsw-alias-state-error-primary)}
.wcp-state--warn .wcp-state__title{color:var(--dsw-alias-state-warn-primary)}

/* Buttons */
.wcp-btn{
  display:inline-flex;align-items:center;gap:6px;padding:5px 12px;cursor:pointer;
  border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 80%, transparent);
  border-radius:8px;
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 60%, transparent);
}
.wcp-btn:hover{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 90%, transparent)}
.wcp-btn:disabled{opacity:.45;cursor:default}
.wcp-btn--primary{
  border-color:transparent;background:var(--wcp-accent-fill);color:var(--wcp-on-accent);font-weight:500;
}
.wcp-btn--primary:hover{background:color-mix(in srgb, var(--wcp-accent) 74%, #000)}
.wcp-btn--quiet{border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary)}
.wcp-btn--quiet:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 60%, transparent)}

/* Status bar */
.wcp-status{
  display:flex;align-items:center;gap:10px;flex:none;padding:7px 12px;
  border-top:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent);
  background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 30%, transparent);
  color:var(--dsw-alias-label-secondary);font-size:11px;
}
.wcp-status__strong{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.wcp-status__warn{color:var(--dsw-alias-state-warn-primary)}

/* Skeleton */
.wcp-skeleton__row{display:flex;align-items:center;gap:10px;padding:8px 16px}
.wcp-skeleton__bar{
  height:10px;border-radius:999px;
  background:color-mix(in srgb, var(--dsw-alias-label-secondary) 22%, transparent);
  animation:wcp-pulse 1.5s ease-in-out infinite;
}
.wcp-skeleton__bar--mark{flex:0 0 18px;height:18px;border-radius:999px}
.wcp-skeleton__bar--name{flex:1 1 auto}
.wcp-skeleton__bar--meta{flex:0 0 72px}
.wcp-skeleton__row:nth-child(3n) .wcp-skeleton__bar--name{max-width:72%}
.wcp-skeleton__row:nth-child(3n+1) .wcp-skeleton__bar--name{max-width:58%}
.wcp-skeleton__row:nth-child(3n+2) .wcp-skeleton__bar--meta{flex-basis:56px}
@keyframes wcp-pulse{0%,100%{opacity:.5}50%{opacity:1}}

/* Paging sentinel: visible only while the next page is in flight */
.wcp-sentinel{display:grid;place-items:center;flex:none;height:var(--wcp-h)}
.wcp-sentinel__pulse{
  width:40px;height:4px;border-radius:999px;
  background:color-mix(in srgb, var(--dsw-alias-label-secondary) 40%, transparent);
  animation:wcp-pulse 1.2s ease-in-out infinite;
}
.wcp-filmstrip .wcp-sentinel{width:var(--wcp-h);height:auto}

/* Utilities */
.wcp-ellipsis{display:block;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wcp-visually-hidden{
  position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip-path:inset(50%);white-space:nowrap;border:0;
}

/* Scrolling */
.wcp-scroll::-webkit-scrollbar,.wcp-pane__list::-webkit-scrollbar,.wcp-filmstrip::-webkit-scrollbar,
.wcp-columns::-webkit-scrollbar,.wcp-state__detail::-webkit-scrollbar{width:10px;height:10px}
.wcp-scroll::-webkit-scrollbar-thumb,.wcp-pane__list::-webkit-scrollbar-thumb,.wcp-filmstrip::-webkit-scrollbar-thumb,
.wcp-columns::-webkit-scrollbar-thumb,.wcp-state__detail::-webkit-scrollbar-thumb{
  border:3px solid transparent;border-radius:999px;
  background:color-mix(in srgb, var(--dsw-alias-label-secondary) 35%, transparent);
  background-clip:content-box;
}

/* Narrow panels: the window yields room to the list, chrome compresses. */
@media (max-width:720px){
  .wcp-overlay{padding:12px}
  .wcp-window{width:100%;height:min(620px,88vh);border-radius:14px}
  .wcp-window .wcp-title{display:none}
  .wcp-search{flex:1 1 auto}
  .wcp-col--place{display:none}
}

@media (prefers-reduced-motion:reduce){
  .wcp-window *,.wcp-window *::before,.wcp-window *::after{transition:none!important;animation:none!important}
}
`;
		/**
		* Composer button material, injected by the slot component itself so the
		* launcher is styled before any window ever mounts.
		*/
		const LAUNCH_STYLE = `
.wcp-launch{
  display:grid;place-items:center;flex:none;width:28px;height:28px;padding:0;
  border:0;border-radius:999px;cursor:pointer;
  background:var(--dsw-specific-selector);color:var(--dsw-alias-label-primary);
  transition:background-color .12s ease;
}
.wcp-launch:hover{background:color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--dsw-static-deepseek-500, #4176e6)) 16%, var(--dsw-specific-selector))}
.wcp-launch:active{background:color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--dsw-static-deepseek-500, #4176e6)) 26%, var(--dsw-specific-selector))}
.wcp-launch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--dsw-static-deepseek-500, #4176e6));outline-offset:1px}
@media (prefers-reduced-motion:reduce){.wcp-launch{transition:none}}
`;
		//#endregion
		//#region src/client/cli/model.ts
		/** Toolbar view options, in toolbar order. */
		const VIEW_OPTIONS = [
			{
				id: "list",
				labelKey: "view.list"
			},
			{
				id: "columns",
				labelKey: "view.columns"
			},
			{
				id: "gallery",
				labelKey: "view.gallery"
			}
		];
		/** Sort-menu options, in Finder's order. */
		const SORT_OPTIONS = [
			{
				id: "name",
				labelKey: "sort.name"
			},
			{
				id: "kind",
				labelKey: "sort.kind"
			},
			{
				id: "updatedAt",
				labelKey: "sort.updatedAt"
			},
			{
				id: "size",
				labelKey: "sort.size"
			},
			{
				id: "location",
				labelKey: "sort.location"
			}
		];
		/** CLI type to glyph. Online document types get the 20px document glyphs. */
		const TYPE_ICONS = {
			word: "tdoc",
			sheet: "tsheet",
			ppt: "tslide",
			smartsheet: "tsmartsheet",
			smartpage: "smartdoc",
			mind: "tmindmap",
			flow: "tflowchart",
			collect: "tform",
			journal: "treport",
			pdf: "tpdf",
			folder: "folder",
			space: "space",
			offline_word: "localWord",
			offline_excel: "localExcel",
			offline_ppt: "localPpt",
			offline_pdf: "localPdf",
			image: "localImage",
			videoaudio: "localVideo",
			design: "localSketch"
		};
		/**
		* Extension fallback for entries the CLI types only as `file`. Ordered most
		* specific first; the first match wins.
		*/
		const EXTENSION_ICONS = [
			[/\.(zip|rar|7z|tar|gz|bz2)$/iu, "localZip"],
			[/\.(png|jpe?g|gif|webp|bmp|heic|heif|tiff?|svg)$/iu, "localImage"],
			[/\.(mp4|mov|mkv|avi|wmv|flv|webm|m4v)$/iu, "localVideo"],
			[/\.(mp3|flac|wav|aac|m4a|ape|dsf|dff|ogg|wma)$/iu, "localAudio"],
			[/\.(docx?|rtf|odt)$/iu, "localWord"],
			[/\.(xlsx?|csv|ods|numbers)$/iu, "localExcel"],
			[/\.(pptx?|key|odp)$/iu, "localPpt"],
			[/\.pdf$/iu, "localPdf"],
			[/\.(txt|md|markdown|json|ya?ml|log|xml|html?)$/iu, "localText"],
			[/\.(psd|psb|ai|sketch|fig|xd|afdesign)$/iu, "localSketch"]
		];
		/**
		* Glyph for one entry: the CLI's document type first, then the name's
		* extension, then the generic file or folder glyph.
		* @param item - the entry to decorate.
		*/
		function fileIconKey(item) {
			const byType = item.type === void 0 ? void 0 : TYPE_ICONS[item.type];
			if (byType !== void 0) return byType;
			for (const [pattern, key] of EXTENSION_ICONS) if (pattern.test(item.name)) return key;
			return item.kind === "folder" ? "folder" : "localOther";
		}
		/** Raw CLI type to locale key for a row's kind label. */
		const TYPE_KEYS = {
			file: "type.file",
			folder: "type.folder",
			space: "type.space",
			sheet: "type.sheet",
			word: "type.word",
			ppt: "type.ppt",
			smartsheet: "type.smartsheet",
			smartpage: "type.smartpage",
			collect: "type.collect",
			journal: "type.journal",
			flow: "type.flow",
			mind: "type.mind"
		};
		/** Default browsing mode; column view is the signature, list is the fallback. */
		const DEFAULT_PREFERENCES = {
			view: "columns",
			sortKey: "updatedAt",
			sortDirection: "desc"
		};
		/** Storage key for {@link loadPreferences}. */
		const STORAGE_KEY$1 = "wecom-picker/preferences/v1";
		/** Locale-aware, numeric-aware name ordering shared by every sort facet. */
		const collator = new Intl.Collator(void 0, {
			numeric: true,
			sensitivity: "base"
		});
		/** Kind label for one entry, falling back to the file/folder split. */
		function typeLabel(item, t) {
			const key = item.type === void 0 ? void 0 : TYPE_KEYS[item.type];
			if (key !== void 0) return t(key);
			return item.kind === "folder" ? t("type.folder") : t("type.file");
		}
		/** Chip identity: a doc id and an entry id may collide across kinds. */
		function itemKey(item) {
			return `${item.idKind}:${item.id}`;
		}
		/** Whether two entries are the same chip target. */
		function sameItem(left, right) {
			return itemKey(left) === itemKey(right);
		}
		/** Space bucket of one entry; empty when the CLI withheld the location. */
		function spaceKey(item) {
			return item.spaceId ?? item.spaceName ?? "";
		}
		/** Folder bucket of one entry; empty when the CLI withheld the location. */
		function folderKey(item) {
			return item.folderId ?? item.folderName ?? "";
		}
		/**
		* Path values the CLI uses when the bot may not read a location. They are
		* sentinel text, not data: showing them would put "no permission to view the
		* path" in every row.
		*/
		const OPAQUE_PATH = /无权限|not\s+allowed|no\s+permission|permission\s+denied/iu;
		/** Localized location text: `空间 / 文件夹`, else a usable CLI path. */
		function locationLabel(item) {
			const parts = [item.spaceName, item.folderName].filter((part) => part !== void 0 && part !== "");
			if (parts.length > 0) return parts.join(" / ");
			const path = item.path ?? "";
			return OPAQUE_PATH.test(path) ? "" : path;
		}
		/**
		* Types whose reported byte size is meaningful. Online documents report a
		* payload size that is not a file size (a smart page can claim gigabytes), so
		* their size is withheld rather than shown wrong.
		*/
		const SIZED_TYPES = new Set([
			"file",
			"pdf",
			"offline_word",
			"offline_excel",
			"offline_ppt",
			"offline_pdf",
			"image",
			"videoaudio",
			"design"
		]);
		/** Byte size worth showing or sorting on, or `undefined` when unknown/meaningless. */
		function itemSize(item) {
			if (item.size === void 0) return void 0;
			if (SIZED_TYPES.has(item.type ?? "")) return item.size;
			return item.type === void 0 && item.idKind === "file" && item.kind === "file" ? item.size : void 0;
		}
		/** Epoch milliseconds of a CLI timestamp (`YYYY-MM-DD HH:mm:ss`), 0 when absent. */
		function timeValue(updatedAt) {
			if (updatedAt === void 0) return 0;
			const parsed = Date.parse(updatedAt.replace(" ", "T"));
			return Number.isNaN(parsed) ? 0 : parsed;
		}
		/** Human-readable size; dashes stand in for folders and unknown sizes. */
		function formatBytes(size) {
			if (size === void 0 || size < 0) return "—";
			if (size < 1024) return `${String(size)} B`;
			const units = [
				"KB",
				"MB",
				"GB",
				"TB"
			];
			let value = size / 1024;
			let unit = 0;
			while (value >= 1024 && unit < units.length - 1) {
				value /= 1024;
				unit += 1;
			}
			return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unit] ?? "KB"}`;
		}
		/** Compact modified-date text: time when recent, date when older. */
		function formatDate(updatedAt) {
			if (updatedAt === void 0) return "—";
			const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/u.exec(updatedAt);
			if (match === null) return updatedAt;
			const [, year, month, day, hour, minute] = match;
			const now = /* @__PURE__ */ new Date();
			return Number(year) === now.getFullYear() ? `${month}-${day} ${hour}:${minute}` : `${year}-${month}-${day}`;
		}
		/** Compare two entries on one facet, excluding direction. */
		function compareOn(left, right, key, t) {
			switch (key) {
				case "kind": {
					const byKind = collator.compare(typeLabel(left, t), typeLabel(right, t));
					return byKind !== 0 ? byKind : collator.compare(left.name, right.name);
				}
				case "updatedAt": return timeValue(left.updatedAt) - timeValue(right.updatedAt);
				case "size": return (itemSize(left) ?? -1) - (itemSize(right) ?? -1);
				case "location": {
					const byPlace = collator.compare(locationLabel(left), locationLabel(right));
					return byPlace !== 0 ? byPlace : collator.compare(left.name, right.name);
				}
				case "name": return collator.compare(left.name, right.name);
			}
		}
		/**
		* Order one result set for display.
		* @param items - entries as returned by the host.
		* @param key - active facet.
		* @param direction - active direction.
		* @param t - locale lookup for the kind facet.
		* @returns a new, ordered array; the input is never mutated.
		*/
		function sortItems(items, key, direction, t) {
			const sign = direction === "asc" ? 1 : -1;
			return [...items].sort((left, right) => {
				const byFacet = compareOn(left, right, key, t);
				if (byFacet !== 0) return sign * byFacet;
				return sign * collator.compare(left.name, right.name);
			});
		}
		/** Bucket entries by an identity function, preserving first-seen order. */
		function bucket(items, of) {
			const groups = /* @__PURE__ */ new Map();
			for (const item of items) {
				const key = of(item);
				const group = groups.get(key);
				if (group === void 0) groups.set(key, [item]);
				else group.push(item);
			}
			return groups;
		}
		/**
		* Resolve the column view against one result set.
		*
		* The CLI exposes locations but no folder listing, so the levels are derived
		* from the entries themselves: space, then folder inside that space, then the
		* entries of that folder. A stale space/folder selection falls back to the
		* first available level instead of rendering an empty pane.
		* @param items - the current result set.
		* @param preferences - active sort.
		* @param t - locale lookup for labels.
		* @param space - requested space bucket, if any.
		* @param folder - requested folder bucket, if any.
		* @returns levels and entries for the column view.
		*/
		function groupColumns(items, preferences, t, space, folder) {
			const spaceGroups = bucket(sortItems(items, preferences.sortKey, preferences.sortDirection, t), spaceKey);
			const spaces = [...spaceGroups].map(([id, group]) => ({
				id,
				label: id === "" ? t("column.root") : group[0]?.spaceName ?? id,
				count: group.length
			}));
			const spaceId = space !== void 0 && spaceGroups.has(space) ? space : spaces[0]?.id;
			const inSpace = spaceId === void 0 ? [] : spaceGroups.get(spaceId) ?? [];
			const folderGroups = bucket(inSpace, folderKey);
			const folders = [...folderGroups].map(([id, group]) => ({
				id,
				label: id === "" ? t("column.root") : group[0]?.folderName ?? id,
				count: group.length
			}));
			const folderId = folder !== void 0 && folderGroups.has(folder) ? folder : folders[0]?.id;
			return {
				spaces,
				folders,
				items: folderId === void 0 ? inSpace : folderGroups.get(folderId) ?? [],
				spaceId,
				folderId
			};
		}
		/** Read persisted preferences, falling back per field on any invalid value. */
		function loadPreferences() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY$1);
				if (raw === null) return DEFAULT_PREFERENCES;
				const parsed = JSON.parse(raw);
				const view = VIEW_OPTIONS.some((option) => option.id === parsed.view) ? parsed.view : void 0;
				const sortKey = SORT_OPTIONS.some((option) => option.id === parsed.sortKey) ? parsed.sortKey : void 0;
				const sortDirection = parsed.sortDirection === "asc" || parsed.sortDirection === "desc" ? parsed.sortDirection : void 0;
				return {
					view: view ?? DEFAULT_PREFERENCES.view,
					sortKey: sortKey ?? DEFAULT_PREFERENCES.sortKey,
					sortDirection: sortDirection ?? DEFAULT_PREFERENCES.sortDirection
				};
			} catch {
				return DEFAULT_PREFERENCES;
			}
		}
		/** Persist preferences, ignoring a blocked or full storage. */
		function savePreferences(preferences) {
			try {
				window.localStorage.setItem(STORAGE_KEY$1, JSON.stringify(preferences));
			} catch {}
		}
		//#endregion
		//#region src/client/cli/api.ts
		/** Browser-side calls into the Host picker routes (document-relative by convention). */
		/** One page of entries per request. */
		const PAGE_SIZE = 30;
		/** A refusal the host classified, which the caller decides what to do with. */
		function isRefusal(payload) {
			return typeof payload === "object" && payload !== null && "state" in payload;
		}
		/**
		* One JSON route call.
		*
		* The host answers a *classified* refusal with a non-2xx status (a missing
		* `wecom-cli` is 503) yet the body is what the picker needs in order to choose
		* the official-selector fallback. Such a body is returned to the caller; only a
		* bodyless failure is a transport error.
		*/
		async function requestJson(route, init, signal) {
			const response = await fetch(route, {
				...init,
				...signal === void 0 ? {} : { signal },
				headers: { accept: "application/json" }
			});
			if (response.ok) return await response.json();
			const payload = await response.json().catch(() => void 0);
			if (isRefusal(payload)) return payload;
			throw new Error(`${route} → HTTP ${String(response.status)}`);
		}
		/** Authorization state, CLI version, and the current login attempt. */
		function fetchPickerStatus(signal) {
			return requestJson(PICKER_STATUS_ROUTE, { method: "GET" }, signal);
		}
		/** Recently browsed files, or keyword search results for a non-empty query. */
		function fetchPickerFiles(params) {
			const search = new URLSearchParams();
			const keyword = params.query.trim();
			if (keyword !== "") search.set("q", keyword);
			if (params.cursor !== void 0 && params.cursor !== "") search.set("cursor", params.cursor);
			search.set("limit", String(PAGE_SIZE));
			return requestJson(`${PICKER_FILES_ROUTE}?${search.toString()}`, { method: "GET" }, params.signal);
		}
		/**
		* Start one `wecom-cli auth init` QR login on the host.
		*
		* `restart` retires a running attempt first; that is the only way back from a
		* QR code that expired or whose scan failed without a distinct failure state.
		* A classified refusal (the host could not spawn the CLI at all) is thrown, so
		* the panel can show why instead of leaving an inert "重新授权" button.
		* @param signal - aborts the request.
		* @param options - `restart` forces a new login attempt.
		*/
		async function startPickerAuth(signal, options) {
			const payload = await requestJson(`${PICKER_AUTH_START_ROUTE}${options?.restart === true ? "?restart=1" : ""}`, { method: "POST" }, signal);
			if (isRefusal(payload)) throw new Error(payload.message);
			return payload;
		}
		/** Cache-busted QR image reference for the running login attempt. */
		function pickerAuthQrUrl(stamp) {
			return `${PICKER_AUTH_QR_ROUTE}?t=${String(stamp)}`;
		}
		//#endregion
		//#region src/client/cli/auth.ts
		/**
		* Whether a CLI login attempt is on screen and worth observing.
		*
		* A failed attempt deliberately stops the poll: its failure is authoritative
		* until the user clicks "重新授权", which starts a new attempt.
		* @param block - the active refusal, if any.
		* @param auth - the last reported login attempt.
		*/
		function pollsAuth(block, auth) {
			return block === "unauthorized" && auth.phase === "waiting";
		}
		/**
		* What the blocked view shows for one refusal.
		*
		* Re-authorization is offered for every refusal that the CLI can resolve: an
		* expired token, and also a generic read error, because an authorization
		* failure can be classified as one. Only a missing binary has no login to
		* start. While an attempt is already waiting, the button restarts it — a QR
		* code cannot be refreshed in place, so that is the only way back from an
		* expired code or a scan that failed without a distinct failure state.
		* @param block - the active refusal.
		* @param auth - the last reported login attempt.
		*/
		function authPanel(block, auth) {
			const waiting = pollsAuth(block, auth);
			return {
				qr: waiting,
				reauthorize: block !== "missing",
				retry: block !== "unauthorized",
				poll: waiting,
				failure: auth.phase === "failed" ? auth.message ?? "" : void 0
			};
		}
		//#endregion
		//#region src/client/cli/States.tsx
		/** Skeleton rows: the list's shape, so the window does not jump when data lands. */
		function LoadingRows({ t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "wcp-scroll",
				role: "status",
				"aria-busy": "true",
				"aria-label": t("panel.loading"),
				children: [
					0,
					1,
					2,
					3,
					4,
					5
				].map((index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "wcp-skeleton__row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-skeleton__bar wcp-skeleton__bar--mark" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-skeleton__bar wcp-skeleton__bar--name" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-skeleton__bar wcp-skeleton__bar--meta" })
					]
				}, index))
			});
		}
		/**
		* Empty result set, split by cause: a fresh account has nothing recent, while a
		* search that found nothing needs a different next step.
		*/
		function EmptyState({ query, t }) {
			const searching = query.trim() !== "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-state",
				role: "status",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wcp-state__title",
						children: searching ? t("panel.emptySearch") : t("panel.empty")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "wcp-state__hint",
						children: searching ? t("panel.emptySearchHint") : t("panel.emptyHint")
					}),
					searching ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
						className: "wcp-state__detail",
						children: query
					}) : null
				]
			});
		}
		/** One refusal, with the one action that can resolve it. */
		function BlockedView({ block, auth, qrStamp, t, onRetry, onAuthorize, onUseIframe }) {
			const panel = authPanel(block.code, auth);
			const title = block.code === "missing" ? t("state.missing") : block.code === "unauthorized" ? t("state.unauthorized") : t("state.error");
			const hint = block.code === "missing" ? t("state.missingHint") : block.code === "unauthorized" ? t("state.unauthorizedHint") : t("state.errorHint");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: block.code === "error" ? "wcp-state wcp-state--error" : "wcp-state wcp-state--warn",
				role: "alert",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wcp-state__title",
						children: title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "wcp-state__hint",
						children: hint
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
						className: "wcp-state__detail",
						children: block.message
					}),
					panel.failure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "wcp-state__hint wcp-state__title",
						children: panel.failure === "" ? t("auth.failed") : `${t("auth.failed")}：${panel.failure}`
					}),
					panel.qr ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-state__qr",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: "wcp-qr",
							src: pickerAuthQrUrl(qrStamp),
							alt: t("auth.waiting"),
							width: 190,
							height: 190
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wcp-state__hint",
							children: t("auth.waiting")
						})]
					}) : null,
					auth.link === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						className: "wcp-link",
						href: auth.link,
						target: "_blank",
						rel: "noreferrer",
						children: t("auth.link")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-state__actions",
						children: [
							panel.retry ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "wcp-btn",
								onClick: onRetry,
								children: t("panel.retry")
							}) : null,
							panel.reauthorize ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: block.code === "unauthorized" && !panel.qr ? "wcp-btn wcp-btn--primary" : "wcp-btn wcp-btn--quiet",
								onClick: () => {
									onAuthorize(panel.qr);
								},
								children: panel.qr ? t("auth.restart") : t("auth.action")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "wcp-btn wcp-btn--quiet",
								onClick: onUseIframe,
								children: t("cli.useIframe")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/window-geometry.ts
		/** Rest position: the overlay's own centering, i.e. no displacement at all. */
		const CENTERED = {
			x: 0,
			y: 0
		};
		/** Storage key for {@link loadWindowOffset}. */
		const STORAGE_KEY = "wecom-picker/window/v1";
		/** A number that survives JSON and arithmetic, or `0`. */
		function finite(value) {
			return typeof value === "number" && Number.isFinite(value) ? positiveZero(value) : 0;
		}
		/**
		* Normalize `-0`. Negating a zero limit is how a pinned axis produces one, and
		* `Object.is(-0, 0)` is false — which would look like a state change to React and
		* print as `-0px` in the transform.
		*/
		function positiveZero(value) {
			return value === 0 ? 0 : value;
		}
		/** Furthest the window may sit from center on each axis. */
		function offsetLimit(size, viewport, margin = 8) {
			return {
				x: Math.max(0, (viewport.width - size.width) / 2 - margin),
				y: Math.max(0, (viewport.height - size.height) / 2 - margin)
			};
		}
		/**
		* Pin one offset into the reachable area.
		*
		* Returns the input unchanged when it already fits, so a caller may use the
		* result as React state without provoking a re-render on every resize tick.
		*/
		function clampOffset(offset, size, viewport, margin = 8) {
			const limit = offsetLimit(size, viewport, margin);
			const x = positiveZero(Math.min(limit.x, Math.max(-limit.x, finite(offset.x))));
			const y = positiveZero(Math.min(limit.y, Math.max(-limit.y, finite(offset.y))));
			return x === offset.x && y === offset.y ? offset : {
				x,
				y
			};
		}
		/** Offset after a pointer released at `to` that grabbed the window at `from`. */
		function dragOffset(origin, from, to) {
			return {
				x: origin.x + (to.x - from.x),
				y: origin.y + (to.y - from.y)
			};
		}
		/** Whether a displacement is far enough to count as a drag rather than a click. */
		function exceedsSlop(origin, moved, slop = 4) {
			return Math.abs(moved.x - origin.x) > slop || Math.abs(moved.y - origin.y) > slop;
		}
		/**
		* Arrow key to the movement it asks for, in px.
		* @param key - the `KeyboardEvent.key` value.
		* @param fine - whether `Shift` asked for the small step.
		* @returns the delta, or `undefined` when the key is not one of the four arrows.
		*/
		function nudgeDelta(key, fine = false) {
			const step = fine ? 4 : 16;
			switch (key) {
				case "ArrowLeft": return {
					x: -step,
					y: 0
				};
				case "ArrowRight": return {
					x: step,
					y: 0
				};
				case "ArrowUp": return {
					x: 0,
					y: -step
				};
				case "ArrowDown": return {
					x: 0,
					y: step
				};
				default: return;
			}
		}
		/** Read the remembered position; junk, or storage the page cannot use, means centered. */
		function loadWindowOffset() {
			try {
				const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
				if (raw === null || raw === void 0) return CENTERED;
				const parsed = JSON.parse(raw);
				return {
					x: finite(parsed.x),
					y: finite(parsed.y)
				};
			} catch {
				return CENTERED;
			}
		}
		/** Persist the position, ignoring storage that is blocked or full. */
		function saveWindowOffset(offset) {
			try {
				globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(offset));
			} catch {}
		}
		//#endregion
		//#region src/client/window-drag.ts
		/**
		* Window dragging for the picker shells.
		*
		* A picker opens centered and can be moved: the window's chrome is a pointer
		* drag surface, its title is a keyboard handle (arrow keys nudge, activation
		* re-centers), and every resulting offset is clamped so the window can never be
		* parked outside the viewport. The position is remembered, because a window that
		* snaps back to the middle on every open is the fixed modal this replaces.
		*
		* WCAG 2.5.7: every move the pointer can make has a keyboard equivalent, so
		* dragging is never the only route to the same result.
		*
		* Geometry and storage live in `window-geometry.ts`; this hook only wires them
		* to pointer, keyboard and resize events.
		*/
		/**
		* Chrome whose own pointer gestures a drag must not steal. The title is a
		* `<button>` as well, so {@link WINDOW_HANDLE_PROPS} exempts it from this list.
		*/
		const INTERACTIVE = "button,input,textarea,select,a[href],[role=\"menu\"],[contenteditable=\"true\"]";
		/** Marks the window's keyboard handle inside the drag surface. */
		const WINDOW_HANDLE_PROPS = { "data-wcp-handle": "" };
		/** Whether a press on `target` should start moving the window. */
		function startsWindowDrag(target) {
			if (!(target instanceof Element)) return false;
			return target.closest("[data-wcp-handle]") !== null || target.closest(INTERACTIVE) === null;
		}
		/**
		* Give a window its drag behavior.
		* @param frame - the window element the offset is applied to and measured from.
		* @returns the offset, the chrome/handle handlers, and the style carrying it.
		*/
		function useWindowDrag(frame) {
			const [offset, setOffset] = (0, react.useState)(loadWindowOffset);
			const [dragging, setDragging] = (0, react.useState)(false);
			const session = (0, react.useRef)(void 0);
			/**
			* Whether the gesture that just ended actually moved the window. The browser
			* fires a click after a drag too, and that click is the gesture's tail, not a
			* request to re-center.
			*/
			const dragged = (0, react.useRef)(false);
			/** Window and viewport sizes: the two inputs every clamp needs. */
			const measure = (0, react.useCallback)(() => {
				const rect = frame.current?.getBoundingClientRect();
				return {
					size: {
						width: rect?.width ?? 0,
						height: rect?.height ?? 0
					},
					viewport: {
						width: globalThis.innerWidth,
						height: globalThis.innerHeight
					}
				};
			}, [frame]);
			/** Move through `update`, then refuse anything that would leave the viewport. */
			const place = (0, react.useCallback)((update) => {
				const { size, viewport } = measure();
				setOffset((previous) => clampOffset(update(previous), size, viewport));
			}, [measure]);
			(0, react.useLayoutEffect)(() => {
				const keepVisible = () => {
					place((previous) => previous);
				};
				keepVisible();
				globalThis.addEventListener("resize", keepVisible);
				return () => {
					globalThis.removeEventListener("resize", keepVisible);
				};
			}, [place]);
			(0, react.useEffect)(() => {
				if (dragging) return;
				saveWindowOffset(offset);
			}, [dragging, offset]);
			const onPointerDown = (0, react.useCallback)((event) => {
				if (event.button !== 0 || !event.isPrimary) return;
				if (!startsWindowDrag(event.target)) return;
				const { size, viewport } = measure();
				dragged.current = false;
				session.current = {
					pointerId: event.pointerId,
					from: {
						x: event.clientX,
						y: event.clientY
					},
					origin: offset,
					size,
					viewport,
					moved: false
				};
				event.currentTarget.setPointerCapture(event.pointerId);
				setDragging(true);
			}, [measure, offset]);
			const onPointerMove = (0, react.useCallback)((event) => {
				const active = session.current;
				if (active === void 0 || active.pointerId !== event.pointerId) return;
				const next = dragOffset(active.origin, active.from, {
					x: event.clientX,
					y: event.clientY
				});
				if (exceedsSlop(active.origin, next)) active.moved = true;
				setOffset(clampOffset(next, active.size, active.viewport));
			}, []);
			const endDrag = (0, react.useCallback)((event) => {
				const active = session.current;
				if (active === void 0 || active.pointerId !== event.pointerId) return;
				session.current = void 0;
				dragged.current = active.moved;
				setDragging(false);
			}, []);
			const onHandleClick = (0, react.useCallback)((event) => {
				if (dragged.current) {
					dragged.current = false;
					event.preventDefault();
					return;
				}
				setOffset(CENTERED);
			}, []);
			const onHandleKeyDown = (0, react.useCallback)((event) => {
				const delta = nudgeDelta(event.key, event.shiftKey);
				if (delta === void 0 && event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				event.stopPropagation();
				if (delta === void 0) {
					setOffset(CENTERED);
					return;
				}
				place((previous) => ({
					x: previous.x + delta.x,
					y: previous.y + delta.y
				}));
			}, [place]);
			return {
				offset,
				dragging,
				style: (0, react.useMemo)(() => ({ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }), [offset]),
				chromeProps: {
					onPointerDown,
					onPointerMove,
					onPointerUp: endDrag,
					onPointerCancel: endDrag
				},
				handleProps: {
					onClick: onHandleClick,
					onKeyDown: onHandleKeyDown
				}
			};
		}
		//#endregion
		//#region src/client/assets/UiIcons.tsx
		/** One 16px frame; every glyph draws inside it with `currentColor`. */
		function Frame({ size = 16, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children
			});
		}
		/** Stroked line path shared by the outline glyphs. */
		const line = {
			stroke: "currentColor",
			strokeWidth: 1.4,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		};
		/** View: rows. */
		function IconViewList(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2.5 4h11M2.5 8h11M2.5 12h11",
					...line
				})
			});
		}
		/** View: side-by-side panes. */
		function IconViewColumns(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Frame, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "2.5",
					y: "3",
					width: "4.4",
					height: "10",
					rx: "1.2",
					...line
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "9.1",
					y: "3",
					width: "4.4",
					height: "10",
					rx: "1.2",
					...line
				})]
			});
		}
		/** View: one large stage with a filmstrip. */
		function IconViewGallery(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Frame, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "2.5",
					y: "2.5",
					width: "11",
					height: "7.5",
					rx: "1.4",
					...line
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M4 13h2.4M9.6 13H12",
					...line
				})]
			});
		}
		/** Search field magnifier. */
		function IconSearch(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Frame, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "7",
					cy: "7",
					r: "3.8",
					...line
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M10 10l3 3",
					...line
				})]
			});
		}
		/** Small dismiss cross. */
		function IconClose(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M4.5 4.5l7 7M11.5 4.5l-7 7",
					...line
				})
			});
		}
		/** Disclosure caret. */
		function IconChevronRight(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M6.5 4l4 4-4 4",
					...line
				})
			});
		}
		/** Downward caret for menus. */
		function IconChevronDown(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M4 6.5l4 4 4-4",
					...line
				})
			});
		}
		/** Sort chevron: up for ascending, down for descending. */
		function IconSortArrow({ direction, size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				size,
				children: direction === "asc" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 12.5V4m0 0L5 7m3-3l3 3",
					...line
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 3.5V12m0 0l3-3m-3 3l-3-3",
					...line
				})
			});
		}
		/** Neutral sort mark for the inactive facet. */
		function IconSort(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5 3.5v9m0 0L3 10.5M5 12.5l2-2M11 12.5v-9m0 0l2 2M11 3.5l-2 2",
					...line
				})
			});
		}
		/** Selection check mark. */
		function IconCheck(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				size: props.size ?? 11,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M3 8.4l3.2 3.2L13 4.6",
					...line,
					strokeWidth: 1.8
				})
			});
		}
		//#endregion
		//#region src/client/cli/Toolbar.tsx
		/**
		* Finder-style unified toolbar: view switcher, sort control, search field, and
		* the window's close button. The sort control is a menu, so it owns its own
		* dismissal (outside click and Escape) without reaching into the window.
		*/
		/** View mode to its toolbar glyph. */
		const VIEW_ICONS = {
			list: () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconViewList, {}),
			columns: () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconViewColumns, {}),
			gallery: () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconViewGallery, {})
		};
		/** Unified toolbar. */
		function PickerToolbar({ query, onQuery, view, onView, sortKey, sortDirection, onSortKey, onSortDirection, onClose, searchRef, chromeProps, handleProps, t }) {
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const anchor = (0, react.useRef)(null);
			const sortLabel = SORT_OPTIONS.find((option) => option.id === sortKey);
			(0, react.useEffect)(() => {
				if (!menuOpen) return;
				const onPointerDown = (event) => {
					if (anchor.current !== null && !anchor.current.contains(event.target)) setMenuOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.stopPropagation();
					setMenuOpen(false);
				};
				document.addEventListener("mousedown", onPointerDown);
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("mousedown", onPointerDown);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [menuOpen]);
			/** Apply one direction and dismiss the menu, matching Finder. */
			const chooseDirection = (direction) => {
				onSortDirection(direction);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-toolbar",
				...chromeProps,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "wcp-title",
						"aria-label": t("panel.drag"),
						title: t("panel.drag"),
						...WINDOW_HANDLE_PROPS,
						...handleProps,
						children: t("panel.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "wcp-segmented",
						role: "group",
						"aria-label": t("view.label"),
						children: VIEW_OPTIONS.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === option.id,
							"aria-label": t(option.labelKey),
							title: t(option.labelKey),
							onClick: () => {
								onView(option.id);
							},
							children: VIEW_ICONS[option.id]()
						}, option.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-menu-anchor",
						ref: anchor,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "wcp-iconbtn wcp-iconbtn--wide",
							"aria-haspopup": "menu",
							"aria-expanded": menuOpen,
							"aria-label": `${t("sort.label")}：${t(sortLabel?.labelKey ?? "sort.name")}`,
							onClick: () => {
								setMenuOpen((open) => !open);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSort, {}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-toolbar__label",
									children: t(sortLabel?.labelKey ?? "sort.name")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDown, { size: 12 })
							]
						}), menuOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-menu",
							role: "menu",
							children: [
								SORT_OPTIONS.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "menuitemradio",
									className: "wcp-menu__item",
									"aria-checked": sortKey === option.id,
									onClick: () => {
										onSortKey(option.id);
										setMenuOpen(false);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "wcp-menu__check",
										children: sortKey === option.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {}) : null
									}), t(option.labelKey)]
								}, option.id)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "wcp-menu__sep",
									role: "separator"
								}),
								["asc", "desc"].map((direction) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "menuitemradio",
									className: "wcp-menu__item",
									"aria-checked": sortDirection === direction,
									onClick: () => {
										chooseDirection(direction);
										setMenuOpen(false);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "wcp-menu__check",
										children: sortDirection === direction ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {}) : null
									}), t(direction === "asc" ? "sort.ascending" : "sort.descending")]
								}, direction))
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-spacer" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-search",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wcp-search__icon",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: searchRef,
								type: "search",
								value: query,
								"aria-label": t("search.label"),
								placeholder: t("search.placeholder"),
								onChange: (event) => {
									onQuery(event.target.value);
								}
							}),
							query === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "wcp-search__clear",
								"aria-label": t("search.clear"),
								onClick: () => {
									onQuery("");
									searchRef.current?.focus();
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 12 })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "wcp-iconbtn",
						"aria-label": t("panel.close"),
						title: t("panel.close"),
						onClick: onClose,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, {})
					})
				]
			});
		}
		//#endregion
		//#region src/client/cli/scroll.ts
		/**
		* Scroll-triggered paging.
		*
		* A sentinel is rendered after the last row and observed with
		* `IntersectionObserver`, whose intersection already accounts for clipping by
		* the scroll container — so one hook serves the vertical list, the column
		* view's item pane, and the horizontal filmstrip without each view owning
		* scroll math.
		*/
		/** How far before the sentinel becomes visible the next page is requested. */
		const PRELOAD_MARGIN = "240px 0px";
		/**
		* Call `onReach` while the sentinel is visible inside its scroller.
		*
		* The observer is rebuilt whenever `enabled` or `onReach` changes, so a page
		* that lands without pushing the sentinel out of view immediately requests the
		* next one: the list fills the pane instead of leaving a stub at the bottom.
		* @param sentinel - element rendered after the last row.
		* @param enabled - `false` while a page is in flight or the list is exhausted.
		* @param onReach - request for the next page; must be idempotent per gap.
		*/
		function useEndReached(sentinel, enabled, onReach) {
			(0, react.useEffect)(() => {
				const node = sentinel.current;
				if (node === null || !enabled) return;
				if (typeof IntersectionObserver === "undefined") return;
				const observer = new IntersectionObserver((entries) => {
					if (entries.some((entry) => entry.isIntersecting)) onReach();
				}, { rootMargin: PRELOAD_MARGIN });
				observer.observe(node);
				return () => {
					observer.disconnect();
				};
			}, [
				sentinel,
				enabled,
				onReach
			]);
		}
		//#endregion
		//#region src/client/assets/WedocsFileIcons.tsx
		/** file-tdoc-20.svg */
		function Tdoc20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-tdoc-20_clip0_17_21832)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#2272DB",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#4B95F3",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M13.5 11v1.8h-10V11h10z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M13.5 14.2V16h-10v-1.8h10z",
							opacity: "0.75"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tdoc-20_clip0_17_21832",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tsheet-20.svg */
		function Tsheet20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fillRule: "evenodd",
					clipPath: "url(#file-tsheet-20_clip0_17_21922)",
					clipRule: "evenodd",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#1BAB3D",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#44C966",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M7.5 16v-1.8h-4V16h4zm6 0v-1.8h-4V16h4z",
							opacity: "0.75"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M7.5 12.8V11h-4v1.8h4zm6 0V11h-4v1.8h4z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tsheet-20_clip0_17_21922",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tslide-20.svg */
		function Tslide20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fillRule: "evenodd",
					clipPath: "url(#file-tslide-20_clip0_17_21946)",
					clipRule: "evenodd",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#E7552B",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#FF7A56",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M8 7.53a4.5 4.5 0 104.97 4.97H8V7.53z",
							opacity: "0.75"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M12.97 11.5A4.5 4.5 0 009 7.53v3.97h3.97z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tslide-20_clip0_17_21946",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tsmartsheet-20.svg */
		function Tsmartsheet20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#00A691",
						d: "M5 5h13.33c.92 0 1.67.75 1.67 1.67v11.66c0 .92-.75 1.67-1.67 1.67H5V5z"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#15CFB0",
						d: "M1.67 0C.75 0 0 .75 0 1.67v16.66C0 19.25.75 20 1.67 20h16.65c-.91 0-1.64-.74-1.65-1.65V1.67C16.67.75 15.92 0 15 0H1.67z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						stroke: "#fff",
						d: "M7.08 11.08L4.72 8.91M9.5 11.08l2.36-2.17",
						strokeWidth: "2.08"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						stroke: "#fff",
						d: "M9.5 13.56l2.36 2.17M7.08 13.56l-2.36 2.17",
						strokeOpacity: "0.75",
						strokeWidth: "2.08"
					})
				]
			});
		}
		/** file-smartdoc-20.svg */
		function Smartdoc20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
					clipPath: "url(#file-smartdoc-20_clip0_8074_18427)",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						clipPath: "url(#file-smartdoc-20_clip1_8074_18427)",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								fill: "#3999DA",
								d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
								fillRule: "evenodd",
								clipRule: "evenodd"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								fill: "#5FB8F3",
								d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
								fillRule: "evenodd",
								clipRule: "evenodd"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								fill: "#fff",
								d: "M13.75 14.25v1.25H9v-1.25h4.75zm0-1.63H11v-1.24h2.75v1.24zm0-2.87H9V8.5h4.75v1.25z",
								opacity: "0.75"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								fill: "#fff",
								d: "M5.51 8.54c.08-.22.4-.22.48 0l.8 2.27c.02.07.08.13.15.15l2.27.8c.22.08.22.4 0 .48l-2.27.8a.25.25 0 00-.15.15l-.8 2.27a.25.25 0 01-.48 0l-.8-2.27a.25.25 0 00-.15-.15l-2.27-.8a.25.25 0 010-.48l2.27-.8a.25.25 0 00.15-.15l.8-2.27z"
							})
						]
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-smartdoc-20_clip0_8074_18427",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-smartdoc-20_clip1_8074_18427",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				})] })]
			});
		}
		/** file-tmindmap-20.svg */
		function Tmindmap20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-tmindmap-20_clip0_17_21961)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#9552E0",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#B478F7",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							stroke: "#fff",
							d: "M12.25 9h-4.1a3.25 3.25 0 00-3.25 3.25v0c0 1.8 1.46 3.25 3.25 3.25h4.1",
							opacity: "0.75",
							strokeWidth: "2"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "3",
							y: "10.25",
							fill: "#fff",
							rx: "1.88"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M12 7.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 14.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tmindmap-20_clip0_17_21961",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tflowchart-20.svg */
		function Tflowchart20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-tflowchart-20_clip0_17_21973)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#4C63E9",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#7187FF",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							stroke: "#fff",
							d: "M12 8.5H6.67c-.97 0-1.75.79-1.75 1.75v0c0 .97.78 1.75 1.75 1.75h3.58c.97 0 1.75.79 1.75 1.75v0c0 .97-.78 1.75-1.75 1.75H4.92",
							opacity: "0.75",
							strokeWidth: "2"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M10 8.5l1.88-1.87 1.87 1.87-1.88 1.88L10 8.5zM6 14.25H3.5v2.5H6v-2.5z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tflowchart-20_clip0_17_21973",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tform-20.svg */
		function Tform20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-tform-20_clip0_17_21938)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#E79B00",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#FFBA30",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							stroke: "#fff",
							d: "M4.5 12l3 3L13 9.5",
							strokeWidth: "2"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tform-20_clip0_17_21938",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-treport-20.svg */
		function Treport20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-treport-20_clip0_17_21984)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#E48125",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#FC9D45",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M13.5 11v1.8h-10V11h10zM5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M8.5 14.2V16h-5v-1.8h5z",
							opacity: "0.75"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-treport-20_clip0_17_21984",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-tpdf-20.svg */
		function Tpdf20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-tpdf-20_clip0_254_304048)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#D9443A",
							d: "M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#F26A62",
							d: "M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
							fill: "#fff",
							opacity: "0.5",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8.95 7.2l-2 .04v.04l.01.22v.2a8.85 8.85 0 01-1.76 5.17c-.6.8-1.35 1.5-2.3 2.1l.4-.23c1.35-.75 2.76-1.3 4.19-1.69a9.7 9.7 0 001.47-5.67v-.19zM2.89 14.97z" })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M12.78 14.42l.12-2-.12-.01a18.62 18.62 0 00-9.48 2.33l-.41.23 1.02 1.73h.01a16.55 16.55 0 018.66-2.28h.2z",
							opacity: "0.75",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M6.94 7.24a7.97 7.97 0 002.74 5.59c.6.53 2.02 1.3 2.55 1.45l.55.14.12-2A6.64 6.64 0 0111 11.3a6.01 6.01 0 01-2-3.65l-.02-.2-.02-.17v-.1l-2.02.05z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-tpdf-20_clip0_254_304048",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h20v20H0z"
					})
				}) })]
			});
		}
		/** file-folder-20.svg */
		function Folder20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#64B5F9",
						d: "M2 18a2 2 0 01-2-2V3c0-1.1.9-2 2-2h4.59a1 1 0 01.7.3l1.42 1.4a1 1 0 00.7.3H18a2 2 0 012 2v11a2 2 0 01-2 2H2z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "url(#file-folder-20_paint0_linear_409_96849)",
						d: "M2 18a2 2 0 01-2-2V3c0-1.1.9-2 2-2h4.59a1 1 0 01.7.3l1.42 1.4a1 1 0 00.7.3H18a2 2 0 012 2v11a2 2 0 01-2 2H2z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
						id: "file-folder-20_paint0_linear_409_96849",
						x1: "0",
						x2: "15.66",
						y1: "1",
						y2: "21.34",
						gradientUnits: "userSpaceOnUse",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", { stopColor: "#79C8FC" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "#4EA2F5"
						})]
					}) })
				]
			});
		}
		/** file-space-20.svg */
		function Space20({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#6CA9F7",
						d: "M19 6.18c0-.8-.44-1.53-1.15-1.9L11.01.64A2.16 2.16 0 009 .64L2.15 4.28C1.45 4.65 1 5.38 1 6.18v7.64c0 .8.44 1.54 1.15 1.91l6.84 3.63c.63.34 1.39.34 2.02 0l6.84-3.63c.7-.37 1.15-1.1 1.15-1.9V6.17z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "url(#file-space-20_paint0_linear_1234_30745)",
						d: "M19 6.18c0-.8-.44-1.53-1.15-1.9L11.01.64A2.16 2.16 0 009 .64L2.15 4.28C1.45 4.65 1 5.38 1 6.18v7.64c0 .8.44 1.54 1.15 1.91l6.84 3.63c.63.34 1.39.34 2.02 0l6.84-3.63c.7-.37 1.15-1.1 1.15-1.9V6.17z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "url(#file-space-20_paint1_radial_1234_30745)",
						d: "M10.5 9.77l7.16-4.05L9.97 8.9 2.35 5.74 9.5 9.8l.5 8.23.52-8.25z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("radialGradient", {
						id: "file-space-20_paint1_radial_1234_30745",
						cx: "0",
						cy: "0",
						r: "1",
						gradientTransform: "rotate(90 .29 9.72) scale(8.59248 10.6992)",
						gradientUnits: "userSpaceOnUse",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", { stopColor: "#fff" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "#fff",
							stopOpacity: "0.7"
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
						id: "file-space-20_paint0_linear_1234_30745",
						x1: "1",
						x2: "19",
						y1: "0",
						y2: "20",
						gradientUnits: "userSpaceOnUse",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", { stopColor: "#82BEFA" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "#5897F5"
						})]
					})] })
				]
			});
		}
		/** file-pdf-default-inline.svg */
		function LocalPdf16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
					clipPath: "url(#file-pdf-default-inline_clip0_39942_124118)",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#E63D33",
						d: "M7.51.72c.97 0 1.38.85 1.37 2.13 0 .96-.23 2.22-.63 3.57l.06-.21c.17.3.35.6.55.89l.2.29.13.17c.36.48.75.92 1.17 1.3l.19.18a8.74 8.74 0 013.4-.06c1.05.26 1.6.98 1.21 1.92-.58 1.43-2.84.95-4.9-.7-.5.1-1.03.23-1.57.39l-.4.12-.22.07c-.7.23-1.33.44-1.91.65L6 11.5c-.8 1.3-1.63 2.38-2.39 3.04-.98.85-1.93 1.05-2.56.23-.6-.76-.38-1.59.49-2.3.67-.55 1.8-1.13 3.47-1.76l.29-.11.16-.27.67-1.28.2-.43c.26-.58.52-1.27.75-1.98l.09-.3C5.73 3.52 5.7.72 7.5.72zM4.23 12.24l.06-.08-.09.04c-.93.4-1.6.78-2 1.11-.46.38-.5.55-.33.76.16.2.48.14 1.08-.38.35-.3.74-.73 1.13-1.25l.15-.2zm9.48-2.2c-.38-.1-.9-.14-1.5-.1h-.23l-.19.02.15.09c.32.19.64.33.94.44l.18.05.17.05c.58.13.9.05.96-.11.1-.22.01-.32-.48-.45zM7.9 7.58l-.02.08-.03-.06-.03.1c-.14.39-.29.76-.43 1.1l-.12.26-.28.6-.18.35.07-.02-.02.04.54-.18.57-.19.61-.18.3-.08.34-.09-.03-.03.06-.01-.03-.03-.45-.5-.21-.26-.2-.27-.14-.18-.1-.14-.1-.14-.12-.17zm-.4-5.78c-.44 0-.51 1.14.03 2.7l.06.18.03-.13c.1-.5.16-.94.2-1.34v-.37c.01-.76-.13-1.04-.32-1.04z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-pdf-default-inline_clip0_39942_124118",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-word-default-inline.svg */
		function LocalWord16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-word-default-inline_clip0_39942_124126)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z",
							fillOpacity: "0.1",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M6.4 6c0-.22.18-.4.4-.4h5.6a.4.4 0 110 .8H6.8a.4.4 0 01-.4-.4zM6.4 10.8c0-.22.18-.4.4-.4h5.6a.4.4 0 110 .8H6.8a.4.4 0 01-.4-.4zM6.8 8a.4.4 0 100 .8h5.6a.4.4 0 100-.8H6.8z",
							fillOpacity: "0.1"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#185ABD",
							d: "M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M6.8 5.8l-1.14 4.4h-.78L4.1 7.12a2.22 2.22 0 01-.06-.43h-.01a2.2 2.2 0 01-.07.43l-.8 3.08h-.79L1.2 5.8h.75l.76 3.22c.03.14.05.28.06.43h.01c0-.1.03-.25.08-.43l.85-3.22h.71l.79 3.25c.03.1.05.24.06.39h.01c0-.1.03-.24.07-.4l.74-3.24h.7z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-word-default-inline_clip0_39942_124126",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-excel-default-inline.svg */
		function LocalExcel16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-excel-default-inline_clip0_39942_124125)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z",
							fillOpacity: "0.1",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M12.8 5.97a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4zM8.8 5.57a.4.4 0 010 .8H6.4v-.8h2.4zM8.8 8a.4.4 0 110 .8H6.4V8h2.4zM9.2 10.8a.4.4 0 00-.4-.4H6.4v.8h2.4a.4.4 0 00.4-.4zM12.8 10.8a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4zM12.8 8.4a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4z",
							fillOpacity: "0.1"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#107C41",
							d: "M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M6 10.4h-.93l-.95-1.76a1.8 1.8 0 01-.1-.23l-.1.23-.99 1.76H2l1.53-2.41-1.4-2.39h.94l.84 1.62.15.32.17-.33.87-1.61h.87L4.54 7.98 6 10.4z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-excel-default-inline_clip0_39942_124125",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-ppt-default-inline.svg */
		function LocalPpt16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-ppt-default-inline_clip0_39942_124124)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z",
							fillOpacity: "0.1",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M9.6 11.2a3.2 3.2 0 003.17-2.8H9.2V4.82a3.2 3.2 0 00.4 6.38z",
							fillOpacity: "0.1"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#060F1A",
							d: "M10 4.82a3.2 3.2 0 012.77 2.78H10V4.82z",
							fillOpacity: "0.1"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#C43E1C",
							d: "M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M3.2 8.66v1.74h-.8V5.6h1.46c.55 0 .98.13 1.28.38.3.26.46.62.46 1.09 0 .47-.16.85-.48 1.14-.32.3-.74.45-1.29.45H3.2zm0-2.4V8h.51c.34 0 .6-.08.78-.24a.85.85 0 00.27-.67c0-.56-.33-.84-.99-.84H3.2z"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-ppt-default-inline_clip0_39942_124124",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-image-default-inline.svg */
		function LocalImage16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fill: "#27ABF7",
					clipPath: "url(#file-image-default-inline_clip0_39942_124111)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M3.22 6.01a.56.56 0 01.92-.2l7.39 7.4c.35.35.1.95-.4.95H.97a.56.56 0 01-.52-.76l2.77-7.39z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M8.78 7.6a.56.56 0 01.9-.15l5.76 5.75c.36.36.1.96-.4.96h-8.4a.56.56 0 01-.51-.8l2.65-5.75z",
							opacity: "0.6",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							cx: "13.04",
							cy: "4.08",
							r: "1.68"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-image-default-inline_clip0_39942_124111",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-video-default-inline.svg */
		function LocalVideo16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fill: "#27A0F7",
					clipPath: "url(#file-video-default-inline_clip0_39942_124108)",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M.16 4.36c0-.77.63-1.4 1.4-1.4h8.4c.77 0 1.4.63 1.4 1.4v7.28c0 .77-.63 1.4-1.4 1.4h-8.4a1.4 1.4 0 01-1.4-1.4V4.36z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M12.48 6.32l1.93-1.93a.84.84 0 011.43.6V11a.84.84 0 01-1.43.6l-1.93-1.93V6.32z",
						opacity: "0.6"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-video-default-inline_clip0_39942_124108",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-audio-default-inline.svg */
		function LocalAudio16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
					clipPath: "url(#file-audio-default-inline_clip0_39942_124120)",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#2792F7",
						d: "M13.04 4.59a3.21 3.21 0 00-3.8-3.16l-2.54.48a3.21 3.21 0 00-2.62 3.15v4.77a1.9 1.9 0 01-1.65 1.88 1.94 1.94 0 10.48 3.86l.33-.04A2.24 2.24 0 005.2 13.3V6.88c0-.77.55-1.43 1.31-1.58l3.51-.65a1.6 1.6 0 011.9 1.57v1.93a1.9 1.9 0 01-1.65 1.88 1.94 1.94 0 00.48 3.86l.33-.04a2.24 2.24 0 001.96-2.23V4.6z"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-audio-default-inline_clip0_39942_124120",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-zip-default-inline.svg */
		function LocalZip16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fill: "#3084E3",
					clipPath: "url(#file-zip-default-inline_clip0_39942_124114)",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10.24 2.68a.84.84 0 00-.84-.84H6.6a.84.84 0 000 1.68h2.8c.47 0 .84-.38.84-.84zM9.4 4.65a.84.84 0 010 1.67H6.6a.84.84 0 110-1.68h2.8z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M10.24 8.28a.84.84 0 00-.83-.83H6.6a.84.84 0 100 1.67h.55v1.28a2.24 2.24 0 101.68 0V9.12h.56c.47 0 .84-.37.84-.84zM8 11.92a.56.56 0 100 1.12.56.56 0 000-1.12z",
						fillRule: "evenodd",
						clipRule: "evenodd"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-zip-default-inline_clip0_39942_124114",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-text-default-inline.svg */
		function LocalText16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-text-default-inline_clip0_39942_124107)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#0B121A",
							d: "M1.4 2.3c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z",
							fillOpacity: "0.6"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#0A111A",
							d: "M1.4 5.9c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z",
							fillOpacity: "0.5"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#09111A",
							d: "M1.4 9.5c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z",
							fillOpacity: "0.4"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#08101A",
							d: "M1.4 13.1c0-.5.4-.9.9-.9h6.6a.9.9 0 010 1.8H2.3a.9.9 0 01-.9-.9z",
							fillOpacity: "0.3"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-text-default-inline_clip0_39942_124107",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** file-sketch-default-inline.svg */
		function LocalSketch16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					clipPath: "url(#file-sketch-default-inline_clip0_39942_124113)",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "url(#file-sketch-default-inline_paint0_linear_39942_124113)",
							d: "M.34 6.6a.26.26 0 01-.02-.33L3.4 2.04c.13-.18.32-.3.54-.32L8 1.24l4.06.48c.22.03.41.14.54.32l3.08 4.23c.07.1.06.23-.02.33L8.2 15.06a.26.26 0 01-.39 0L.34 6.6z",
							fillRule: "evenodd",
							clipRule: "evenodd"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M15.73 6.44H.27c0-.06.02-.12.05-.17L3.4 2.04c.13-.18.32-.3.54-.32L8 1.24l4.06.48c.22.03.41.14.54.32l3.08 4.23c.03.05.05.11.05.17z",
							fillOpacity: "0.25"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M12.06 1.72c.13.01.24.06.35.13l.27 4.59H3.32l.28-4.6c.1-.06.21-.1.34-.12L8 1.24l4.06.48z",
							fillOpacity: "0.4"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M8 1.24l-4.68 5.2h9.36L8 1.24z",
							fillOpacity: "0.5"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							fill: "#fff",
							d: "M8.08 15.14a.26.26 0 01-.16 0l-4.6-8.7h9.36l-4.6 8.7z",
							fillOpacity: "0.2"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
					id: "file-sketch-default-inline_paint0_linear_39942_124113",
					x1: "8",
					x2: "8",
					y1: "1.24",
					y2: "15.15",
					gradientUnits: "userSpaceOnUse",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", { stopColor: "#FAA700" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#FA7B21"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-sketch-default-inline_clip0_39942_124113",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				})] })]
			});
		}
		/** file-other-default-inline.svg */
		function LocalOther16({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					fill: "#888B99",
					clipPath: "url(#file-other-default-inline_clip0_39942_124104)",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M3.95.98c-1.05 0-1.9.85-1.9 1.89v10.26c0 1.04.85 1.89 1.9 1.89h8.1c1.04 0 1.89-.85 1.89-1.89V6.08c0-.5-.2-.98-.55-1.33l-3.22-3.22A1.89 1.89 0 008.84.98h-4.9z",
						opacity: "0.6",
						fillRule: "evenodd",
						clipRule: "evenodd"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.08 1v3.76c0 .6.48 1.08 1.08 1.08h3.76c-.05-.41-.24-.8-.54-1.1l-3.2-3.2c-.3-.3-.69-.5-1.1-.54z" })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("clipPath", {
					id: "file-other-default-inline_clip0_39942_124104",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: "#fff",
						d: "M0 0h16v16H0z"
					})
				}) })]
			});
		}
		/** Icon key to glyph. */
		const GLYPHS = {
			tdoc: Tdoc20,
			tsheet: Tsheet20,
			tslide: Tslide20,
			tsmartsheet: Tsmartsheet20,
			smartdoc: Smartdoc20,
			tmindmap: Tmindmap20,
			tflowchart: Tflowchart20,
			tform: Tform20,
			treport: Treport20,
			tpdf: Tpdf20,
			folder: Folder20,
			space: Space20,
			localPdf: LocalPdf16,
			localWord: LocalWord16,
			localExcel: LocalExcel16,
			localPpt: LocalPpt16,
			localImage: LocalImage16,
			localVideo: LocalVideo16,
			localAudio: LocalAudio16,
			localZip: LocalZip16,
			localText: LocalText16,
			localSketch: LocalSketch16,
			localOther: LocalOther16
		};
		/**
		* Render one file-type glyph.
		* @param props.iconKey - which glyph, from {@link WedocsIconKey}.
		* @param props.size - square size in pixels.
		*/
		function WedocsFileIcon({ iconKey, size }) {
			const Glyph = GLYPHS[iconKey];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { size });
		}
		//#endregion
		//#region src/client/cli/Views.tsx
		/**
		* Content views: list, columns, and gallery, plus the preview pane and the
		* shared row pieces they compose.
		*
		* Rows follow the ARIA listbox pattern rather than the `button`-in-`button`
		* nesting the selection circle would otherwise force: the container is a
		* `listbox`, each row is a focusable `option` with a roving tab stop, and the
		* circle is the row's own button. Arrow/Home/End move focus; Enter and Space
		* toggle the row.
		*/
		/** Sentinel that triggers paging and shows a pulse while the page is loading. */
		function EndSentinel({ hasMore, loadingMore, onEndReached }) {
			const sentinel = (0, react.useRef)(null);
			useEndReached(sentinel, hasMore && !loadingMore, onEndReached);
			if (!hasMore) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "wcp-sentinel",
				ref: sentinel,
				"aria-hidden": "true",
				children: loadingMore ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-sentinel__pulse" }) : null
			});
		}
		/** The entry's WeDocs file-type glyph, at the requested square size. */
		function Glyph({ item, size = 18 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "wcp-glyph",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WedocsFileIcon, {
					iconKey: fileIconKey(item),
					size
				})
			});
		}
		/** Row-leading selection circle; the row itself toggles too. */
		function SelectionToggle({ item, checked, onToggle, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "wcp-toggle",
				"aria-pressed": checked,
				"aria-label": `${checked ? t("row.remove") : t("row.add")}：${item.name}`,
				onClick: (event) => {
					event.stopPropagation();
					onToggle(item);
				},
				children: checked ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {}) : null
			});
		}
		/** Enter/Space activation for a row that is not a `<button>`. */
		function rowKeyDown(event, item, onToggle) {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			event.stopPropagation();
			onToggle(item);
		}
		/** Roving focus across one list's rows. */
		function listKeyDown(event) {
			const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
			const edge = event.key === "Home" ? 0 : event.key === "End" ? -1 : void 0;
			if (step === 0 && edge === void 0) return;
			const rows = [...event.currentTarget.querySelectorAll("[data-wcp-row]")];
			if (rows.length === 0) return;
			const current = event.target.closest("[data-wcp-row]");
			const at = current === null ? -1 : rows.indexOf(current);
			const next = edge === void 0 ? rows[at + step] : edge === 0 ? rows[0] : rows[rows.length - 1];
			if (next === void 0) return;
			event.preventDefault();
			next.focus();
		}
		/** Column view: locations → folders → items → preview. */
		function ColumnsView({ columns, spaceId, folderId, onSpace, onFolder, selected, focused, onFocus, onToggle, hasMore, loadingMore, onEndReached, t }) {
			const focusedKey = focused === void 0 ? void 0 : itemKey(focused);
			const showFolders = columns.folders.length > 1;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-columns",
				children: [
					columns.spaces.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pane, {
						title: t("column.spaces"),
						label: t("column.spaces"),
						onKeyDown: listKeyDown,
						children: columns.spaces.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PaneEntry, {
							label: entry.label,
							count: entry.count,
							active: entry.id === spaceId,
							onSelect: () => {
								onSpace(entry.id);
							}
						}, entry.id))
					}) : null,
					showFolders ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pane, {
						title: t("column.folders"),
						label: t("column.folders"),
						onKeyDown: listKeyDown,
						children: columns.folders.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PaneEntry, {
							label: entry.label,
							count: entry.count,
							active: entry.id === folderId,
							onSelect: () => {
								onFolder(entry.id);
							}
						}, entry.id))
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pane, {
						title: t("column.items"),
						label: t("column.items"),
						onKeyDown: listKeyDown,
						children: [columns.items.map((item) => {
							const checked = selected.some((entry) => sameItem(entry, item));
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wcp-pane__item",
								role: "option",
								"data-wcp-row": true,
								"aria-selected": checked,
								tabIndex: itemKey(item) === focusedKey ? 0 : -1,
								onFocus: () => {
									onFocus(item);
								},
								onClick: () => {
									onToggle(item);
								},
								onKeyDown: (event) => {
									rowKeyDown(event, item, onToggle);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectionToggle, {
										item,
										checked,
										onToggle,
										t
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { item }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "wcp-pane__label",
										children: item.name
									})
								]
							}, itemKey(item));
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndSentinel, {
							hasMore,
							loadingMore,
							onEndReached
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewPane, {
						item: focused,
						t
					})
				]
			});
		}
		/** One column-view pane with its caption. */
		function Pane({ title, label, onKeyDown, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-pane",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-pane__head",
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-pane__list",
					role: "listbox",
					"aria-label": label,
					onKeyDown,
					children
				})]
			});
		}
		/** One navigating entry in the location/folder panes. */
		function PaneEntry({ label, count, active, onSelect }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-pane__item",
				role: "option",
				"data-wcp-row": true,
				"aria-selected": active,
				"aria-current": active,
				tabIndex: -1,
				onClick: onSelect,
				onKeyDown: (event) => {
					if (event.key !== "Enter" && event.key !== " ") return;
					event.preventDefault();
					event.stopPropagation();
					onSelect();
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "wcp-pane__label wcp-ellipsis",
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "wcp-pane__count wcp-num",
						children: count
					})
				]
			});
		}
		/** List view with a sortable header row. */
		function ListView({ items, selected, focused, onFocus, onToggle, preferences, onSort, hasMore, loadingMore, onEndReached, t }) {
			const focusedKey = focused === void 0 ? void 0 : itemKey(focused);
			const direction = preferences.sortDirection === "asc" ? "sort.ascending" : "sort.descending";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-list",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "wcp-list__head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-col wcp-col--toggle" }), [
						{
							key: "name",
							className: "wcp-col--name",
							labelKey: "sort.name"
						},
						{
							key: "kind",
							className: "wcp-col--kind",
							labelKey: "sort.kind"
						},
						{
							key: "updatedAt",
							className: "wcp-col--modified",
							labelKey: "sort.updatedAt"
						},
						{
							key: "size",
							className: "wcp-col--size",
							labelKey: "sort.size"
						},
						{
							key: "location",
							className: "wcp-col--place",
							labelKey: "sort.location"
						}
					].map(({ key, className, labelKey }) => {
						const active = preferences.sortKey === key;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `wcp-col ${className}`,
							"aria-label": active ? `${t(labelKey)}：${t(direction)}` : t(labelKey),
							onClick: () => {
								onSort(key);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wcp-ellipsis",
								children: t(labelKey)
							}), active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSortArrow, {
								direction: preferences.sortDirection,
								size: 12
							}) : null]
						}, key);
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "wcp-scroll",
					role: "listbox",
					"aria-multiselectable": "true",
					"aria-label": t("panel.title"),
					onKeyDown: listKeyDown,
					children: [items.map((item) => {
						const checked = selected.some((entry) => sameItem(entry, item));
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-row",
							role: "option",
							"data-wcp-row": true,
							"aria-selected": checked,
							tabIndex: itemKey(item) === focusedKey ? 0 : -1,
							onFocus: () => {
								onFocus(item);
							},
							onClick: () => {
								onToggle(item);
							},
							onKeyDown: (event) => {
								rowKeyDown(event, item, onToggle);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-row__cell wcp-col--toggle",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectionToggle, {
										item,
										checked,
										onToggle,
										t
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "wcp-row__cell wcp-col wcp-col--name",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { item }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "wcp-ellipsis wcp-row__name",
										children: item.name
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-row__cell wcp-col wcp-col--kind wcp-row__sub wcp-ellipsis",
									children: typeLabel(item, t)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-row__cell wcp-col wcp-col--modified wcp-row__sub wcp-num",
									children: formatDate(item.updatedAt)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-row__cell wcp-col wcp-col--size wcp-row__sub wcp-num",
									children: formatBytes(itemSize(item))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-row__cell wcp-col wcp-col--place wcp-row__sub wcp-ellipsis",
									children: locationLabel(item)
								})
							]
						}, itemKey(item));
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndSentinel, {
						hasMore,
						loadingMore,
						onEndReached
					})]
				})]
			});
		}
		/** Gallery view: one large stage over a horizontal filmstrip. */
		function GalleryView({ items, selected, focused, onFocus, onToggle, hasMore, loadingMore, onEndReached, t }) {
			const stage = focused ?? items[0];
			const focusedKey = stage === void 0 ? void 0 : itemKey(stage);
			const stageChecked = stage !== void 0 && selected.some((entry) => sameItem(entry, stage));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-gallery",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-gallery__stage",
					children: stage === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wcp-gallery__glyph",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, {
								item: stage,
								size: 64
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wcp-gallery__name",
							children: stage.name
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wcp-gallery__meta",
							children: [
								typeLabel(stage, t),
								locationLabel(stage),
								formatDate(stage.updatedAt),
								formatBytes(itemSize(stage))
							].filter((part) => part !== "" && part !== "—").join(" · ")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: stageChecked ? "wcp-btn" : "wcp-btn wcp-btn--primary",
							"aria-pressed": stageChecked,
							onClick: () => {
								onToggle(stage);
							},
							children: stageChecked ? t("row.remove") : t("row.add")
						})
					] })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "wcp-filmstrip",
					role: "listbox",
					"aria-multiselectable": "true",
					"aria-orientation": "horizontal",
					"aria-label": t("column.items"),
					onKeyDown: listKeyDown,
					children: [items.map((item) => {
						const checked = selected.some((entry) => sameItem(entry, item));
						const key = itemKey(item);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-thumb",
							role: "option",
							"data-wcp-row": true,
							"aria-selected": checked,
							"aria-current": key === focusedKey,
							tabIndex: key === focusedKey ? 0 : -1,
							onFocus: () => {
								onFocus(item);
							},
							onClick: () => {
								onFocus(item);
								onToggle(item);
							},
							onKeyDown: (event) => {
								rowKeyDown(event, item, onToggle);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, {
									item,
									size: 24
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-thumb__label",
									children: item.name
								}),
								checked ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-thumb__badge",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 10 })
								}) : null
							]
						}, key);
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndSentinel, {
						hasMore,
						loadingMore,
						onEndReached
					})]
				})]
			});
		}
		/** Column view's trailing pane: everything known about the focused entry. */
		function PreviewPane({ item, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-pane wcp-pane--preview",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-pane__head",
					children: t("column.preview")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-scroll",
					children: item === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-state",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wcp-state__title",
							children: t("preview.emptyTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "wcp-state__hint",
							children: t("preview.emptyHint")
						})]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "wcp-preview",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wcp-preview__stage",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, {
									item,
									size: 40
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wcp-preview__name",
								children: item.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wcp-preview__kind",
								children: typeLabel(item, t)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
								className: "wcp-preview__rows",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewRow, {
										label: t("preview.size"),
										value: formatBytes(itemSize(item))
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewRow, {
										label: t("preview.modified"),
										value: formatDate(item.updatedAt)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewRow, {
										label: t("preview.location"),
										value: locationLabel(item) === "" ? "—" : locationLabel(item)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewRow, {
										label: t("preview.identifier"),
										value: item.id
									})
								]
							}),
							item.url === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: "wcp-link",
								href: item.url,
								target: "_blank",
								rel: "noreferrer",
								children: t("preview.open")
							})
						]
					})
				})]
			});
		}
		/** One definition row in the preview pane. */
		function PreviewRow({ label, value }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-def",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: value })]
			});
		}
		//#endregion
		//#region src/client/cli/CliPicker.tsx
		/**
		* The picker window: data loading, selection, browsing preferences, keyboard
		* behavior, and the Finder-style chrome around one of the three views.
		*
		* App concerns stay outside: the window reports the confirmed selection and the
		* close request; the slot component owns chip insertion.
		*/
		/** Poll cadence while the CLI waits for a scan. */
		const AUTH_POLL_MS = 2500;
		/** QR refresh cadence; an expired code must not stay on screen, and a restarted
		* login may not have written its image yet when the URL is first requested. */
		const QR_REFRESH_MS = 5e3;
		/** Search debounce, so typing does not spawn one CLI call per keystroke. */
		const SEARCH_DEBOUNCE_MS = 250;
		/** Default direction per facet: names read up, dates and sizes read down. */
		const DEFAULT_DIRECTION = {
			name: "asc",
			kind: "asc",
			location: "asc",
			updatedAt: "desc",
			size: "desc"
		};
		/** Finder-style WeDrive picker window. */
		function PickerWindow({ onConfirm, onClose, onUseIframe, t }) {
			const dialog = (0, react.useRef)(null);
			const search = (0, react.useRef)(null);
			const drag = useWindowDrag(dialog);
			const [preferences, setPreferences] = (0, react.useState)(loadPreferences);
			const [query, setQuery] = (0, react.useState)("");
			const [items, setItems] = (0, react.useState)([]);
			const [cursor, setCursor] = (0, react.useState)(void 0);
			const [hasMore, setHasMore] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(true);
			const [loadingMore, setLoadingMore] = (0, react.useState)(false);
			const [block, setBlock] = (0, react.useState)(void 0);
			const [auth, setAuth] = (0, react.useState)({ phase: "idle" });
			const [qrStamp, setQrStamp] = (0, react.useState)(0);
			const [selected, setSelected] = (0, react.useState)([]);
			const [focused, setFocused] = (0, react.useState)(void 0);
			const [space, setSpace] = (0, react.useState)(void 0);
			const [folder, setFolder] = (0, react.useState)(void 0);
			const [notice, setNotice] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				savePreferences(preferences);
			}, [preferences]);
			(0, react.useEffect)(() => {
				dialog.current?.focus();
			}, []);
			/** One page request at a time: the sentinel can fire twice within a tick. */
			const paging = (0, react.useRef)(false);
			/** Replace the result set, keeping focus on a still-present entry. */
			const applyItems = (0, react.useCallback)((next) => {
				setItems(next);
				setFocused((previous) => previous !== void 0 && next.some((item) => sameItem(item, previous)) ? previous : next[0]);
			}, []);
			/** First page for the current query; the window's one refresh path. */
			const refresh = (0, react.useCallback)(async (signal) => {
				setBusy(true);
				try {
					const response = await fetchPickerFiles({
						query,
						signal
					});
					if (signal.aborted) return;
					if (response.ok) {
						applyItems(response.items);
						setCursor(response.nextCursor);
						setHasMore(response.hasMore);
						setBlock(void 0);
						setLoadingMore(false);
						return;
					}
					applyItems([]);
					setCursor(void 0);
					setHasMore(false);
					if (response.state === "missing") {
						onUseIframe(true);
						return;
					}
					setBlock({
						code: response.state,
						message: response.message
					});
					if (response.state === "unauthorized") {
						const status = await fetchPickerStatus(signal).catch(() => void 0);
						if (status !== void 0 && !signal.aborted) setAuth(status.auth);
					}
				} catch (error) {
					if (!signal.aborted) setBlock({
						code: "error",
						message: error instanceof Error ? error.message : String(error)
					});
				} finally {
					if (!signal.aborted) setBusy(false);
				}
			}, [
				applyItems,
				onUseIframe,
				query
			]);
			(0, react.useEffect)(() => {
				const controller = new AbortController();
				const timer = setTimeout(() => {
					refresh(controller.signal);
				}, query.trim() === "" ? 0 : SEARCH_DEBOUNCE_MS);
				return () => {
					clearTimeout(timer);
					controller.abort();
				};
			}, [query, refresh]);
			const polling = pollsAuth(block?.code, auth);
			(0, react.useEffect)(() => {
				if (!polling) return;
				const controller = new AbortController();
				const timer = setInterval(() => {
					fetchPickerStatus(controller.signal).then((status) => {
						if (controller.signal.aborted) return;
						if (status.state === "authorized") {
							setAuth({ phase: "idle" });
							setBlock(void 0);
							refresh(new AbortController().signal);
							return;
						}
						setAuth(status.auth);
					}).catch(() => void 0);
				}, AUTH_POLL_MS);
				return () => {
					clearInterval(timer);
					controller.abort();
				};
			}, [polling, refresh]);
			(0, react.useEffect)(() => {
				if (auth.phase !== "waiting") return;
				const timer = setInterval(() => {
					setQrStamp((stamp) => stamp + 1);
				}, QR_REFRESH_MS);
				return () => {
					clearInterval(timer);
				};
			}, [auth.phase]);
			const sorted = (0, react.useMemo)(() => sortItems(items, preferences.sortKey, preferences.sortDirection, t), [
				items,
				preferences.sortKey,
				preferences.sortDirection,
				t
			]);
			const columns = (0, react.useMemo)(() => groupColumns(items, preferences, t, space, folder), [
				items,
				preferences,
				t,
				space,
				folder
			]);
			(0, react.useEffect)(() => {
				setSpace(columns.spaceId);
				setFolder(columns.folderId);
			}, [columns.spaceId, columns.folderId]);
			const toggle = (0, react.useCallback)((item) => {
				setFocused(item);
				if (selected.some((entry) => sameItem(entry, item))) {
					setSelected(selected.filter((entry) => !sameItem(entry, item)));
					setNotice("");
					return;
				}
				if (selected.length >= 10) {
					setNotice(t("status.max"));
					return;
				}
				setSelected([...selected, item]);
				setNotice("");
			}, [selected, t]);
			/**
			* Append the next page. A cursor that repeats a page, or a page whose entries
			* are all known already, ends paging instead of spinning on the sentinel.
			*/
			const loadMore = (0, react.useCallback)(async () => {
				if (paging.current || cursor === void 0) return;
				paging.current = true;
				setLoadingMore(true);
				try {
					const response = await fetchPickerFiles({
						query,
						cursor
					});
					if (!response.ok) {
						setBlock({
							code: response.state,
							message: response.message
						});
						return;
					}
					const known = new Set(items.map(itemKey));
					const added = response.items.filter((item) => !known.has(itemKey(item)));
					if (added.length === 0) {
						setHasMore(false);
						return;
					}
					applyItems([...items, ...added]);
					setCursor(response.nextCursor);
					setHasMore(response.hasMore);
				} catch (error) {
					setNotice(error instanceof Error ? error.message : String(error));
				} finally {
					paging.current = false;
					setLoadingMore(false);
				}
			}, [
				applyItems,
				cursor,
				items,
				query
			]);
			/** Stable callback handed to the views' paging sentinels. */
			const requestMore = (0, react.useCallback)(() => {
				loadMore();
			}, [loadMore]);
			/**
			* Start a QR login. `restart` retires the attempt whose QR is on screen, so
			* an expired code or a failed scan is recoverable with the same click.
			*/
			const beginAuth = (0, react.useCallback)(async (restart = false) => {
				setAuth({ phase: "waiting" });
				setQrStamp((stamp) => stamp + 1);
				try {
					setAuth(await startPickerAuth(void 0, { restart }));
				} catch (error) {
					setAuth({
						phase: "failed",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}, []);
			/** Re-clicking the active facet flips direction; a new facet takes its default. */
			const chooseSortKey = (0, react.useCallback)((key) => {
				setPreferences((previous) => previous.sortKey === key ? {
					...previous,
					sortDirection: previous.sortDirection === "asc" ? "desc" : "asc"
				} : {
					...previous,
					sortKey: key,
					sortDirection: DEFAULT_DIRECTION[key]
				});
			}, []);
			const chooseView = (0, react.useCallback)((view) => {
				setPreferences((previous) => ({
					...previous,
					view
				}));
			}, []);
			const confirm = (0, react.useCallback)(() => {
				if (selected.length === 0) return;
				onConfirm(selected);
			}, [onConfirm, selected]);
			/** Dialog-level shortcuts, plus the focus trap a modal owes its user. */
			const onKeyDown = (0, react.useCallback)((event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose();
					return;
				}
				if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
					event.preventDefault();
					search.current?.focus();
					return;
				}
				if (event.key === "Enter" && selected.length > 0) {
					event.preventDefault();
					confirm();
					return;
				}
				if (event.key !== "Tab") return;
				const node = dialog.current;
				if (node === null) return;
				const focusable = [...node.querySelectorAll("button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex=\"-1\"])")];
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (first === void 0 || last === void 0) return;
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}, [
				confirm,
				onClose,
				selected.length
			]);
			const view = preferences.view;
			const content = block !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockedView, {
				block,
				auth,
				qrStamp,
				t,
				onRetry: () => {
					setBlock(void 0);
					refresh(new AbortController().signal);
				},
				onAuthorize: (restart) => {
					beginAuth(restart);
				},
				onUseIframe: () => {
					onUseIframe(false);
				}
			}) : busy && items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoadingRows, { t }) : sorted.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				query,
				t
			}) : view === "list" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListView, {
				items: sorted,
				selected,
				focused,
				onFocus: setFocused,
				onToggle: toggle,
				preferences,
				onSort: chooseSortKey,
				hasMore,
				loadingMore,
				onEndReached: requestMore,
				t
			}) : view === "columns" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColumnsView, {
				columns,
				spaceId: space,
				folderId: folder,
				onSpace: setSpace,
				onFolder: setFolder,
				selected,
				focused,
				onFocus: setFocused,
				onToggle: toggle,
				hasMore,
				loadingMore,
				onEndReached: requestMore,
				t
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GalleryView, {
				items: sorted,
				selected,
				focused,
				onFocus: setFocused,
				onToggle: toggle,
				hasMore,
				loadingMore,
				onEndReached: requestMore,
				t
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: PICKER_STYLE }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-overlay",
				role: "presentation",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-scrim",
					"aria-hidden": "true",
					onClick: onClose
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: drag.dragging ? "wcp-window wcp-window--dragging" : "wcp-window",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("panel.title"),
					tabIndex: -1,
					ref: dialog,
					style: drag.style,
					onKeyDown,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PickerToolbar, {
							query,
							onQuery: setQuery,
							view,
							onView: chooseView,
							sortKey: preferences.sortKey,
							sortDirection: preferences.sortDirection,
							onSortKey: chooseSortKey,
							onSortDirection: (direction) => {
								setPreferences((previous) => ({
									...previous,
									sortDirection: direction
								}));
							},
							onClose,
							searchRef: search,
							chromeProps: drag.chromeProps,
							handleProps: drag.handleProps,
							t
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wcp-content",
							children: content
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-status",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-status__strong",
									children: sorted.length
								}), ` ${t("status.count")}`] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									"aria-live": "polite",
									children: [
										`${t("status.selected")} `,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "wcp-status__strong",
											children: selected.length
										}),
										`/${String(10)}`
									]
								}),
								notice === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-status__warn",
									children: notice
								}),
								busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("status.searching") }) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-spacer" }),
								hasMore && block === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-btn wcp-btn--quiet",
									disabled: busy || loadingMore,
									onClick: requestMore,
									children: t("panel.more")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-btn",
									onClick: onClose,
									children: t("panel.cancel")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-btn wcp-btn--primary",
									disabled: selected.length === 0,
									onClick: confirm,
									children: t("panel.confirm")
								})
							]
						})
					]
				})]
			})] });
		}
		//#endregion
		//#region src/client/iframe/selector.ts
		/**
		* Official WeCom selector iframe contract: the picker URL, the origin that may
		* post results, and the `IWedriveFileSelectorResponse` parser.
		*
		* The panel currently lists files through `wecom-cli` (see `src/host/wecom-cli.ts`)
		* because the desktop app cannot hold a WeCom web session in a cross-site
		* iframe. This module is retained for the planned proxy phase, which serves the
		* official selector from a same-site origin; until then `WecomSelectedFile` is
		* its live consumer.
		*/
		/** Hard-coded WeCom WeDrive file-selector page. */
		const WECOM_SELECTOR_URL = "https://doc.weixin.qq.com/webdisk/index?t=wedriveFileSelectorForWework&weworkType=-1&multiSelectable=true&selectFileMaxlength=10";
		/** WeDrive directory entry (`kEntryDir`). */
		const ENTRY_DIR = 1;
		/** Parse a JSON string; invalid text is not a selector payload. */
		function parseJson(text) {
			try {
				return JSON.parse(text);
			} catch {
				return;
			}
		}
		/** Read a non-empty string field from a record. */
		function stringField(record, ...keys) {
			for (const key of keys) {
				const value = record[key];
				if (typeof value === "string" && value.trim() !== "") return value.trim();
			}
		}
		/**
		* Resolve the clickable URL on one WeDrive fileInfo.
		* Docs use `doc_url`; journal / invite cards put the jump URL on `journalForwardInfo.url`.
		*/
		function fileUrl(record) {
			const direct = stringField(record, "doc_url", "docUrl");
			if (direct !== void 0) return direct;
			const journal = record.journalForwardInfo;
			if (journal !== null && typeof journal === "object") {
				const nested = stringField(journal, "url");
				if (nested !== void 0) return nested;
			}
			return stringField(record, "url");
		}
		/** Folder when `type` is WeDrive `kEntryDir` (number or numeric string). */
		function entryKind(record) {
			const type = record.type;
			if (type === ENTRY_DIR || type === String(ENTRY_DIR)) return "folder";
			return "file";
		}
		/**
		* Chip identity: a document carries `doc_id` (`a1_` / `s3_` / `d3_` …);
		* files and folders use the list entry `id` (`s.xxx`). `fileId` is the
		* encrypted blob and is never the chip.
		*/
		function entryId(record) {
			const docId = stringField(record, "doc_id", "docId");
			if (docId !== void 0) return {
				id: docId,
				idKind: "doc"
			};
			const id = stringField(record, "id");
			if (id !== void 0) return {
				id,
				idKind: "file"
			};
		}
		/** Project one selector list item into a chip payload. */
		function fileFrom(item) {
			if (item === null || typeof item !== "object") return void 0;
			const record = item;
			const nested = record.fileInfo;
			const body = nested !== null && typeof nested === "object" ? {
				...record,
				...nested
			} : record;
			const identity = entryId(body);
			if (identity === void 0) return void 0;
			const name = stringField(body, "showName", "name", "showNameWithEscape") ?? identity.id;
			const url = fileUrl(body);
			return {
				...identity,
				name,
				kind: entryKind(body),
				...url === void 0 ? {} : { url }
			};
		}
		/** Collect chip payloads from `selectedFileList` / a parsed JSON list. */
		function filesFrom(value) {
			if (!Array.isArray(value)) return [];
			const files = [];
			for (const item of value) {
				const file = fileFrom(item);
				if (file !== void 0) files.push(file);
			}
			return files;
		}
		/** Unwrap a payload that may itself be a JSON string. */
		function asRecord(data) {
			const value = typeof data === "string" ? parseJson(data) : data;
			if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
			return value;
		}
		/**
		* Parse a WeCom selector `postMessage` as `IWedriveFileSelectorResponse`.
		* @param data - `MessageEvent.data` from the selector.
		* @returns confirm/cancel when `action` is recognized; otherwise undefined.
		*/
		function parseWecomSelectorMessage(data) {
			const record = asRecord(data);
			if (record === void 0) return void 0;
			const inner = asRecord(record.data) ?? asRecord(record.info) ?? record;
			const action = typeof inner.action === "string" ? inner.action : "";
			if (action === "cancel") return { kind: "cancel" };
			if (action !== "confirm") return void 0;
			const listed = filesFrom(inner.selectedFileList);
			const encoded = typeof inner.selectedFileListJSONString === "string" ? filesFrom(parseJson(inner.selectedFileListJSONString)) : [];
			const seen = /* @__PURE__ */ new Set();
			return {
				kind: "confirm",
				files: [...listed, ...encoded].filter((file) => {
					const key = `${file.idKind}:${file.id}`;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				})
			};
		}
		//#endregion
		//#region src/client/iframe/IframePicker.tsx
		/**
		* Official WeCom selector, used as the fallback when the host cannot drive
		* `wecom-cli` (or when the user asks for it).
		*
		* The selector is the real WeDrive web app embedded in an iframe, so it brings
		* its own session requirements: it only logs in when the surrounding document
		* shares a site with `doc.weixin.qq.com`. In the desktop app (`dsh-app://app`)
		* that is never true, which is exactly why the CLI picker is primary.
		*/
		/** Official selector in a modal frame, with the same chip contract as the CLI picker. */
		function IframePicker({ onConfirm, onClose, onUseCli, t }) {
			const [loaded, setLoaded] = (0, react.useState)(false);
			const frame = (0, react.useRef)(null);
			const drag = useWindowDrag(frame);
			(0, react.useEffect)(() => {
				const onMessage = (event) => {
					if (event.origin !== "https://doc.weixin.qq.com") return;
					const parsed = parseWecomSelectorMessage(event.data);
					if (parsed === void 0) return;
					if (parsed.kind === "confirm") onConfirm(parsed.files);
					onClose();
				};
				window.addEventListener("message", onMessage);
				return () => {
					window.removeEventListener("message", onMessage);
				};
			}, [onClose, onConfirm]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "wcp-overlay",
				role: "presentation",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "wcp-scrim",
					"aria-hidden": "true",
					onClick: onClose
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: drag.dragging ? "wcp-window wcp-window--dragging" : "wcp-window",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("iframe.title"),
					ref: frame,
					style: drag.style,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-toolbar",
							...drag.chromeProps,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-title",
									"aria-label": t("panel.drag"),
									title: t("panel.drag"),
									...WINDOW_HANDLE_PROPS,
									...drag.handleProps,
									children: t("iframe.title")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wcp-spacer" }),
								onUseCli === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-btn wcp-btn--quiet",
									onClick: onUseCli,
									children: t("iframe.useCli")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wcp-iconbtn",
									"aria-label": t("panel.close"),
									onClick: onClose,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, {})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "wcp-iframe__hint",
							children: t("iframe.hint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wcp-iframe__frame",
							children: [loaded ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wcp-state",
								role: "status",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wcp-state__hint",
									children: t("iframe.loading")
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
								className: "wcp-iframe",
								title: t("iframe.title"),
								src: WECOM_SELECTOR_URL,
								onLoad: () => {
									setLoaded(true);
								}
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/placement.ts
		/** The composer tool-row button shows for every placement except menu-only. */
		function showsToolRow(placement) {
			return placement !== "plusMenu";
		}
		/** The `+` command-menu row is contributed whenever the menu is part of the placement. */
		function usesPlusMenu(placement) {
			return placement === "plusMenu" || placement === "both";
		}
		//#endregion
		//#region src/client/PickerButton.tsx
		/**
		* Composer-left WeCom picker slot: the launcher, and the modal that hosts one
		* of the two pickers.
		*
		* Routing is CLI first: the `wecom-cli` picker opens by default because it
		* needs no browser session and works identically in the desktop app and in
		* `dsh web`. The official iframe selector is the fallback — entered
		* automatically when the host reports no CLI at all, and by explicit choice
		* from the CLI picker's refusal states. Closing always returns to the default,
		* so the next open tries the CLI again.
		*
		* Placement is configurable (`placement` on the plugin's Loader row): this
		* component renders the composer tool-row button unless the placement is
		* `plusMenu`, and in every placement it stays mounted as the modal host that
		* the `+` menu entry opens through {@link PickerStore}.
		*/
		/**
		* Bind the picker to one client root so confirmed files become WeDrive chips.
		* @param ctx - client root (sessions + input-trigger registry).
		* @returns the conversation.input.left slot component.
		*/
		function createWecomPicker(ctx, store) {
			return function WecomPickerButton(props) {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WecomPickerButtonView, {
					...props,
					ctx,
					store
				});
			};
		}
		/** Launcher plus the picker it opens. */
		function WecomPickerButtonView({ useInput, sessionId, t, ctx, store }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [placement, setPlacement] = (0, react.useState)(void 0);
			const [mode, setMode] = (0, react.useState)("cli");
			const [cliMissing, setCliMissing] = (0, react.useState)(false);
			const launcher = (0, react.useRef)(null);
			const input = useInput((s) => s);
			(0, react.useEffect)(() => {
				let alive = true;
				loadPlacement().then((value) => {
					if (alive) setPlacement(value);
				});
				return () => {
					alive = false;
				};
			}, []);
			(0, react.useEffect)(() => store.subscribe((requested) => {
				if (requested === String(sessionId)) setOpen(true);
			}), [sessionId, store]);
			/** Focus returns to the launcher, so the composer keyboard path never breaks. */
			const close = (0, react.useCallback)(() => {
				setOpen(false);
				setMode("cli");
				setCliMissing(false);
				launcher.current?.focus();
			}, []);
			/** Enter the official selector; `missing` suppresses the way back. */
			const useIframe = (0, react.useCallback)((missing) => {
				setCliMissing(missing);
				setMode("iframe");
			}, []);
			const useCli = (0, react.useCallback)(() => {
				setMode("cli");
			}, []);
			const confirm = (0, react.useCallback)((files) => {
				insertWedriveChips(ctx, sessionId, files, input);
				close();
			}, [
				close,
				ctx,
				input,
				sessionId
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: LAUNCH_STYLE }),
				placement === void 0 || !showsToolRow(placement) ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("button.label"),
					side: "top",
					delayMs: 500,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						ref: launcher,
						type: "button",
						className: "wcp-launch",
						"aria-label": t("button.label"),
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						onClick: () => {
							setOpen(true);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Wedrive16, {})
					})
				}),
				open ? (0, react_dom.createPortal)(mode === "cli" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PickerWindow, {
					onConfirm: confirm,
					onClose: close,
					onUseIframe: useIframe,
					t
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IframePicker, {
					onConfirm: confirm,
					onClose: close,
					onUseCli: cliMissing ? void 0 : useCli,
					t
				}), document.body) : null
			] });
		}
		//#endregion
		//#region src/client/picker-store.ts
		/** Create the handoff store for one client root. */
		function createPickerStore() {
			const listeners = /* @__PURE__ */ new Set();
			return {
				open(sessionId) {
					for (const listener of [...listeners]) listener(sessionId);
				},
				subscribe(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Command name of the `+` menu row; unique across contributions. */
		const MENU_COMMAND = "wecom-picker";
		/** Locale dictionaries, trigger codec, and the conversation slot tree. */
		const inject = [
			"slots",
			"locale",
			"inputTriggers",
			"sessions"
		];
		/** Register the picker's two entry points. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "wecom-picker: dictionaries");
			ctx.effect(() => registerWedriveSource(ctx), "wecom-picker: wedrive source");
			const store = createPickerStore();
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "wecom-picker",
				order: 20,
				locale: NS
			}, createWecomPicker(ctx, store)));
			registerMenuEntry(ctx, store);
		}
		/**
		* Add the picker to the composer's `+` command menu when the placement asks for
		* it. Registration waits on the config read, so the menu row never appears on a
		* `standalone` install.
		*/
		function registerMenuEntry(ctx, store) {
			ctx.inject(["commandUi"], (scope) => {
				const t = ctx.locale.bind(NS);
				scope.effect(() => {
					let dispose;
					let cancelled = false;
					loadPlacement().then((placement) => {
						if (cancelled || !usesPlusMenu(placement)) return;
						dispose = scope.get("commandUi").register({
							name: MENU_COMMAND,
							label: () => t("menu.label"),
							description: () => t("menu.description"),
							icon: Wedrive16,
							available: () => true,
							ui: {
								kind: "action",
								run: (session) => {
									store.open(String(session.sessionId));
								}
							}
						});
					});
					return () => {
						cancelled = true;
						dispose?.();
					};
				}, "wecom-picker: plus-menu entry");
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map