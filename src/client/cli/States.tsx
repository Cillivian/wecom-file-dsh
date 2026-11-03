/**
 * Non-content states: loading, empty, and the three refusals the host can
 * report (missing CLI, expired authorization with its QR relay, read error).
 * Every one of them names what happened and what to do next.
 */
import type { PickerAuthState, PickerBlockCode } from '../../shared/protocol.ts'
import type { WecomPickerKey } from '../locales.ts'
import { pickerAuthQrUrl } from './api.ts'
import { authPanel } from './auth.ts'

/** Locale lookup owned by the window. */
type T = (key: WecomPickerKey) => string

/** Skeleton rows: the list's shape, so the window does not jump when data lands. */
export function LoadingRows({ t }: { readonly t: T }) {
  return (
    <div className="wcp-scroll" role="status" aria-busy="true" aria-label={t('panel.loading')}>
      {[0, 1, 2, 3, 4, 5].map(index => (
        <div className="wcp-skeleton__row" key={index}>
          <span className="wcp-skeleton__bar wcp-skeleton__bar--mark" />
          <span className="wcp-skeleton__bar wcp-skeleton__bar--name" />
          <span className="wcp-skeleton__bar wcp-skeleton__bar--meta" />
        </div>
      ))}
    </div>
  )
}

/**
 * Empty result set, split by cause: a fresh account has nothing recent, while a
 * search that found nothing needs a different next step.
 */
export function EmptyState({ query, t }: { readonly query: string; readonly t: T }) {
  const searching = query.trim() !== ''
  return (
    <div className="wcp-state" role="status">
      <div className="wcp-state__title">{searching ? t('panel.emptySearch') : t('panel.empty')}</div>
      <p className="wcp-state__hint">{searching ? t('panel.emptySearchHint') : t('panel.emptyHint')}</p>
      {searching ? <code className="wcp-state__detail">{query}</code> : null}
    </div>
  )
}

/** One refusal, with the one action that can resolve it. */
export function BlockedView({
  block, auth, qrStamp, t, onRetry, onAuthorize, onUseIframe,
}: {
  readonly block: { readonly code: PickerBlockCode; readonly message: string }
  readonly auth: PickerAuthState
  readonly qrStamp: number
  readonly t: T
  readonly onRetry: () => void
  /** Start a fresh login; `restart` retires the attempt whose QR is on screen. */
  readonly onAuthorize: (restart: boolean) => void
  /** Switch to the official selector; absent once the CLI is known to be missing. */
  readonly onUseIframe: () => void
}) {
  const panel = authPanel(block.code, auth)
  const title = block.code === 'missing'
    ? t('state.missing')
    : block.code === 'unauthorized' ? t('state.unauthorized') : t('state.error')
  const hint = block.code === 'missing'
    ? t('state.missingHint')
    : block.code === 'unauthorized' ? t('state.unauthorizedHint') : t('state.errorHint')
  const tone = block.code === 'error' ? 'wcp-state wcp-state--error' : 'wcp-state wcp-state--warn'
  return (
    <div className={tone} role="alert">
      <div className="wcp-state__title">{title}</div>
      <p className="wcp-state__hint">{hint}</p>
      <code className="wcp-state__detail">{block.message}</code>
      {panel.failure === undefined
        ? null
        : (
          <p className="wcp-state__hint wcp-state__title">
            {panel.failure === '' ? t('auth.failed') : `${t('auth.failed')}：${panel.failure}`}
          </p>
        )}
      {panel.qr
        ? (
          <div className="wcp-state__qr">
            <img className="wcp-qr" src={pickerAuthQrUrl(qrStamp)} alt={t('auth.waiting')} width={190} height={190} />
            <span className="wcp-state__hint">{t('auth.waiting')}</span>
          </div>
        )
        : null}
      {auth.link === undefined
        ? null
        : <a className="wcp-link" href={auth.link} target="_blank" rel="noreferrer">{t('auth.link')}</a>}
      <div className="wcp-state__actions">
        {panel.retry
          ? <button type="button" className="wcp-btn" onClick={onRetry}>{t('panel.retry')}</button>
          : null}
        {panel.reauthorize
          ? (
            <button
              type="button"
              className={block.code === 'unauthorized' && !panel.qr ? 'wcp-btn wcp-btn--primary' : 'wcp-btn wcp-btn--quiet'}
              onClick={() => { onAuthorize(panel.qr) }}
            >
              {panel.qr ? t('auth.restart') : t('auth.action')}
            </button>
          )
          : null}
        <button type="button" className="wcp-btn wcp-btn--quiet" onClick={onUseIframe}>{t('cli.useIframe')}</button>
      </div>
    </div>
  )
}
