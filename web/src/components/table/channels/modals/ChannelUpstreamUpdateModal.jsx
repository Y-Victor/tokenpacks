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
import { Search } from 'lucide-react';
import { confirm } from '../../../../lib/confirm';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const normalizeModels = (models = []) =>
  Array.from(
    new Set(
      (models || []).map((model) => String(model || '').trim()).filter(Boolean),
    ),
  );

const filterByKeyword = (models = [], keyword = '') => {
  const normalizedKeyword = String(keyword || '')
    .trim()
    .toLowerCase();
  if (!normalizedKeyword) {
    return models;
  }
  return models.filter((model) =>
    String(model).toLowerCase().includes(normalizedKeyword),
  );
};

const ChannelUpstreamUpdateModal = ({
  visible,
  addModels = [],
  removeModels = [],
  preferredTab = 'add',
  confirmLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const normalizedAddModels = useMemo(
    () => normalizeModels(addModels),
    [addModels],
  );
  const normalizedRemoveModels = useMemo(
    () => normalizeModels(removeModels),
    [removeModels],
  );

  const [selectedAddModels, setSelectedAddModels] = useState([]);
  const [selectedRemoveModels, setSelectedRemoveModels] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [partialSubmitConfirmed, setPartialSubmitConfirmed] = useState(false);

  const addTabEnabled = normalizedAddModels.length > 0;
  const removeTabEnabled = normalizedRemoveModels.length > 0;
  const filteredAddModels = useMemo(
    () => filterByKeyword(normalizedAddModels, keyword),
    [normalizedAddModels, keyword],
  );
  const filteredRemoveModels = useMemo(
    () => filterByKeyword(normalizedRemoveModels, keyword),
    [normalizedRemoveModels, keyword],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelectedAddModels([]);
    setSelectedRemoveModels([]);
    setKeyword('');
    setPartialSubmitConfirmed(false);
    const normalizedPreferredTab = preferredTab === 'remove' ? 'remove' : 'add';
    if (normalizedPreferredTab === 'remove' && removeTabEnabled) {
      setActiveTab('remove');
      return;
    }
    if (normalizedPreferredTab === 'add' && addTabEnabled) {
      setActiveTab('add');
      return;
    }
    setActiveTab(addTabEnabled ? 'add' : 'remove');
  }, [visible, addTabEnabled, removeTabEnabled, preferredTab]);

  const currentModels =
    activeTab === 'add' ? filteredAddModels : filteredRemoveModels;
  const currentSelectedModels =
    activeTab === 'add' ? selectedAddModels : selectedRemoveModels;
  const currentSetSelectedModels =
    activeTab === 'add' ? setSelectedAddModels : setSelectedRemoveModels;
  const selectedAddCount = selectedAddModels.length;
  const selectedRemoveCount = selectedRemoveModels.length;
  const checkedCount = currentModels.filter((model) =>
    currentSelectedModels.includes(model),
  ).length;
  const isAllChecked =
    currentModels.length > 0 && checkedCount === currentModels.length;
  const isIndeterminate =
    checkedCount > 0 && checkedCount < currentModels.length;

  const handleToggleAllCurrent = (checked) => {
    if (checked) {
      const merged = normalizeModels([
        ...currentSelectedModels,
        ...currentModels,
      ]);
      currentSetSelectedModels(merged);
      return;
    }
    const currentSet = new Set(currentModels);
    currentSetSelectedModels(
      currentSelectedModels.filter((model) => !currentSet.has(model)),
    );
  };

  const tabList = [
    {
      itemKey: 'add',
      tab: `${t('新增模型')} (${selectedAddCount}/${normalizedAddModels.length})`,
      disabled: !addTabEnabled,
    },
    {
      itemKey: 'remove',
      tab: `${t('删除模型')} (${selectedRemoveCount}/${normalizedRemoveModels.length})`,
      disabled: !removeTabEnabled,
    },
  ];

  const submitSelectedChanges = () => {
    onConfirm?.({
      addModels: selectedAddModels,
      removeModels: selectedRemoveModels,
    });
  };

  const handleSubmit = () => {
    const hasAnySelected = selectedAddCount > 0 || selectedRemoveCount > 0;
    if (!hasAnySelected) {
      submitSelectedChanges();
      return;
    }

    const hasBothPending = addTabEnabled && removeTabEnabled;
    const hasUnselectedAdd = addTabEnabled && selectedAddCount === 0;
    const hasUnselectedRemove = removeTabEnabled && selectedRemoveCount === 0;
    if (hasBothPending && (hasUnselectedAdd || hasUnselectedRemove)) {
      if (partialSubmitConfirmed) {
        submitSelectedChanges();
        return;
      }
      const missingTab = hasUnselectedAdd ? 'add' : 'remove';
      const missingType = hasUnselectedAdd ? t('新增') : t('删除');
      const missingCount = hasUnselectedAdd
        ? normalizedAddModels.length
        : normalizedRemoveModels.length;
      setActiveTab(missingTab);
      confirm({
        title: t('仍有未处理项'),
        description: t(
          '你还没有处理{{type}}模型（{{count}}个）。是否仅提交当前已勾选内容？',
          {
            type: missingType,
            count: missingCount,
          },
        ),
        onConfirm: () => {
          setPartialSubmitConfirmed(true);
          submitSelectedChanges();
        },
      });
      return;
    }

    submitSelectedChanges();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className={isMobile ? 'max-w-full' : 'max-w-lg'}>
        <DialogHeader>
          <DialogTitle>{t('处理上游模型更新')}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>
            {t(
              '可勾选需要执行的变更：新增会加入渠道模型列表，删除会从渠道模型列表移除。',
            )}
          </p>

          <Tabs value={activeTab} onValueChange={(key) => setActiveTab(key)}>
            <TabsList>
              {tabList.map((tab) => (
                <TabsTrigger key={tab.itemKey} value={tab.itemKey} disabled={tab.disabled}>
                  {tab.tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className='flex items-center gap-3 text-xs text-gray-500'>
            <span>
              {t('新增已选 {{selected}} / {{total}}', {
                selected: selectedAddCount,
                total: normalizedAddModels.length,
              })}
            </span>
            <span>
              {t('删除已选 {{selected}} / {{total}}', {
                selected: selectedRemoveCount,
                total: normalizedRemoveModels.length,
              })}
            </span>
          </div>

          <div className='relative'>
            <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              className='pl-8'
              placeholder={t('搜索模型')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 8 }}>
            {currentModels.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-6 text-muted-foreground'>
                <p>{t('暂无匹配模型')}</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4'>
                {currentModels.map((model) => (
                  <div key={`${activeTab}:${model}`} className='flex items-center gap-2 my-1'>
                    <Checkbox
                      checked={currentSelectedModels.includes(model)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          currentSetSelectedModels(normalizeModels([...currentSelectedModels, model]));
                        } else {
                          currentSetSelectedModels(currentSelectedModels.filter((m) => m !== model));
                        }
                      }}
                    />
                    <span className='text-sm'>{model}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center justify-end gap-2'>
            <span className='text-sm text-muted-foreground'>
              {t('已选择 {{selected}} / {{total}}', {
                selected: checkedCount,
                total: currentModels.length,
              })}
            </span>
            <Checkbox
              checked={isAllChecked}
              aria-label={t('全选当前列表模型')}
              onCheckedChange={(checked) => handleToggleAllCurrent(!!checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>{t('取消')}</Button>
          <Button onClick={handleSubmit} disabled={confirmLoading}>
            {confirmLoading ? '...' : t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelUpstreamUpdateModal;
