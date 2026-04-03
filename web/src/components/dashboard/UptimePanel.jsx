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
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Gauge, RefreshCw, Loader2 } from 'lucide-react';
import { EmptyState } from '../ui/empty-state';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const UptimePanel = ({
  uptimeData,
  uptimeLoading,
  activeUptimeTab,
  setActiveUptimeTab,
  loadUptimeData,
  uptimeLegendData,
  renderMonitorList,
  CARD_PROPS,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <Card className='shadow-sm rounded-2xl lg:col-span-1'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>
          <div className='flex items-center justify-between w-full gap-2'>
            <div className='flex items-center gap-2'>
              <Gauge size={16} />
              {t('服务可用性')}
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={loadUptimeData}
              disabled={uptimeLoading}
              className='h-8 w-8 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full'
            >
              {uptimeLoading ? <Loader2 size={14} className='animate-spin' /> : <RefreshCw size={14} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        {/* Content area */}
        <div className='relative'>
          {uptimeLoading && (
            <div className='absolute inset-0 bg-background/50 z-10 flex items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          )}
          {uptimeData.length > 0 ? (
            uptimeData.length === 1 ? (
              <ScrollableContainer maxHeight='24rem'>
                {renderMonitorList(uptimeData[0].monitors)}
              </ScrollableContainer>
            ) : (
              <Tabs value={activeUptimeTab} onValueChange={setActiveUptimeTab}>
                <TabsList className='w-full justify-start flex-wrap h-auto p-1'>
                  {uptimeData.map((group, groupIdx) => (
                    <TabsTrigger
                      value={group.categoryName}
                      key={groupIdx}
                      className='text-xs gap-1'
                    >
                      <Gauge size={14} />
                      {group.categoryName}
                      <Badge
                        variant={activeUptimeTab === group.categoryName ? 'destructive' : 'secondary'}
                        className='rounded-full text-xs px-1.5 py-0'
                      >
                        {group.monitors ? group.monitors.length : 0}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {uptimeData.map((group, groupIdx) => (
                  <TabsContent value={group.categoryName} key={groupIdx}>
                    <ScrollableContainer maxHeight='21.5rem'>
                      {renderMonitorList(group.monitors)}
                    </ScrollableContainer>
                  </TabsContent>
                ))}
              </Tabs>
            )
          ) : (
            <div className='flex justify-center items-center py-8'>
              <EmptyState
                type='construction'
                title={t('暂无监控数据')}
                description={t('请联系管理员在系统设置中配置Uptime')}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        {uptimeData.length > 0 && (
          <div className='p-3 bg-gray-50 rounded-b-2xl'>
            <div className='flex flex-wrap gap-3 text-xs justify-center'>
              {uptimeLegendData.map((legend, index) => (
                <div key={index} className='flex items-center gap-1'>
                  <div
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: legend.color }}
                  />
                  <span className='text-gray-600'>{legend.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UptimePanel;
