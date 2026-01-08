import React, { useState, useCallback } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { Layouts } from '@/components/layout/Layouts';
import { UserIcon, SchoolIcon, EditIcon, ExperimentationIcon } from '@/components/ui/icons';
import { StudentManagement } from './StudentManagement';
import { CourseManagement } from './CourseManagement';
import { ActantManagement } from './ActantManagement';
import ResourceManagement from './ResourceManagement';

type TabKey = 'etudiants' | 'cours' | 'actants' | 'ressources';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('etudiants');
  const [highlightCourseId, setHighlightCourseId] = useState<number | null>(null);

  // Fonction pour naviguer vers un cours avec highlight
  const navigateToCourse = useCallback((courseId: number) => {
    // Reset puis set pour déclencher le useEffect même si c'est le même cours
    setHighlightCourseId(null);
    setActiveTab('cours');
    setTimeout(() => {
      setHighlightCourseId(courseId);
      // Reset après 3.5 secondes (après la fin de l'animation)
      setTimeout(() => {
        setHighlightCourseId(null);
      }, 3500);
    }, 50);
  }, []);

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
          cursor: 'bg-c4',
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
        <Tab
          key='actants'
          title={
            <div className='flex items-center gap-2'>
              <EditIcon size={18} />
              <span>Actants</span>
            </div>
          }
        />
        <Tab
          key='ressources'
          title={
            <div className='flex items-center gap-2'>
              <ExperimentationIcon size={18} />
              <span>Ressources</span>
            </div>
          }
        />
      </Tabs>

      {/* Contenu */}
      <div>
        {activeTab === 'etudiants' && <StudentManagement embedded onNavigateToCourse={navigateToCourse} />}
        {activeTab === 'cours' && <CourseManagement embedded highlightCourseId={highlightCourseId} />}
        {activeTab === 'actants' && <ActantManagement embedded />}
        {activeTab === 'ressources' && <ResourceManagement embedded onNavigateToCourse={navigateToCourse} />}
      </div>
    </Layouts>
  );
};

export default AdminDashboard;
