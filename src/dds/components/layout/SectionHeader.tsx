import React from 'react';
import { cn } from '../../utils';
import { Heading } from '../typography/Heading';
import { Body } from '../typography/Body';
import { Label } from '../typography/Label';

export type SectionHeaderAlign = 'left' | 'center';

interface SectionHeaderContextValue {
  align: SectionHeaderAlign;
  titleId?: string;
}

const SectionHeaderContext = React.createContext<SectionHeaderContextValue | null>(null);

function useSectionHeaderContext(slot: string): SectionHeaderContextValue {
  const context = React.useContext(SectionHeaderContext);
  if (context == null) {
    throw new Error(`${slot} must be used within <SectionHeader>`);
  }
  return context;
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alinhamento do bloco — `center` aplica text-align e max-width na descrição (CES-020). */
  align?: SectionHeaderAlign;
  /** ID padrão do título para `aria-labelledby` na `Section` pai. */
  titleId?: string;
}

/**
 * CES-020 — `phd-layout-section-header`
 *
 * Cabeçalho padronizado de seção por composição exclusiva de Heading, Body e Label.
 * Nenhuma regra tipográfica é definida neste módulo — apenas layout e contexto de alinhamento.
 */
const SectionHeaderRoot = React.forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { align = 'left', titleId, className, children, ...props },
  ref,
) {
  return (
    <SectionHeaderContext.Provider value={{ align, titleId }}>
      <div
        ref={ref}
        className={cn('mb-phd-stack-lg', align === 'center' && 'text-center', className)}
        {...props}
      >
        {children}
      </div>
    </SectionHeaderContext.Provider>
  );
});

export type SectionHeaderEyebrowProps = React.ComponentPropsWithoutRef<typeof Label>;

const SectionHeaderEyebrow = React.forwardRef<HTMLElement, SectionHeaderEyebrowProps>(
  function SectionHeaderEyebrow({ spacing = 'default', className, ...props }, ref) {
    useSectionHeaderContext('SectionHeader.Eyebrow');

    return <Label ref={ref} spacing={spacing} className={className} {...props} />;
  },
);

export type SectionHeaderTitleProps = Omit<
  React.ComponentPropsWithoutRef<typeof Heading>,
  'level' | 'centered'
>;

const SectionHeaderTitle = React.forwardRef<HTMLElement, SectionHeaderTitleProps>(
  function SectionHeaderTitle({ spacing = 'default', id, className, ...props }, ref) {
    const { align, titleId } = useSectionHeaderContext('SectionHeader.Title');

    return (
      <Heading
        ref={ref}
        level={2}
        centered={align === 'center'}
        spacing={spacing}
        id={id ?? titleId}
        className={className}
        {...props}
      />
    );
  },
);

export type SectionHeaderDescriptionProps = React.ComponentPropsWithoutRef<typeof Body>;

const SectionHeaderDescription = React.forwardRef<HTMLElement, SectionHeaderDescriptionProps>(
  function SectionHeaderDescription(
    { muted = true, size = 'default', spacing = 'none', className, ...props },
    ref,
  ) {
    const { align } = useSectionHeaderContext('SectionHeader.Description');

    return (
      <Body
        ref={ref}
        muted={muted}
        size={size}
        spacing={spacing}
        className={cn(align === 'center' && 'mx-auto max-w-phd-narrow', className)}
        {...props}
      />
    );
  },
);

SectionHeaderRoot.displayName = 'SectionHeader';
SectionHeaderEyebrow.displayName = 'SectionHeader.Eyebrow';
SectionHeaderTitle.displayName = 'SectionHeader.Title';
SectionHeaderDescription.displayName = 'SectionHeader.Description';

type SectionHeaderComponent = typeof SectionHeaderRoot & {
  Eyebrow: typeof SectionHeaderEyebrow;
  Title: typeof SectionHeaderTitle;
  Description: typeof SectionHeaderDescription;
};

export const SectionHeader = Object.assign(SectionHeaderRoot, {
  Eyebrow: SectionHeaderEyebrow,
  Title: SectionHeaderTitle,
  Description: SectionHeaderDescription,
}) as SectionHeaderComponent;
