import { Textarea as OTextarea, extendVariants } from "@heroui/react";

export const Textarea = extendVariants(OTextarea, {
  defaultVariants: {
    size: 'md',
    labelPlacement: 'inside',
    variant: 'bordered',
    color: 'secondary',
  },
});
