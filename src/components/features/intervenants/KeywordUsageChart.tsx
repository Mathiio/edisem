import React, { useState, useEffect } from 'react';
import { ChartContainer, BarPlot, ChartsXAxis, ChartsYAxis, ChartsTooltipContainer, ChartsClipPath } from '@mui/x-charts';
import { getSeminarConfs, getKeywords } from '@/lib/Items';
import { CustomItemTooltip } from '@/components/features/intervenants/CustomToolTip';



const getTailwindColor = (className: string, property: 'color' | 'fill' = 'fill'): string => {
  const el = document.createElement('div');
  el.className = className;
  document.body.appendChild(el);
  const color = getComputedStyle(el).getPropertyValue(property);
  document.body.removeChild(el);
  return color.trim();
};


const KeywordUsageChart: React.FC = () => {
    const [dataset, setDataset] = useState<{ keyword: string; count: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionColor, setActionColor] = useState<string>('#6B53BA');
    const [actionColor2, setActionColor2] = useState<string>('#B4A4E5');

    const id = React.useId();
    const clipPathId = `${id}-clip-path`;
    const gradientId = `${id}-bar-gradient`;

    useEffect(() => {
        setActionColor(getTailwindColor('fill-action'));
        setActionColor2(getTailwindColor('fill-action2'));
    }, []);

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
            }))
            .sort(() => Math.random() - 0.5);

        setDataset(transformedDataset);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
        <p className="text-c6 w-full text-center">Chargement des données...</p>
    );
  }

  return (
    <div className='w-full'>
      <h2 className='text-16 font-medium text-c6 text-center mb-2'>Mots clés les plus utilisés par nos intervenants</h2>
      <div className='flex w-full justify-center'>
        <ChartContainer
          dataset={dataset}
          height={400}
          width={1000}
          xAxis={[{ scaleType: 'band', dataKey: 'keyword', categoryGapRatio: 0.5 }]}
          series={[
            {
              type: 'bar',
              dataKey: 'count',
              label: 'Utilisation',
              color: `url(#${gradientId})`,
            },
          ]}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={actionColor} />
              <stop offset="100%" stopColor={actionColor2} />
            </linearGradient>
          </defs>
          <ChartsClipPath id={clipPathId}/>
          <g clipPath={`url(#${clipPathId})`}>
            {dataset.map((_, index) => {
              const barWidth = (1005) / dataset.length * (1 - 0.55);
              const barSpacing = (915) / dataset.length;
              const xPosition = 60 + index * barSpacing + barSpacing * 0.29;
              
              return (
                <rect
                    className='fill-c2'
                    key={`bg-${index}`}
                    x={xPosition}
                    y={40}
                    width={barWidth}
                    height={320}
                    fill={``}
                    rx={15}
                    ry={15}
                />
              );
            })}
            <BarPlot borderRadius={15}/>
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