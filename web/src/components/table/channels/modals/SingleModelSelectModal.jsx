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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../ui/collapsible';
import { Search, ChevronDown } from 'lucide-react';
import { getModelCategories } from '../../../../helpers/render';

const SingleModelSelectModal = ({
  visible,
  models = [],
  selected = '',
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const normalizeModelName = (model) => String(model ?? '').trim();
  const normalizedModels = useMemo(() => {
    const list = Array.isArray(models) ? models : [];
    return Array.from(new Set(list.map(normalizeModelName).filter(Boolean)));
  }, [models]);

  const [keyword, setKeyword] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    if (visible) {
      setKeyword('');
      setSelectedModel(normalizeModelName(selected));
    }
  }, [visible, selected]);

  const filteredModels = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    if (!lower) return normalizedModels;
    return normalizedModels.filter((m) => m.toLowerCase().includes(lower));
  }, [normalizedModels, keyword]);

  const modelsByCategory = useMemo(() => {
    const categories = getModelCategories(t);
    const categorized = {};
    const uncategorized = [];

    filteredModels.forEach((model) => {
      let foundCategory = false;
      for (const [key, category] of Object.entries(categories)) {
        if (key !== 'all' && category.filter({ model_name: model })) {
          if (!categorized[key]) {
            categorized[key] = {
              label: category.label,
              icon: category.icon,
              models: [],
            };
          }
          categorized[key].models.push(model);
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory) {
        uncategorized.push(model);
      }
    });

    if (uncategorized.length > 0) {
      categorized.other = {
        label: t('其他'),
        icon: null,
        models: uncategorized,
      };
    }

    return categorized;
  }, [filteredModels, t]);

  const categoryEntries = useMemo(
    () => Object.entries(modelsByCategory),
    [modelsByCategory],
  );

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className={isMobile ? 'max-w-full' : 'max-w-3xl'}>
        <DialogHeader>
          <DialogTitle>{t('选择模型')}</DialogTitle>
        </DialogHeader>
        <div className='relative'>
          <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            className='pl-8'
            placeholder={t('搜索模型')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
          {filteredModels.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
              <p>{t('暂无匹配模型')}</p>
            </div>
          ) : (
            <div className='w-full'>
              {categoryEntries.map(([key, categoryData], index) => (
                <Collapsible key={`${key}_${index}`}>
                  <CollapsibleTrigger className='flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded'>
                    <ChevronDown className='h-4 w-4' />
                    {categoryData.icon}
                    <span>
                      {categoryData.label} ({categoryData.models.length})
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className='grid grid-cols-2 gap-x-4 pl-6'>
                      {categoryData.models.map((model) => (
                        <label key={model} className='flex items-center gap-2 my-1 cursor-pointer'>
                          <input
                            type='radio'
                            name='single-model-select'
                            value={model}
                            checked={selectedModel === model}
                            onChange={() => setSelectedModel(model)}
                            className='accent-primary'
                          />
                          <span className='text-sm'>{model}</span>
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>{t('取消')}</Button>
          <Button onClick={() => onConfirm?.(selectedModel)} disabled={!selectedModel}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SingleModelSelectModal;
