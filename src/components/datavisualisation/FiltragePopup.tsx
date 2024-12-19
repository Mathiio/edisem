import React, { useState } from 'react';
import { Button, Select, SelectItem } from '@nextui-org/react';
import { PlusIcon } from '@/components/utils/icons';

// Définition du type pour une règle de filtrage
type FilterRule = {
  id: number; // Identifiant unique pour chaque règle
  type: 'Si' | 'Et' | 'Ou'; // Type de la règle : "Si", "Et", ou "Ou"
  condition: string; // Condition sélectionnée dans le premier sélecteur
  operator: string; // Opérateur sélectionné dans le deuxième sélecteur
  value: string; // Valeur saisie dans le champ d'entrée
  isChild?: boolean; // Indicateur pour savoir si la règle est une sous-condition
};

const FiltragePopup: React.FC = () => {
  // État des règles de filtrage
  const [filters, setFilters] = useState<FilterRule[]>([]);

  // Fonction pour ajouter une nouvelle règle de filtrage
  const addFilter = (type: 'Si' | 'Et' | 'Ou', isChild = false) => {
    setFilters((prev) => [...prev, { id: Date.now(), type, condition: '', operator: '', value: '', isChild }]);
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
    <div className='w-full border-b-1 pb-5'>
      {/* Bouton pour ajouter une règle */}
      <Button
        className='gap-5 font-14 p-2'
        startContent={<PlusIcon size={10} />}
        onPress={() => addFilter(filters.length === 0 ? 'Si' : 'Et')}>
        Ajouter une règle de filtrage
      </Button>

      {/* Liste des règles de filtrage */}
      <div className='mt-4 space-y-4'>
        {filters.map((filter, index) => (
          <div key={filter.id} className='flex flex-col space-y-2'>
            {/* Sélecteurs et type de condition */}
            <div className='flex items-center space-x-3'>
              {/* Affichage du type : "Si", "Et", ou "Ou" */}
              {index === 0 ? (
                <span>{filter.type}</span>
              ) : (
                !filter.isChild && (
                  <Select
                    className='w-24'
                    placeholder='Et / Ou'
                    value={filter.type}
                    onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'type')}>
                    <SelectItem value='Et' key={''}>
                      Et
                    </SelectItem>
                    <SelectItem value='Ou' key={''}>
                      Ou
                    </SelectItem>
                  </Select>
                )
              )}

              {/* Sélecteur de condition */}
              {!filter.isChild && (
                <Select
                  className='w-40'
                  placeholder='Condition'
                  value={filter.condition}
                  onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'condition')}>
                  <SelectItem value='conference' key={''}>
                    Conférence
                  </SelectItem>
                  <SelectItem value='webinaire' key={''}>
                    Webinaire
                  </SelectItem>
                </Select>
              )}

              {/* Sélecteur d'opérateur */}
              <Select
                className='w-40'
                placeholder='Opérateur'
                value={filter.operator}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>, filter.id, 'operator')}>
                <SelectItem value='contains' key={''}>
                  Contient
                </SelectItem>
                <SelectItem value='equals' key={''}>
                  Égale à
                </SelectItem>
              </Select>
            </div>

            {/* Champ de saisie pour la valeur */}
            <input
              type='text'
              className='w-full px-2 py-1 border rounded bg-gray-800 text-gray-300'
              placeholder='Nom...'
              value={filter.value}
              onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
            />

            {/* Bouton pour ajouter une sous-condition */}
            {(filter.type === 'Et' || filter.type === 'Ou') && (
              <Button
                variant='ghost'
                className='gap-5 font-14 p-2 text-gray-400'
                onPress={() => addFilter(filter.type, true)}>
                Ajouter une condition
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FiltragePopup;
