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

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../ui/button';

// Fixed notification ID to maintain single instance and avoid flicker
const NOTICE_ID = 'models-batch-actions';

/**
 * SelectionNotification component
 * Shows a fixed toast notification when models are selected for batch operations.
 */
const SelectionNotification = ({
  selectedKeys = [],
  t,
  onDelete,
  onAddPrefill,
  onClear,
  onCopy,
}) => {
  const toastRef = useRef(null);

  useEffect(() => {
    const selectedCount = selectedKeys.length;

    if (selectedCount > 0) {
      // Dismiss any existing toast before showing updated one
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }

      toastRef.current = toast(
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <span className='font-medium'>{t('批量操作')}</span>
            <span className='text-sm text-muted-foreground'>
              {t('已选择 {{count}} 个模型', { count: selectedCount })}
            </span>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button size='sm' variant='secondary' onClick={onClear}>
              {t('取消全选')}
            </Button>
            <Button size='sm' onClick={onAddPrefill}>
              {t('加入预填组')}
            </Button>
            <Button size='sm' variant='outline' onClick={onCopy}>
              {t('复制名称')}
            </Button>
            <Button size='sm' variant='destructive' onClick={onDelete}>
              {t('删除所选')}
            </Button>
          </div>
        </div>,
        {
          id: NOTICE_ID,
          duration: Infinity,
          position: 'bottom-center',
        },
      );
    } else {
      toast.dismiss(NOTICE_ID);
      toastRef.current = null;
    }
  }, [selectedKeys, t, onDelete, onAddPrefill, onClear, onCopy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toast.dismiss(NOTICE_ID);
    };
  }, []);

  return null;
};

export default SelectionNotification;
