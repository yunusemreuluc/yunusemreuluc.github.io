import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { asset, upper, useLang } from '../i18n';
import { CountUp, EASE, SplitTitle } from './fx';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const rise = { hidden: { opacity: 0, y: 26, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } } };

/** The pilot: resume summary over a parallax portrait, with drifting light and counting highlights. */
export default function Hero({ onPlay }: { onPlay: () => void }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const total = t.seasons.reduce((n, s) => n + s.episodes.length, 0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Pointer parallax on fine pointers: the portrait and the light drift a little toward the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 });
  const sy = useSpring(my, { stiffness: 70, damping: 20 });
  const tiltY = useTransform(sx, [-1, 1], [-5, 5]);
  const tiltX = useTransform(sy, [-1, 1], [4, -4]);
  const glowX = useTransform(sx, [-1, 1], ['-4%', '4%']);
  const chipX = useTransform(sx, [-1, 1], [14, -14]);

  return (
    <section
      id="pilot"
      ref={ref}
      className="hero"
      aria-labelledby="pilot-title"
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        mx.set((e.clientX / innerWidth) * 2 - 1);
        my.set((e.clientY / innerHeight) * 2 - 1);
      }}
    >
      <motion.div className="hero-light" style={{ x: glowX }} aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </motion.div>
      <div className="hero-sweep" aria-hidden />

      <motion.div className="hero-photo" style={reduced ? undefined : { y: photoY, scale: photoScale, opacity: fade }}>
        <motion.div
          className="hero-photo-inner"
          style={reduced ? undefined : { rotateY: tiltY, rotateX: tiltX, transformPerspective: 1200 }}
          initial={{ clipPath: 'inset(100% -40% -10% -40%)', opacity: 0 }}
          animate={{ clipPath: 'inset(-40% -40% -10% -40%)', opacity: 1 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.15 }}
        >
          <span className="hero-ring" aria-hidden />
          <img src={asset('portrait-720.webp')} srcSet={`${asset('portrait-720.webp')} 720w, ${asset('portrait-1100.webp')} 1100w`} sizes="(max-width: 900px) 90vw, 46vw" alt={t.photoAlt} />
          <motion.span className="hero-chip hero-chip-a mono" style={{ x: chipX }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            ● REC · S00E01
          </motion.span>
          <motion.span className="hero-chip hero-chip-b" style={{ x: chipX }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
            <strong>{t.highlights[0].value}</strong>
            <small>{t.highlights[0].label}</small>
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div className="hero-copy" style={reduced ? undefined : { y: copyY, opacity: fade }} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={rise} className="eyebrow mono">
          S00E01 · {upper(t.ui.pilot, lang)} · {t.ui.episodes(total)}
        </motion.p>
        <SplitTitle as="h1" text={t.name} className="hero-title" delay={0.25} />
        <motion.p variants={rise} className="hero-role">
          {t.role}
          <span className="hero-tag mono"> · {upper(t.ui.seriesTag, lang)}</span>
        </motion.p>
        {t.pilot.map((p) => (
          <motion.p key={p.slice(0, 20)} variants={rise} className="hero-text">
            {p}
          </motion.p>
        ))}
        <motion.div variants={rise} className="actions">
          <motion.button type="button" className="btn btn-primary btn-play" onClick={onPlay} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <span aria-hidden>▶</span> {t.ui.playAll}
          </motion.button>
          <motion.a className="btn" href={asset(t.cvFile)} download={t.cvFile} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <span aria-hidden>⤓</span> {t.ui.downloadCv}
          </motion.a>
          <a className="btn btn-ghost" href="#credits">
            {t.ui.contact}
          </a>
        </motion.div>
      </motion.div>

      <dl className="highlights">
        {t.highlights.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE }}
          >
            <dt>{h.label}</dt>
            <dd>
              <CountUp value={h.value} />
            </dd>
          </motion.div>
        ))}
      </dl>

      <motion.a className="scroll-hint mono" href="#guide" style={{ opacity: fade }} aria-hidden tabIndex={-1}>
        {t.ui.scrollHint}
        <span />
      </motion.a>
    </section>
  );
}
