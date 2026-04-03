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

import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Checkbox } from '../../../ui/checkbox';
import { Input } from '../../../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../../ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../ui/tooltip';
import { Search, Info, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getModelCategories } from '../../../../helpers/render';

const ModelSelectModal = ({
  visible,
  models = [],
  selected = [],
  redirectModels = [],
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  const getModelName = (model) => {
    if (!model) return '';
    if (typeof model === 'string') return model;
    if (typeof model === 'object' && model.model_name) return model.model_name;
    return String(model ?? '');
  };

  const normalizedSelected = useMemo(
    () => (selected || []).map(getModelName),
    [selected],
  );

  const [checkedList, setCheckedList] = useState(normalizedSelected);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('new');

  const isMobile = useIsMobile();
  const normalizeModelName = (model) =>
    typeof model === 'string' ? model.trim() : '';
  const normalizedRedirectModels = useMemo(
    () =>
      Array.from(
        new Set(
          (redirectModels || [])
            .map((model) => normalizeModelName(model))
            .filter(Boolean),
        ),
      ),
    [redirectModels],
  );
  const normalizedSelectedSet = useMemo(() => {
    const set = new Set();
    (selected || []).forEach((model) => {
      const normalized = normalizeModelName(model);
      if (normalized) {
        set.add(normalized);
      }
    });
    return set;
  }, [selected]);
  const classificationSet = useMemo(() => {
    const set = new Set(normalizedSelectedSet);
    normalizedRedirectModels.forEach((model) => set.add(model));
    return set;
  }, [normalizedSelectedSet, normalizedRedirectModels]);
  const redirectOnlySet = useMemo(() => {
    const set = new Set();
    normalizedRedirectModels.forEach((model) => {
      if (!normalizedSelectedSet.has(model)) {
        set.add(model);
      }
    });
    return set;
  }, [normalizedRedirectModels, normalizedSelectedSet]);

  const filteredModels = models.filter((m) =>
    String(m || '')
      .toLowerCase()
      .includes(keyword.toLowerCase()),
  );

  // 分类模型：新获取的模型和已有模型
  const isExistingModel = (model) =>
    classificationSet.has(normalizeModelName(model));
  const newModels = filteredModels.filter((model) => !isExistingModel(model));
  const existingModels = filteredModels.filter((model) =>
    isExistingModel(model),
  );

  // 同步外部选中值
  useEffect(() => {
    if (visible) {
      setCheckedList(normalizedSelected);
    }
  }, [visible, normalizedSelected]);

  // 当模型列表变化时，设置默认tab
  useEffect(() => {
    if (visible) {
      // 默认显示新获取模型tab，如果没有新模型则显示已有模型
      const hasNewModels = newModels.length > 0;
      setActiveTab(hasNewModels ? 'new' : 'existing');
    }
  }, [visible, newModels.length, selected]);

  const handleOk = () => {
    onConfirm && onConfirm(checkedList);
  };

  // 按厂商分类模型
  const categorizeModels = (models) => {
    const categories = getModelCategories(t);
    const categorizedModels = {};
    const uncategorizedModels = [];

    models.forEach((model) => {
      let foundCategory = false;
      for (const [key, category] of Object.entries(categories)) {
        if (key !== 'all' && category.filter({ model_name: model })) {
          if (!categorizedModels[key]) {
            categorizedModels[key] = {
              label: category.label,
              icon: category.icon,
              models: [],
            };
          }
          categorizedModels[key].models.push(model);
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory) {
        uncategorizedModels.push(model);
      }
    });

    // 如果有未分类模型，添加到"其他"分类
    if (uncategorizedModels.length > 0) {
      categorizedModels['other'] = {
        label: t('其他'),
        icon: null,
        models: uncategorizedModels,
      };
    }

    return categorizedModels;
  };

  const newModelsByCategory = categorizeModels(newModels);
  const existingModelsByCategory = categorizeModels(existingModels);

  // Tab列表配置
  const tabList = [
    ...(newModels.length > 0
      ? [
          {
            tab: `${t('新获取的模型')} (${newModels.length})`,
            itemKey: 'new',
          },
        ]
      : []),
    ...(existingModels.length > 0
      ? [
          {
            tab: `${t('已有的模型')} (${existingModels.length})`,
            itemKey: 'existing',
          },
        ]
      : []),
  ];

  // 处理分类全选/取消全选
  const handleCategorySelectAll = (categoryModels, isChecked) => {
    let newCheckedList = [...checkedList];

    if (isChecked) {
      // 全选：添加该分类下所有未选中的模型
      categoryModels.forEach((model) => {
        if (!newCheckedList.includes(model)) {
          newCheckedList.push(model);
        }
      });
    } else {
      // 取消全选：移除该分类下所有已选中的模型
      newCheckedList = newCheckedList.filter(
        (model) => !categoryModels.includes(model),
      );
    }

    setCheckedList(newCheckedList);
  };

  // 检查分类是否全选
  const isCategoryAllSelected = (categoryModels) => {
    return (
      categoryModels.length > 0 &&
      categoryModels.every((model) => checkedList.includes(model))
    );
  };

  // 检查分类是否部分选中
  const isCategoryIndeterminate = (categoryModels) => {
    const selectedCount = categoryModels.filter((model) =>
      checkedList.includes(model),
    ).length;
    return selectedCount > 0 && selectedCount < categoryModels.length;
  };

  const renderModelsByCategory = (modelsByCategory, categoryKeyPrefix) => {
    const categoryEntries = Object.entries(modelsByCategory);
    if (categoryEntries.length === 0) return null;

    return (
      <div key={`${categoryKeyPrefix}_${categoryEntries.length}`}>
        {categoryEntries.map(([key, categoryData], index) => (
          <Collapsible key={`${categoryKeyPrefix}_${index}`}>
            <div className='flex items-center justify-between'>
              <CollapsibleTrigger className='flex items-center gap-2 p-2 hover:bg-muted/50 rounded flex-1'>
                <ChevronDown className='h-4 w-4' />
                <span>{`${categoryData.label} (${categoryData.models.length})`}</span>
              </CollapsibleTrigger>
              <Checkbox
                checked={isCategoryAllSelected(categoryData.models)}
                onCheckedChange={(checked) => {
                  handleCategorySelectAll(categoryData.models, !!checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <CollapsibleContent>
              <div className='flex items-center gap-2 mb-3 pl-6'>
                {categoryData.icon}
                <span className='text-sm text-muted-foreground'>
                  {t('已选择 {{selected}} / {{total}}', {
                    selected: categoryData.models.filter((model) =>
                      checkedList.includes(model),
                    ).length,
                    total: categoryData.models.length,
                  })}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-4 pl-6'>
                {categoryData.models.map((model) => (
                  <div key={model} className='flex items-center gap-2 my-1'>
                    <Checkbox
                      checked={checkedList.includes(model)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCheckedList([...checkedList, model]);
                        } else {
                          setCheckedList(checkedList.filter((m) => m !== model));
                        }
                      }}
                    />
                    <span className='flex items-center gap-2'>
                      <span className='text-sm'>{model}</span>
                      {redirectOnlySet.has(normalizeModelName(model)) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-3 w-3 text-amber-500 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            {t('来自模型重定向，尚未加入模型列表')}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className={isMobile ? 'max-w-full' : 'max-w-3xl'}>
        <DialogHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
            <DialogTitle>{t('选择模型')}</DialogTitle>
            <div className='flex-shrink-0'>
              <Tabs value={activeTab} onValueChange={(key) => setActiveTab(key)}>
                <TabsList>
                  {tabList.map((tab) => (
                    <TabsTrigger key={tab.itemKey} value={tab.itemKey}>
                      {tab.tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
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

        {(!models || models.length === 0) ? (
          <div className='flex justify-center py-4'>
            <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {filteredModels.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
                <p>{t('暂无匹配模型')}</p>
              </div>
            ) : (
              <div>
                {activeTab === 'new' && newModels.length > 0 && (
                  <div>{renderModelsByCategory(newModelsByCategory, 'new')}</div>
                )}
                {activeTab === 'existing' && existingModels.length > 0 && (
                  <div>
                    {renderModelsByCategory(existingModelsByCategory, 'existing')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className='flex items-center justify-end gap-2 mt-4'>
          {(() => {
            const currentModels =
              activeTab === 'new' ? newModels : existingModels;
            const currentSelected = currentModels.filter((model) =>
              checkedList.includes(model),
            ).length;

            return (
              <>
                <span className='text-sm text-muted-foreground'>
                  {t('已选择 {{selected}} / {{total}}', {
                    selected: currentSelected,
                    total: currentModels.length,
                  })}
                </span>
                <Checkbox
                  checked={currentModels.length > 0 && currentSelected === currentModels.length}
                  onCheckedChange={(checked) => {
                    handleCategorySelectAll(currentModels, !!checked);
                  }}
                />
              </>
            );
          })()}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>{t('取消')}</Button>
          <Button onClick={handleOk}>{t('确定')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectModal;
