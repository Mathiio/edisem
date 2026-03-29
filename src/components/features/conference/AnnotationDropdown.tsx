import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Link, Modal, ModalBody, ModalContent, ModalHeader, Textarea } from '@heroui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { CrossIcon, DotsIcon, UserIcon } from '@/components/ui/icons';
import { IconSvgProps, ResourceDetails } from '@/types/ui';
import { getAnnotations } from '@/services/resourceDetails';

import { ApiProxy } from '@/services/ApiProxy';

interface AnnotationDropdownProps {
  id: string | number;
  content: string | React.ReactNode;
  image?: string | React.ReactElement<IconSvgProps>;
  actant?: string;
  type: string;
  // Nouvelles props pour le mode
  mode?: 'dropdown' | 'annotate' | 'view';
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnnotationDropdown: React.FC<AnnotationDropdownProps> = ({ id, content, image, actant, type, mode = 'dropdown', isOpen = false, onClose: externalOnClose }) => {
  const userString = localStorage.getItem('user');
  const user: { id?: number } | null = userString ? JSON.parse(userString) : null;

  // États pour le mode dropdown
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour voir les annotations
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [annotations, setAnnotations] = useState<ResourceDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewAnnotations = useCallback(async () => {
    setIsLoading(true);

    try {
      const results = await getAnnotations(id as string | number);
      setAnnotations(results || []);
    } catch (error) {
      console.error('Error loading annotations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Gestion des états selon le mode
  useEffect(() => {
    if (mode === 'annotate') {
      setIsAnnotateOpen(isOpen);
    } else if (mode === 'view') {
      setIsViewOpen(isOpen);
      if (isOpen) {
        void handleViewAnnotations();
      }
    }
  }, [mode, isOpen, handleViewAnnotations]);

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

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);

    try {
      const itemData = {
        'o:resource_template': { 'o:id': 101 },
        'dcterms:title': [
          {
            type: 'literal',
            property_id: 1,
            '@value': title,
            is_public: true,
          },
        ],
        'dcterms:description': [
          {
            type: 'literal',
            property_id: 4,
            '@value': description,
            is_public: true,
          },
        ],
        'oa:hasTarget': [
          {
            type: 'resource',
            property_id: 199,
            value_resource_id: Number(id),
            is_public: true,
          },
        ],
        'schema:contributor': [
          {
            type: 'resource',
            property_id: 581,
            value_resource_id: Number(user?.id),
            is_public: true,
          },
        ],
      };

      await ApiProxy.createItem(itemData);

      onAnnotateClose();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors de la création de l\'annotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

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
                <h1 className='text-3xl text-c6 font-medium'>Annotation</h1>
                <Link onPress={onAnnotateClose}>
                  <CrossIcon className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-[25px] gap-6'>
                <div className='flex flex-col gap-2.5'>
                  <p className='text-base text-c6'>{type}</p>
                  <div className='p-6 flex flex-row border-1 w-full gap-6 border-c3 rounded-xl'>
                    {image && (
                      <div className='flex flex-row items-center text-c4'>
                        {typeof image === 'string' ? (
                          <img src={image} alt='thumbnail' className='w-24 h-full object-cover rounded-md' />
                        ) : React.isValidElement(image) ? (
                          image
                        ) : null}
                      </div>
                    )}
                    <div className='flex gap-2.5 flex-col'>
                      {actant ? (
                        <>
                          <div className='text-c6'>{actant}</div>
                          <p
                            className='text-base text-c4 font-normal transition-all ease-in-out duration-200'
                            style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
                            {content}
                          </p>
                          <p className='text-base text-c5 font-medium cursor-pointer transition-all ease-in-out duration-200' onClick={toggleExpansion}>
                            {expanded ? 'affichez moins' : '...affichez plus'}
                          </p>
                        </>
                      ) : (
                        <div className='text-c6'>{content}</div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-6'>
                  <Input
                    size='lg'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    classNames={{
                      label: 'text-semibold !text-c6 text-2xl',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label="Titre de l'annotation *"
                    labelPlacement='outside-top'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    classNames={{
                      label: 'text-semibold !text-c6 text-2xl',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label='Commentaire *'
                    labelPlacement='outside-top'
                    placeholder='Entrez votre commentaire..'
                  />
                  <div className='flex w-full flex-row justify-end items-center gap-3 mt-4'>
                    <Button onClick={onAnnotateClose} className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-lg'>
                      Annuler
                    </Button>
                    <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected rounded-lg ' disabled={isSubmitting}>
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
                <h1 className='text-3xl text-c6 font-medium'>Annotations</h1>
                <Link onPress={onViewClose}>
                  <CrossIcon className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex flex-col p-6 gap-6'>
                {isLoading ? (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Chargement des annotations...</p>
                  </div>
                ) : annotations.length > 0 ? (
                  <div className='flex flex-col gap-8 w-full'>
                    <div className='flex flex-row items-center gap-2.5'>
                      <h1 className='text-base text-c6'>Annotations</h1>
                      <div className='rounded-md text-[12px] border-2 p-1.5 leading-[60%] text-c6 border-c3'>{annotations.length}</div>
                    </div>
                    <div className='flex flex-col gap-8 max-h-[350px] overflow-y-scroll'>
                      {annotations.map((annotation: any, index) => (
                        <div key={index} className=' flex flex-col border-2 px-[15px] py-[15px] border-c3 w-fit gap-4 rounded-xl'>
                          <div className='flex flex-row rounded-lg items-center h-[40px] gap-2.5 text-c6 transition-all ease-in-out duration-200'>
                            {annotation.contributor?.picture ? (
                              <img src={annotation.contributor.picture} alt='Avatar' className='w-[30px] h-[30px] rounded-md object-cover' />
                            ) : (
                              <UserIcon size={16} className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200' />
                            )}
                            <span className='text-sm font-normal text-c6'>
                              {annotation.contributor?.firstname && annotation.contributor?.lastname
                                ? `${annotation.contributor.firstname} ${annotation.contributor.lastname.charAt(0)}.`
                                : annotation.contributor?.firstname || annotation.contributor?.lastname || 'Utilisateur'}
                            </span>
                            <div className='w-[5px] h-[5px]'></div>
                            <span className='text-sm font-normal text-c6'>{new Date(annotation.created).toLocaleDateString('ca-CA')}</span>
                          </div>
                          <h3 className='text-xl text-c6 font-medium'>{annotation.title}</h3>
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
      <Dropdown
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        classNames={{
          content:
            'shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 rounded-xl border-2 border-c3 min-w-[220px]',
        }}>
        <DropdownTrigger className='cursor-pointer text-c6'>
          <div>
            <DotsIcon className='mx-px' size={15} />
          </div>
        </DropdownTrigger>

        <DropdownMenu
          aria-label='Actions annotation'
          className='p-2 text-c6'
          classNames={{
            base: 'bg-transparent shadow-none border-0',
            list: 'bg-transparent',
          }}>
          <DropdownItem
            key='Annoter'
            className='gap-2 cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
            onPress={onAnnotateOpen}>
            Annoter
          </DropdownItem>
          <DropdownItem
            key='VoirAnnoter'
            className='gap-2 cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
            onPress={() => void handleViewOpen()}>
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
                <h1 className='text-3xl text-c6 font-medium'>Annotation</h1>
                <Link onPress={onAnnotateClose}>
                  <CrossIcon className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-[25px] gap-6'>
                <div className='flex flex-col gap-2.5'>
                  <p className='text-base text-c6'>{type}</p>
                  <div className='p-6 flex flex-row border-1 w-full gap-6 border-c3 rounded-xl'>
                    {image && (
                      <div className='flex flex-row items-center text-c4'>
                        {typeof image === 'string' ? (
                          <img src={image} alt='thumbnail' className='w-24 h-full object-cover rounded-md' />
                        ) : React.isValidElement(image) ? (
                          image
                        ) : null}
                      </div>
                    )}
                    <div className='flex gap-2.5 flex-col'>
                      {actant ? (
                        <>
                          <div className='text-c6'>{actant}</div>
                          <p
                            className='text-base text-c4 font-normal transition-all ease-in-out duration-200'
                            style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
                            {content}
                          </p>
                          <p className='text-base text-c5 font-medium cursor-pointer transition-all ease-in-out duration-200' onClick={toggleExpansion}>
                            {expanded ? 'affichez moins' : '...affichez plus'}
                          </p>
                        </>
                      ) : (
                        <div className='text-c6'>{content}</div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-6'>
                  <Input
                    size='lg'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    classNames={{
                      label: 'text-semibold !text-c6 text-2xl',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label="Titre de l'annotation *"
                    labelPlacement='outside-top'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    classNames={{
                      label: 'text-semibold !text-c6 text-2xl',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    label='Commentaire *'
                    labelPlacement='outside-top'
                    placeholder='Entrez votre commentaire..'
                  />
                  <div className='flex w-full flex-row justify-end items-center gap-3 mt-4'>
                    <Button onClick={onAnnotateClose} className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-lg'>
                      Annuler
                    </Button>
                    <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected rounded-lg ' disabled={isSubmitting}>
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
                <h1 className='text-3xl text-c6 font-medium'>Annotations</h1>
                <Link onPress={onViewClose}>
                  <CrossIcon className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex flex-col p-6 gap-6'>
                {isLoading ? (
                  <div className='flex justify-center items-center p-6'>
                    <p className='text-c6'>Chargement des annotations...</p>
                  </div>
                ) : annotations.length > 0 ? (
                  <div className='flex flex-col gap-8 w-full'>
                    <div className='flex flex-row items-center gap-2.5'>
                      <h1 className='text-base text-c6'>Annotations</h1>
                      <div className='rounded-md text-[12px] border-2 p-1.5 leading-[60%] text-c6 border-c3'>{annotations.length}</div>
                    </div>
                    <div className='flex flex-col gap-8 max-h-[350px] overflow-y-scroll'>
                      {annotations.map((annotation: any, index) => (
                        <div key={index} className=' flex flex-col border-2 px-[15px] py-[15px] border-c3 w-fit gap-4 rounded-xl'>
                          <div className='flex flex-row rounded-lg items-center h-[40px] gap-2.5 text-c6 transition-all ease-in-out duration-200'>
                            {annotation.contributor?.picture ? (
                              <img src={annotation.contributor.picture} alt='Avatar' className='w-[30px] h-[30px] rounded-md object-cover' />
                            ) : (
                              <UserIcon size={16} className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200' />
                            )}
                            <span className='text-sm font-normal text-c6'>
                              {annotation.contributor?.firstname && annotation.contributor?.lastname
                                ? `${annotation.contributor.firstname} ${annotation.contributor.lastname.charAt(0)}.`
                                : annotation.contributor?.firstname || annotation.contributor?.lastname || 'Utilisateur'}
                            </span>
                            <div className='w-[5px] h-[5px]'></div>
                            <span className='text-sm font-normal text-c6'>{new Date(annotation.created).toLocaleDateString('ca-CA')}</span>
                          </div>
                          <h3 className='text-xl text-c6 font-medium'>{annotation.title}</h3>
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
