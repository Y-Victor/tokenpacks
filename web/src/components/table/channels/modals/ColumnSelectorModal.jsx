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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Checkbox } from '../../../ui/checkbox';
import { getChannelsColumns } from '../ChannelsColumnDefs';

const ColumnSelectorModal = ({
  showColumnSelector,
  setShowColumnSelector,
  visibleColumns,
  handleColumnVisibilityChange,
  handleSelectAll,
  initDefaultColumns,
  COLUMN_KEYS,
  t,
  // Props needed for getChannelsColumns
  updateChannelBalance,
  manageChannel,
  manageTag,
  submitTagEdit,
  testChannel,
  setCurrentTestChannel,
  setShowModelTestModal,
  setEditingChannel,
  setShowEdit,
  setShowEditTag,
  setEditingTag,
  copySelectedChannel,
  refresh,
  activePage,
  channels,
}) => {
  // Get all columns for display in selector
  const allColumns = getChannelsColumns({
    t,
    COLUMN_KEYS,
    updateChannelBalance,
    manageChannel,
    manageTag,
    submitTagEdit,
    testChannel,
    setCurrentTestChannel,
    setShowModelTestModal,
    setEditingChannel,
    setShowEdit,
    setShowEditTag,
    setEditingTag,
    copySelectedChannel,
    refresh,
    activePage,
    channels,
  });

  return (
    <Dialog open={showColumnSelector} onOpenChange={(open) => !open && setShowColumnSelector(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('列设置')}</DialogTitle>
        </DialogHeader>
        <div style={{ marginBottom: 20 }}>
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={Object.values(visibleColumns).every((v) => v === true)}
              ref={undefined}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
            />
            <span>{t('全选')}</span>
          </div>
        </div>
        <div
          className='flex flex-wrap max-h-96 overflow-y-auto rounded-lg p-4 border'
        >
          {allColumns.map((column) => {
            if (!column.title) {
              return null;
            }

            return (
              <div key={column.key} className='w-1/2 mb-4 pr-2'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={!!visibleColumns[column.key]}
                    onCheckedChange={(checked) =>
                      handleColumnVisibilityChange(column.key, !!checked)
                    }
                  />
                  <span>{column.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => initDefaultColumns()}>{t('重置')}</Button>
          <Button variant='outline' onClick={() => setShowColumnSelector(false)}>
            {t('取消')}
          </Button>
          <Button onClick={() => setShowColumnSelector(false)}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSelectorModal;
