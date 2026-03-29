import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import {
  CitationIcon,
  ConferenceIcon,
  UserIcon,
  KeywordIcon,
  CountryIcon,
  UniversityIcon,
  LaboritoryIcon,
  SchoolIcon,
} from '@/components/ui/icons';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface CreateType {
  key: string;
  label: string;
  description: string;
  icon: IconComponent;
  iconColor: string;
  iconBg: string;
  type: number;
  config: string;
}

const CREATE_TYPES: CreateType[] = [
  { key: 'citation', label: 'Citation', description: 'Extrait textuel référencé', icon: CitationIcon, iconColor: 'text-violet-400', iconBg: 'bg-violet-400/15', type: 80, config: 'citations' },
  { key: 'conference', label: 'Conférence', description: 'Communication ou présentation', icon: ConferenceIcon, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/15', type: 71, config: 'conferences' },
  { key: 'actant', label: 'Conférencier', description: 'Intervenant ou chercheur', icon: UserIcon, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-400/15', type: 72, config: 'conferenciers' },
  { key: 'keyword', label: 'Mot clé', description: 'Concept ou terme indexé', icon: KeywordIcon, iconColor: 'text-amber-400', iconBg: 'bg-amber-400/15', type: 34, config: 'motcles' },
  { key: 'pays', label: 'Pays', description: 'Entité géographique nationale', icon: CountryIcon, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-400/15', type: 94, config: 'pays' },
  { key: 'university', label: 'Université', description: "Établissement d'enseignement supérieur", icon: UniversityIcon, iconColor: 'text-rose-400', iconBg: 'bg-rose-400/15', type: 73, config: 'universites' },
  { key: 'laboratory', label: 'Laboratoire', description: 'Unité de recherche', icon: LaboritoryIcon, iconColor: 'text-orange-400', iconBg: 'bg-orange-400/15', type: 91, config: 'laboratoire' },
  { key: 'doctoralschool', label: 'École doctorale', description: 'Structure de formation doctorale', icon: SchoolIcon, iconColor: 'text-teal-400', iconBg: 'bg-teal-400/15', type: 74, config: 'ecolesdoctorales' },
];

interface CreateViewProps {
  onCreateItem: (typeNumber: number, config: string) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({ onCreateItem }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleCreate = () => {
    if (!selectedType) return;
    const item = CREATE_TYPES.find((t) => t.key === selectedType);
    if (item) onCreateItem(item.type, item.config);
  };

  const selectedItem = CREATE_TYPES.find((t) => t.key === selectedType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className='flex flex-col gap-6'>
      {/* Grille de types */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
        {CREATE_TYPES.map((type) => {
          const isSelected = selectedType === type.key;
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`
                group flex flex-col gap-4 p-5 rounded-2xl border-2 text-left
                transition-all duration-200 cursor-pointer
                ${isSelected ? 'border-action bg-action/10' : 'border-c3 bg-c2 hover:bg-c3 hover:border-c4'}
              `}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${type.iconBg} ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon size={20} className={type.iconColor} />
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-sm font-semibold text-c6 leading-tight'>{type.label}</span>
                <span className='text-xs text-c4 leading-snug'>{type.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barre d'action */}
      <div className='flex items-center justify-between gap-4 p-4 rounded-2xl bg-c2 border-2 border-c3'>
        <p className='text-sm text-c5'>
          {selectedItem ? (
            <>Type sélectionné : <span className='font-medium text-c6'>{selectedItem.label}</span></>
          ) : (
            'Sélectionnez un type pour continuer'
          )}
        </p>
        <Button
          size='sm'
          className='bg-action text-selected h-[36px] px-5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'
          onPress={handleCreate}
          isDisabled={!selectedType}>
          {selectedItem ? `Créer un(e) ${selectedItem.label}` : 'Créer un élément'}
        </Button>
      </div>
    </motion.div>
  );
};
