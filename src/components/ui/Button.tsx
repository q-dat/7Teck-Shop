'use client';
import { Button as DaisyButton } from 'react-daisyui';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline' | 'buy' | 'plain' | 'unstyled';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-primary text-white border-none hover:bg-primary/90',
  ghost: 'bg-transparent text-primary border-primary/30 hover:bg-primary/10',
  outline: 'bg-transparent text-neutral-900 border-neutral-200 hover:bg-neutral-100',
  buy: 'bg-neutral-900 text-white border-none hover:bg-primary rounded-none',
  plain: '',
  unstyled: '',
};

type ButtonProps = Omit<ComponentProps<typeof DaisyButton>, 'variant'> & {
  variant?: Variant;
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
};

type UnstyledProps = ComponentProps<'button'> & {
  variant?: Variant;
  children?: ReactNode;
};

export default function Button(props: ButtonProps | UnstyledProps) {
  const { variant = 'plain', className = '', children, ...rest } = props as ButtonProps & UnstyledProps;
  const merged = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');

  // unstyled -> native button (no daisyui .btn), safe for wrapping images/icons
  if (variant === 'unstyled') {
    return (
      <button className={merged} {...(rest as ComponentProps<'button'>)}>
        {children}
      </button>
    );
  }

  return (
    <DaisyButton className={merged} {...(rest as Omit<ComponentProps<typeof DaisyButton>, 'variant'>)}>
      {children}
    </DaisyButton>
  );
}
