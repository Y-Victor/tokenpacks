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
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Switch } from '../../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { confirm } from '../../../lib/confirm';
import CompactModeToggle from '../../common/ui/CompactModeToggle';

const ChannelsActions = ({
  enableBatchDelete,
  batchDeleteChannels,
  setShowBatchSetTag,
  testAllChannels,
  fixChannelsAbilities,
  updateAllChannelsBalance,
  deleteAllDisabledChannels,
  applyAllUpstreamUpdates,
  detectAllUpstreamUpdates,
  detectAllUpstreamUpdatesLoading,
  applyAllUpstreamUpdatesLoading,
  compactMode,
  setCompactMode,
  idSort,
  setIdSort,
  setEnableBatchDelete,
  enableTagMode,
  setEnableTagMode,
  statusFilter,
  setStatusFilter,
  getFormValues,
  loadChannels,
  searchChannels,
  activeTypeKey,
  activePage,
  pageSize,
  setActivePage,
  t,
}) => {
  return (
    <div className='flex flex-col gap-2'>
      {/* 第一行：批量操作按钮 + 设置开关 */}
      <div className='flex flex-col md:flex-row justify-between gap-2'>
        {/* 左侧：批量操作按钮 */}
        <div className='flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto order-2 md:order-1'>
          <Button
            size='sm'
            disabled={!enableBatchDelete}
            variant='destructive'
            className='w-full md:w-auto'
            onClick={() => {
              confirm({
                title: t('确定是否要删除所选通道？'),
                description: t('此修改将不可逆'),
                onConfirm: () => batchDeleteChannels(),
              });
            }}
          >
            {t('删除所选通道')}
          </Button>

          <Button
            size='sm'
            disabled={!enableBatchDelete}
            variant='outline'
            onClick={() => setShowBatchSetTag(true)}
            className='w-full md:w-auto'
          >
            {t('批量设置标签')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full md:w-auto'
              >
                {t('批量操作')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  confirm({
                    title: t('确定？'),
                    description: t('确定要测试所有未手动禁用渠道吗？'),
                    onConfirm: () => testAllChannels(),
                  });
                }}
              >
                {t('测试所有未手动禁用渠道')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  confirm({
                    title: t('确定是否要修复数据库一致性？'),
                    description: t(
                      '进行该操作时，可能导致渠道访问错误，请仅在数据库出现问题时使用',
                    ),
                    onConfirm: () => fixChannelsAbilities(),
                  });
                }}
              >
                {t('修复数据库一致性')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  confirm({
                    title: t('确定？'),
                    description: t('确定要更新所有已启用通道余额吗？'),
                    onConfirm: () => updateAllChannelsBalance(),
                  });
                }}
              >
                {t('更新所有已启用通道余额')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  confirm({
                    title: t('确定？'),
                    description: t(
                      '确定要仅检测全部渠道上游模型更新吗？（不执行新增/删除）',
                    ),
                    onConfirm: () => detectAllUpstreamUpdates(),
                  });
                }}
              >
                {t('检测全部渠道上游更新')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  confirm({
                    title: t('确定？'),
                    description: t('确定要对全部渠道执行上游模型更新吗？'),
                    onConfirm: () => applyAllUpstreamUpdates(),
                  });
                }}
              >
                {t('处理全部渠道上游更新')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => {
                  confirm({
                    title: t('确定是否要删除禁用通道？'),
                    description: t('此修改将不可逆'),
                    onConfirm: () => deleteAllDisabledChannels(),
                  });
                }}
              >
                {t('删除禁用通道')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CompactModeToggle
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            t={t}
          />
        </div>

        {/* 右侧：设置开关区域 */}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto order-1 md:order-2'>
          <div className='flex items-center justify-between w-full md:w-auto'>
            <span className='font-semibold mr-2'>
              {t('使用ID排序')}
            </span>
            <Switch
              checked={idSort}
              onCheckedChange={(v) => {
                localStorage.setItem('id-sort', v + '');
                setIdSort(v);
                const { searchKeyword, searchGroup, searchModel } =
                  getFormValues();
                if (
                  searchKeyword === '' &&
                  searchGroup === '' &&
                  searchModel === ''
                ) {
                  loadChannels(activePage, pageSize, v, enableTagMode);
                } else {
                  searchChannels(
                    enableTagMode,
                    activeTypeKey,
                    statusFilter,
                    activePage,
                    pageSize,
                    v,
                  );
                }
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <span className='font-semibold mr-2'>
              {t('开启批量操作')}
            </span>
            <Switch
              checked={enableBatchDelete}
              onCheckedChange={(v) => {
                localStorage.setItem('enable-batch-delete', v + '');
                setEnableBatchDelete(v);
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <span className='font-semibold mr-2'>
              {t('标签聚合模式')}
            </span>
            <Switch
              checked={enableTagMode}
              onCheckedChange={(v) => {
                localStorage.setItem('enable-tag-mode', v + '');
                setEnableTagMode(v);
                setActivePage(1);
                loadChannels(1, pageSize, idSort, v);
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <span className='font-semibold mr-2'>
              {t('状态筛选')}
            </span>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                localStorage.setItem('channel-status-filter', v);
                setStatusFilter(v);
                setActivePage(1);
                loadChannels(
                  1,
                  pageSize,
                  idSort,
                  enableTagMode,
                  activeTypeKey,
                  v,
                );
              }}
            >
              <SelectTrigger className='w-auto h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('全部')}</SelectItem>
                <SelectItem value='enabled'>{t('已启用')}</SelectItem>
                <SelectItem value='disabled'>{t('已禁用')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelsActions;
