import { CreditIcon, CrossIcon } from '@/components/utils/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tooltip } from '@nextui-org/react';
import { CreditCard } from '@/components/navbar/CreditCard';

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
              className='text-500 hover:text-action transition-all ease-in-out duration-200'
            />
          </Link>
        </Tooltip>
      </div>

      <Modal
        backdrop='blur'
        className='bg-50'
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
              <ModalHeader className='flex justify-between p-25 border-b-2 border-300'>
                <h2 className='text-500 text-32 font-medium'>Crédits</h2>
                <Link onPress={onClose}>
                  <CrossIcon
                    className='text-500 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-col gap-25 scroll-y-auto'>
                  <h3 className='text-500 font-medium text-16'>Equipe Arcanes</h3>
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
                  <CreditCard name='Renée Bourassa' job="Chef d'équipe" />

                  <CreditCard
                    name='Samuel Szoniecky'
                    job=''
                    description={['Développement Web', 'Modélisation', 'Gestion de la base de donnée Omeka S']}
                  />
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
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreditsModal;
