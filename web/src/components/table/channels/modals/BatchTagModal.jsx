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
import { Input } from '../../../ui/input';

const BatchTagModal = ({
  showBatchSetTag,
  setShowBatchSetTag,
  batchSetChannelTag,
  batchSetTagValue,
  setBatchSetTagValue,
  selectedChannels,
  t,
}) => {
  return (
    <Dialog open={showBatchSetTag} onOpenChange={(open) => !open && setShowBatchSetTag(false)}>
      <DialogContent className='!rounded-lg'>
        <DialogHeader>
          <DialogTitle>{t('批量设置标签')}</DialogTitle>
        </DialogHeader>
        <div className='mb-5'>
          <p>{t('请输入要设置的标签名称')}</p>
        </div>
        <Input
          placeholder={t('请输入标签名称')}
          value={batchSetTagValue}
          onChange={(e) => setBatchSetTagValue(e.target.value)}
        />
        <div className='mt-4'>
          <p className='text-sm text-muted-foreground'>
            {t('已选择 ${count} 个渠道').replace(
              '${count}',
              selectedChannels.length,
            )}
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setShowBatchSetTag(false)}>
            {t('取消')}
          </Button>
          <Button onClick={batchSetChannelTag}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchTagModal;
