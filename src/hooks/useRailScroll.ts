import { useCallback, useRef } from 'react';

/**
 * Makes a horizontal rail scroll with the mouse wheel (vertical wheel → sideways) and by
 * click-dragging. At either end the wheel falls through to the page, so it never traps scrolling.
 * A drag longer than a few pixels swallows the click that follows, so cards don't open by accident.
 */
function attach(el: HTMLElement) {
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // pinch-zoom or a real sideways gesture
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    // deltaMode 1 = lines, 2 = pages (some wheel settings); convert both to pixels.
    const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * el.clientWidth : e.deltaY;
    const atStart = el.scrollLeft <= 0 && delta < 0;
    const atEnd = el.scrollLeft >= max - 1 && delta > 0;
    if (atStart || atEnd) return;
    e.preventDefault();
    el.scrollBy({ left: delta, behavior: 'auto' });
  };

  let startX = 0;
  let startLeft = 0;
  let pointer: number | null = null;
  let moved = false;
  // Only the click fired right after a real drag is swallowed — never a later keyboard or touch activation.
  let swallowUntil = 0;

  const onDown = (e: PointerEvent) => {
    moved = false;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    pointer = e.pointerId;
    startX = e.clientX;
    startLeft = el.scrollLeft;
  };
  const onMove = (e: PointerEvent) => {
    if (pointer === null || e.pointerId !== pointer) return;
    if (e.buttons === 0) {
      end();
      return;
    }
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) {
      moved = true;
      el.classList.add('is-dragging');
    }
    el.scrollLeft = startLeft - dx;
  };
  const end = () => {
    if (pointer === null) return;
    pointer = null;
    if (moved) swallowUntil = performance.now() + 250;
    moved = false;
    el.classList.remove('is-dragging');
  };
  const onClick = (e: MouseEvent) => {
    if (e.detail > 0 && performance.now() < swallowUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
    swallowUntil = 0;
  };

  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  addEventListener('blur', end);
  el.addEventListener('click', onClick, true);
  return () => {
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('pointerdown', onDown);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', end);
    removeEventListener('pointercancel', end);
    removeEventListener('blur', end);
    el.removeEventListener('click', onClick, true);
  };
}

/** Callback ref version: rails remount when the season changes, so listeners follow the element. */
export function useRailScroll() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: HTMLElement | null) => {
    cleanup.current?.();
    cleanup.current = el ? attach(el) : null;
  }, []);
}
