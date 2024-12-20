import React, { useState } from 'react';
import { Button, Select, SelectItem, Divider } from '@nextui-org/react';
import { PlusIcon } from '@/components/utils/icons';
import { Scrollbar } from '../utils/Scrollbar';

// Définition du type pour une règle de filtrage
type FilterRule = {
  id: number; // Identifiant unique pour chaque règle
  type: 'Si' | 'Et' | 'Ou'; // Type de la règle : "Si", "Et", ou "Ou"
  condition: string; // Condition sélectionnée dans le premier sélecteur
  operator: string; // Opérateur sélectionné dans le deuxième sélecteur
  value: string; // Valeur saisie dans le champ d'entrée
  isChild?: boolean; // Indicateur pour savoir si la règle est une sous-condition
  parentId?: number; // ID de la condition parent pour les sous-conditions
};

const FiltragePopup: React.FC = () => {
  // Initialisation avec une règle par défaut de type "Si"
  const [filters, setFilters] = useState<FilterRule[]>([
    { id: Date.now(), type: 'Si', condition: '', operator: '', value: '', isChild: false },
  ]);

  // Fonction pour ajouter une nouvelle règle de filtrage
  const addFilter = (type: 'Si' | 'Et' | 'Ou', isChild = false, parentId?: number) => {
    setFilters((prev) => [
      ...prev,
      { id: Date.now(), type, condition: '', operator: '', value: '', isChild, parentId },
    ]);
  };

  // Fonction pour mettre à jour une règle spécifique
  const updateFilter = (id: number, key: keyof FilterRule, value: string) => {
    setFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, [key]: value } : filter)));
  };

  // Gestionnaire pour convertir l'événement HTML en string
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>, id: number, key: keyof FilterRule) => {
    updateFilter(id, key, e.target.value);
  };

  return (
    <div className='flex flex-col w-full gap-20 '>
      {/* Bouton pour ajouter une règle */}
      <div>
        <Button
          className='flex justify-start gap-5 font-14 p-2 bg-default-100'
          startContent={<PlusIcon size={10} />}
          onPress={() => addFilter('Et')}>
          Ajouter une règle de filtrage
        </Button>
        <Divider className='mt-5 bg-default-300' />
      </div>

      {/* Liste des règles de filtrage */}
      <div className='h-[188px]'>
        <Scrollbar withGap>
          <div className='flex flex-col gap-20'>
            {filters
              .filter((filter) => !filter.isChild) // Affiche uniquement les conditions principales
              .map((filter) => (
                <div key={filter.id} className='flex flex-col gap-10'>
                  {/* Sélecteurs et type de condition */}
                  <div className='flex flex-row'>
                    <div className='flex text-14 gap-10'>
                      {/* Affichage du type : "Si", "Et", ou "Ou" */}
                      {filter.type === 'Si' ? (
                        <span className='w-[40px]'>{filter.type}</span>
                      ) : (
                        <Select
                          className='w-[40px]'
                          classNames={{
                            mainWrapper: 'max-h-[30px] flex gap-20', // Ajout de la max-height dans mainWrapper
                            innerWrapper: 'w-fit  ',
                            trigger: 'max-h-[30px] rounded-8 bg-default-100 p-0',
                            value: 'text-default-900 pr-10',
                            selectorIcon: 'mr-[-9px]',
                            popoverContent: 'min-w-fit bg-default-300',
                          }}
                          placeholder='Et'
                          value={filter.type || 'Et'} // Définit "Et" par défaut
                          onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'type')}>
                          <SelectItem value='Et'>Et</SelectItem>
                          <SelectItem value='Ou'>Ou</SelectItem>
                        </Select>
                      )}
                    </div>
                    <div className='flex flex-col w-full gap-10'>
                      <div className='flex flex-row gap-10 h-fit'>
                        {/* Sélecteur de condition */}
                        <Select
                          className='w-[120px] '
                          classNames={{
                            mainWrapper: 'max-h-[30px] ', // Ajout de la max-height dans mainWrapper
                            trigger: 'max-h-[30px] rounded-8 bg-default-300 ',
                            value: 'text-default-900',
                          }}
                          placeholder='Condition'
                          value={filter.condition}
                          onChange={(e) =>
                            handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'condition')
                          }>
                          <SelectItem value='conference'>Conférence</SelectItem>
                          <SelectItem value='webinaire'>Webinaire</SelectItem>
                        </Select>

                        {/* Sélecteur d'opérateur */}
                        <Select
                          className='w-[120px] '
                          classNames={{
                            mainWrapper: 'max-h-[30px] ', // Ajout de la max-height dans mainWrapper
                            trigger: 'max-h-[30px] rounded-8 bg-default-300 ',
                            value: 'text-default-900',
                          }}
                          placeholder='Opérateur'
                          value={filter.operator}
                          onChange={(e) =>
                            handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'operator')
                          }>
                          <SelectItem value='contains'>Contient</SelectItem>
                          <SelectItem value='equals'>Égale à</SelectItem>
                        </Select>
                      </div>

                      {/* Champ de saisie pour la valeur */}
                      <div className='flex flex-row '>
                        <input
                          type='text'
                          className='w-full py-[5px]  px-[10px]  border max-h-[30px] rounded-8 bg-default-300 text-default-900'
                          placeholder='Nom...'
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Liste des sous-conditions */}
                  {filter.type !== 'Si' && (
                    <div className='flex flex-col gap-10'>
                      {filters
                        .filter((subFilter) => subFilter.isChild && subFilter.parentId === filter.id) // Sous-conditions de ce parent
                        .map((subFilter) => (
                          <div className='flex flex-row'>
                            <div className='flex text-14 gap-10 min-w-[40px]'></div>
                            <div className='flex flex-col w-full gap-10'>
                              <div className='flex flex-row gap-10 h-fit'>
                                {/* Sélecteur de condition */}
                                <Select
                                  className='w-[120px] '
                                  classNames={{
                                    mainWrapper: 'max-h-[30px] ', // Ajout de la max-height dans mainWrapper
                                    trigger: 'max-h-[30px] rounded-8 bg-default-300 ',
                                    value: 'text-default-900',
                                  }}
                                  placeholder='Condition'
                                  value={subFilter.condition}
                                  onChange={(e) =>
                                    handleChange(e as React.ChangeEvent<HTMLSelectElement>, subFilter.id, 'condition')
                                  }>
                                  <SelectItem value='conference'>Conférence</SelectItem>
                                  <SelectItem value='webinaire'>Webinaire</SelectItem>
                                </Select>

                                {/* Sélecteur d'opérateur */}
                                <Select
                                  className='w-[120px] '
                                  classNames={{
                                    mainWrapper: 'max-h-[30px] ', // Ajout de la max-height dans mainWrapper
                                    trigger: 'max-h-[30px] rounded-8 bg-default-300 ',
                                    value: 'text-default-900',
                                  }}
                                  placeholder='Opérateur'
                                  value={subFilter.operator}
                                  onChange={(e) =>
                                    handleChange(e as React.ChangeEvent<HTMLSelectElement>, subFilter.id, 'operator')
                                  }>
                                  <SelectItem value='contains'>Contient</SelectItem>
                                  <SelectItem value='equals'>Égale à</SelectItem>
                                </Select>
                              </div>

                              {/* Champ de saisie pour la valeur */}
                              <div className='flex flex-row '>
                                <input
                                  type='text'
                                  className='w-full py-[5px]  px-[10px]  border max-h-[30px] rounded-8 bg-default-300 text-default-900'
                                  placeholder='Nom...'
                                  value={subFilter.value}
                                  onChange={(e) => updateFilter(subFilter.id, 'value', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Bouton pour ajouter une sous-condition (désactivé si type === "Si") */}
                  {filter.type !== 'Si' && (
                    <Button
                      className='gap-5 font-14 bg-default-100  text-gray-400'
                      onPress={() => addFilter('Et', true, filter.id)}>
                      Ajouter une condition
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </Scrollbar>
      </div>
      <div className='flex flex-row justify-end gap-10'>
        <Button className='gap-5 font-14 p-2 text-default-500 hover:text-default-900 hover:bg-default-300 bg-default-300'>
          Réinitialiser
        </Button>
        <Button className='gap-5 font-14 p-2 text-default-900 hover:bg-default-action bg-default-action '>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default FiltragePopup;
