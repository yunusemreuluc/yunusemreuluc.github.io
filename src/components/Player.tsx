import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Cursor } from '../App';
import { isTopDialog, useDialog } from '../hooks/useDialog';
import { code, useLang } from '../i18n';
import { EASE, Metrics, PosterArt } from './fx';

/** Seconds each episode stays on screen before autoplay moves on. */
const EPISODE_SECONDS = 10;

/**
 * "Play all": every episode of every season in resume order, binge-style —
 * blurred cross-fades between episodes, an up-next countdown ring, pause and keyboard control.
 */
export default function Player({ start, onClose }: { start: Cursor; onClose: (last: Cursor | null) => void }) {
  const { t } = useLang();
  const queue = useMemo(() => t.seasons.flatMap((s, si) => s.episodes.map((ep, ei) => ({ ep, season: s, si, ei }))), [t]);
  const [index, setIndex] = useState(() => Math.max(0, queue.findIndex((q) => q.si === start.season && q.ei === start.episode)));
  const [left, setLeft] = useState(EPISODE_SECONDS);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
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
  const close = useCallback(() => onClose({ season: item.si, episode: item.ei }), [item, onClose]);

  useDialog(root, close, closeBtn);

  useEffect(() => {
    if (paused || ended) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [paused, ended, index]);

  useEffect(() => {
    if (left <= 0) go(index + 1);
  }, [left, index, go]);

  // The up-next card leaves on the last episode and at the finale; once it's gone, keep focus inside.
  const rescueFocus = useCallback(() => {
    if (!root.current?.contains(document.activeElement)) closeBtn.current?.focus();
  }, []);
  useEffect(rescueFocus, [ended, index, rescueFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isTopDialog(root.current)) return;
      const onControl = (e.target as HTMLElement).closest('button, a');
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' && !onControl) {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [go, prev, index]);

  const ring = 2 * Math.PI * 18;

  return (
    <motion.div
      ref={root}
      className="player"
      role="dialog"
      aria-modal="true"
      aria-label={t.ui.playerLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {!ended && (
          <motion.div
            key={`bg-${index}`}
            className="player-bg"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            aria-hidden
          >
            <PosterArt season={item.si} episode={item.ei} id={item.ep.id} />
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="player-stage">
        <AnimatePresence mode="wait">
          {ended ? (
            <motion.div key="end" className="player-episode player-end" initial={{ opacity: 0, letterSpacing: '0.4em' }} animate={{ opacity: 1, letterSpacing: '0em' }} transition={{ duration: 1.1, ease: EASE }}>
              <p className="mono eyebrow">{t.ui.theEnd}</p>
              <h2 className="player-title">{t.ui.finale}</h2>
              <p className="player-summary">
                {t.name} · {t.role}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${index}-${t.ui.langLabel}`}
              className="player-episode"
              initial={{ opacity: 0, x: 80, filter: 'blur(14px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -80, filter: 'blur(14px)' }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              <p className="mono eyebrow">
                {code(item.si, item.ei)}
                {item.ep.date && ` · ${item.ep.date}`}
              </p>
              <h2 className="player-title">{item.ep.title}</h2>
              <p className="player-tagline">{item.ep.tagline}</p>
              <p className="player-summary">{item.ep.summary}</p>
              {item.ep.metrics && <Metrics items={item.ep.metrics} />}
            </motion.div>
          )}
        </AnimatePresence>
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

        <AnimatePresence mode="wait" onExitComplete={rescueFocus}>
          {!ended && upNext && (
            <motion.button
              key={`next-${index}`}
              type="button"
              className="upnext"
              onClick={() => go(index + 1)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <svg className="upnext-ring" viewBox="0 0 44 44" aria-hidden>
                <circle cx="22" cy="22" r="18" className="ring-bg" />
                <circle cx="22" cy="22" r="18" className="ring-fg" strokeDasharray={ring} strokeDashoffset={ring * (left / EPISODE_SECONDS)} />
                <text x="22" y="26" textAnchor="middle">
                  {paused ? '❚❚' : Math.max(0, left)}
                </text>
              </svg>
              <span className="upnext-copy">
                <span className="mono">
                  {t.ui.upNext} · {code(upNext.si, upNext.ei)}
                </span>
                <strong>{upNext.ep.title}</strong>
              </span>
            </motion.button>
          )}
          {ended && (
            <motion.button key="close" type="button" className="btn btn-primary" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {t.ui.close}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
