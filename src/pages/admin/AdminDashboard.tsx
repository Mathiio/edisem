import React, { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { Layouts } from '@/components/layout/Layouts';
import { UserIcon, SchoolIcon } from '@/components/ui/icons';
import { StudentManagement } from './StudentManagement';
import { CourseManagement } from './CourseManagement';

type TabKey = 'etudiants' | 'cours';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('etudiants');

  return (
    <Layouts className='flex flex-col col-span-10 gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-32 font-semibold text-c6'>Administration</h1>
      </div>

      {/* Tabs de navigation */}
      <Tabs
        aria-label='Navigation admin'
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as TabKey)}
        classNames={{
          tabList: 'bg-c2 p-1 rounded-12',
          cursor: 'bg-action',
          tab: 'h-10 px-6 min-h-[40px]',
          tabContent: 'group-data-[selected=true]:text-selected text-c5 min-h-[40px] flex items-center',
        }}>
        <Tab
          key='etudiants'
          title={
            <div className='flex items-center gap-2'>
              <UserIcon size={18} />
              <span>Étudiants</span>
            </div>
          }
        />
        <Tab
          key='cours'
          title={
            <div className='flex items-center gap-2'>
              <SchoolIcon size={18} />
              <span>Cours</span>
            </div>
          }
        />
      </Tabs>

      {/* Contenu */}
      <div>
        {activeTab === 'etudiants' && <StudentManagement embedded />}
        {activeTab === 'cours' && <CourseManagement embedded />}
      </div>
    </Layouts>
  );
};

export default AdminDashboard;
