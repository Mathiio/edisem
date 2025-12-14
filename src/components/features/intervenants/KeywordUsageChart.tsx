import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSeminarConfs, getKeywords } from '@/services/Items';

const KeywordUsageChart: React.FC = () => {
    const [dataset, setDataset] = useState<{ keyword: string; count: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);

            const [confs, keywords] = await Promise.all([
              getSeminarConfs(),
              getKeywords(),
            ]);

            const keywordTitles = new Map<string, string>();
            keywords.forEach((kw: any) => {
              keywordTitles.set(kw.id, kw.title);
            });

            const keywordCount = new Map<string, number>();
            confs.forEach((conf: any) => {
              if (Array.isArray(conf.motcles)) {
                conf.motcles.forEach((motcle: any) => {
                  const keywordId =
                    typeof motcle === 'object' && motcle !== null && 'id' in motcle
                      ? motcle.id
                      : motcle;
                  if (keywordId) {
                    keywordCount.set(keywordId, (keywordCount.get(keywordId) || 0) + 1);
                  }
                });
              }
            });

            const sortedKeywords = Array.from(keywordCount.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 7);

            const transformedDataset = sortedKeywords
                .map(([keywordId, count]) => ({
                    keyword: keywordTitles.get(keywordId) || keywordId,
                    count,
                }));
                // Removed random sort to show top keywords consistently

            setDataset(transformedDataset);
          } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
    }, []);

    // Chart logic
    const data = dataset.map(d => ({ label: d.keyword, value: d.count }));
    const maxHeight = 400;

    // Find max value to normalize bars + buffer
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) * 1.2 : 10;
  
    // Y-axis ticks
    const step = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= maxValue; i += step) {
        ticks.push(i);
    }

  if (loading) {
    return (
        <p className="text-c6 w-full text-center">Chargement des données...</p>
    );
  }

  return (
    <section className="w-full flex flex-col gap-20 items-center">
      <h2 className='text-24 font-medium text-c6 text-center mb-2'>Mots clés les plus utilisés par nos intervenants</h2>
      
      <div className="w-fit h-[400px]">
        <div className="w-full flex gap-20 items-end justify-center" style={{ height: maxHeight }}>
          
          {/* Y Axis Labels */}
          <div className="flex flex-col justify-between h-full items-end pb-[55px] text-c5 text-14 font-light">
             {[...ticks].reverse().map(tick => (
                 <span key={tick}>{tick}</span>
             ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex gap-40 justify-center items-end h-full relative pl-20 border-l-2 border-dashed border-c3/30 text-c6">
            
            {data.map((item, index) => {
                 const heightPercent = ticks.length > 0 ? (item.value / ticks[ticks.length - 1]) * 100 : 0;
                 
                 return (
                     <div key={index} className="flex flex-col items-center gap-15 w-80 max-w-[60px] h-full group">
                         {/* Bar Container */}
                         <div className="relative w-full flex-1 bg-c2 border-2 border-c3 rounded-16 overflow-hidden">
                             {/* Filled Bar */}
                             <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${heightPercent}%` }}
                                 transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                                 className="absolute bottom-0 left-0 right-0 w-full rounded-14"
                                 style={{
                                     background: 'linear-gradient(to top, #291964 0%, #B4A4E5 100%)'
                                 }}
                             />
                         </div>
                         
                         {/* Label */}
                         <span className="text-center text-12 text-c6 font-medium leading-tight h-40 flex items-start justify-center">
                             {item.label}
                         </span>
                     </div>
                 );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeywordUsageChart;