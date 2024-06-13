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

  const saveChanges = async () => {
    try {
      setSaving(true);

      // Prepare payload with itemData
      const payload = { ...itemData };

      // Replace with your API endpoint and method (PUT)
      const response = await fetch(`${itemUrl}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Handle successful response
      const responseData = await response.json();
      console.log('Updated item:', responseData);

      setSaving(false);
      onClose(); // Close modal after successful save
    } catch (error) {
      console.error('Error saving item:', error);
      setSaveError('Error saving item. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
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

        {saveError && <div className='error-message'>{saveError}</div>}

        <Button className='mt-4' onClick={saveChanges} disabled={saving}>
          {saving ? <Spinner color='white' size='sm' /> : 'Enregistrer'}
        </Button>
      </div>
    </>
  );
};
