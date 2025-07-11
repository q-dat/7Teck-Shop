'use client';
import React, { ReactNode } from 'react';
import { Input } from 'react-daisyui';

interface InputFormProps {
  id?: string | number;
  name?: string;
  className?: string;
  type: string;
  placeholder: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  classNameLabel: string;
  required?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  name,
  className = '',
  type = 'text',
  placeholder = '',
  value,
  onChange,
  classNameLabel,
  required = false,
}) => {
  return (
    <div className="relative">
      <Input
        id=""
        name={name}
        className={`peer w-full focus:outline-none ${className}`}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
      />
      <label
        className={`pointer-events-none absolute -top-2 left-2 rounded-sm px-1 py-0 text-sm text-primary transition-all duration-500 ease-in-out peer-placeholder-shown:top-3 peer-placeholder-shown:rounded-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-focus:-top-4 peer-focus:text-sm peer-focus:text-primary dark:peer-placeholder-shown:text-primary dark:peer-focus:text-primary ${classNameLabel}`}
      >
        {placeholder}
      </label>
    </div>
  );
};

export default InputForm;
