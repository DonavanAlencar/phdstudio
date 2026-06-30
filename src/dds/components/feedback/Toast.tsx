import React, { useCallback, useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn, createVariants } from '../../utils';
import { durationMs } from '../../motion/durations';
import { exitPatterns, enterPatterns } from '../../motion/physics';

export type ToastVariant = 'success' | 'error' | 'info';

const toastVariants = createVariants({
  base: cn(
    'flex items-start gap-phd-inline-sm p-phd-compact phd-chamfer-md',
    'phd-material-vidro-fume w-full max-w-[400px]',
  ),
  variants: {
    variant: {
      success: 'border-l-[3px] border-l-phd-state-success',
      error: 'border-l-[3px] border-l-phd-state-error',
      info: 'border-l-[3px] border-l-phd-state-info',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const iconMap = {
  success: Check,
  error: AlertCircle,
  info: Info,
} as const;

const iconColorMap = {
  success: 'text-phd-state-success',
  error: 'text-phd-state-error',
  info: 'text-phd-state-info',
} as const;

type ToastPhase = 'enter' | 'visible' | 'exit' | 'gone';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  onDismiss?: () => void;
  /** Duração antes do auto-dismiss; padrão via token `--phd-duration-toast` */
  autoDismissMs?: number;
  dismissible?: boolean;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    variant = 'info',
    onDismiss,
    autoDismissMs = durationMs.toast,
    dismissible = true,
    className,
    children,
    ...props
  },
  ref,
) {
  const [phase, setPhase] = useState<ToastPhase>('enter');
  const Icon = iconMap[variant];

  const startExit = useCallback(() => {
    setPhase((current) => (current === 'gone' || current === 'exit' ? current : 'exit'));
  }, []);

  useEffect(() => {
    if (phase !== 'enter') return undefined;
    const frame = requestAnimationFrame(() => setPhase('visible'));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (!autoDismissMs || !onDismiss || phase === 'exit' || phase === 'gone') return undefined;
    const timer = window.setTimeout(startExit, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss, phase, startExit]);

  const handleAnimationEnd = () => {
    if (phase === 'enter') {
      setPhase('visible');
      return;
    }
    if (phase === 'exit') {
      setPhase('gone');
      onDismiss?.();
    }
  };

  const handleDismiss = () => {
    startExit();
  };

  if (phase === 'gone') return null;

  const motionClass =
    phase === 'exit'
      ? exitPatterns.recede
      : phase === 'enter'
        ? enterPatterns.emergeSubtle
        : '';

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn('relative z-phd-toast', className)}
      {...props}
    >
      <div
        className={cn(toastVariants({ variant: variant as ToastVariant }), motionClass)}
        onAnimationEnd={handleAnimationEnd}
      >
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColorMap[variant])} aria-hidden="true" />
        <div className="flex-1 min-w-0">{children}</div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center',
              'text-phd-tertiary hover:text-phd-primary phd-focus-ring phd-transition-fast',
            )}
            aria-label="Fechar notificação"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';
