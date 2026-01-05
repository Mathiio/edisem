import { Input, Textarea, TextAreaProps, InputProps } from '@heroui/react';
import { useEffect, useRef } from 'react';

interface AutoResizingFieldProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  textareaProps?: Omit<TextAreaProps, 'value' | 'onChange' | 'placeholder'>;
  inputProps?: Omit<InputProps, 'value' | 'isReadOnly' | 'onChange' | 'placeholder'>;
  isReadOnly?: boolean;
}

export default function AutoResizingField({
  value,
  onChange,
  placeholder,
  textareaProps = {},
  inputProps = {},
  isReadOnly = true,
}: AutoResizingFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add safety check for value - ensure it's always a string
  const safeValue = typeof value === 'string' ? value : String(value || '');

  // Always use Textarea when editable, Input only when read-only and short
  const shouldUseTextarea = !isReadOnly || safeValue.split('\n').length > 1 || safeValue.length > 50;

  useEffect(() => {
    if (textareaRef.current && shouldUseTextarea) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [safeValue, shouldUseTextarea]);

  if (shouldUseTextarea) {
    return (
      <Textarea
        ref={textareaRef}
        value={safeValue}
        isReadOnly={isReadOnly}
        onChange={onChange}
        placeholder={placeholder}
        {...textareaProps}
        style={{ overflow: 'hidden', ...textareaProps.style }}
      />
    );
  }

  return (
    <Input
      value={safeValue}
      isReadOnly={isReadOnly}
      onChange={onChange}
      placeholder={placeholder}
      type='text'
      {...inputProps}
      className={`min-h-[50px] ${inputProps.className || ''}`}
    />
  );
}
