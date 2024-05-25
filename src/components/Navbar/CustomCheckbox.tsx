import React from 'react';
import { useCheckbox, Chip, VisuallyHidden, tv, CheckboxProps } from '@nextui-org/react';
import { CalendarIcon } from '../Utils/icons';

const checkbox = tv({
  slots: {
    base: 'border-default hover:bg-default-200',
    content: 'text-default-500',
  },
  variants: {
    isSelected: {
      true: {
        base: 'border-primary bg-primary hover:bg-primary-500 hover:border-primary-500',
        content: 'text-primary-foreground pl-1',
      },
    },
    isFocusVisible: {
      true: {
        base: 'outline-none ring-2 ring-focus ring-offset-2 ring-offset-background',
      },
    },
  },
});

interface CustomCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  children?: React.ReactNode;
  onChange?: (value: string[]) => void;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ children, onChange, ...props }) => {
  const { isSelected, isFocusVisible, getBaseProps, getLabelProps, getInputProps } = useCheckbox({
    ...props,
  });

  const styles = checkbox({ isSelected, isFocusVisible });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked && onChange) {
      if (Array.isArray(props.value)) {
        // Vérifie si props.value est un tableau
        onChange([...props.value, value]);
      }
    } else if (!checked && onChange) {
      if (Array.isArray(props.value)) {
        // Vérifie si props.value est un tableau
        onChange(props.value.filter((item) => item !== value));
      }
    }
  };

  return (
    <label {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps({ onChange: handleChange })} />
      </VisuallyHidden>
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        color='primary'
        startContent={isSelected ? <CalendarIcon size={22} /> : null}
        variant='faded'
        {...getLabelProps()}>
        {children ? children : isSelected ? 'Enabled' : 'Disabled'}
      </Chip>
    </label>
  );
};
