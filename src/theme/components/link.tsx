import { Link as OLink, extendVariants } from "@heroui/react";

export const Link = extendVariants(OLink, {
  defaultVariants: {
    color: 'primary',
  },
});
