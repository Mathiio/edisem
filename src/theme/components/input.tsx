import { Input as OInput, extendVariants } from "@heroui/react";

export const Input = extendVariants(OInput, {
  defaultVariants: {
    size: 'md',
    labelPlacement: 'inside',
    variant: 'bordered',
    color: 'secondary',
  },
});
