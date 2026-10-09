import { useEffect, useId, type RefObject } from 'react';
import { useIsPresent } from 'framer-motion';

/** Open dialogs, innermost last. Only the top one handles keys; scroll stays locked while any is open. */
const stack: string[] = [];
let savedOverflow = '';

function push(id: string) {
  if (stack.length === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  stack.push(id);
}

function pop(id: string) {
  const i = stack.indexOf(id);
  if (i === -1) return;
  stack.splice(i, 1);
  if (stack.length === 0) document.body.style.overflow = savedOverflow;
}

/**
 * Shared modal behaviour: focus a control on open, keep Tab inside, close on Escape, lock page scroll.
 * A dialog that is animating out (AnimatePresence exit) stops trapping immediately.
 */
export function useDialog(root: RefObject<HTMLElement | null>, onClose: () => void, initial?: RefObject<HTMLElement | null>) {
  const id = useId();
  const present = useIsPresent();

  useEffect(() => {
    if (!present) return;
    push(id);
    (initial?.current ?? root.current)?.focus({ preventScroll: true });
    return () => pop(id);
    // Focus target refs are stable for the dialog's lifetime.
  }, [present, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id || !root.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(root.current.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), a[href]'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = root.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [present, id, root, onClose]);
}

/** True when this dialog is the innermost open one — for dialog-specific shortcuts. */
export function isTopDialog(el: HTMLElement | null) {
  return !!el && stack.length > 0 && el.contains(document.activeElement ?? null);
}
