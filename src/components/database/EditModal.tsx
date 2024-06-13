import React, { useState, useEffect } from 'react';
import { Input, Spinner, Button } from '@nextui-org/react';
import { useFetchDataDetails } from '@/hooks/useFetchData';

interface EditModalProps {
  itemUrl: string;
  activeConfig: string | null;
  onClose: () => void; // Prop pour fermer le modal et retourner à la vue précédente
}

interface ColumnConfig {
  key: string;
  label: string;
  dataPath: string;
}

const inputConfigs: { [key: string]: ColumnConfig[] } = {
  conferences: [
    { key: 'o:id', label: 'ID', dataPath: 'o:id' },
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
  ],
  conferenciers: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'jdc:hasUniversity', label: 'Université', dataPath: 'jdc:hasUniversity.0.display_title' },
  ],
};

function getValueByPath<T>(object: T[], path: string): any {
  if (!path) return undefined;
  if (!Array.isArray(object) || object.length === 0) return undefined;

  const keys = path.split('.');
  let value: any = object[0]; // Access the first element of the array

  for (const key of keys) {
    if (Array.isArray(value)) {
      value = value[parseInt(key)];
    } else if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

interface PropertyValue {
  type: string;
  property_id: number;
  property_label: string;
  '@value': string;
}

function buildOmekaSUpdateData(key: string, value: string): { [key: string]: PropertyValue[] } {
  const propertyIdMap: { [key: string]: number } = {
    'dcterms:title': 1, // Add more mappings if necessary
    // Add other property IDs as needed
  };

  if (!propertyIdMap[key]) {
    throw new Error(`Property ID for key "${key}" not found`);
  }
  console.log(value);
  return {
    [key]: [
      {
        type: 'literal',
        property_id: propertyIdMap[key],
        property_label: key,
        '@value': value,
      },
    ],
  };
}

async function updateResource(url: string, data: any): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update resource');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const EditModal: React.FC<EditModalProps> = ({ itemUrl, activeConfig, onClose }) => {
  const { data: itemDetailsData, loading: detailsLoading, error: detailsError } = useFetchDataDetails(itemUrl);
  const [itemData, setItemData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (itemDetailsData) {
      setItemData(itemDetailsData);
    }
  }, [itemDetailsData]);

  useEffect(() => {
    if (detailsError) {
      console.error('Error fetching item details:', detailsError);
    }
  }, [detailsError]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const updatedData = buildOmekaSUpdateData('dcterms:title', itemData['o:title']);
      await updateResource(itemUrl, updatedData);
      setSaving(false);
      onClose(); // Ferme le modal après la sauvegarde
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('An unknown error occurred');
      }
      setSaving(false);
    }
  };

  return (
    <div className='edit-modal'>
      <button onClick={onClose}>Retour au tableau</button>

      {activeConfig && !detailsLoading ? (
        itemDetailsData &&
        inputConfigs[activeConfig]?.map((col: ColumnConfig) => {
          const value = getValueByPath(itemDetailsData, col.dataPath);
          return (
            <Input
              key={col.key}
              size='lg'
              classNames={{
                label: 'text-semibold',
                inputWrapper: 'bg-default-100',
                input: 'h-[50px]',
              }}
              className='min-h-[50px]'
              type='text'
              label={col.label}
              labelPlacement='outside'
              placeholder={`Entrez ${col.label}`}
              isRequired
              defaultValue={value}
              onChange={(e) => setItemData({ ...itemData, [col.dataPath]: e.target.value })}
            />
          );
        })
      ) : (
        <Spinner />
      )}

      {saveError && <div className='error'>{saveError}</div>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};
