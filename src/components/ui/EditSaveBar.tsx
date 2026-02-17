import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Spinner } from '@heroui/react';
import { SaveIcon, CrossIcon, CheckIcon, WarningIcon } from '@/components/ui/icons';

interface EditSaveBarProps {
  isVisible: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isDirty?: boolean;
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
                <div className='flex items-center gap-2'>                  
                  
                  {/* Dirty indicator */}
                  {isDirty && !isSubmitting && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='flex items-center gap-2 text-c4'>
                      <WarningIcon size={20} className='text-c5'/>
                      <span className='text-14'>Modifications non sauvegardées</span>
                    </motion.div>
                  )}

                  {/* Submitting indicator */}
                  {isSubmitting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center gap-2 text-c5'>
                      <Spinner color="current" className="text-c6" size="sm"/>
                      <span className='text-14'>Sauvegarde en cours...</span>
                    </motion.div>
                  )}

                  {/* Last saved */}
                  {lastSaved && !isDirty && !isSubmitting && (
                    <div className='flex items-center gap-6 text-green-500'>
                      <CheckIcon size={14} />
                      <span className='text-14'>
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
                <div className='flex items-center gap-4'>
                  {/* Cancel button */}
                  <Button
                    size='md'
                    variant='flat'
                    className='text-c6 hover:bg-c3/80 bg-c3 rounded-8 p-6 font-medium transition-all duration-200'
                    onPress={onCancel}
                    isDisabled={isSubmitting}
                    startContent={<CrossIcon size={16} />}>
                    Annuler
                  </Button>

                  {/* Save button */}
                  <Button
                    size='md'
                    className={`rounded-8 p-6 font-medium transition-all duration-200 ${
                      isDirty || isCreateMode ? 'bg-action text-selected hover:bg-action/90 shadow-[0_0_15px_rgba(var(--action-rgb),0.3)]' : 'bg-c3 text-c5 cursor-not-allowed'
                    }`}
                    onPress={onSave}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting || (!isDirty && !isCreateMode)}
                    startContent={!isSubmitting && <SaveIcon size={16} />}>
                    {isCreateMode ? 'Créer la ressource' : 'Sauvegarder'}
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
