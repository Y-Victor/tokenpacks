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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import MarkdownRenderer from '../markdown/MarkdownRenderer';

const RiskMarkdownBlock = React.memo(function RiskMarkdownBlock({
  markdownContent,
}) {
  if (!markdownContent) {
    return null;
  }

  return (
    <div
      className='rounded-lg'
      style={{
        border: '1px solid var(--semi-color-warning-light-hover)',
        padding: '12px',
        contentVisibility: 'auto',
      }}
    >
      <MarkdownRenderer content={markdownContent} />
    </div>
  );
});

const RiskAcknowledgementModal = React.memo(function RiskAcknowledgementModal({
  visible,
  title,
  markdownContent = '',
  detailTitle = '',
  detailItems = [],
  checklist = [],
  inputPrompt = '',
  requiredText = '',
  inputPlaceholder = '',
  mismatchText = '',
  cancelText = '',
  confirmText = '',
  onCancel,
  onConfirm,
}) {
  const isMobile = useIsMobile();
  const [checkedItems, setCheckedItems] = useState([]);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!visible) return;
    setCheckedItems(Array(checklist.length).fill(false));
    setTypedText('');
  }, [visible, checklist.length]);

  const allChecked = useMemo(() => {
    if (checklist.length === 0) return true;
    return checkedItems.length === checklist.length && checkedItems.every(Boolean);
  }, [checkedItems, checklist.length]);

  const typedMatched = useMemo(() => {
    if (!requiredText) return true;
    return typedText.trim() === requiredText.trim();
  }, [typedText, requiredText]);

  const detailText = useMemo(() => detailItems.join(', '), [detailItems]);
  const canConfirm = allChecked && typedMatched;

  const handleChecklistChange = useCallback((index, checked) => {
    setCheckedItems((previous) => {
      const next = [...previous];
      next[index] = checked;
      return next;
    });
  }, []);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className={isMobile ? 'max-w-full' : 'max-w-[860px]'}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' style={{ color: 'var(--semi-color-warning, #faad14)' }} />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {title}
        </DialogDescription>
        <div
          className='flex flex-col gap-4'
          style={{
            maxHeight: isMobile ? '70vh' : '72vh',
            overflowY: 'auto',
          }}
        >

          <RiskMarkdownBlock markdownContent={markdownContent} />

          {detailItems.length > 0 ? (
            <div
              className='flex flex-col gap-2 rounded-lg'
              style={{
                border: '1px solid var(--semi-color-warning-light-hover)',
                background: 'var(--semi-color-fill-0)',
                padding: isMobile ? '10px 12px' : '12px 14px',
              }}
            >
              {detailTitle ? <span className='font-semibold text-sm'>{detailTitle}</span> : null}
              <div className='font-mono text-xs break-all bg-orange-50 border border-orange-200 rounded-md p-2'>
                {detailText}
              </div>
            </div>
          ) : null}

          {checklist.length > 0 ? (
            <div
              className='flex flex-col gap-2 rounded-lg'
              style={{
                border: '1px solid var(--semi-color-border)',
                background: 'var(--semi-color-fill-0)',
                padding: isMobile ? '10px 12px' : '12px 14px',
              }}
            >
              {checklist.map((item, index) => (
                <div key={`risk-check-${index}`} className='flex items-center gap-2'>
                  <Checkbox
                    id={`risk-check-${index}`}
                    checked={!!checkedItems[index]}
                    onCheckedChange={(checked) => {
                      handleChecklistChange(index, !!checked);
                    }}
                  />
                  <label htmlFor={`risk-check-${index}`} className='text-sm cursor-pointer'>
                    {item}
                  </label>
                </div>
              ))}
            </div>
          ) : null}

          {requiredText ? (
            <div
              className='flex flex-col gap-2 rounded-lg'
              style={{
                border: '1px solid var(--semi-color-danger-light-hover)',
                background: 'var(--semi-color-danger-light-default)',
                padding: isMobile ? '10px 12px' : '12px 14px',
              }}
            >
              {inputPrompt ? <span className='font-semibold text-sm'>{inputPrompt}</span> : null}
              <div className='font-mono text-xs break-all rounded-md p-2 bg-gray-50 border border-gray-200'>
                {requiredText}
              </div>
              <Input
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder={inputPlaceholder}
                autoFocus={visible}
                onCopy={(event) => event.preventDefault()}
                onCut={(event) => event.preventDefault()}
                onPaste={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
              />
              {!typedMatched && typedText ? (
                <span className='text-destructive text-xs'>
                  {mismatchText}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onCancel}>{cancelText}</Button>
          <Button
            variant='destructive'
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default RiskAcknowledgementModal;
