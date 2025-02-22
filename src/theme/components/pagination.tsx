import {
  Pagination as OPagination,
  PaginationItem as OPaginationItem,
  PaginationCursor as OPaginationCursor,
  extendVariants,
} from "@heroui/react";

export const Pagination = extendVariants(OPagination, {});

export const PaginationItem = extendVariants(OPaginationItem, {});

export const PaginationCursor = extendVariants(OPaginationCursor, {});
