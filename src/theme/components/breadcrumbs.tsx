import { Breadcrumbs as OBreadcrumbs, BreadcrumbItem as OBreadcrumbItem, extendVariants } from "@heroui/react";

export const Breadcrumbs = extendVariants(OBreadcrumbs, {
  defaultVariants: {},
});

export const BreadcrumbItem = OBreadcrumbItem;
