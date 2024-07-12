import { useThemeMode } from '@/hooks/use-theme-mode';
import { Link } from '@/theme/components';
import { SunIcon, MoonIcon } from '@/components/Utils/icons';

export const ChangeThemeButton = () => {
  const { isDark, toggleThemeMode } = useThemeMode();

  return (
    <Link onClick={toggleThemeMode} className='cursor-pointer'>
      {isDark ? (
        <SunIcon
          size={18}
          className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200'
        />
      ) : (
        <MoonIcon
          size={18}
          className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200'
        />
      )}
    </Link>
  );
};
