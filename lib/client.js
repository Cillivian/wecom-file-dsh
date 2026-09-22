window.__ModuleLoader__.load({
	id: "dsh-scratch-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		//#endregion
		//#region node_modules/.pnpm/@tencent+wedocs-icons@0.3.26091100_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@tencent/wedocs-icons/esm/icon.js
		var __assign = function() {
			__assign = Object.assign || function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
			return __assign.apply(this, arguments);
		};
		var __rest = function(s, e) {
			var t = {};
			for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
			if (s != null && typeof Object.getOwnPropertySymbols === "function") {
				for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
			}
			return t;
		};
		var IconBase = (0, react.forwardRef)(function(props, ref) {
			var icon = props.icon, id = props.id, className = props.className, restProps = __rest(props, [
				"icon",
				"id",
				"className"
			]);
			var cls = ("wedocs-icon wedocs-icon-" + id + " " + (className || "")).trim();
			var idSuffix = (0, react.useRef)("_" + generateShortUuid());
			return render(icon, "" + id, {
				defIds: icon.defIds,
				idSuffix: idSuffix.current
			}, __assign({
				ref,
				className: cls
			}, restProps));
		});
		/**
		* use react createElement to render an IconElement with other props
		*/
		function render(node, id, runtimeProps, rootProps) {
			return (0, react.createElement)(node.tag, __assign(__assign({ key: id }, replaceRuntimeIdsInAttrs(node, runtimeProps)), rootProps), (replaceRuntimeIdsInDefs(node, runtimeProps).children || []).map(function(child, index) {
				return render(child, id + "-" + node.tag + "-" + index, runtimeProps);
			}));
		}
		function replaceRuntimeIdsInAttrs(node, runtimeProps) {
			var defIds = runtimeProps.defIds;
			if (!defIds || defIds.length === 0) return node.attrs;
			var attrs = __assign({}, node.attrs);
			if (node.tag === "use" && attrs["xlink:href"]) attrs["xlink:href"] = attrs["xlink:href"] + runtimeProps.idSuffix;
			Object.entries(attrs).forEach(function(_a) {
				var key = _a[0], value = _a[1];
				if (typeof value === "string") attrs[key] = value.replace(/url\(#(.*)\)/, "url(#$1" + runtimeProps.idSuffix + ")");
			});
			return attrs;
		}
		function replaceRuntimeIdsInDefs(node, runtimeProps) {
			var _a;
			var defIds = runtimeProps.defIds;
			if (!defIds || defIds.length === 0) return node;
			if (node.tag === "defs" && ((_a = node.children) === null || _a === void 0 ? void 0 : _a.length)) return __assign(__assign({}, node), { children: node.children.map(function(child) {
				if (typeof child.attrs.id === "string") {
					if (defIds && defIds.indexOf(child.attrs.id) > -1) return __assign(__assign({}, child), { attrs: __assign(__assign({}, child.attrs), { id: child.attrs.id + runtimeProps.idSuffix }) });
				}
				return child;
			}) });
			return node;
		}
		function generateShortUuid() {
			return Math.random().toString(36).substring(2, 8);
		}
		IconBase.displayName = "WefeIcon";
		//#endregion
		//#region node_modules/.pnpm/@tencent+wedocs-icons@0.3.26091100_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@tencent/wedocs-icons/esm/components/wedrive-16.js
		var element = {
			"tag": "svg",
			"attrs": {
				"fill": "none",
				"viewBox": "0 0 16 16",
				"width": "1em",
				"height": "1em"
			},
			"children": [{
				"tag": "path",
				"attrs": {
					"fill": "currentColor",
					"d": "M7 .48a2 2 0 012 0l5 2.9a2 2 0 011 1.73v5.79a2 2 0 01-1 1.73l-5 2.9a2 2 0 01-2 0l-5-2.9a2 2 0 01-1-1.73V5.1a2 2 0 011-1.72l5-2.9zm1.5.87a1 1 0 00-1 0L5 2.8l3.37 1.95a1 1 0 01.13.06l2 1.16c.31.18.5.51.5.87v1.74l3-1.73V5.1a1 1 0 00-.5-.87l-5-2.9zM14 8l-3.4 1.97a1 1 0 01-.1.06l-2 1.16a1 1 0 01-1 0L6 10.32v3.47l1.5.87a1 1 0 001 0l5-2.9a1 1 0 00.5-.86V8zm-9 5.21V6.84a1 1 0 01.5-.87l1.49-.86-3-1.73-1.5.86a1 1 0 00-.49.87v5.79a1 1 0 00.5.86L5 13.21zM7.99 5.7L6 6.84v2.32l2 1.16 1-.58 1-.58V6.84l-1-.58v.01l-1.01-.58z",
					"fillRule": "evenodd",
					"clipRule": "evenodd"
				}
			}]
		};
		var Wedrive16 = (0, react.forwardRef)(function(props, ref) {
			return (0, react.createElement)(IconBase, Object.assign({}, props, {
				id: "wedrive-16",
				ref,
				icon: element
			}));
		});
		Wedrive16.displayName = "Wedrive16";
		//#endregion
		//#region src/client/selector.ts
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
		//#region src/client/WecomPickerButton.tsx
		/**
		* Bind the picker to one client root so confirmed files become WeDrive chips.
		* @param ctx - client root (sessions + input-trigger registry).
		* @returns the conversation.input.left slot component.
		*/
		function createWecomPicker(ctx) {
			return function WecomPickerButton(props) {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WecomPickerButtonView, {
					...props,
					ctx
				});
			};
		}
		/** Open the WeDrive selector and insert confirmed files as composer chips. */
		function WecomPickerButtonView({ useInput, sessionId, t, ctx }) {
			const [open, setOpen] = (0, react.useState)(false);
			const input = useInput((s) => s);
			const onConfirm = (0, react.useCallback)((files, next) => {
				insertWedriveChips(ctx, sessionId, files, next);
			}, [ctx, sessionId]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onMessage = (event) => {
					if (event.origin !== "https://doc.weixin.qq.com") return;
					const parsed = parseWecomSelectorMessage(event.data);
					if (parsed === void 0) return;
					if (parsed.kind === "confirm") onConfirm(parsed.files, input);
					setOpen(false);
				};
				window.addEventListener("message", onMessage);
				return () => {
					window.removeEventListener("message", onMessage);
				};
			}, [
				input,
				onConfirm,
				open
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: ".scratch-wecom-button:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("button.label"),
					side: "top",
					delayMs: 500,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "scratch-wecom-button",
						"aria-label": t("button.label"),
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						onClick: () => {
							setOpen(true);
						},
						style: {
							display: "grid",
							placeItems: "center",
							flex: "none",
							width: 28,
							cornerShape: "round",
							height: 28,
							border: "none",
							borderRadius: 999,
							background: "var(--dsw-specific-selector)",
							color: "var(--dsw-alias-label-primary)",
							cursor: "pointer"
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Wedrive16, {})
					})
				}),
				open ? (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "presentation",
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 2e3,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: 24
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						onClick: () => {
							setOpen(false);
						},
						style: {
							position: "absolute",
							inset: 0,
							background: "var(--dsw-alias-bg-mask-1)",
							backdropFilter: "var(--dsw-mask-blur)"
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
						title: t("iframe.title"),
						src: WECOM_SELECTOR_URL,
						style: {
							position: "relative",
							zIndex: 1,
							display: "block",
							width: "min(720px, 100%)",
							height: "min(540px, 70vh)",
							border: 0,
							borderRadius: 12,
							overflow: "hidden",
							background: "transparent"
						}
					})]
				}), document.body) : null
			] });
		}
		//#endregion
		//#region src/client/locales.ts
		/** Dictionary namespace for the scratch WeCom picker. */
		const NS = "wecom.picker";
		/** Simplified Chinese copy. */
		const zh = {
			"button.label": "企业微信·微盘",
			"iframe.title": "企业微信微盘选择器"
		};
		/** English copy, same keys as the Chinese source. */
		const en = {
			"button.label": "WeCom WeDrive",
			"iframe.title": "WeCom WeDrive file selector"
		};
		//#endregion
		//#region src/client/index.ts
		/** Locale dictionaries, trigger codec, and the conversation slot tree. */
		const inject = [
			"slots",
			"locale",
			"inputTriggers",
			"sessions"
		];
		/** Register the WeCom picker on the composer left tool row. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "scratch-wecom: dictionaries");
			ctx.effect(() => registerWedriveSource(ctx), "scratch-wecom: wedrive source");
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "wecom-picker",
				order: 20,
				locale: NS
			}, createWecomPicker(ctx)));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map