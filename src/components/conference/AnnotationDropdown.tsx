import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { CrossIcon, DotsIcon } from '../utils/icons';
import { IconSvgProps } from '@/types/types';
import Omk from '@/components/database/CreateModal';

const API_URL = 'https://tests.arcanes.ca/omk/'; 
const API_KEY = import.meta.env.VITE_API_KEY;
const IDENT = 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj';

export const omkInstance = new Omk({
  api: API_URL,
  key: API_KEY,
  ident: IDENT,
  vocabs: ['dcterms', 'oa']
});

omkInstance.init();

interface AnnotationDropdownProps {
  id:Number;
  content: string | React.ReactNode;
  image?: string | React.ReactElement<IconSvgProps>;
  actant?: string;
  type: string;
}


export const AnnotationDropdown: React.FC<AnnotationDropdownProps> = ({ id, content, image, actant, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  console.log(id)

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleOpen = () => {
    onOpen();
    setIsDropdownOpen(false);
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
    // Charger les dépendances nécessaires
    if (!omkInstance.props) {
      omkInstance.init();
    }
  }, []);



  useEffect(() => {
    // Charger les dépendances nécessaires
    if (!omkInstance.props) {
      omkInstance.init();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construction des données brutes
      const rawData = {
        '@type': 'oa:Annotation',
        'o:resource_class': { 'o:id': 106 },
        'o:resource_template': { 'o:id': 101 },
        'dcterms:title': title,
        'rdfs:comment': description,
        'oa:hasTarget': {
          '@id': `#${id}`,
          'o:label': 'Cible spécifique'
        }
      };

      // Formatage avec la méthode de la classe
      const formattedData = omkInstance.formatData(rawData);

      // Appel de la méthode publique createItem
      const response = await omkInstance.createItem(formattedData);
      
      console.log('Annotation créée:', response);
      onClose();
      setTitle('');
      setDescription('');

    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div>
      <Dropdown isOpen={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownTrigger className='cursor-pointer text-c6'>
          <div>
            <DotsIcon className='mx-1' size={15} />
          </div>
        </DropdownTrigger>

        <DropdownMenu aria-label='User menu' className='p-4 text-c6'>
          <DropdownItem key='Annoter' onClick={handleOpen} className='gap-2'>
            Annoter
          </DropdownItem>
          <DropdownItem key='VoirAnnoter' className='gap-2 '>
            Voir les annotations
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-between p-[25px] border-b-1 border-c4'>
                <h1 className='text-32 text-c6 font-semibold'>Annotation</h1>
                <Link onPress={onClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-[25px] gap-25'>
                <div className='flex flex-col gap-10'>
                  <div>{type}</div>
                  <div className='p-25 flex flex-row border-1 w-full gap-25 border-c3 rounded-12'>
                    {image && (
                      <div className='flex flex-row items-center'>
                        {typeof image === 'string' ? (
                          <img src={image} alt='thumbnail' className='w-100 h-full object-cover rounded-6' />
                        ) : // Si c'est un composant React, l'afficher
                        React.isValidElement(image) ? (
                          image
                        ) : null}
                      </div>
                    )}
                    <div className='flex gap-10 flex-col'>
                      {actant ? (
                        <>
                          <div className='text-c6'>{actant}</div>
                          <p
                            className='text-16 text-c4 font-extralight transition-all ease-in-out duration-200'
                            style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
                            {content}
                          </p>
                          <p
                            className='text-16 text-c5 font-semibold cursor-pointer transition-all ease-in-out duration-200'
                            onClick={toggleExpansion}>
                            {expanded ? 'affichez moins' : '...affichez plus'}
                          </p>
                        </>
                      ) : (
                        <div className='text-c6'>{content}</div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
                  <Input
                    size='lg'
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    type='email'
                    label='Titre de l’annotation *'
                    labelPlacement='outside'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    type='password'
                    label='Description *'
                    labelPlacement='outside'
                    placeholder='Entrez votre description..'
                  />
                </form>
              </ModalBody>
              <ModalFooter className='flex w-full flex-row p-[25px] justify-end items-center'>
                <Button className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-8'>Annuler</Button>
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected rounded-8 ' disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Annoter'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
