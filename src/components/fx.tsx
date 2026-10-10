import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import type { Metric } from '../content/types';
import { EPISODE_IMAGES } from '../content/images';
import { asset } from '../i18n';

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Splits a heading into words that rise out of a mask one after another. */
export function SplitTitle({ text, as: Tag = 'h2', className, delay = 0 }: { text: string; as?: 'h1' | 'h2' | 'h3'; className?: string; delay?: number }) {
  const M = motion[Tag];
  const words = text.split(' ');
  return (
    <M className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ staggerChildren: 0.07, delayChildren: delay }}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {/* Padding on the mask leaves room for accents above capitals (İ, Ş, Ü). */}
          <span aria-hidden className="word-mask">
            <motion.span className="word" variants={{ hidden: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: EASE } } }}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </M>
  );
}

/** Counts a metric like "91.54%" or "~67k" up from zero, keeping its prefix, suffix and decimal style. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const match = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  const [shown, setShown] = useState(match && !reduced ? value.replace(match[2], '0') : value);

  useEffect(() => {
    if (!match || !inView || reduced) return;
    const [, pre, num, post] = match;
    // The last separator is a thousands separator when exactly three digits follow it
    // (1,523 / 1.523) — unless the integer part is 0 (0.960 / 0,960 are decimals).
    const at = Math.max(num.lastIndexOf('.'), num.lastIndexOf(','));
    let group = '';
    let dec = '';
    let decimals = 0;
    if (at >= 0) {
      const tail = num.slice(at + 1);
      if (tail.length === 3 && num.slice(0, at) !== '0') group = num[at];
      else {
        dec = num[at];
        decimals = tail.length;
      }
    }
    const raw = Number((group ? num.split(group).join('') : num).replace(dec || '#', '.'));
    if (!Number.isFinite(raw)) return;
    const controls = animate(0, raw, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        let s = v.toFixed(decimals);
        if (dec) s = s.replace('.', dec);
        if (group) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, group);
        setShown(`${pre}${s}${post}`);
      },
    });
    return () => controls.stop();
    // `match` is derived from `value`, which is already a dependency.
  }, [inView, value, reduced]);

  return <span ref={ref}>{match && !reduced ? shown : value}</span>;
}

export function Metrics({ items }: { items: Metric[] }) {
  return (
    <dl className="metrics">
      {items.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
        >
          <dt>{m.label}</dt>
          <dd>
            <CountUp value={m.value} />
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

/** Per-season colour grading for the generated poster art. */
export const GRADES = [
  { a: '#f5b342', b: '#5a2a06', c: '#120a04' },
  { a: '#5fd4c8', b: '#0b3d44', c: '#05100f' },
  { a: '#b993ff', b: '#2f1b5c', c: '#0a0714' },
  { a: '#ff7a59', b: '#5a1708', c: '#120604' },
  { a: '#7fb6ff', b: '#13305c', c: '#050a14' },
];

/**
 * Key art for an episode: the episode's image (photo-style fill, or a framed screenshot/icon),
 * over a season-graded gradient with a light leak, scanlines and a huge episode number.
 */
export function PosterArt({ season, episode, id }: { season: number; episode: number; id?: string }) {
  const g = GRADES[season % GRADES.length];
  const img = id ? EPISODE_IMAGES[id] : undefined;
  return (
    <div
      className="poster-art"
      style={{
        background: `radial-gradient(120% 80% at 80% 0%, ${g.b}, transparent 65%), radial-gradient(90% 70% at 0% 100%, ${g.b}aa, transparent 70%), linear-gradient(160deg, ${g.c}, #07080b)`,
      }}
      aria-hidden
    >
      {img && (
        <img
          className={`poster-img${img.fit === 'contain' ? ' poster-img-framed' : ''}${img.dim ? ' poster-img-dim' : ''}`}
          src={asset(img.src)}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          style={img.fit === 'contain' ? { boxShadow: `0 0 80px ${g.a}33` } : undefined}
        />
      )}
      <span className="poster-leak" style={{ background: `linear-gradient(100deg, transparent 30%, ${g.a}55, transparent 70%)` }} />
      <span className="poster-num" style={{ WebkitTextStroke: `1px ${g.a}66` }}>
        {String(episode + 1).padStart(2, '0')}
      </span>
      <span className="poster-scan" />
    </div>
  );
}
