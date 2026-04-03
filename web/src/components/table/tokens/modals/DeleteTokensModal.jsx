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

const DeleteTokensModal = ({
  visible,
  onCancel,
  onConfirm,
  selectedKeys,
  t,
}) => {
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('批量删除令牌')}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          {t('确定要删除所选的 {{count}} 个令牌吗？', {
            count: selectedKeys.length,
          })}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>{t('取消')}</Button>
          <Button variant='destructive' onClick={onConfirm}>{t('确定')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTokensModal;
