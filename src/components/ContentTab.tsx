import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import { ContentMedia } from './ContentMedia';

export const ContentTab: React.FC = () => {
  const [selected, setSelected] = useState<string>('photos');

  return (
    <div className='flex w-full flex-col gap-25'>
      <Tabs
        classNames={{
          tabList: 'bg-default-100 w-full gap-10',
          cursor: 'w-full rounded-sm ',
          tab: 'w-full bg-default-200 rounded-8 p-10 ',
          tabContent: 'group-data-[selected=true]:text-default-500  group-data-[selected=true]:font-semibold ',
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
