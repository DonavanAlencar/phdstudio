import React, { useEffect, useRef, useState } from 'react';

const ScrollVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Scroll state
  const scrollProgressTargetRef = useRef(0); // 0 -> topo, 1 -> fundo
  const scrollProgressSmoothedRef = useRef(0);
  const scrollableHeightRef = useRef(0);
  const playedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const computeScrollable = () => {
      const doc = document.documentElement;
      const scrollable =
        Math.max(doc.scrollHeight, document.body?.scrollHeight || 0) -
        window.innerHeight;
      scrollableHeightRef.current = scrollable > 0 ? scrollable : 0;
    };

    const updateScrollTarget = () => {
      const scrollable = scrollableHeightRef.current;
      if (scrollable <= 0) {
        scrollProgressTargetRef.current = 0;
        return;
      }
      const y = window.scrollY ?? window.pageYOffset ?? 0;
      const clamped = Math.min(Math.max(y, 0), scrollable);
      scrollProgressTargetRef.current = clamped / scrollable;
    };

    const handleScroll = () => {
      updateScrollTarget();
    };

    const handleResize = () => {
      computeScrollable();
      updateScrollTarget();
    };

    computeScrollable();
    updateScrollTarget();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    let frameCount = 0;
    const loop = () => {
      frameCount += 1;
      // Recalcula altura rolável a cada ~30 frames para conteúdo dinâmico
      if (frameCount % 30 === 0) {
        computeScrollable();
        updateScrollTarget();
      }

      const video = videoRef.current;
      const dur = duration ?? 0;
      if (video && dur > 0) {
        const current = scrollProgressSmoothedRef.current;
        const target = scrollProgressTargetRef.current;
        // Alpha maior = segue o scroll mais de perto, ainda suave (evita travadas)
        const alpha = 0.4;
        const next = current + (target - current) * alpha;
        scrollProgressSmoothedRef.current = next;

        const targetTime = next * dur;
        if (Number.isFinite(targetTime)) {
          const diff = Math.abs(video.currentTime - targetTime);
          if (diff > 0.015) {
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

  const tryPlay = () => {
    const video = videoRef.current;
    if (!video || playedRef.current) return;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        playedRef.current = true;
      }).catch(() => {});
    } else {
      playedRef.current = true;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      setDuration(video.duration || 0);
      // Sincroniza posição suavizada com o scroll atual para evitar salto inicial
      const doc = document.documentElement;
      const scrollable = Math.max(doc.scrollHeight, document.body?.scrollHeight || 0) - window.innerHeight;
      if (scrollable > 0) {
        const y = window.scrollY ?? window.pageYOffset ?? 0;
        const progress = Math.min(Math.max(y / scrollable, 0), 1);
        scrollProgressTargetRef.current = progress;
        scrollProgressSmoothedRef.current = progress;
        scrollableHeightRef.current = scrollable;
      }
      // Mobile: inicia reprodução muda para o vídeo atualizar ao dar seek
      tryPlay();
    }
  };

  // Mobile: em muitos navegadores o autoplay só funciona após interação; tenta play no primeiro toque/scroll
  useEffect(() => {
    const onFirstInteraction = () => {
      tryPlay();
      window.removeEventListener('touchstart', onFirstInteraction, listenerOpts);
      window.removeEventListener('scroll', onFirstInteraction, listenerOpts);
    };
    const listenerOpts: AddEventListenerOptions = { passive: true };
    window.addEventListener('touchstart', onFirstInteraction, listenerOpts);
    window.addEventListener('scroll', onFirstInteraction, listenerOpts);
    return () => {
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('scroll', onFirstInteraction);
    };
  }, []);

  // Garante atributos para iOS/Android (inline play, sem fullscreen forçado)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('muted', 'true');
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black min-h-[100vh] min-h-[100dvh]"
      aria-hidden="true"
      style={{ transform: 'translateZ(0)' }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover scale-[1.25] min-h-[100%] min-w-[100%]"
        src="/videos/background.mp4"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        onLoadedMetadata={handleLoadedMetadata}
      />
      {/* Optional subtle overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default ScrollVideoBackground;

