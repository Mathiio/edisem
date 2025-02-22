import { Button as OButton, extendVariants } from "@heroui/react";

export const Button = extendVariants(OButton, {
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    color: 'default',
  },
});
