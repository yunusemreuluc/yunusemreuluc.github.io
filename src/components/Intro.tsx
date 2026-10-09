import { useEffect, useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LangSwitch, upper, useLang } from '../i18n';
import { EASE } from './fx';

/**
 * Opening titles, played like switching on an old CRT:
 * dark → a bright line opens into a screen → static → channel ident → the name, letter by letter → ▶.
 */
const BEATS = [
  { at: 250, beat: 1 }, // power line
  { at: 900, beat: 2 }, // screen opens + static
  { at: 1700, beat: 3 }, // channel ident
  { at: 2500, beat: 4 }, // name
  { at: 3700, beat: 5 }, // tag + role
  { at: 4500, beat: 6 }, // play button
];

export default function Intro({ onDone }: { onDone: () => void }) {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(reduced ? 6 : 0);
  const play = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  useDialog(root, onDone, skip);

  useEffect(() => {
    if (reduced) return;
    const timers = BEATS.map(({ at, beat }) => setTimeout(() => setBeat(beat), at));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    if (beat === 6) play.current?.focus({ preventScroll: true });
  }, [beat]);

  const [first, ...rest] = t.name.split(' ');
  const name = upper(first, lang);

  return (
    <motion.div
      ref={root}
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label={t.ui.introLabel}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/* CRT power-on: a hairline that opens vertically into the screen */}
      <motion.div
        className="crt"
        initial={{ scaleX: 0, scaleY: 0.004, opacity: 0 }}
        animate={beat >= 2 ? { scaleX: 1, scaleY: 1, opacity: 1 } : beat >= 1 ? { scaleX: 1, scaleY: 0.004, opacity: 1 } : {}}
        transition={{ duration: beat >= 2 ? 0.55 : 0.45, ease: [0.7, 0, 0.2, 1] }}
        style={beat === 1 ? { background: '#fff3d6', boxShadow: '0 0 40px 8px rgba(245,179,66,0.9)' } : undefined}
      >
        <AnimatePresence>
          {beat === 2 && <motion.div key="static" className="static" initial={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
        </AnimatePresence>
        <div className="crt-glow" />
        <div className="crt-lines" />
      </motion.div>

      <div className="intro-stage">
        <AnimatePresence mode="wait">
          {beat === 3 && (
            <motion.p
              key="ch"
              className="intro-channel mono"
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.5em' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.6 }}
            >
              <span className="lamp" /> {upper(t.ui.channel, lang)}
            </motion.p>
          )}
        </AnimatePresence>

        {beat >= 4 && (
          <div className="intro-title">
            <h1 className="intro-name" aria-label={t.name}>
              {name.split('').map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  aria-hidden
                  initial={{ opacity: 0, y: 40, filter: 'blur(16px)', scale: 1.4 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="intro-sub"
              initial={{ opacity: 0, letterSpacing: '1.2em' }}
              animate={beat >= 5 ? { opacity: 1, letterSpacing: '0.5em' } : {}}
              transition={{ duration: 1, ease: EASE }}
            >
              {upper(rest.join(' '), lang)} · {upper(t.ui.seriesTag, lang)}
            </motion.p>
            <motion.p className="intro-role mono" initial={{ opacity: 0, y: 10 }} animate={beat >= 5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.3 }}>
              {t.role} · {t.stack.slice(0, 3).join(' · ')}
            </motion.p>
          </div>
        )}

        <motion.div className="intro-play" initial={{ opacity: 0, scale: 0.85 }} animate={beat >= 6 ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, ease: EASE }}>
          <button ref={play} type="button" className="btn btn-primary btn-play" onClick={onDone} tabIndex={beat >= 6 ? 0 : -1}>
            <span aria-hidden>▶</span> {t.ui.pressPlay}
          </button>
        </motion.div>
      </div>

      <div className="intro-lang">
        <LangSwitch />
      </div>
      <button ref={skip} type="button" className="intro-skip mono" onClick={onDone}>
        {t.ui.skipIntro} ⏭
      </button>
    </motion.div>
  );
}
