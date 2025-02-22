import { Select as OSelect, SelectItem as OSelectItem, extendVariants } from "@heroui/react";

export const SelectItem = OSelectItem;

export const Select = extendVariants(OSelect, {
  defaultVariants: {
    size: 'md',
    labelPlacement: 'inside',
    variant: 'bordered',
    color: 'secondary',
  },
});
