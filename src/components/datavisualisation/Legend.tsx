import { FC } from 'react';
import { ArrowIcon } from '@/components/utils/icons';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";


const Legend: FC = () => {
  return (
    <div className='fixed bottom-25 left-25'>
        <Dropdown className='min-w-[160px] w-fit p-1.5 rounded-8 shadow-lg flex flex-col gap-3 bg-c2'>
            <DropdownTrigger className='bg-c2'>
                <Button 
                size={"lg"}
                    endContent={<ArrowIcon size={14} className='text-c6 rotate-90' />}
                    className='px-4 py-4 flex justify-between gap-2 text-c6 rounded-8 w-[160px]'>
                        Légende
                </Button>
                </DropdownTrigger>
                <DropdownMenu variant='flat' className='gap-1.5'>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle5.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Mot clé</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle6.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Citation</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start  gap-0.5'>
                            <img src="/bulle7.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Actant</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle2.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Bibliographie</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle3.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Médiagraphie</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle1.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Conférence</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle4.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Établissement</p>
                        </div>
                    </DropdownItem>
                    <DropdownItem className="pr-0">
                        <div className='flex items-center justify-start gap-0.5'>
                            <img src="/bulle8.png" alt="" className='w-7'/>
                            <p className="text-c6 text-14">Collection</p>
                        </div>
                    </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </div>

  );
};

export default Legend;
