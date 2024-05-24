import React from 'react';
import { useSwitch, VisuallyHidden, SwitchProps } from '@nextui-org/react';
import { MoonIcon, SunIcon } from './icons';
import { useThemeMode } from '@/hooks/use-theme-mode';

export const ThemeSwitch: React.FC<SwitchProps> = (props) => {
  const { isDark, toggleThemeMode } = useThemeMode();
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    ...props,
    isSelected: isDark, // Set the initial selected state based on isDark
    onChange: () => toggleThemeMode(), // Toggle theme mode on change
  });

  return (
    <div className='flex flex-col gap-2'>
      <Component {...getBaseProps()}>
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: [
              'w-8 h-8',
              'flex items-center justify-center',
              'text-default-400 rounded-8  bg-transparent hover:bg-default-200',
            ],
          })}>
          {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </div>
      </Component>
    </div>
  );
};
