import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import { ContentMedia } from './ContentMedia';

export const ContentTab: React.FC = () => {
  const [selected, setSelected] = useState<string>('photos');

  return (
    <div className='flex w-full flex-col gap-25'>
      <Tabs
        classNames={{
          tabList: 'w-full bg-default-100 gap-10',
          cursor: 'w-full rounded-8',
          tab: 'w-full bg-default-200 data-[selected=true]:bg-default-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-default-300 ',
          tabContent: 'w-full group-data-[selected=true]:text-default-100 data-[selected=true]:bg-default-action group-data-[selected=true]:font-semibold ',
        }}
        aria-label='Options'
        selectedKey={selected}
        onSelectionChange={(key: React.Key) => setSelected(key as string)}>
        <Tab key='Bibliographie' title='Bibliographie'>
          <div>dfsdfsdsdf</div>
        </Tab>
        <Tab key='Citations' title='Citations'>
          <div>sss</div>
        </Tab>
        <Tab key='Medias' title='Médias' className='px-0 py-0'>
          <ContentMedia numberOfCards={7} />
        </Tab>

        <Tab key='Annexes' title='Annexes'>
          <div>dfsddffssdf</div>
        </Tab>
      </Tabs>
    </div>
  );
};
