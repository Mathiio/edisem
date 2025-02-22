import { Tooltip as OTooltip, extendVariants } from "@heroui/react";

export const Tooltip = extendVariants(OTooltip, {
  defaultVariants: {
    delay: 0,
    closeDelay: 0,
  },
});
