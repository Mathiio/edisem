import React from 'react';

interface DatavisHeaderProps {
  nodeCount: number;
  breadcrumb?: React.ReactNode;
  filterDropdown?: React.ReactNode;
}

export const DatavisHeader = ({ nodeCount, breadcrumb, filterDropdown }: DatavisHeaderProps) => {
  return (
    <div className='flex items-center justify-between px-4 border-b-2 border-c3 h-[62px] bg-c2 shadow-[inset_0_0px_15px_rgba(255,255,255,0.03)]'>
      <div className='flex items-center gap-2.5'>{breadcrumb}</div>
      <div className='flex items-center gap-2.5'>
        {filterDropdown}
        {nodeCount > 0 && <span className='text-sm text-c4'>{nodeCount} noeuds</span>}
      </div>
    </div>
  );
};
