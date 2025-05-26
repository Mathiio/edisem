import { Input, Textarea, TextAreaProps, InputProps } from '@heroui/react';
import { useEffect, useRef } from 'react';

interface AutoResizingFieldProps {
  value: string;
  textareaProps?: Omit<TextAreaProps, 'value'>;
  inputProps?: Omit<InputProps, 'value' | 'isReadOnly'>;
  isReadOnly?: boolean;
}

export default function AutoResizingField({
  value,
  textareaProps = {},
  inputProps = {},
  isReadOnly = true,
}: AutoResizingFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add safety check for value
  const safeValue = value || '';
  const hasMultipleLines = safeValue.split('\n').length > 1 || safeValue.length > 50;

  useEffect(() => {
    if (textareaRef.current && hasMultipleLines) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [safeValue, hasMultipleLines]);

  if (hasMultipleLines) {
    return (
      <Textarea
        ref={textareaRef}
        value={safeValue}
        isReadOnly={isReadOnly}
        {...textareaProps}
        style={{ overflow: 'hidden', ...textareaProps.style }}
      />
    );
  }

  return (
    <Input
      value={safeValue}
      isReadOnly={isReadOnly}
      type='text'
      {...inputProps}
      className={`min-h-[50px] ${inputProps.className || ''}`}
    />
  );
}
