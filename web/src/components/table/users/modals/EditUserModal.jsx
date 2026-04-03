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

import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  API,
  showError,
  showSuccess,
  renderQuota,
  renderQuotaWithPrompt,
  getCurrencyConfig,
} from '../../../../helpers';
import {
  quotaToDisplayAmount,
  displayAmountToQuota,
} from '../../../../helpers/quota';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { User, Save, X, Link, Users, Plus } from 'lucide-react';
import UserBindingManagementModal from './UserBindingManagementModal';

const EditUserModal = (props) => {
  const { t } = useTranslation();
  const userId = props.editingUser.id;
  const [loading, setLoading] = useState(true);
  const [addQuotaModalOpen, setIsModalOpen] = useState(false);
  const [addQuotaLocal, setAddQuotaLocal] = useState('');
  const [addAmountLocal, setAddAmountLocal] = useState('');
  const isMobile = useIsMobile();
  const [groupOptions, setGroupOptions] = useState([]);
  const [bindingModalVisible, setBindingModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [, setForceUpdate] = useState(0);

  // Create a formApi-like ref for compatibility with UserBindingManagementModal
  const formApiRef = useRef({
    getValue: (field) => formValues[field],
    setValue: (field, value) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    getValues: () => formValues,
    setValues: (vals) => {
      setFormValues(vals);
    },
    submitForm: () => handleSubmit(),
    reset: () => setFormValues(getInitValues()),
  });

  // Keep ref in sync
  useEffect(() => {
    formApiRef.current.getValue = (field) => formValues[field];
    formApiRef.current.getValues = () => formValues;
  }, [formValues]);

  const isEdit = Boolean(userId);

  const getInitValues = () => ({
    username: '',
    display_name: '',
    password: '',
    github_id: '',
    oidc_id: '',
    discord_id: '',
    wechat_id: '',
    telegram_id: '',
    linux_do_id: '',
    email: '',
    quota: 0,
    group: 'default',
    remark: '',
  });

  const fetchGroups = async () => {
    try {
      let res = await API.get(`/api/group/`);
      setGroupOptions(res.data.data.map((g) => ({ label: g, value: g })));
    } catch (e) {
      showError(e.message);
    }
  };

  const handleCancel = () => props.handleClose();

  const loadUser = async () => {
    setLoading(true);
    const url = userId ? `/api/user/${userId}` : `/api/user/self`;
    const res = await API.get(url);
    const { success, message, data } = res.data;
    if (success) {
      data.password = '';
      setFormValues({ ...getInitValues(), ...data });
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    if (userId) fetchGroups();
    setBindingModalVisible(false);
  }, [props.editingUser.id]);

  const openBindingModal = () => {
    setBindingModalVisible(true);
  };

  const closeBindingModal = () => {
    setBindingModalVisible(false);
  };

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  /* ----------------------- submit ----------------------- */
  const handleSubmit = async () => {
    if (!formValues.username) {
      showError(t('请输入用户名'));
      return;
    }
    setLoading(true);
    let payload = { ...formValues };
    if (typeof payload.quota === 'string')
      payload.quota = parseInt(payload.quota) || 0;
    if (userId) {
      payload.id = parseInt(userId);
    }
    const url = userId ? `/api/user/` : `/api/user/self`;
    const res = await API.put(url, payload);
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('用户信息更新成功！'));
      props.refresh();
      props.handleClose();
    } else {
      showError(message);
    }
    setLoading(false);
  };

  /* --------------------- quota helper -------------------- */
  const addLocalQuota = () => {
    const current = parseInt(formValues.quota || 0);
    const delta = parseInt(addQuotaLocal) || 0;
    updateField('quota', current + delta);
  };

  /* --------------------------- UI --------------------------- */
  return (
    <>
      <Sheet open={props.visible} onOpenChange={(open) => !open && handleCancel()}>
        <SheetContent side='right' className={isMobile ? 'w-full' : 'w-[600px] sm:max-w-[600px]'}>
          <SheetHeader>
            <SheetTitle>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-blue-600 border-blue-300'>
                  {t(isEdit ? '编辑' : '新建')}
                </Badge>
                <span>{isEdit ? t('编辑用户') : t('创建用户')}</span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary' />
              </div>
            ) : (
              <div className='p-2 space-y-3'>
                {/* Basic Info */}
                <Card className='rounded-2xl shadow-sm border-0'>
                  <div className='p-4'>
                    <div className='flex items-center mb-2'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shadow-md'>
                        <User className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <span className='text-lg font-medium'>
                          {t('基本信息')}
                        </span>
                        <div className='text-xs text-gray-600'>
                          {t('用户的基本账户信息')}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>{t('用户名')} *</label>
                        <Input
                          value={formValues.username || ''}
                          onChange={(e) => updateField('username', e.target.value)}
                          placeholder={t('请输入新的用户名')}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>{t('密码')}</label>
                        <Input
                          type='password'
                          value={formValues.password || ''}
                          onChange={(e) => updateField('password', e.target.value)}
                          placeholder={t('请输入新的密码，最短 8 位')}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>{t('显示名称')}</label>
                        <Input
                          value={formValues.display_name || ''}
                          onChange={(e) => updateField('display_name', e.target.value)}
                          placeholder={t('请输入新的显示名称')}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>{t('备注')}</label>
                        <Input
                          value={formValues.remark || ''}
                          onChange={(e) => updateField('remark', e.target.value)}
                          placeholder={t('请输入备注（仅管理员可见）')}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Permission Settings */}
                {userId && (
                  <Card className='rounded-2xl shadow-sm border-0'>
                    <div className='p-4'>
                      <div className='flex items-center mb-2'>
                        <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 shadow-md'>
                          <Users className='h-4 w-4 text-green-600' />
                        </div>
                        <div>
                          <span className='text-lg font-medium'>
                            {t('权限设置')}
                          </span>
                          <div className='text-xs text-gray-600'>
                            {t('用户分组和额度管理')}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>{t('分组')} *</label>
                          <Select
                            value={formValues.group || undefined}
                            onValueChange={(value) => updateField('group', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('请选择分组')} />
                            </SelectTrigger>
                            <SelectContent>
                              {groupOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='grid grid-cols-12 gap-3'>
                          <div className='col-span-10'>
                            <label className='text-sm font-medium mb-1 block'>{t('剩余额度')} *</label>
                            <Input
                              type='number'
                              value={formValues.quota ?? 0}
                              onChange={(e) => updateField('quota', parseInt(e.target.value) || 0)}
                              placeholder={t('请输入新的剩余额度')}
                              step={500000}
                            />
                            <p className='text-xs text-muted-foreground mt-1'>
                              {renderQuotaWithPrompt(formValues.quota || 0)}
                            </p>
                          </div>
                          <div className='col-span-2 flex items-end'>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => setIsModalOpen(true)}
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Binding Info Entry */}
                {userId && (
                  <Card className='rounded-2xl shadow-sm border-0'>
                    <div className='p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center min-w-0'>
                          <div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 shadow-md'>
                            <Link className='h-4 w-4 text-purple-600' />
                          </div>
                          <div className='min-w-0'>
                            <span className='text-lg font-medium'>
                              {t('绑定信息')}
                            </span>
                            <div className='text-xs text-gray-600'>
                              {t('管理用户已绑定的第三方账户，支持筛选与解绑')}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          onClick={openBindingModal}
                        >
                          {t('管理绑定')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          <SheetFooter>
            <div className='flex justify-end gap-2'>
              <Button onClick={handleSubmit} disabled={loading}>
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

      <UserBindingManagementModal
        visible={bindingModalVisible}
        onCancel={closeBindingModal}
        userId={userId}
        isMobile={isMobile}
        formApiRef={formApiRef}
      />

      {/* Add Quota Modal */}
      <Dialog open={addQuotaModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className='flex items-center'>
                <Plus className='mr-2 h-4 w-4' />
                {t('添加额度')}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className='mb-4'>
            {(() => {
              const current = formValues.quota || 0;
              return (
                <span className='text-sm text-muted-foreground block mb-2'>
                  {`${t('新额度：')}${renderQuota(current)} + ${renderQuota(addQuotaLocal)} = ${renderQuota(current + parseInt(addQuotaLocal || 0))}`}
                </span>
              );
            })()}
          </div>
          {getCurrencyConfig().type !== 'TOKENS' && (
            <div className='mb-3'>
              <div className='mb-1'>
                <span className='text-sm'>{t('金额')}</span>
                <span className='text-sm text-muted-foreground'>
                  {' '}
                  ({t('仅用于换算，实际保存的是额度')})
                </span>
              </div>
              <Input
                type='number'
                placeholder={t('输入金额')}
                value={addAmountLocal}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setAddAmountLocal(val);
                  setAddQuotaLocal(
                    val != null && val !== ''
                      ? displayAmountToQuota(Math.abs(val)) * Math.sign(val)
                      : '',
                  );
                }}
              />
            </div>
          )}
          <div>
            <div className='mb-1'>
              <span className='text-sm'>{t('额度')}</span>
            </div>
            <Input
              type='number'
              placeholder={t('输入额度')}
              value={addQuotaLocal}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setAddQuotaLocal(val);
                setAddAmountLocal(
                  val != null && val !== ''
                    ? Number(
                        (
                          quotaToDisplayAmount(Math.abs(val)) * Math.sign(val)
                        ).toFixed(2),
                      )
                    : '',
                );
              }}
              step={500000}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              {t('取消')}
            </Button>
            <Button
              onClick={() => {
                addLocalQuota();
                setIsModalOpen(false);
                setAddQuotaLocal('');
                setAddAmountLocal('');
              }}
            >
              {t('确定')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditUserModal;
