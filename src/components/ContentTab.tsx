import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import { ContentMedia } from './ContentMedia';

export const ContentTab: React.FC = () => {
  const [selected, setSelected] = useState<string>('Bibliographie');

  return (
    <div className='flex w-full flex-col gap-25'>
      <Tabs
        classNames={{
          tabList: 'w-full gap-10 bg-default-0 rounded-8',
          cursor: 'w-full',
          tab: 'w-full bg-default-200 data-[selected=true]:bg-default-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-default-300 transition-all ease-in-out duration-200n',
          tabContent: 'group-data-[selected=true]:text-default-100 group-data-[selected=true]:font-semibold',
        }}
        aria-label='Options'
        selectedKey={selected}
        onSelectionChange={(key: React.Key) => setSelected(key as string)}>
        <Tab key='Bibliographie' title='Bibliographie' className='px-0 py-0 flex'>
          {selected === 'Bibliographie' && <ContentMedia numberOfCards={35} />}
        </Tab>
        <Tab key='Citations' title='Citations' className='px-0 py-0 flex'>
          {selected === 'Citations' && <ContentMedia numberOfCards={35} />}
        </Tab>
        <Tab key='Medias' title='Médias' className='px-0 py-0 flex'>
          {selected === 'Medias' && <ContentMedia numberOfCards={35} />}
        </Tab>
        <Tab key='Annexes' title='Annexes' className='px-0 py-0 flex'>
          {selected === 'Annexes' && <ContentMedia numberOfCards={35} />}
        </Tab>
      </Tabs>
    </div>
  );
};
