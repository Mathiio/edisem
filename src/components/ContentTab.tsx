import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import { ContentMedia } from './ContentMedia';

export const ContentTab: React.FC = () => {
  const [selected, setSelected] = useState<string>('photos');

  return (
    <div className='flex w-full flex-col'>
      <Tabs
        classNames={{
          tabList: ' bg-default-50 w-full gap-sm p-0 ',
          cursor: 'w-full bg-secondary-400 rounded-sm ',
          tab: ' w-full px-0 h-12 bg-default-200 rounded-sm p-0 ',
          tabContent: 'group-data-[selected=true]:text-default-50 group-data-[selected=true]:font-semibold ',
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
