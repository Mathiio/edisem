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
  ModalHeader,
  Textarea,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { CrossIcon, DotsIcon, UserIcon } from '@/components/utils/icons';
import { IconSvgProps } from '@/types/ui';
import Omk from '@/components/features/database/CreateModal';
import { getActants, getAnnotations, getStudents } from '@/lib/Items';

const API_URL = 'https://edisem.arcanes.ca/omk/api/';
const API_KEY = import.meta.env.VITE_API_KEY;
const IDENT = 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj';

export const omkInstance = new Omk({
  api: API_URL,
  key: API_KEY,
  ident: IDENT,
  vocabs: ['dcterms', 'oa'],
});

omkInstance.init();

interface AnnotationDropdownProps {
  id: Number;
  content: string | React.ReactNode;
  image?: string | React.ReactElement<IconSvgProps>;
  actant?: string;
  type: string;
  // Nouvelles props pour le mode
  mode?: 'dropdown' | 'annotate' | 'view';
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnnotationDropdown: React.FC<AnnotationDropdownProps> = ({
  id,
  content,
  image,
  actant,
  type,
  mode = 'dropdown',
  isOpen = false,
  onClose: externalOnClose,
}) => {
  const userString = localStorage.getItem('user');
  const user: any | null = userString ? JSON.parse(userString) : null;

  if (!user) {
    return null;
  }

  // États pour le mode dropdown
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour voir les annotations
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gestion des états selon le mode
  useEffect(() => {
    if (mode === 'annotate') {
      setIsAnnotateOpen(isOpen);
    } else if (mode === 'view') {
      setIsViewOpen(isOpen);
      if (isOpen) {
        handleViewAnnotations();
      }
    }
  }, [mode, isOpen]);

  const onAnnotateClose = () => {
    setIsAnnotateOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const onViewClose = () => {
    setIsViewOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const onAnnotateOpen = () => {
    setIsAnnotateOpen(true);
    setIsDropdownOpen(false);
  };

  const handleViewOpen = async () => {
    setIsViewOpen(true);
    setIsDropdownOpen(false);
    await handleViewAnnotations();
  };

  const handleViewAnnotations = async () => {
    setIsLoading(true);

    try {
      const [fetchedAnnotations, actants, students] = await Promise.all([
        getAnnotations(),
        getActants(),
        getStudents(),
      ]);

      console.log(actants);
      console.log(students);
      console.log(id);

      const relatedAnnotations = fetchedAnnotations.filter((annotation: any) => annotation.related === id.toString());

      const annotationsWithContributors = relatedAnnotations.map((annotation: any) => {
        const contributor =
          actants.find((actant: any) => actant.id.toString() === annotation.contributor.toString()) ||
          students.find((student: any) => student.id.toString() === annotation.contributor.toString());

        return {
          ...annotation,
          contributor: contributor,
        };
      });

      console.log(annotationsWithContributors);
      setAnnotations(annotationsWithContributors);
    } catch (error) {
      console.error('Error loading annotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (!omkInstance.props) {
      omkInstance.init();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Construction des données brutes');
      const rawData = {};
      const response = await omkInstance.createItem(rawData);
      console.log('Annotation créée:', response);

      onAnnotateClose();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu selon le mode
  if (mode === 'annotate') {
    return (
      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
        isOpen={isAnnotateOpen}
        onClose={onAnnotateClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex justify-between p-[25px] border-b-1 border-c4'>
                <h1 className='text-32 text-c6 font-semibold'>Annotation</h1>
                <Link onPress={onAnnotateClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-[25px] gap-25'>
                <div className='flex flex-col gap-10'>
                  <p className='text-16 text-c6'>{type}</p>
                  <div className='p-25 flex flex-row border-1 w-full gap-25 border-c3 rounded-12'>
                    {image && (
                      <div className='flex flex-row items-center text-c4'>
                        {typeof image === 'string' ? (
                          <img src={image} alt='thumbnail' className='w-100 h-full object-cover rounded-6' />
                        ) : React.isValidElement(image) ? (
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label="Titre de l'annotation *"
                    labelPlacement='outside'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label='Commentaire *'
                    labelPlacement='outside'
                    placeholder='Entrez votre commentaire..'
                  />
                  <div className='flex w-full flex-row justify-end items-center gap-3 mt-4'>
                    <Button onClick={onAnnotateClose} className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-8'>
                      Annuler
                    </Button>
                    <Button
                      type='submit'
                      className='w-fit px-3 h-[40px] bg-action text-selected rounded-8 '
                      disabled={isSubmitting}>
                      {isSubmitting ? 'Création...' : 'Annoter'}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  if (mode === 'view') {
    return (
      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
        isOpen={isViewOpen}
        onClose={onViewClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex justify-between p-[25px] border-b-1 border-c4'>
                <h1 className='text-32 text-c6 font-semibold'>Annotations</h1>
                <Link onPress={onViewClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex flex-col p-6 gap-6'>
                {isLoading ? (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Chargement des annotations...</p>
                  </div>
                ) : annotations.length > 0 ? (
                  <div className='flex flex-col gap-[30px] w-full'>
                    <div className='flex flex-row items-center gap-10'>
                      <h1 className='text-16 text-c6'>Annotations</h1>
                      <div className='rounded-[7px] text-[12px] border-2 p-5 leading-[60%] text-c6 border-c3'>
                        {annotations.length}
                      </div>
                    </div>
                    <div className='flex flex-col gap-[30px] max-h-[350px] overflow-y-scroll'>
                      {annotations.map((annotation: any, index) => (
                        <div
                          key={index}
                          className=' flex flex-col border-2 px-[15px] py-[15px] border-c3 w-fit gap-[15px] rounded-12'>
                          <div className='flex flex-row rounded-8 items-center h-[40px] gap-10 text-c6 transition-all ease-in-out duration-200'>
                            {annotation.contributor?.picture ? (
                              <img
                                src={annotation.contributor.picture}
                                alt='Avatar'
                                className='w-[30px] h-[30px] rounded-[6px] object-cover'
                              />
                            ) : (
                              <UserIcon
                                size={16}
                                className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200'
                              />
                            )}
                            <span className='text-14 font-normal text-c6'>
                              {annotation.contributor?.firstname && annotation.contributor?.lastname
                                ? `${annotation.contributor.firstname} ${annotation.contributor.lastname.charAt(0)}.`
                                : annotation.contributor?.firstname ||
                                  annotation.contributor?.lastname ||
                                  'Utilisateur'}
                            </span>
                            <div className='w-[5px] h-[5px]'></div>
                            <span className='text-14 font-normal text-c6'>
                              {new Date(annotation.created).toLocaleDateString('ca-CA')}
                            </span>
                          </div>
                          <h3 className='text-xl text-c6 font-semibold'>{annotation.title}</h3>
                          <p className='text-base text-c4'>{annotation.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Aucune annotation trouvée pour cet élément.</p>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  // Mode dropdown par défaut
  return (
    <div>
      <Dropdown isOpen={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownTrigger className='cursor-pointer text-c6'>
          <div>
            <DotsIcon className='mx-1' size={15} />
          </div>
        </DropdownTrigger>

        <DropdownMenu aria-label='User menu' className='p-4 text-c6'>
          <DropdownItem key='Annoter' onClick={onAnnotateOpen} className='gap-2'>
            Annoter
          </DropdownItem>
          <DropdownItem key='VoirAnnoter' onClick={handleViewOpen} className='gap-2'>
            Voir les annotations
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
        isOpen={isAnnotateOpen}
        onClose={onAnnotateClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex justify-between p-[25px] border-b-1 border-c4'>
                <h1 className='text-32 text-c6 font-semibold'>Annotation</h1>
                <Link onPress={onAnnotateClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-[25px] gap-25'>
                <div className='flex flex-col gap-10'>
                  <p className='text-16 text-c6'>{type}</p>
                  <div className='p-25 flex flex-row border-1 w-full gap-25 border-c3 rounded-12'>
                    {image && (
                      <div className='flex flex-row items-center text-c4'>
                        {typeof image === 'string' ? (
                          <img src={image} alt='thumbnail' className='w-100 h-full object-cover rounded-6' />
                        ) : React.isValidElement(image) ? (
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label="Titre de l'annotation *"
                    labelPlacement='outside'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label='Commentaire *'
                    labelPlacement='outside'
                    placeholder='Entrez votre commentaire..'
                  />
                  <div className='flex w-full flex-row justify-end items-center gap-3 mt-4'>
                    <Button onClick={onAnnotateClose} className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-8'>
                      Annuler
                    </Button>
                    <Button
                      type='submit'
                      className='w-fit px-3 h-[40px] bg-action text-selected rounded-8 '
                      disabled={isSubmitting}>
                      {isSubmitting ? 'Création...' : 'Annoter'}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
        isOpen={isViewOpen}
        onClose={onViewClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex justify-between p-[25px] border-b-1 border-c4'>
                <h1 className='text-32 text-c6 font-semibold'>Annotations</h1>
                <Link onPress={onViewClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex flex-col p-6 gap-6'>
                {isLoading ? (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Chargement des annotations...</p>
                  </div>
                ) : annotations.length > 0 ? (
                  <div className='flex flex-col gap-[30px] w-full'>
                    <div className='flex flex-row items-center gap-10'>
                      <h1 className='text-16 text-c6'>Annotations</h1>
                      <div className='rounded-[7px] text-[12px] border-2 p-5 leading-[60%] text-c6 border-c3'>
                        {annotations.length}
                      </div>
                    </div>
                    <div className='flex flex-col gap-[30px] max-h-[350px] overflow-y-scroll'>
                      {annotations.map((annotation: any, index) => (
                        <div
                          key={index}
                          className=' flex flex-col border-2 px-[15px] py-[15px] border-c3 w-fit gap-[15px] rounded-12'>
                          <div className='flex flex-row rounded-8 items-center h-[40px] gap-10 text-c6 transition-all ease-in-out duration-200'>
                            {annotation.contributor?.picture ? (
                              <img
                                src={annotation.contributor.picture}
                                alt='Avatar'
                                className='w-[30px] h-[30px] rounded-[6px] object-cover'
                              />
                            ) : (
                              <UserIcon
                                size={16}
                                className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200'
                              />
                            )}
                            <span className='text-14 font-normal text-c6'>
                              {annotation.contributor?.firstname && annotation.contributor?.lastname
                                ? `${annotation.contributor.firstname} ${annotation.contributor.lastname.charAt(0)}.`
                                : annotation.contributor?.firstname ||
                                  annotation.contributor?.lastname ||
                                  'Utilisateur'}
                            </span>
                            <div className='w-[5px] h-[5px]'></div>
                            <span className='text-14 font-normal text-c6'>
                              {new Date(annotation.created).toLocaleDateString('ca-CA')}
                            </span>
                          </div>
                          <h3 className='text-xl text-c6 font-semibold'>{annotation.title}</h3>
                          <p className='text-base text-c4'>{annotation.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Aucune annotation trouvée pour cet élément.</p>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
