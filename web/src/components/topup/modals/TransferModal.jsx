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
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { CreditCard } from 'lucide-react';

const TransferModal = ({
  t,
  openTransfer,
  transfer,
  handleTransferCancel,
  userState,
  renderQuota,
  getQuotaPerUnit,
  transferAmount,
  setTransferAmount,
}) => {
  return (
    <Dialog open={openTransfer} onOpenChange={(open) => !open && handleTransferCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center'>
              <CreditCard className='mr-2' size={18} />
              {t('划转邀请额度')}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <span className='font-semibold block mb-2'>
              {t('可用邀请额度')}
            </span>
            <Input
              value={renderQuota(userState?.user?.aff_quota)}
              disabled
              className='!rounded-lg'
            />
          </div>
          <div>
            <span className='font-semibold block mb-2'>
              {t('划转额度')} · {t('最低') + renderQuota(getQuotaPerUnit())}
            </span>
            <Input
              type='number'
              min={getQuotaPerUnit()}
              max={userState?.user?.aff_quota || 0}
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              className='w-full !rounded-lg'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleTransferCancel}>
            {t('取消')}
          </Button>
          <Button onClick={transfer}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
