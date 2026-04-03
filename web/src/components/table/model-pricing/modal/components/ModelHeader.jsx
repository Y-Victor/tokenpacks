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
import {
  Avatar,
  AvatarFallback,
} from '../../../../ui/avatar';
import { Button } from '../../../../ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { getLobeHubIcon } from '../../../../../helpers';

const CARD_STYLES = {
  container:
    'w-12 h-12 rounded-2xl flex items-center justify-center relative shadow-md',
  icon: 'w-8 h-8 flex items-center justify-center',
};

const ModelHeader = ({ modelData, vendorsMap = {}, t }) => {
  // 获取模型图标（优先模型图标，其次供应商图标）
  const getModelIcon = () => {
    // 1) 优先使用模型自定义图标
    if (modelData?.icon) {
      return (
        <div className={CARD_STYLES.container}>
          <div className={CARD_STYLES.icon}>
            {getLobeHubIcon(modelData.icon, 32)}
          </div>
        </div>
      );
    }
    // 2) 退化为供应商图标
    if (modelData?.vendor_icon) {
      return (
        <div className={CARD_STYLES.container}>
          <div className={CARD_STYLES.icon}>
            {getLobeHubIcon(modelData.vendor_icon, 32)}
          </div>
        </div>
      );
    }

    // 如果没有供应商图标，使用模型名称的前两个字符
    const avatarText = modelData?.model_name?.slice(0, 2).toUpperCase() || 'AI';
    return (
      <div className={CARD_STYLES.container}>
        <Avatar
          className='h-12 w-12 rounded-2xl text-base font-bold'
        >
          <AvatarFallback className='rounded-2xl text-base font-bold'>{avatarText}</AvatarFallback>
        </Avatar>
      </div>
    );
  };

  const handleCopy = () => {
    const name = modelData?.model_name || '';
    navigator.clipboard.writeText(name).then(() => {
      toast.success(t('已复制模型名称'));
    });
  };

  return (
    <div className='flex items-center'>
      {getModelIcon()}
      <div className='ml-3 font-normal flex items-center gap-2'>
        <span className='truncate max-w-60 font-bold text-lg'>
          {modelData?.model_name || t('未知模型')}
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='h-6 w-6 p-0'
        >
          <Copy className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
};

export default ModelHeader;
