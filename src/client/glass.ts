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
export const PICKER_STYLE = `.wcp-overlay{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px}
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
`

/**
 * Composer button material, injected by the slot component itself so the
 * launcher is styled before any window ever mounts.
 *
 * Geometry copies the composer's own `+` button (28px circle, selector fill,
 * solid hover) so the two read as one group. Placement does too: DSH renders
 * `conversation.input.left` *after* the composer's `+` and access-mode chips,
 * and registers no slot between them, so flex `order` is the only way to sit
 * immediately right of `+`:
 *
 * - A `:has()`-scoped rule pulls the launcher in front of the mode chips, but
 *   only while a `+` button is actually present.
 * - A sibling rule pushes that `+` to `-2`, keeping it on our left.
 *
 * Both selectors key off `data-icon` (a stable DSH attribute), not the hashed
 * CSS-module class, so if a DSH build renames the icon neither rule matches and
 * the launcher falls back to the default order (after the mode chips) instead
 * of jumping ahead of `+`.
 */
export const LAUNCH_STYLE = `
.wcp-launch{
  display:grid;place-items:center;flex:none;width:28px;height:28px;padding:0;
  border:0;border-radius:999px;corner-shape:round;cursor:pointer;
  background:var(--dsw-specific-selector);color:var(--dsw-alias-label-primary);
  transition:background-color .12s ease;
}
/* Both rules hinge on the same stable data-icon, so they either apply
   together (button lands right of +) or not at all (default order). */
[data-composer-card] div:has(> button > svg[data-icon="dsw-icon-plus-outline-medium"]) .wcp-launch{order:-1}
[data-composer-card] button:has(> svg[data-icon="dsw-icon-plus-outline-medium"]){order:-2}
@media (hover:hover){.wcp-launch:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}}
.wcp-launch:active{background:var(--dsw-alias-interactive-bg-hover-solid)}
.wcp-launch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--dsw-static-deepseek-500, #4176e6));outline-offset:1px}
@media (prefers-reduced-motion:reduce){.wcp-launch{transition:none}}
`
