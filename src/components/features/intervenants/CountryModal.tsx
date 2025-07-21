import React from 'react';
import { Link, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { IntervenantLongCard } from '@/components/features/intervenants/IntervenantCards';
import { getFrCountryName } from '@/components/features/intervenants/CountryUtils';
import { CrossIcon } from '@/components/ui/icons';
import { Actant, University } from '@/types/ui';



export interface UniversityWithIntervenants {
    university: University; // University metadata
    intervenants: Actant[]; // List of intervenants for the university
    [x: string]: any; // Allow additional dynamic fields
}

interface CountryModalProps {
    selectedCountry: string | null; // Name of selected country
    universityGroups: any[]; // Array of universities with grouped intervenants
    onClose: () => void; // Function to close the modal
}

const MODAL_MOTION_PROPS = {
  variants: {
    enter: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }, // Slide-in animation
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }, // Slide-out animation
    },
  },
};



export const CountryModal: React.FC<CountryModalProps> = ({
  selectedCountry,
  universityGroups,
  onClose
}) => (
  <Modal
    backdrop='blur' // Blurred background
    className='bg-c2 rounded-30'
    size='3xl'
    isOpen={!!selectedCountry} // Modal visibility based on selection
    onClose={onClose}
    hideCloseButton={true}
    scrollBehavior='inside' // Allow inner scrolling
    motionProps={MODAL_MOTION_PROPS} // Custom animation
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className='flex justify-between p-40 border-b-2 border-c3'>
            <h2 className='text-c6 text-32 font-medium'>
              Intervenants – {selectedCountry ? getFrCountryName(selectedCountry) : 'Pays'}
            </h2>
            <Link onPress={onClose}>
            <CrossIcon
                className='text-c4 cursor-pointer hover:text-c6 transition-all ease-in-out duration-200'
                size={24}
            />
            </Link>
        </ModalHeader>
          <ModalBody className='flex flex-col gap-40 p-40'>
                {universityGroups.length > 0 ? (
                universityGroups.map((group) => (
                    <div key={group.university.name} className='flex flex-col gap-20'>
                        <h2 className='text-24 font-medium text-c6'>
                        {group.university.name}
                        </h2>
                        <div className='flex flex-col gap-10'>
                        {group.intervenants.map((intervenant : any) => (
                            <IntervenantLongCard key={intervenant.id} {...intervenant} />
                        ))}
                        </div>
                    </div>
                ))
                ) : (
                 <p className='text-c5 text-16'>Aucun intervenant répertorié.</p>
                )}
            </ModalBody>
        </>
      )}
    </ModalContent>
  </Modal>
);