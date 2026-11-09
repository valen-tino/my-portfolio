import '@testing-library/jest-dom/vitest';

// Polyfill layout methods required by ProseMirror / TipTap in jsdom
function getBoundingClientRect(): DOMRect {
  const rec = {
    x: 0,
    y: 0,
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0
  };
  return { ...rec, toJSON: () => rec };
}

class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
  item(index: number): DOMRect | null {
    return this[index] || null;
  }
}

if (typeof document !== 'undefined') {
  document.elementFromPoint = () => null;
  HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect;
  HTMLElement.prototype.getClientRects = () => new FakeDOMRectList();
  Range.prototype.getBoundingClientRect = getBoundingClientRect;
  Range.prototype.getClientRects = () => new FakeDOMRectList();
  if (typeof Text !== 'undefined') {
    (Text.prototype as any).getClientRects = () => new FakeDOMRectList();
    (Text.prototype as any).getBoundingClientRect = getBoundingClientRect;
  }
}
