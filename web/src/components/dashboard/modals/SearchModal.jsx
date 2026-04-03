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
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../ui/select';

const SearchModal = ({
  searchModalVisible,
  handleSearchConfirm,
  handleCloseModal,
  isMobile,
  isAdminUser,
  inputs,
  dataExportDefaultTime,
  timeOptions,
  handleInputChange,
  t,
}) => {
  const { start_timestamp, end_timestamp, username } = inputs;

  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={searchModalVisible} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
      <DialogContent className={isMobile ? 'w-full max-w-full h-full max-h-full rounded-none' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>{t('搜索条件')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>{t('起始时间')}</Label>
            <Input
              type='datetime-local'
              value={formatDateForInput(start_timestamp)}
              onChange={(e) => handleInputChange(e.target.value ? new Date(e.target.value) : null, 'start_timestamp')}
              className='w-full rounded-lg'
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('结束时间')}</Label>
            <Input
              type='datetime-local'
              value={formatDateForInput(end_timestamp)}
              onChange={(e) => handleInputChange(e.target.value ? new Date(e.target.value) : null, 'end_timestamp')}
              className='w-full rounded-lg'
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('时间粒度')}</Label>
            <Select
              value={dataExportDefaultTime}
              onValueChange={(value) => handleInputChange(value, 'data_export_default_time')}
            >
              <SelectTrigger className='w-full rounded-lg'>
                <SelectValue placeholder={t('时间粒度')} />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdminUser && (
            <div className='space-y-2'>
              <Label>{t('用户名称')}</Label>
              <Input
                value={username || ''}
                placeholder={t('可选值')}
                onChange={(e) => handleInputChange(e.target.value, 'username')}
                className='w-full rounded-lg'
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleCloseModal}>
            {t('取消')}
          </Button>
          <Button onClick={handleSearchConfirm}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
