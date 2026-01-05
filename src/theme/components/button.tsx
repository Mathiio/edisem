import { Button as OButton, extendVariants } from '@heroui/react';

export const Button = extendVariants(OButton, {
  variants: {
    size: {
      sm: 'h-[32px] min-h-[32px] min-w-[32px] data-[icon-only=true]:w-[32px] data-[icon-only=false]:px-3 text-small',
      md: 'h-[40px] min-h-[40px] min-w-[40px] data-[icon-only=true]:w-[40px] data-[icon-only=false]:px-4 text-medium',
      lg: 'h-[48px] min-h-[48px] min-w-[48px] data-[icon-only=true]:w-[48px] data-[icon-only=false]:px-6 text-large',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    color: 'default',
  },
});
