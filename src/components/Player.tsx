import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Cursor } from '../App';
import { code, useLang } from '../i18n';
import { Metrics } from './Guide';

/** Seconds each episode stays on screen before autoplay moves on. */
const EPISODE_SECONDS = 10;

/**
 * "Play all": every episode of every season in resume order, binge-style —
 * with an up-next countdown, pause, keyboard control and a focus trap.
 */
export default function Player({ start, onClose }: { start: Cursor; onClose: (last: Cursor | null) => void }) {
  const { t } = useLang();
  const queue = useMemo(() => t.seasons.flatMap((s, si) => s.episodes.map((ep, ei) => ({ ep, season: s, si, ei }))), [t]);
  const [index, setIndex] = useState(() => Math.max(0, queue.findIndex((q) => q.si === start.season && q.ei === start.episode)));
  const [left, setLeft] = useState(EPISODE_SECONDS);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const item = queue[index];
  const upNext = queue[index + 1];

  const go = useCallback(
    (to: number) => {
      if (to >= queue.length) {
        setEnded(true);
        return;
      }
      setEnded(false);
      setIndex(Math.max(0, to));
      setLeft(EPISODE_SECONDS);
    },
    [queue.length],
  );

  // From the finale, "previous" reopens the last episode instead of skipping one back.
  const prev = useCallback(() => (ended ? go(index) : go(index - 1)), [ended, index, go]);

  const close = useCallback(() => onClose(item ? { season: item.si, episode: item.ei } : null), [item, onClose]);

  // One-second clock drives the countdown; it stops while paused or after the finale.
  useEffect(() => {
    if (paused || ended) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [paused, ended, index]);

  useEffect(() => {
    if (left <= 0) go(index + 1);
  }, [left, index, go]);

  // The up-next card disappears on the last episode and at the finale; don't let focus fall out with it.
  useEffect(() => {
    if (!dialog.current?.contains(document.activeElement)) closeBtn.current?.focus();
  }, [ended, index]);

  useEffect(() => {
    closeBtn.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const onKey = (e: KeyboardEvent) => {
    const onButton = (e.target as HTMLElement).closest('button, a');
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === ' ' && !onButton) {
      e.preventDefault();
      setPaused((p) => !p);
    } else if (e.key === 'Tab') trapFocus(e, dialog.current);
  };

  return (
    <div ref={dialog} className="player" role="dialog" aria-modal="true" aria-label={t.ui.playerLabel} onKeyDown={onKey}>
      <ol className="player-track" aria-hidden>
        {queue.map((q, i) => (
          <li key={`${q.si}-${q.ei}`} className={q.ei === 0 && i > 0 ? 'season-start' : undefined}>
            <span style={{ transform: `scaleX(${i < index || ended ? 1 : i === index ? 1 - left / EPISODE_SECONDS : 0})` }} />
          </li>
        ))}
      </ol>

      <div className="player-top">
        <p className="mono">
          {t.ui.season} {item.si + 1} · {item.season.title}
        </p>
        <button ref={closeBtn} type="button" className="icon-btn" onClick={close} aria-label={t.ui.close}>
          ✕
        </button>
      </div>

      <div className="player-stage" aria-live="polite">
        {ended ? (
          <div className="player-episode">
            <p className="mono eyebrow">{t.ui.theEnd}</p>
            <h2 className="player-title">{t.ui.finale}</h2>
            <p className="player-summary">{t.name} · {t.role}</p>
          </div>
        ) : (
          <div className="player-episode" key={`${index}-${t.ui.langLabel}`}>
            <p className="mono eyebrow">
              {code(item.si, item.ei)}
              {item.ep.date && ` · ${item.ep.date}`}
            </p>
            <h2 className="player-title">{item.ep.title}</h2>
            <p className="player-tagline">{item.ep.tagline}</p>
            <p className="player-summary">{item.ep.summary}</p>
            {item.ep.metrics && <Metrics items={item.ep.metrics} />}
            {item.ep.tags && (
              <ul className="chips">
                {item.ep.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <button type="button" className="icon-btn" onClick={prev} disabled={index === 0 && !ended} aria-label={t.ui.previous}>
            ⏮
          </button>
          <button type="button" className="icon-btn icon-btn-main" onClick={() => setPaused((p) => !p)} disabled={ended} aria-label={paused ? t.ui.resume : t.ui.pause}>
            {paused ? '▶' : '❚❚'}
          </button>
          <button type="button" className="icon-btn" onClick={() => go(index + 1)} disabled={ended} aria-label={t.ui.next}>
            ⏭
          </button>
          <span className="player-keys mono" aria-hidden>
            SPACE · ← → · ESC
          </span>
        </div>

        {!ended && upNext && (
          <button type="button" className="upnext" onClick={() => go(index + 1)}>
            <span className="mono">
              {t.ui.upNext} · {paused ? '❚❚' : t.ui.nextIn(left)}
            </span>
            <strong>{upNext.ep.title}</strong>
            <span className="upnext-code mono">{code(upNext.si, upNext.ei)}</span>
          </button>
        )}
        {ended && (
          <button type="button" className="btn btn-primary" onClick={close}>
            {t.ui.close}
          </button>
        )}
      </div>
    </div>
  );
}

/** Keeps Tab / Shift+Tab cycling inside the dialog. */
function trapFocus(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
