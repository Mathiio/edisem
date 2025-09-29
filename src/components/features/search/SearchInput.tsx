import { forwardRef } from 'react';
import { Input, Kbd } from '@heroui/react';
import { SearchIcon } from '@/components/ui/icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = "Conférences, œuvres, intervenants, mots clés..." }, ref) => {
    return (
      <Input
        ref={ref}
        classNames={{
          base: 'w-full',
          clearButton: 'bg-c3',
          mainWrapper: 'h-full',
          input: 'text-100 Inter font-semibold text-16 nav_searchbar block focus:outline-none focus-visible:outline-none',
          inputWrapper: 'group-data-[focus=true]:bg-c1 rounded-12 font-normal text-c6 bg-c1 px-20 py-15 h-auto',
          innerWrapper: 'h-auto',
        }}
        placeholder={placeholder}
        size="sm"
        startContent={<SearchIcon size={18} />}
        endContent={<Kbd className="flex sm:flex font-semibold text-c6 text-12 px-[8px] py-5 bg-c3 gap-5">ESC</Kbd>}
        type="search"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
