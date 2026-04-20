import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

type FloatingWhatsAppButtonProps = {
  phoneE164?: string;
  message?: string;
  className?: string;
  hideOnPathPrefixes?: string[];
};

const DEFAULT_PHONE = '5511972158877';
const DEFAULT_MESSAGE =
  'Olá, vim pelo site da PHD Studio e gostaria de entender melhor como vocês podem ajudar meu negócio.';

function buildWhatsAppUrl(phoneE164: string, message: string) {
  const normalizedPhone = phoneE164.replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${text}`;
}

export default function FloatingWhatsAppButton({
  phoneE164 = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  className = '',
  hideOnPathPrefixes = ['/admin', '/logs', '/produtos', '/chat-diagnostico'],
}: FloatingWhatsAppButtonProps) {
  const location = useLocation();
  const [isNearFooter, setIsNearFooter] = useState(false);

  const shouldHide = useMemo(() => {
    const path = location?.pathname || '/';
    return hideOnPathPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }, [hideOnPathPrefixes, location?.pathname]);

  const href = useMemo(() => buildWhatsAppUrl(phoneE164, message), [phoneE164, message]);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsNearFooter(Boolean(entry?.isIntersecting));
      },
      {
        // Sobe antes de encostar nos ícones/links do rodapé (ajuste fino)
        root: null,
        threshold: 0,
        rootMargin: '0px 0px 140px 0px',
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (shouldHide) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir conversa no WhatsApp com a PHD Studio"
      title="Falar no WhatsApp"
      className={[
        'fixed right-[30px] z-[60]',
        'h-14 w-14 md:h-16 md:w-16',
        'grid place-items-center rounded-full',
        'bg-[#25D366]',
        'shadow-[0_14px_36px_rgba(0,0,0,0.45)]',
        'ring-1 ring-white/10',
        'transition-[transform,box-shadow,filter,bottom] duration-300 ease-out',
        'hover:scale-[1.06]',
        'hover:shadow-[0_18px_44px_rgba(0,0,0,0.55)]',
        'active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
        'backdrop-blur-sm',
        'select-none',
        className,
      ].join(' ')}
      style={{
        bottom: isNearFooter ? '104px' : '30px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/14 to-transparent opacity-100" />
      <span className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />

      {/* WhatsApp official mark (SVG) */}
      <svg
        viewBox="0 0 32 32"
        width="26"
        height="26"
        className="relative z-10 md:h-7 md:w-7"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#FFFFFF"
          d="M19.11 17.26c-.28-.14-1.66-.82-1.92-.92-.26-.1-.45-.14-.64.14-.19.28-.74.92-.91 1.11-.17.19-.33.21-.62.07-.28-.14-1.2-.44-2.29-1.41-.85-.76-1.43-1.7-1.6-1.99-.17-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.91.14.19 1.97 3.01 4.77 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.9-1.33.23-.65.23-1.21.16-1.33-.07-.12-.26-.19-.54-.33z"
        />
        <path
          fill="#FFFFFF"
          d="M16.01 5.33c-5.89 0-10.67 4.79-10.67 10.67 0 1.87.49 3.7 1.42 5.31L5.28 26.7l5.56-1.46c1.55.85 3.3 1.3 5.17 1.3 5.89 0 10.67-4.79 10.67-10.67 0-5.89-4.79-10.67-10.67-10.67zm0 19.42c-1.67 0-3.3-.45-4.72-1.31l-.34-.2-3.3.87.88-3.22-.22-.33c-.94-1.44-1.44-3.11-1.44-4.84 0-4.95 4.03-8.97 8.97-8.97s8.97 4.03 8.97 8.97-4.03 8.97-8.97 8.97z"
        />
      </svg>

      <span className="sr-only">WhatsApp</span>
    </a>
  );
}

