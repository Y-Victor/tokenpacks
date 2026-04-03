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

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const SyncWizardModal = ({ visible, onClose, onConfirm, loading, t }) => {
  const [step, setStep] = useState(0);
  const [option, setOption] = useState('official');
  const [locale, setLocale] = useState('zh-CN');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (visible) {
      setStep(0);
      setOption('official');
      setLocale('zh-CN');
    }
  }, [visible]);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? 'w-full max-w-full' : ''}>
        <DialogHeader>
          <DialogTitle>{t('同步向导')}</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className='mb-3 flex items-center gap-4'>
          <div className={`flex items-center gap-2 ${step === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <div>
              <div className='text-sm'>{t('选择方式')}</div>
              <div className='text-xs text-muted-foreground'>{t('选择同步来源')}</div>
            </div>
          </div>
          <div className='flex-1 h-px bg-border' />
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <div>
              <div className='text-sm'>{t('选择语言')}</div>
              <div className='text-xs text-muted-foreground'>{t('选择同步语言')}</div>
            </div>
          </div>
        </div>

        {step === 0 && (
          <div className='mt-2 flex justify-center'>
            <RadioGroup
              value={option}
              onValueChange={setOption}
              className='flex gap-4'
            >
              <label className='flex items-start gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50'>
                <RadioGroupItem value='official' />
                <div>
                  <div className='font-medium'>{t('官方模型同步')}</div>
                  <div className='text-sm text-muted-foreground'>{t('从官方模型库同步')}</div>
                </div>
              </label>
              <label className='flex items-start gap-3 border rounded-lg p-4 cursor-not-allowed opacity-50'>
                <RadioGroupItem value='config' disabled />
                <div>
                  <div className='font-medium'>{t('配置文件同步')}</div>
                  <div className='text-sm text-muted-foreground'>{t('从配置文件同步')}</div>
                </div>
              </label>
            </RadioGroup>
          </div>
        )}

        {step === 1 && (
          <div className='mt-2'>
            <div className='mb-2 text-muted-foreground'>
              {t('请选择同步语言')}
            </div>
            <div className='flex justify-center'>
              <RadioGroup
                value={locale}
                onValueChange={setLocale}
                className='flex gap-4'
              >
                {[
                  { value: 'en', label: 'en', desc: 'English' },
                  { value: 'zh-CN', label: 'zh-CN', desc: '\u7B80\u4F53\u4E2D\u6587' },
                  { value: 'zh-TW', label: 'zh-TW', desc: '\u7E41\u9AD4\u4E2D\u6587' },
                  { value: 'ja', label: 'ja', desc: '\u65E5\u672C\u8A9E' },
                ].map((item) => (
                  <label key={item.value} className='flex items-start gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50'>
                    <RadioGroupItem value={item.value} />
                    <div>
                      <div className='font-medium'>{item.label}</div>
                      <div className='text-sm text-muted-foreground'>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className='flex justify-end gap-2'>
            {step === 1 && (
              <Button variant='outline' onClick={() => setStep(0)}>{t('上一步')}</Button>
            )}
            <Button variant='outline' onClick={onClose}>{t('取消')}</Button>
            {step === 0 && (
              <Button
                onClick={() => setStep(1)}
                disabled={option !== 'official'}
              >
                {t('下一步')}
              </Button>
            )}
            {step === 1 && (
              <Button
                disabled={loading}
                onClick={async () => {
                  await onConfirm?.({ option, locale });
                }}
              >
                {t('开始同步')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncWizardModal;
