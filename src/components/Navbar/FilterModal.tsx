import { useRef, useState, useEffect, useCallback } from 'react';
import { FilterIcon, CloseIcon, CalendarIcon, UserIcon } from '@/components/Utils/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import { DateRangePicker } from '@nextui-org/date-picker';
import { NavConferencierFilter } from './NavConferencierFilter';
import { NavTypeFilter } from './NavTypeFilter';
import { Button } from '@nextui-org/button';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';

export const FilterModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null);
  const [selectedConferenciers, setSelectedConferenciers] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [resetFilters, setResetFilters] = useState(false);

  const handleOpen = () => {
    onOpen();
  };

  const handleReset = () => {
    setResetFilters(true);
    setDateRange(null);
    setSelectedConferenciers([]);
    setSelectedTypes([]);
    setTimeout(() => setResetFilters(false), 0);
  };

  const handleConferencierClick = (index: number) => {
    setSelectedConferenciers((prevSelected) =>
      prevSelected.includes(index) ? prevSelected.filter((i) => i !== index) : [...prevSelected, index],
    );
  };

  const handleTypeClick = (index: number) => {
    setSelectedTypes((prevSelected) =>
      prevSelected.includes(index) ? prevSelected.filter((i) => i !== index) : [...prevSelected, index],
    );
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedFiltersCount = useCallback(() => {
    let count = 0;
    if (dateRange) count += 1;
    count += selectedConferenciers.length;
    count += selectedTypes.length;
    return count;
  }, [dateRange, selectedConferenciers, selectedTypes]);

  return (
    <>
      <Button
        onPress={handleOpen}
        className='bg-default-200 hover:bg-default-300 data-[hover=true]:opacity-100 items-center gap-25 p-25 h-[50px] hidden sm:flex'>
        <FilterIcon className='text-default-600' size={22} />
      </Button>

      <Modal
        backdrop='blur'
        className='bg-default-100'
        size='2xl'
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center justify-between p-25 border-b-2 border-default-300'>
                <div className='flex flex-row gap-25 items-center text-24'>Filtres</div>
                <Link onPress={onClose}>
                  <CloseIcon
                    className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-col gap-25'>
                  <div className='flex flex-col gap-10'>
                    <div className='flex flex-row items-center gap-10'>
                      <CalendarIcon className='text-default-600' size={20} />
                      <div className='text-default-600 font-semibold'>Date de publication</div>
                    </div>
                    <div className='sm:max-w-[350px]'>
                      <DateRangePicker
                        classNames={{
                          selectorButton: 'w-[50px] rounded-8',
                          calendarContent: 'rounded-8',
                          calendar: 'rounded-8',
                          timeInput: 'rounded-8',
                          timeInputWrapper: 'rounded-8',
                        }}
                        color='secondary'
                        visibleMonths={3}
                        pageBehavior='single'
                        label='Date de publication'
                        selectorIcon={<CalendarIcon size={20} />}
                        className='h-full'
                        value={dateRange}
                        onChange={setDateRange}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-10'>
                    <div className='flex flex-row items-center gap-10'>
                      <UserIcon className='text-default-600' size={20} />
                      <div className='text-default-600 font-semibold'>Conférenciers</div>
                    </div>
                    <div>
                      <NavConferencierFilter
                        numberOfButtons={50}
                        onClick={handleConferencierClick}
                        reset={resetFilters}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-10'>
                    <div className='flex flex-row items-center gap-10'>
                      <CalendarIcon className='text-default-600' size={20} />
                      <div className='text-default-600 font-semibold'>Type de contenus</div>
                    </div>
                    <div>
                      <NavTypeFilter
                        buttonNames={['Image', 'Vidéo', 'Document texte', 'Bande sonore']}
                        onClick={handleTypeClick}
                        reset={resetFilters}
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalHeader className='flex items-center justify-between p-25 '>
                <div className='flex flex-row gap-25 items-center text-16'>{selectedFiltersCount()} sélectionnés</div>
                <div className='flex flex-row gap-25'>
                  <Button
                    radius='none'
                    onClick={handleReset}
                    className={`h-[32px] text-16 rounded-8 text-default-500 bg-default-200 hover:text-default-500 hover:bg-default-300 transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Réinitialiser
                  </Button>
                  <Button
                    onPress={onClose}
                    radius='none'
                    className={`h-[32px] text-16 rounded-8 text-default-100 bg-default-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Appliquer
                  </Button>
                </div>
              </ModalHeader>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
