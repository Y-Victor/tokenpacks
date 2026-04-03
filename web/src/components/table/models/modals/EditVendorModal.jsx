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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';
import { Link } from 'lucide-react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const EditVendorModal = ({ visible, handleClose, refresh, editingVendor }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const isEdit = editingVendor && editingVendor.id !== undefined;

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    icon: '',
    status: true,
  });

  const getInitValues = () => ({
    name: '',
    description: '',
    icon: '',
    status: true,
  });

  const handleCancel = () => {
    handleClose();
    setFormValues(getInitValues());
  };

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const loadVendor = async () => {
    if (!isEdit || !editingVendor.id) return;

    setLoading(true);
    try {
      const res = await API.get(`/api/vendors/${editingVendor.id}`);
      const { success, message, data } = res.data;
      if (success) {
        data.status = data.status === 1;
        setFormValues({ ...getInitValues(), ...data });
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('加载供应商信息失败'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        loadVendor();
      } else {
        setFormValues(getInitValues());
      }
    } else {
      setFormValues(getInitValues());
    }
  }, [visible, editingVendor?.id]);

  const submit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...formValues,
        status: formValues.status ? 1 : 0,
      };

      if (isEdit) {
        submitData.id = editingVendor.id;
        const res = await API.put('/api/vendors/', submitData);
        const { success, message } = res.data;
        if (success) {
          showSuccess(t('供应商更新成功！'));
          refresh();
          handleClose();
        } else {
          showError(t(message));
        }
      } else {
        const res = await API.post('/api/vendors/', submitData);
        const { success, message } = res.data;
        if (success) {
          showSuccess(t('供应商创建成功！'));
          refresh();
          handleClose();
        } else {
          showError(t(message));
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || t('操作失败'));
    }
    setLoading(false);
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className={isMobile ? 'w-full max-w-full' : ''}>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('编辑供应商') : t('新增供应商')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-1 block'>{t('供应商名称')} *</label>
            <Input
              value={formValues.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('请输入供应商名称，如：OpenAI')}
            />
          </div>
          <div>
            <label className='text-sm font-medium mb-1 block'>{t('描述')}</label>
            <Textarea
              value={formValues.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('请输入供应商描述')}
              rows={3}
            />
          </div>
          <div>
            <label className='text-sm font-medium mb-1 block'>{t('供应商图标')}</label>
            <Input
              value={formValues.icon || ''}
              onChange={(e) => updateField('icon', e.target.value)}
              placeholder={t('请输入图标名称')}
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {t(
                "图标使用@lobehub/icons库，如：OpenAI、Claude.Color，支持链式参数：OpenAI.Avatar.type={'platform'}、OpenRouter.Avatar.shape={'square'}，查询所有可用图标请 ",
              )}
              <a
                href='https://icons.lobehub.com/components/lobe-hub'
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 underline inline-flex items-center gap-1'
              >
                <Link className='h-3 w-3' />
                {t('请点击我')}
              </a>
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-sm font-medium'>{t('状态')}</label>
            <Switch
              checked={formValues.status}
              onCheckedChange={(checked) => updateField('status', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button onClick={submit} disabled={loading}>
            {t('确定')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVendorModal;
