import React, { useState, useRef, useEffect } from 'react';
import {
  ChartContainer,
  BarPlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltipContainer,
  ChartsClipPath,
} from '@mui/x-charts';
import { getActants, getConfs, getKeywords } from '@/lib/Items';
import { CustomItemTooltip } from '@/components/features/intervenants/CustomToolTip';


const KeywordUsageChart: React.FC = () => {
    const [colors, setColors] = useState({ c6: '', action: '' });
    const [dataset, setDataset] = useState<{ keyword: string; count: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const c6Ref = useRef<HTMLDivElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);

    const id = React.useId();
    const clipPathId = `${id}-clip-path`;

    useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [actants, confs, keywords] = await Promise.all([
          getActants(),
          getConfs(),
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
            }))
            .sort(() => Math.random() - 0.5);

        setDataset(transformedDataset);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    useEffect(() => {
    if (c6Ref.current && actionRef.current) {
      const c6 = getComputedStyle(c6Ref.current).color;
      const action = getComputedStyle(actionRef.current).color;
      setColors({ c6, action });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
        <div ref={c6Ref} className="text-c6 hidden" />
        <div ref={actionRef} className="text-action hidden" />
      <h2 className='text-16 font-medium text-c6 text-center mb-2'>Mots clés les plus utilisés par nos intervenants</h2>
      <div className='flex w-full justify-center'>
        <ChartContainer
          dataset={dataset}
          height={400}
          width={1000}
          xAxis={[{ scaleType: 'band', dataKey: 'keyword'}]}
          series={[{ type: 'bar', dataKey: 'count', label: 'Utilisation', color: colors.action }]}>
          <ChartsClipPath id={clipPathId} />
          <g clipPath={`url(#${clipPathId})`}>
            <BarPlot borderRadius={10}/>
          </g>
          <ChartsXAxis
            scaleType="band"
            dataKey="keyword"
            disableLine
            disableTicks
            valueFormatter={(value: string) => value.length > 14 ? value.slice(0, 14) + '…' : value}
          />
          <ChartsYAxis
            disableLine
            disableTicks
            sx={{
              '.MuiChartsAxis-tickLabel': {
                    display: 'none',
                },
            }}
          />
          <ChartsTooltipContainer trigger='item'>
            <CustomItemTooltip dataset={dataset} />
          </ChartsTooltipContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default KeywordUsageChart;