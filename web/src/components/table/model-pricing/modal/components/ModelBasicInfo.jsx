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
import { Card } from '../../../../ui/card';
import {
  Avatar,
  AvatarFallback,
} from '../../../../ui/avatar';
import { Badge } from '../../../../ui/badge';
import { Info } from 'lucide-react';
import { stringToColor } from '../../../../../helpers';

const ModelBasicInfo = ({ modelData, vendorsMap = {}, t }) => {
  // 获取模型描述（使用后端真实数据）
  const getModelDescription = () => {
    if (!modelData) return t('暂无模型描述');

    // 优先使用后端提供的描述
    if (modelData.description) {
      return modelData.description;
    }

    // 如果没有描述但有供应商描述，显示供应商信息
    if (modelData.vendor_description) {
      return t('供应商信息：') + modelData.vendor_description;
    }

    return t('暂无模型描述');
  };

  // 获取模型标签
  const getModelTags = () => {
    const tags = [];

    if (modelData?.tags) {
      const customTags = modelData.tags.split(',').filter((tag) => tag.trim());
      customTags.forEach((tag) => {
        const tagText = tag.trim();
        tags.push({ text: tagText, color: stringToColor(tagText) });
      });
    }

    return tags;
  };

  return (
    <Card className='!rounded-2xl shadow-sm border-0 mb-6 p-6'>
      <div className='flex items-center mb-4'>
        <Avatar className='mr-2 shadow-md h-8 w-8 bg-blue-500'>
          <AvatarFallback className='bg-blue-500 text-white'>
            <Info size={16} />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className='text-lg font-medium'>{t('基本信息')}</span>
          <div className='text-xs text-gray-600'>
            {t('模型的详细描述和基本特性')}
          </div>
        </div>
      </div>
      <div className='text-gray-600'>
        <p className='mb-4'>{getModelDescription()}</p>
        {getModelTags().length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            {getModelTags().map((tag, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='rounded-full'
                style={{ backgroundColor: tag.color, color: '#fff' }}
              >
                {tag.text}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ModelBasicInfo;
