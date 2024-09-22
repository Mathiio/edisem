import { CreditIcon, CloseIcon } from '@/components/Utils/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tooltip } from '@nextui-org/react';
import { CreditCard } from '@/components/Navbar/CreditCard';
import { Scrollbar } from '@/components/Utils/Scrollbar';

const CreditsModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <Tooltip content='voir les crédits'>
          <Link onPress={handleOpen} className='cursor-pointer'>
            <CreditIcon
              size={18}
              className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200'
            />
          </Link>
        </Tooltip>
      </div>

      <Modal
        backdrop='blur'
        className='bg-default-100'
        size='2xl'
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-between p-25 border-b-2 border-default-300'>
                <h2 className='text-default-500 text-32 font-semibold'>Crédits</h2>
                <Link onPress={onClose}>
                  <CloseIcon
                    className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <Scrollbar withGap>
                  <div className='flex flex-col gap-25'>
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <CreditCard
                      name='Gabrielle Godin'
                      job=''
                      description={[
                        'Modèle de données',
                        'Veille informationnelle',
                        'Administration de la base de données',
                        'Contenus (citations, bibliographies et médiagraphies)',
                      ]}
                    />
                    <CreditCard name='Renée Bourassa' job='' />
                    <CreditCard
                      name='Sandrine Bienvenu'
                      job='Assistanat de recherche'
                      description={[
                        'Developed web applications',
                        'Managed a small team',
                        'Collaborated with cross-functional teams',
                      ]}
                    />
                    <CreditCard
                      name='Maxime Girard'
                      job='Technicien en travaux d’enseignement et de recherche'
                      description={['Montage vidéo', 'Expérimentation de générateurs conversationnels', 'Graphisme']}
                    />
                    <CreditCard name='Erwan THIBAUD' job='Developpeur / Designer' />
                    <CreditCard name='Mathéo Pougalan' job='Developpeur / Designer' />
                  </div>
                </Scrollbar>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreditsModal;
