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

const CopyTokensModal = ({
  visible,
  onCancel,
  batchCopyTokens,
  t,
}) => {
  const handleCopyWithName = async () => {
    await batchCopyTokens('name+key');
    onCancel();
  };

  const handleCopyKeyOnly = async () => {
    await batchCopyTokens('key-only');
    onCancel();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('复制令牌')}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          {t('请选择你的复制方式')}
        </div>
        <DialogFooter>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleCopyWithName}>
              {t('名称+密钥')}
            </Button>
            <Button onClick={handleCopyKeyOnly}>{t('仅密钥')}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyTokensModal;
