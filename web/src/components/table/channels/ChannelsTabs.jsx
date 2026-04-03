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
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { CHANNEL_OPTIONS } from '../../../constants';
import { getChannelIcon } from '../../../helpers';

const ChannelsTabs = ({
  enableTagMode,
  activeTypeKey,
  setActiveTypeKey,
  channelTypeCounts,
  availableTypeKeys,
  loadChannels,
  activePage,
  pageSize,
  idSort,
  setActivePage,
  t,
}) => {
  if (enableTagMode) return null;

  const handleTabChange = (key) => {
    setActiveTypeKey(key);
    setActivePage(1);
    loadChannels(1, pageSize, idSort, enableTagMode, key);
  };

  return (
    <Tabs
      value={activeTypeKey}
      onValueChange={handleTabChange}
      className='mb-2'
    >
      <TabsList className='flex flex-wrap h-auto'>
        <TabsTrigger value='all'>
          <span className='flex items-center gap-2'>
            {t('全部')}
            <Badge
              variant={activeTypeKey === 'all' ? 'destructive' : 'secondary'}
              className='rounded-full'
            >
              {channelTypeCounts['all'] || 0}
            </Badge>
          </span>
        </TabsTrigger>

        {CHANNEL_OPTIONS.filter((opt) =>
          availableTypeKeys.includes(String(opt.value)),
        ).map((option) => {
          const key = String(option.value);
          const count = channelTypeCounts[option.value] || 0;
          return (
            <TabsTrigger key={key} value={key}>
              <span className='flex items-center gap-2'>
                {getChannelIcon(option.value)}
                {option.label}
                <Badge
                  variant={activeTypeKey === key ? 'destructive' : 'secondary'}
                  className='rounded-full'
                >
                  {count}
                </Badge>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default ChannelsTabs;
