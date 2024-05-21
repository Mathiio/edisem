import { useThemeMode } from '@/hooks/use-theme-mode';
import { Link } from '@/theme/components';
import { ButtonProps } from '@nextui-org/react';
import { SunIcon, MoonIcon } from '@/components/icons';

export const ChangeThemeButton = (props: ButtonProps) => {
  const { isDark, toggleThemeMode } = useThemeMode();

  return (
    <Link onClick={toggleThemeMode} className='cursor-pointer'>
      {isDark ? (
        <SunIcon className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200' />
      ) : (
        <MoonIcon className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200' />
      )}
    </Link>
  );
};
