import { Button, Divider, Select, SelectItem } from '@heroui/react';
import React from 'react';
import { useEffect } from 'react';
import { ExhangeIcon } from '@/components/utils/icons';

interface Node {
  id: string;
  fullTitle: string;
}

interface LinkPopupProps {
  firstSelectedNode: Node | null;
  secondSelectedNode: Node | null;
  onConnect: (linkType: string) => void;
  onCancel: () => void;
}

const LINK_TYPES = [
  { key: 'dependency', label: 'Dépendance' },
  { key: 'association', label: 'Association' },
  { key: 'composition', label: 'Composition' },
  { key: 'inheritance', label: 'Héritage' },
];

export default function LinkPopup({ firstSelectedNode, secondSelectedNode, onConnect, onCancel }: LinkPopupProps) {
  const [selectedLinkType, setSelectedLinkType] = React.useState<string>('');

  const handleSelectionChange = (keys: any) => {
    const selectedArray = Array.from(keys);
    if (selectedArray.length > 0) {
      setSelectedLinkType(selectedArray[0] as string);
    }
  };

  useEffect(() => {
    if (firstSelectedNode && secondSelectedNode) {
      console.log('Nœuds sélectionnés:', firstSelectedNode.fullTitle, secondSelectedNode.fullTitle);
    }
  }, [firstSelectedNode, secondSelectedNode]);

  const handleConnectClick = () => {
    if (firstSelectedNode && secondSelectedNode && selectedLinkType) {
      onConnect(selectedLinkType);
    } else {
      console.warn('Veuillez sélectionner deux nœuds et un type de lien avant de connecter');
    }
  };

  const handleCancelClick = () => {
    onCancel();
    setSelectedLinkType('');
  };

  const isConnectDisabled = !firstSelectedNode || !secondSelectedNode || !selectedLinkType;

  return (
    <div className='w-full flex flex-col gap-4 h-full overflow-hidden justify-between'>
      <div className='text-14 flex justify-start leading-[150%] w-full gap-2 rounded-0 text-c6 bg-transparent'>
        Connecter des données
      </div>
      <Divider />

      <div className='flex flex-row gap-20 items-center'>
        {/* Premier nœud */}
        <div
          className={`text-14 text-c6 py-4 w-full bg-c3 rounded-8 flex flex-col justify-center items-center ${
            !firstSelectedNode ? 'border-2 border-white' : ''
          }`}>
          {firstSelectedNode ? firstSelectedNode.fullTitle : <div className='loader'></div>}
        </div>

        <div className='text-c6'>
          <ExhangeIcon size={30} />
        </div>

        {/* Deuxième nœud */}
        <div
          className={`text-14 text-c6 py-4 w-full bg-c3 rounded-8 flex flex-col justify-center items-center ${
            firstSelectedNode && !secondSelectedNode ? 'border-2 border-white opacity-100' : ''
          } ${
            !firstSelectedNode
              ? 'opacity-50'
              : firstSelectedNode && !secondSelectedNode
                ? ''
                : !secondSelectedNode
                  ? 'opacity-50'
                  : ''
          }`}>
          {secondSelectedNode ? secondSelectedNode.fullTitle : <div className='loader'></div>}
        </div>
      </div>

      <Select
        className='h-[60px]'
        onSelectionChange={handleSelectionChange}
        classNames={{
          base: 'flex flex-row gap-2',
          innerWrapper: '',
          trigger: 'h-[40px] rounded-8 bg-c3',
          selectorIcon: 'text-c6',
          listboxWrapper: 'bg-c3',
        }}
        label='Type de lien'
        labelPlacement='outside-left'
        placeholder='Sélectionnez un type de lien'>
        {LINK_TYPES.map((type) => (
          <SelectItem className='text-c6 bg-c3' key={type.key}>
            {type.label}
          </SelectItem>
        ))}
      </Select>

      <div className='flex justify-end gap-2 mt-4'>
        <Button
          className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
          variant='flat'
          onClick={handleCancelClick}>
          Réinitialiser
        </Button>
        <Button
          className='text-16 h-auto px-10 py-5 rounded-8 text-selected gap-2 bg-action disabled:opacity-50 disabled:hover:opacity-50 transition-all ease-in-out duration-200'
          color='primary'
          onClick={handleConnectClick}
          disabled={isConnectDisabled}>
          Connecter
        </Button>
      </div>
    </div>
  );
}
