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

import React, { useState, useRef, useEffect } from 'react';
import JSONEditor from '../../../common/ui/JSONEditor';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../../../ui/sheet';
import { Layers, Save, X } from 'lucide-react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const ENDPOINT_TEMPLATE = {
  openai: { path: '/v1/chat/completions', method: 'POST' },
  'openai-response': { path: '/v1/responses', method: 'POST' },
  'openai-response-compact': { path: '/v1/responses/compact', method: 'POST' },
  anthropic: { path: '/v1/messages', method: 'POST' },
  gemini: { path: '/v1beta/models/{model}:generateContent', method: 'POST' },
  'jina-rerank': { path: '/v1/rerank', method: 'POST' },
  'image-generation': { path: '/v1/images/generations', method: 'POST' },
};

const EditPrefillGroupModal = ({
  visible,
  onClose,
  editingGroup,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const isEdit = editingGroup && editingGroup.id !== undefined;

  const [selectedType, setSelectedType] = useState(editingGroup?.type || 'tag');
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    setSelectedType(editingGroup?.type || 'tag');
  }, [editingGroup?.type]);

  useEffect(() => {
    if (visible) {
      setFormValues({
        name: editingGroup?.name || '',
        type: editingGroup?.type || 'tag',
        description: editingGroup?.description || '',
        items: (() => {
          try {
            if (editingGroup?.type === 'endpoint') {
              return typeof editingGroup?.items === 'string'
                ? editingGroup.items
                : JSON.stringify(editingGroup.items || {}, null, 2);
            }
            return Array.isArray(editingGroup?.items)
              ? editingGroup.items.join(', ')
              : '';
          } catch {
            return editingGroup?.type === 'endpoint' ? '' : '';
          }
        })(),
      });
      setSelectedType(editingGroup?.type || 'tag');
    }
  }, [visible, editingGroup]);

  const typeOptions = [
    { label: t('模型组'), value: 'model' },
    { label: t('标签组'), value: 'tag' },
    { label: t('端点组'), value: 'endpoint' },
  ];

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.name) {
      showError(t('请输入组名'));
      return;
    }
    if (!formValues.type) {
      showError(t('请选择组类型'));
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
      };
      if (formValues.type === 'endpoint') {
        submitData.items = formValues.items || '';
      } else {
        // Convert comma-separated string back to array
        submitData.items = formValues.items
          ? formValues.items.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      }

      if (editingGroup.id) {
        submitData.id = editingGroup.id;
        const res = await API.put('/api/prefill_group', submitData);
        if (res.data.success) {
          showSuccess(t('更新成功'));
          onSuccess();
        } else {
          showError(res.data.message || t('更新失败'));
        }
      } else {
        const res = await API.post('/api/prefill_group', submitData);
        if (res.data.success) {
          showSuccess(t('创建成功'));
          onSuccess();
        } else {
          showError(res.data.message || t('创建失败'));
        }
      }
    } catch (error) {
      showError(t('操作失败'));
    }
    setLoading(false);
  };

  return (
    <Sheet open={visible} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side='left' className={isMobile ? 'w-full' : 'w-[600px] sm:max-w-[600px]'}>
        <SheetHeader>
          <SheetTitle>
            <div className='flex items-center gap-2'>
              {isEdit ? (
                <Badge variant='outline' className='text-blue-600 border-blue-300'>
                  {t('更新')}
                </Badge>
              ) : (
                <Badge variant='outline' className='text-green-600 border-green-300'>
                  {t('新建')}
                </Badge>
              )}
              <span>{isEdit ? t('更新预填组') : t('创建新的预填组')}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary' />
            </div>
          ) : (
            <div className='p-2'>
              <Card className='rounded-2xl shadow-sm border-0'>
                <div className='p-4'>
                  <div className='flex items-center mb-2'>
                    <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 shadow-md'>
                      <Layers className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <span className='text-lg font-medium'>{t('基本信息')}</span>
                      <div className='text-xs text-gray-600'>
                        {t('设置预填组的基本信息')}
                      </div>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>{t('组名')} *</label>
                      <Input
                        value={formValues.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder={t('请输入组名')}
                      />
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>{t('类型')} *</label>
                      <Select
                        value={formValues.type || undefined}
                        onValueChange={(val) => {
                          updateField('type', val);
                          setSelectedType(val);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('选择组类型')} />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>{t('描述')}</label>
                      <Textarea
                        value={formValues.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder={t('请输入组描述')}
                        rows={3}
                      />
                    </div>
                    <div>
                      {selectedType === 'endpoint' ? (
                        <JSONEditor
                          field='items'
                          label={t('端点映射')}
                          value={formValues.items || ''}
                          onChange={(val) => updateField('items', val)}
                          editorType='object'
                          placeholder={
                            '{\n  "openai": {"path": "/v1/chat/completions", "method": "POST"}\n}'
                          }
                          template={ENDPOINT_TEMPLATE}
                          templateLabel={t('填入模板')}
                          extraText={t('键为端点类型，值为路径和方法对象')}
                        />
                      ) : (
                        <div>
                          <label className='text-sm font-medium mb-1 block'>{t('项目')}</label>
                          <Input
                            value={formValues.items || ''}
                            onChange={(e) => updateField('items', e.target.value)}
                            placeholder={t('输入项目名称，用逗号分隔')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className='flex justify-end gap-2'>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className='h-4 w-4 mr-1' />
              {t('提交')}
            </Button>
            <Button variant='outline' onClick={onClose}>
              <X className='h-4 w-4 mr-1' />
              {t('取消')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditPrefillGroupModal;
