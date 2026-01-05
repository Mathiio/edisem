import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Spinner } from '@heroui/react';
import { SaveIcon, CrossIcon, CheckIcon } from '@/components/ui/icons';

interface EditSaveBarProps {
  isVisible: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isDirty?: boolean;
  resourceType?: string;
  mode?: 'edit' | 'create' | 'view';
  lastSaved?: Date | null;
}

/**
 * Barre de sauvegarde fixe en bas de l'écran (style WordPress)
 * Affichée uniquement en mode édition/création
 */
export const EditSaveBar: React.FC<EditSaveBarProps> = ({
  isVisible,
  onSave,
  onCancel,
  isSubmitting = false,
  isDirty = false,
  resourceType = 'Ressource',
  mode = 'edit',
  lastSaved,
}) => {
  const isCreateMode = mode === 'create';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className='fixed bottom-0 left-0 right-0 z-50'>
          {/* Gradient fade effect */}
          <div className='h-20 bg-gradient-to-t from-c1 to-transparent pointer-events-none' />

          {/* Main bar */}
          <div className='bg-c2 border-t-2 border-c3 '>
            <div className='px-25 py-[10px]'>
              <div className='flex items-center justify-between gap-20'>
                {/* Left side - Status info */}
                <div className='flex items-center gap-15'>
                  {/* Mode indicator */}
                  <div className={`flex items-center gap-8 px-12 py-[5px] rounded-8 ${isCreateMode ? 'bg-action/20 border border-action/40' : 'bg-c3 border border-c4/30'}`}>
                    <div className={`w-6 h-6 rounded-full ${isCreateMode ? 'bg-action' : 'bg-c5'}`} />
                    <span className={`text-14 font-medium ${isCreateMode ? 'text-action' : 'text-c5'}`}>{isCreateMode ? `Nouvelle ${resourceType}` : `Modification`}</span>
                  </div>

                  {/* Dirty indicator */}
                  {isDirty && !isSubmitting && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='flex items-center gap-6 text-c4'>
                      <div className='w-5 h-5 rounded-full bg-yellow-500/80 animate-pulse' />
                      <span className='text-13'>Modifications non sauvegardées</span>
                    </motion.div>
                  )}

                  {/* Submitting indicator */}
                  {isSubmitting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center gap-8 text-c5'>
                      <Spinner size='sm' color='primary' />
                      <span className='text-13'>Sauvegarde en cours...</span>
                    </motion.div>
                  )}

                  {/* Last saved */}
                  {lastSaved && !isDirty && !isSubmitting && (
                    <div className='flex items-center gap-6 text-green-500'>
                      <CheckIcon size={14} />
                      <span className='text-13'>
                        Sauvegarde le{' '}
                        {lastSaved.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side - Action buttons */}
                <div className='flex items-center gap-12'>
                  {/* Cancel button */}
                  <Button
                    size='md'
                    variant='flat'
                    className='bg-c3 text-c6 hover:bg-c4 rounded-10 px-20 h-40 font-medium transition-all duration-200'
                    onPress={onCancel}
                    isDisabled={isSubmitting}
                    startContent={<CrossIcon size={16} />}>
                    Annuler
                  </Button>

                  {/* Save button */}
                  <Button
                    size='md'
                    className={`rounded-10 px-25 h-40 font-medium transition-all duration-200 ${
                      isDirty || isCreateMode ? 'bg-action text-selected hover:bg-action/90 shadow-[0_0_15px_rgba(var(--action-rgb),0.3)]' : 'bg-c3 text-c5 cursor-not-allowed'
                    }`}
                    onPress={onSave}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting || (!isDirty && !isCreateMode)}
                    startContent={!isSubmitting && <SaveIcon size={16} />}>
                    {isCreateMode ? 'Creer' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
