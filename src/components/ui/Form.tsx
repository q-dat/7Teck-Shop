'use client';
import { Input as DaisyInput, Textarea as DaisyTextarea } from 'react-daisyui';
import type { ComponentProps } from 'react';

export function Input(props: ComponentProps<typeof DaisyInput>) {
  return <DaisyInput {...props} />;
}

export function Textarea(props: ComponentProps<typeof DaisyTextarea>) {
  return <DaisyTextarea {...props} />;
}
