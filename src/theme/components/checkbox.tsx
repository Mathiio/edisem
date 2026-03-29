import { Checkbox as OCheckbox, CheckboxGroup as OCheckboxGroup, extendVariants } from '@heroui/react';

export const Checkbox = extendVariants(OCheckbox, {
  variants: {
    color: {
      action: {
        wrapper: 'before:!border-c4 after:!bg-action after:!text-selected',
        icon: '!text-selected',
      },
    },
  },
  defaultVariants: {
    color: 'action',
  },
});

export const CheckboxGroup = OCheckboxGroup;
