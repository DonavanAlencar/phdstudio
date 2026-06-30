import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn, createVariants } from '../../utils';

export type ToastVariant = 'success' | 'error' | 'info';

const toastVariants = createVariants({
  base: cn(
    'flex items-start gap-phd-inline-sm p-phd-compact phd-chamfer-md',
    'phd-material-vidro-fume w-full max-w-[400px]',
    'phd-motion-emerge-subtle',
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

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  onDismiss?: () => void;
  autoDismissMs?: number;
  dismissible?: boolean;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    variant = 'info',
    onDismiss,
    autoDismissMs = 5000,
    dismissible = true,
    className,
    children,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[variant];

  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return undefined;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn('relative z-phd-toast', className)}
      {...props}
    >
      <div className={toastVariants({ variant: variant as ToastVariant })}>
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
