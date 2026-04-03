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

import React, { useState, useRef } from 'react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../../../ui/sheet';
import { Save, X, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AddUserModal = (props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const [formValues, setFormValues] = useState({
    username: '',
    display_name: '',
    password: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});

  const getInitValues = () => ({
    username: '',
    display_name: '',
    password: '',
    remark: '',
  });

  const validate = () => {
    const errs = {};
    if (!formValues.username) errs.username = t('请输入用户名');
    if (!formValues.password) errs.password = t('请输入密码');
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showError(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const res = await API.post(`/api/user/`, formValues);
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('用户账户创建成功！'));
      setFormValues(getInitValues());
      props.refresh();
      props.handleClose();
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    props.handleClose();
  };

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Sheet open={props.visible} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent side='left' className={isMobile ? 'w-full' : 'w-[600px] sm:max-w-[600px]'}>
        <SheetHeader>
          <SheetTitle>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-green-600 border-green-300'>
                {t('新建')}
              </Badge>
              <span>{t('添加用户')}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-2'>
          {loading && (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary' />
            </div>
          )}
          <Card className='rounded-2xl shadow-sm border-0'>
            <div className='p-4'>
              <div className='flex items-center mb-2'>
                <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shadow-md'>
                  <UserPlus className='h-4 w-4 text-blue-600' />
                </div>
                <div>
                  <span className='text-lg font-medium'>{t('用户信息')}</span>
                  <div className='text-xs text-gray-600'>
                    {t('创建新用户账户')}
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1 block'>{t('用户名')} *</label>
                  <Input
                    value={formValues.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder={t('请输入用户名')}
                  />
                  {errors.username && <p className='text-xs text-destructive mt-1'>{errors.username}</p>}
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>{t('显示名称')}</label>
                  <Input
                    value={formValues.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                    placeholder={t('请输入显示名称')}
                  />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>{t('密码')} *</label>
                  <Input
                    type='password'
                    value={formValues.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder={t('请输入密码')}
                  />
                  {errors.password && <p className='text-xs text-destructive mt-1'>{errors.password}</p>}
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>{t('备注')}</label>
                  <Input
                    value={formValues.remark}
                    onChange={(e) => updateField('remark', e.target.value)}
                    placeholder={t('请输入备注（仅管理员可见）')}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <SheetFooter>
          <div className='flex justify-end gap-2'>
            <Button onClick={submit} disabled={loading}>
              <Save className='h-4 w-4 mr-1' />
              {t('提交')}
            </Button>
            <Button variant='outline' onClick={handleCancel}>
              <X className='h-4 w-4 mr-1' />
              {t('取消')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddUserModal;
