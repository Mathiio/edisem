import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { TrashIcon, WarningIcon, InfoIcon, CheckIcon, LockIcon } from '@/components/ui/icons';

export type AlertModalType = 'danger' | 'warning' | 'info' | 'success' | 'forbidden';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  type?: AlertModalType;
  icon?: React.FC<any>;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const typeConfigs = {
  danger: {
    icon: TrashIcon,
    iconColor: 'text-[#FF0000]',
    iconBg: 'bg-red-500/20',
    confirmButtonClass: 'bg-[#FF0000]/70 hover:bg-[#FF0000]/90',
  },
  warning: {
    icon: WarningIcon,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/20',
    confirmButtonClass: 'bg-orange-500/70 hover:bg-orange-500/90',
  },
  info: {
    icon: InfoIcon,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/20',
    confirmButtonClass: 'bg-blue-500/70 hover:bg-blue-500/90',
  },
  success: {
    icon: CheckIcon,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/20',
    confirmButtonClass: 'bg-green-500/70 hover:bg-green-500/90',
  },
  forbidden: {
    icon: LockIcon,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/20',
    confirmButtonClass: 'bg-red-500/70 hover:bg-red-500/90',
  },
};

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  icon,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  isLoading = false,
}) => {
  const config = typeConfigs[type];
  const Icon = icon || config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'bg-c1 border-2 border-c3',
        header: 'border-b border-c3',
        body: 'py-6',
        footer: 'border-t border-c3',
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-px'>
          <div className='flex items-center gap-2'>
            <div className={`p-1 rounded-lg ${config.iconBg}`}>
              <Icon size={20} className={config.iconColor} />
            </div>
            <span className='text-c6'>{title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='flex flex-col justify-center gap-4'>
            <div className='text-c5'>
              {typeof description === 'string' ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose} className='text-c5 hover:text-c6'>
            {cancelLabel}
          </Button>
          <Button onPress={onConfirm} isLoading={isLoading} className={`${config.confirmButtonClass} text-white font-medium`}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
