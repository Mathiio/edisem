import {
  Modal as OModal,
  ModalContent as OModalContent,
  ModalHeader as OModalHeader,
  ModalBody as OModalBody,
  ModalFooter as OModalFooter,
  extendVariants,
} from '@heroui/react';

/** Bouton fermer HeroUI : même picto qu’en admin, fond au survol légèrement arrondi (pas en pilule). */
export const modalCloseButtonClasses = [
  'cursor-pointer',
  '!rounded-lg',
  'text-c6',
  'bg-transparent',
  'hover:bg-c3',
  'active:bg-c3/90',
  'transition-colors',
  'duration-200',
].join(' ');

export const Modal = extendVariants(OModal, {
  variants: {
    theme: {
      default: {
        base: 'bg-c1 border-2 border-c3',
        header: 'border-b border-c3',
        body: 'py-6',
        footer: 'border-t border-c3',
        closeButton: modalCloseButtonClasses,
      },
    },
  },
  defaultVariants: {
    theme: 'default',
  },
});

export const ModalContent = OModalContent;
export const ModalHeader = OModalHeader;
export const ModalBody = OModalBody;
export const ModalFooter = OModalFooter;
