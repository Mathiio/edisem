import { useItemTooltip } from '@mui/x-charts/ChartsTooltip';
import { motion } from 'framer-motion';


interface DataEntry {
  keyword: string;
  count: number;
}

export function CustomItemTooltip({ dataset }: { dataset: DataEntry[] }) {
  const tooltip = useItemTooltip();
  if (!tooltip) return null;

  const idx = tooltip.identifier?.dataIndex;
  if (typeof idx !== 'number' || idx < 0 || idx >= dataset.length) return null;

  const item = dataset[idx];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} 
        className="bg-c2 p-4 flex flex-col items-start rounded-8 shadow-lg gap-5"
    >
        <p className='text-16 text-c6 text-medium'>{item.keyword}</p>
        <p className='text-14 text-c5'> Utilisé {item.count} fois </p>
    </motion.div>
  );
}