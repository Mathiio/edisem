import React, { useState } from 'react';
import { Input, Textarea, Slider, Button } from '@heroui/react';
import { Card, CardBody } from '@heroui/react';
import { experimentationStudentConfig } from '@/pages/generic/config/experimentationStudentConfig';

interface ExperimentationFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formulaire de création d'une nouvelle expérimentation
 * Basé sur experimentationStudentConfig.formFields
 */
export const ExperimentationForm: React.FC<ExperimentationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    title: '',
    description: '',
    abstract: '',
    percentage: 0,
    status: '',
    date: '',
    url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when field is modified
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields based on config
    experimentationStudentConfig.formFields?.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} est requis`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-25'>
      {/* Informations générales */}
      <Card className='bg-c2 border border-c3'>
        <CardBody className='p-25 flex flex-col gap-25'>
          <h3 className='text-20 font-semibold text-c6 mb-10'>Informations générales</h3>

          {/* Titre */}
          <div>
            <Input
              label='Titre'
              labelPlacement='outside'
              placeholder="Titre de l'expérimentation"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              isRequired
              isInvalid={!!errors.title}
              errorMessage={errors.title}
              classNames={{
                label: 'text-semibold !text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              label='Description'
              labelPlacement='outside'
              placeholder='Décrivez votre expérimentation...'
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              minRows={4}
              classNames={{
                label: 'text-semibold text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>

          {/* Hypothèse */}
          <div>
            <Textarea
              label='Hypothèse'
              labelPlacement='outside'
              placeholder='Hypothèse à expérimenter...'
              value={formData.abstract}
              onChange={(e) => handleChange('abstract', e.target.value)}
              minRows={3}
              classNames={{
                label: 'text-semibold text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* État et progression */}
      <Card className='bg-c2 border border-c3'>
        <CardBody className='p-25 flex flex-col gap-25'>
          <h3 className='text-20 font-semibold text-c6 mb-10'>État et progression</h3>

          {/* Avancement */}
          <div>
            <label className='text-semibold text-c6 text-18 mb-10 block'>
              Avancement: {formData.percentage}%
            </label>
            <Slider
              size='sm'
              step={5}
              maxValue={100}
              minValue={0}
              value={formData.percentage}
              onChange={(value) => handleChange('percentage', value)}
              className='max-w-full'
              classNames={{
                track: 'bg-c3',
                filler: 'bg-action',
                thumb: 'bg-action',
              }}
            />
          </div>

          {/* Statut */}
          <div>
            <Input
              label='Statut'
              labelPlacement='outside'
              placeholder='En cours, Terminé, Suspendu...'
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              classNames={{
                label: 'text-semibold !text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>

          {/* Date */}
          <div>
            <Input
              label='Date'
              labelPlacement='outside'
              type='date'
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              classNames={{
                label: 'text-semibold !text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Liens externes */}
      <Card className='bg-c2 border border-c3'>
        <CardBody className='p-25 flex flex-col gap-25'>
          <h3 className='text-20 font-semibold text-c6 mb-10'>Liens externes</h3>

          {/* URL */}
          <div>
            <Input
              label='Lien externe'
              labelPlacement='outside'
              type='url'
              placeholder='https://...'
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              classNames={{
                label: 'text-semibold !text-c6 text-18 mb-5',
                inputWrapper: 'bg-c1 shadow-none border-1 border-c3',
                input: 'text-c6',
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Boutons d'action */}
      <div className='flex items-center justify-end gap-10 pt-25'>
        <Button
          size='md'
          className='bg-c3 text-c6 hover:bg-c4 rounded-8'
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          size='md'
          className='bg-action text-selected rounded-8'
          onPress={handleSubmit}
          isLoading={isSubmitting}
        >
          Créer l'expérimentation
        </Button>
      </div>
    </div>
  );
};

export default ExperimentationForm;
