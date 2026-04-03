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
import { Badge } from '../ui/badge';
import { Bell } from 'lucide-react';
import { marked } from 'marked';
import { EmptyState } from '../ui/empty-state';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const AnnouncementsPanel = ({
  announcementData,
  announcementLegendData,
  CARD_PROPS,
  ILLUSTRATION_SIZE,
  t,
}) => {
  // Map announcement type to a timeline dot color
  const getTimelineDotColor = (type) => {
    switch (type) {
      case 'ongoing': return '#3b82f6';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#8b9aa7';
    }
  };

  return (
    <Card className='shadow-sm rounded-2xl lg:col-span-2'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 w-full'>
            <div className='flex items-center gap-2'>
              <Bell size={16} />
              {t('系统公告')}
              <Badge variant='secondary' className='rounded-full'>
                {t('显示最新20条')}
              </Badge>
            </div>
            {/* Legend */}
            <div className='flex flex-wrap gap-3 text-xs'>
              {announcementLegendData.map((legend, index) => (
                <div key={index} className='flex items-center gap-1'>
                  <div
                    className='w-2 h-2 rounded-full'
                    style={{
                      backgroundColor:
                        legend.color === 'grey'
                          ? '#8b9aa7'
                          : legend.color === 'blue'
                            ? '#3b82f6'
                            : legend.color === 'green'
                              ? '#10b981'
                              : legend.color === 'orange'
                                ? '#f59e0b'
                                : legend.color === 'red'
                                  ? '#ef4444'
                                  : '#8b9aa7',
                    }}
                  />
                  <span className='text-gray-600'>{legend.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <ScrollableContainer maxHeight='24rem'>
          {announcementData.length > 0 ? (
            <div className='relative ml-6 border-l border-gray-200'>
              {announcementData.map((item, idx) => {
                const htmlExtra = item.extra ? marked.parse(item.extra) : '';
                return (
                  <div key={idx} className='relative pl-6 pb-6 last:pb-0'>
                    {/* Timeline dot */}
                    <div
                      className='absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white'
                      style={{ backgroundColor: getTimelineDotColor(item.type) }}
                    />
                    <div className='text-xs text-muted-foreground mb-1'>
                      {item.relative ? item.relative + ' ' : ''}{item.time}
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(item.content || ''),
                      }}
                    />
                    {item.extra && (
                      <div
                        className='text-xs text-gray-500 mt-1'
                        dangerouslySetInnerHTML={{ __html: htmlExtra }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='flex justify-center items-center py-8'>
              <EmptyState
                type='construction'
                title={t('暂无系统公告')}
                description={t('请联系管理员在系统设置中配置公告信息')}
              />
            </div>
          )}
        </ScrollableContainer>
      </CardContent>
    </Card>
  );
};

export default AnnouncementsPanel;
