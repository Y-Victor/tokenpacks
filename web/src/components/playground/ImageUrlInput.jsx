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
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { FileText, Plus, X, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImageUrlInput = ({
  imageUrls,
  imageEnabled,
  onImageUrlsChange,
  onImageEnabledChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const handleAddImageUrl = () => {
    const newUrls = [...imageUrls, ''];
    onImageUrlsChange(newUrls);
  };

  const handleUpdateImageUrl = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    onImageUrlsChange(newUrls);
  };

  const handleRemoveImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    onImageUrlsChange(newUrls);
  };

  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <Image
            size={16}
            className={
              imageEnabled && !disabled ? 'text-blue-500' : 'text-gray-400'
            }
          />
          <span className='text-sm font-semibold'>
            {t('图片地址')}
          </span>
          {disabled && (
            <span className='text-xs text-orange-600'>
              ({t('已在自定义模式中忽略')})
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Switch
            checked={imageEnabled}
            onCheckedChange={onImageEnabledChange}
            disabled={disabled}
          />
          <Button
            size='icon'
            onClick={handleAddImageUrl}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={!imageEnabled || disabled}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {!imageEnabled ? (
        <span className='text-xs text-gray-500 mb-2 block'>
          {disabled
            ? t('图片功能在自定义请求体模式下不可用')
            : t('启用后可添加图片URL进行多模态对话')}
        </span>
      ) : imageUrls.length === 0 ? (
        <span className='text-xs text-gray-500 mb-2 block'>
          {disabled
            ? t('图片功能在自定义请求体模式下不可用')
            : t('点击 + 按钮添加图片URL进行多模态对话')}
        </span>
      ) : (
        <span className='text-xs text-gray-500 mb-2 block'>
          {t('已添加')} {imageUrls.length} {t('张图片')}
          {disabled ? ` (${t('自定义模式下不可用')})` : ''}
        </span>
      )}

      <div
        className={`space-y-2 max-h-32 overflow-y-auto image-list-scroll ${!imageEnabled || disabled ? 'opacity-50' : ''}`}
      >
        {imageUrls.map((url, index) => (
          <div key={index} className='flex items-center gap-2'>
            <div className='flex-1'>
              <Input
                placeholder={`https://example.com/image${index + 1}.jpg`}
                value={url}
                onChange={(e) => handleUpdateImageUrl(index, e.target.value)}
                className='!rounded-lg h-8 text-sm'
                disabled={!imageEnabled || disabled}
              />
            </div>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => handleRemoveImageUrl(index)}
              className='!rounded-full !w-6 !h-6 !p-0 !min-w-0 !text-red-500 hover:!bg-red-50 flex-shrink-0'
              disabled={!imageEnabled || disabled}
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUrlInput;
