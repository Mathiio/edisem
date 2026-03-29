import { Textarea as OTextarea, extendVariants } from '@heroui/react';

const baseInputWrapper = [
  '!bg-c2',
  '!border-2',
  '!border-c3',
  '!shadow-none',
  'data-[hover=true]:!border-c3',
  'data-[hover=true]:!bg-c3',
  'group-data-[focus=true]:!bg-c3',
  'group-data-[focus=true]:!border-c3',
  'group-data-[invalid=true]:!border-[#ef4444]',
  'rounded-xl',
  'transition-all',
  'duration-200',
  '!mt-0',
].join(' ');

export const Textarea = extendVariants(OTextarea, {
  variants: {
    variant: {
      bordered: {
        base: 'w-full flex flex-col gap-0',
        inputWrapper: baseInputWrapper,
        input: 'text-c6 placeholder:text-c4/60 !mt-0',
        label: 'text-c6 font-medium',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    labelPlacement: 'outside-top',
    variant: 'bordered',
  },
});
