import { useRef, useState, useEffect, useCallback } from 'react';
import { FilterIcon, CrossIcon, CalendarIcon, UserIcon } from '@/components/utils/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { DateRangePicker } from "@heroui/date-picker";
import { NavConferencierFilter } from '@/components/navbar/NavConferencierFilter';
import { NavTypeFilter } from '@/components/navbar/NavTypeFilter';
import { Button } from "@heroui/button";
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
    console.log(selectedConferenciers);
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
      <div className='relative'>
        <Button
          onPress={handleOpen}
          className='bg-c3 hover:bg-c4 data-[hover=true]:opacity-100 items-center gap-25 p-25 h-[50px] hidden sm:flex relative'>
          <FilterIcon className='text-c6' size={22} />
        </Button>
        {selectedFiltersCount() > 0 && (
          <span className='absolute top-[-6px] right-[-6px] text-12 text-100  bg-action rounded-[99px] w-[20px] h-[20px] flex items-center justify-center '>
            {selectedFiltersCount()}
          </span>
        )}
      </div>

      <Modal
        backdrop='blur'
        className='bg-c2'
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
              <ModalHeader className='flex items-center justify-between p-25 border-b-2 bg-c4'>
                <div className='flex flex-row gap-25 items-center text-24'>Filtres</div>
                <Link onPress={onClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-col gap-25'>
                  <div className='flex flex-col gap-10'>
                    <div className='flex flex-row items-center gap-10'>
                      <CalendarIcon className='text-c6' size={20} />
                      <div className='text-c6 font-semibold'>Date de publication</div>
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
                      <UserIcon className='text-c6' size={20} />
                      <div className='text-c6 font-semibold'>Conférenciers</div>
                    </div>
                    <div>
                      <NavConferencierFilter
                        numberOfButtons={50}
                        selected={selectedConferenciers}
                        onClick={handleConferencierClick}
                        reset={resetFilters}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-10'>
                    <div className='flex flex-row items-center gap-10'>
                      <CalendarIcon className='text-c6' size={20} />
                      <div className='text-c6 font-semibold'>Type de contenus</div>
                    </div>
                    <div>
                      <NavTypeFilter
                        buttonNames={['Image', 'Vidéo', 'Document texte', 'Bande sonore']}
                        selected={selectedTypes}
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
                    className={`h-[32px] text-16 rounded-8 text-c6 bg-c3 hover:text-c6 hover:bg-c4 transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Réinitialiser
                  </Button>
                  <Button
                    onPress={onClose}
                    radius='none'
                    className={`h-[32px] text-16 rounded-8 text-100 bg-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
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
