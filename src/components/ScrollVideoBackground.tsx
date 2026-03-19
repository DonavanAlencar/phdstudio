import React, { useEffect, useRef, useState } from 'react';

const ScrollVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Scroll state
  const scrollProgressTargetRef = useRef(0); // 0 -> topo, 1 -> fundo
  const scrollProgressSmoothedRef = useRef(0);
  const scrollableHeightRef = useRef(0);

  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const computeScrollable = () => {
      const doc = document.documentElement;
      const scrollable =
        Math.max(doc.scrollHeight, document.body?.scrollHeight || 0) -
        window.innerHeight;
      scrollableHeightRef.current = scrollable > 0 ? scrollable : 0;
    };

    const handleScroll = () => {
      if (!duration || duration <= 0) return;

      const scrollable = scrollableHeightRef.current;
      if (scrollable <= 0) {
        scrollProgressTargetRef.current = 0;
        return;
      }

      const y = window.scrollY || window.pageYOffset || 0;
      const clamped = Math.min(Math.max(y, 0), scrollable);
      scrollProgressTargetRef.current = clamped / scrollable;
    };

    const handleResize = () => {
      computeScrollable();
      handleScroll();
    };

    computeScrollable();
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const loop = () => {
      const video = videoRef.current;
      if (video && duration && duration > 0) {
        // Suaviza o movimento com um lerp simples
        const current = scrollProgressSmoothedRef.current;
        const target = scrollProgressTargetRef.current;
        const alpha = 0.15; // quanto maior, mais rápido segue o scroll
        const next = current + (target - current) * alpha;
        scrollProgressSmoothedRef.current = next;

        const targetTime = next * duration;

        if (!Number.isNaN(targetTime) && isFinite(targetTime)) {
          const diff = Math.abs(video.currentTime - targetTime);
          if (diff > 0.02) {
            video.currentTime = targetTime;
          }
        }
      }

      rafIdRef.current = window.requestAnimationFrame(loop);
    };

    rafIdRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [duration]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover scale-[1.25]"
        src="/videos/background.mp4"
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
      />
      {/* Optional subtle overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default ScrollVideoBackground;

