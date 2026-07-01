import { useEffect, useRef, useState, useCallback } from 'react';
import { FiX, FiPlus, FiMinus, FiRotateCcw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getProductImage } from '@/lib/images';

interface LightboxImage {
  url?: string | null;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  productName: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const STEP = 0.5;

/**
 * Fullscreen image viewer with explicit zoom in / zoom out / reset controls.
 * Works with both mouse (wheel, drag, double-click) and touch (drag-to-pan,
 * double-tap). Provides the "zoom out" affordance the hover-zoom lacks.
 */
export function ImageLightbox({ images, index, onIndexChange, onClose, productName }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [errored, setErrored] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Reset the broken-image flag whenever the shown image changes.
  useEffect(() => setErrored(false), [index]);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setScale((s) => Math.min(MAX_SCALE, +(s + STEP).toFixed(2))), []);
  const zoomOut = useCallback(
    () =>
      setScale((s) => {
        const next = Math.max(MIN_SCALE, +(s - STEP).toFixed(2));
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      }),
    []
  );

  const go = useCallback(
    (dir: number) => {
      if (images.length < 2) return;
      reset();
      onIndexChange((index + dir + images.length) % images.length);
    },
    [images.length, index, onIndexChange, reset]
  );

  // Keyboard shortcuts + lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-' || e.key === '_') zoomOut();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, zoomIn, zoomOut, go]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const current = images[index] || images[0];
  const canReset = scale !== 1 || offset.x !== 0 || offset.y !== 0;
  const src = errored || !current?.url ? getProductImage(productName, index) : current.url;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="truncate pr-4 text-sm font-medium">
          {images.length > 1 ? `${index + 1} / ${images.length}` : productName}
        </span>
        <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
          <FiX className="h-6 w-6" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex-1 overflow-hidden"
        onWheel={onWheel}
        onDoubleClick={() => (scale > 1 ? reset() : setScale(2))}
      >
        <div
          className="flex h-full w-full touch-none select-none items-center justify-center p-4"
          style={{ cursor: scale > 1 ? (drag.current ? 'grabbing' : 'grab') : 'zoom-in' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => scale === 1 && setScale(2)}
        >
          <img
            src={src}
            alt={productName}
            draggable={false}
            onError={() => setErrored(true)}
            className="max-h-full max-w-full select-none object-contain transition-transform duration-150 ease-out"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
          />
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-2 py-4 sm:py-5">
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-40"
        >
          <FiMinus className="h-5 w-5" />
        </button>
        <span className="min-w-[54px] text-center text-sm font-semibold text-white">{Math.round(scale * 100)}%</span>
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-40"
        >
          <FiPlus className="h-5 w-5" />
        </button>
        <button
          onClick={reset}
          disabled={!canReset}
          className="ml-2 flex h-11 items-center gap-1.5 rounded-full bg-white/15 px-4 text-sm font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-40"
        >
          <FiRotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}
