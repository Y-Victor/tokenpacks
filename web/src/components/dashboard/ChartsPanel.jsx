/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { PieChart } from 'lucide-react';
import { VChart } from '@visactor/react-vchart';

const ChartsPanel = ({
  activeChartTab,
  setActiveChartTab,
  spec_line,
  spec_model_line,
  spec_pie,
  spec_rank_bar,
  CARD_PROPS,
  CHART_CONFIG,
  FLEX_CENTER_GAP2,
  hasApiInfoPanel,
  t,
}) => {
  return (
    <Card className={`rounded-2xl ${hasApiInfoPanel ? 'lg:col-span-3' : ''}`}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-3'>
            <div className={FLEX_CENTER_GAP2}>
              <PieChart size={16} />
              {t('模型数据分析')}
            </div>
            <Tabs
              value={activeChartTab}
              onValueChange={setActiveChartTab}
              className='w-full lg:w-auto'
            >
              <TabsList className='w-full lg:w-auto'>
                <TabsTrigger className='flex-1 lg:flex-none' value='1'>{t('消耗分布')}</TabsTrigger>
                <TabsTrigger className='flex-1 lg:flex-none' value='2'>{t('消耗趋势')}</TabsTrigger>
                <TabsTrigger className='flex-1 lg:flex-none' value='3'>{t('调用次数分布')}</TabsTrigger>
                <TabsTrigger className='flex-1 lg:flex-none' value='4'>{t('调用次数排行')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='h-96 p-2'>
          {activeChartTab === '1' && (
            <VChart spec={spec_line} option={CHART_CONFIG} />
          )}
          {activeChartTab === '2' && (
            <VChart spec={spec_model_line} option={CHART_CONFIG} />
          )}
          {activeChartTab === '3' && (
            <VChart spec={spec_pie} option={CHART_CONFIG} />
          )}
          {activeChartTab === '4' && (
            <VChart spec={spec_rank_bar} option={CHART_CONFIG} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartsPanel;
