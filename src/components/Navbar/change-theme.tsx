import { Link } from '@/theme/components';
import { SunIcon, MoonIcon } from '@/components/Utils/icons';

interface ChangeThemeButtonProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ChangeThemeButton: React.FC<ChangeThemeButtonProps> = ({ isDark, toggleTheme }) => {
  return (
    <Link onClick={toggleTheme} className='cursor-pointer'>
      {isDark ? (
        <SunIcon
          size={18}
          className='text-c4 hover:text-c6 hover:opacity-100 transition-all ease-in-out duration-200'
        />
      ) : (
        <MoonIcon
          size={18}
          className='text-c4 hover:text-c6 hover:opacity-100 transition-all ease-in-out duration-200'
        />
      )}
    </Link>
  );
};
