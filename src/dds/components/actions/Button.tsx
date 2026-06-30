import React from 'react';
import { cn, createVariants } from '../../utils';

export type ButtonVariant = 'primary' | 'secondary' | 'cta';
export type ButtonSize = 'default' | 'lg';

const buttonVariants = createVariants({
  base: cn(
    'inline-flex items-center justify-center gap-phd-inline-xs',
    'min-h-[48px] px-phd-5 py-phd-3',
    'phd-chamfer-sm phd-focus-ring phd-motion-press phd-transition-fast',
    'font-phd-body text-base leading-none',
    'disabled:opacity-[var(--phd-opacity-disabled)] disabled:shadow-phd-none disabled:pointer-events-none',
  ),
  variants: {
    variant: {
      primary: cn(
        'phd-material-metal-accent font-phd-semibold text-phd-inverse',
        'shadow-phd-accent',
        'hover:bg-phd-accent-brand-hover',
      ),
      secondary: cn(
        'bg-phd-surface-graphite-deep border border-phd-border-default',
        'shadow-phd-contact font-phd-medium text-phd-primary',
        'phd-overlay-hover hover:shadow-phd-raised',
      ),
      cta: cn(
        'phd-material-metal-accent font-phd-semibold text-phd-inverse',
        'shadow-phd-accent w-full',
        'hover:bg-phd-accent-brand-hover',
      ),
    },
    size: {
      default: '',
      lg: 'px-phd-8 py-phd-5 md:px-phd-8 md:py-phd-5',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'cta',
      fullWidth: 'false',
      class: 'w-full',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'default',
    fullWidth: 'false',
  },
});

function HexSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-6 w-6 phd-motion-hex-rotate shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.5L19.5 7V17L12 21.5L4.5 17V7L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="bevel"
      />
    </svg>
  );
}

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export type ButtonProps = ButtonBaseProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' })
  );

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'default',
      fullWidth,
      loading = false,
      iconLeft,
      iconRight,
      as = 'button',
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const isCta = variant === 'cta';
    const resolvedFullWidth = fullWidth ?? isCta;
    const isDisabled = Boolean(disabled || loading);

    const classes = buttonVariants({
      variant: variant as ButtonVariant,
      size: size as ButtonSize,
      fullWidth: resolvedFullWidth ? 'true' : 'false',
      class: className,
    });

    const content = loading ? (
      <>
        <HexSpinner />
        {children}
      </>
    ) : (
      <>
        {iconLeft}
        {children}
        {iconRight}
      </>
    );

    if (as === 'a') {
      const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          aria-busy={loading || undefined}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type ?? 'button'}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...buttonProps}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';
