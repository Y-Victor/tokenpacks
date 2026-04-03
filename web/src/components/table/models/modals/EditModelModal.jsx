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

import React, { useState, useEffect, useMemo } from 'react';
import JSONEditor from '../../../common/ui/JSONEditor';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Switch } from '../../../ui/switch';
import { Alert, AlertDescription } from '../../../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
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
import { Save, X, FileText, AlertTriangle, Link } from 'lucide-react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

// Example endpoint template for quick fill
const ENDPOINT_TEMPLATE = {
  openai: { path: '/v1/chat/completions', method: 'POST' },
  'openai-response': { path: '/v1/responses', method: 'POST' },
  'openai-response-compact': { path: '/v1/responses/compact', method: 'POST' },
  anthropic: { path: '/v1/messages', method: 'POST' },
  gemini: { path: '/v1beta/models/{model}:generateContent', method: 'POST' },
  'jina-rerank': { path: '/v1/rerank', method: 'POST' },
  'image-generation': { path: '/v1/images/generations', method: 'POST' },
};

const nameRuleOptions = [
  { label: '精确名称匹配', value: 0 },
  { label: '前缀名称匹配', value: 1 },
  { label: '包含名称匹配', value: 2 },
  { label: '后缀名称匹配', value: 3 },
];

const EditModelModal = (props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const isEdit = props.editingModel && props.editingModel.id !== undefined;
  const placement = useMemo(() => (isEdit ? 'right' : 'left'), [isEdit]);

  // Vendor list
  const [vendors, setVendors] = useState([]);

  // Prefill groups (tags, endpoints)
  const [tagGroups, setTagGroups] = useState([]);
  const [endpointGroups, setEndpointGroups] = useState([]);

  // Form state
  const [formValues, setFormValues] = useState({});

  const getInitValues = () => ({
    model_name: props.editingModel?.model_name || '',
    description: '',
    icon: '',
    tags: '',
    vendor_id: undefined,
    vendor: '',
    vendor_icon: '',
    endpoints: '',
    name_rule: props.editingModel?.model_name ? 0 : undefined,
    status: true,
    sync_official: true,
  });

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const fetchVendors = async () => {
    try {
      const res = await API.get('/api/vendors/?page_size=1000');
      if (res.data.success) {
        const items = res.data.data.items || res.data.data || [];
        setVendors(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      // ignore
    }
  };

  const fetchPrefillGroups = async () => {
    try {
      const [tagRes, endpointRes] = await Promise.all([
        API.get('/api/prefill_group?type=tag'),
        API.get('/api/prefill_group?type=endpoint'),
      ]);
      if (tagRes?.data?.success) {
        setTagGroups(tagRes.data.data || []);
      }
      if (endpointRes?.data?.success) {
        setEndpointGroups(endpointRes.data.data || []);
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    if (props.visiable) {
      fetchVendors();
      fetchPrefillGroups();
    }
  }, [props.visiable]);

  const handleCancel = () => {
    props.handleClose();
  };

  const loadModel = async () => {
    if (!isEdit || !props.editingModel.id) return;

    setLoading(true);
    try {
      const res = await API.get(`/api/models/${props.editingModel.id}`);
      const { success, message, data } = res.data;
      if (success) {
        if (data.tags) {
          data.tags = data.tags; // Keep as comma-separated string
        } else {
          data.tags = '';
        }
        if (!data.endpoints) {
          data.endpoints = '';
        }
        data.status = data.status === 1;
        data.sync_official = (data.sync_official ?? 1) === 1;
        setFormValues({ ...getInitValues(), ...data });
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('加载模型信息失败'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isEdit) {
      setFormValues({
        ...getInitValues(),
        model_name: props.editingModel?.model_name || '',
      });
    }
  }, [props.editingModel?.id, props.editingModel?.model_name]);

  useEffect(() => {
    if (props.visiable) {
      if (isEdit) {
        loadModel();
      } else {
        setFormValues({
          ...getInitValues(),
          model_name: props.editingModel?.model_name || '',
        });
      }
    } else {
      setFormValues(getInitValues());
    }
  }, [props.visiable, props.editingModel?.id, props.editingModel?.model_name]);

  const submit = async () => {
    if (!formValues.model_name) {
      showError(t('请输入模型名称'));
      return;
    }
    if (formValues.name_rule === undefined || formValues.name_rule === null) {
      showError(t('请选择名称匹配类型'));
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
        tags: formValues.tags || '',
        endpoints: formValues.endpoints || '',
        status: formValues.status ? 1 : 0,
        sync_official: formValues.sync_official ? 1 : 0,
      };

      if (isEdit) {
        submitData.id = props.editingModel.id;
        const res = await API.put('/api/models/', submitData);
        const { success, message } = res.data;
        if (success) {
          showSuccess(t('模型更新成功！'));
          props.refresh();
          props.handleClose();
        } else {
          showError(t(message));
        }
      } else {
        const res = await API.post('/api/models/', submitData);
        const { success, message } = res.data;
        if (success) {
          showSuccess(t('模型创建成功！'));
          props.refresh();
          props.handleClose();
        } else {
          showError(t(message));
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || t('操作失败'));
    }
    setLoading(false);
    setFormValues(getInitValues());
  };

  const titleNode = (
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
      <span>{isEdit ? t('更新模型信息') : t('创建新的模型')}</span>
    </div>
  );

  const formContent = (
    <div className='min-h-0 flex-1 overflow-y-auto'>
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
                  <FileText className='h-4 w-4 text-green-600' />
                </div>
                <div>
                  <span className='text-lg font-medium'>{t('基本信息')}</span>
                  <div className='text-xs text-gray-600'>
                    {t('设置模型的基本信息')}
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('模型名称')} *
                  </label>
                  <Input
                    value={formValues.model_name || ''}
                    onChange={(e) => updateField('model_name', e.target.value)}
                    placeholder={t('请输入模型名称，如：gpt-4')}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('名称匹配类型')} *
                  </label>
                  <Select
                    value={
                      formValues.name_rule !== undefined &&
                      formValues.name_rule !== null
                        ? String(formValues.name_rule)
                        : undefined
                    }
                    onValueChange={(val) =>
                      updateField('name_rule', parseInt(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('请选择名称匹配类型')} />
                    </SelectTrigger>
                    <SelectContent>
                      {nameRuleOptions.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>
                          {t(o.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t(
                      '根据模型名称和匹配规则查找模型元数据，优先级：精确 > 前缀 > 后缀 > 包含',
                    )}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('模型图标')}
                  </label>
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

                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('描述')}
                  </label>
                  <Textarea
                    value={formValues.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder={t('请输入模型描述')}
                    rows={3}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('标签')}
                  </label>
                  <Input
                    value={formValues.tags || ''}
                    onChange={(e) => updateField('tags', e.target.value)}
                    placeholder={t('输入标签或使用","分隔多个标签')}
                  />
                  {tagGroups.length > 0 && (
                    <div className='flex items-center gap-1 flex-wrap mt-2'>
                      {tagGroups.map((group) => (
                        <Button
                          key={group.id}
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            const currentTags = (formValues.tags || '')
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            const newTags = [
                              ...currentTags,
                              ...(group.items || []),
                            ];
                            const uniqueTags = [...new Set(newTags)];
                            updateField('tags', uniqueTags.join(','));
                          }}
                        >
                          {group.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium mb-1 block'>
                    {t('供应商')}
                  </label>
                  <Select
                    value={
                      formValues.vendor_id !== undefined
                        ? String(formValues.vendor_id)
                        : undefined
                    }
                    onValueChange={(value) => {
                      const vid = parseInt(value);
                      updateField('vendor_id', vid);
                      const vendorInfo = vendors.find((v) => v.id === vid);
                      if (vendorInfo) {
                        updateField('vendor', vendorInfo.name);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('选择模型供应商')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Alert
                    variant='default'
                    className='border-yellow-300 bg-yellow-50 dark:bg-yellow-950 mb-3'
                  >
                    <AlertTriangle className='h-4 w-4 text-yellow-600' />
                    <AlertDescription>
                      {t(
                        '提示：此处配置仅用于控制「模型广场」对用户的展示效果，不会影响模型的实际调用与路由。若需配置真实调用行为，请前往「渠道管理」进行设置。',
                      )}
                    </AlertDescription>
                  </Alert>
                  <JSONEditor
                    field='endpoints'
                    label={t('在模型广场向用户展示的端点')}
                    placeholder={
                      '{\n  "openai": {"path": "/v1/chat/completions", "method": "POST"}\n}'
                    }
                    value={formValues.endpoints || ''}
                    onChange={(val) => updateField('endpoints', val)}
                    editorType='object'
                    template={ENDPOINT_TEMPLATE}
                    templateLabel={t('填入模板')}
                    extraText={t('留空则使用默认端点；支持 {path, method}')}
                    extraFooter={
                      endpointGroups.length > 0 && (
                        <div className='flex items-center gap-1 flex-wrap'>
                          {endpointGroups.map((group) => (
                            <Button
                              key={group.id}
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                try {
                                  const current = formValues.endpoints || '';
                                  let base = {};
                                  if (current && current.trim()) {
                                    base = JSON.parse(current);
                                  }
                                  const groupObj =
                                    typeof group.items === 'string'
                                      ? JSON.parse(group.items || '{}')
                                      : group.items || {};
                                  const merged = { ...base, ...groupObj };
                                  updateField(
                                    'endpoints',
                                    JSON.stringify(merged, null, 2),
                                  );
                                } catch (e) {
                                  try {
                                    const groupObj =
                                      typeof group.items === 'string'
                                        ? JSON.parse(group.items || '{}')
                                        : group.items || {};
                                    updateField(
                                      'endpoints',
                                      JSON.stringify(groupObj, null, 2),
                                    );
                                  } catch {}
                                }
                              }}
                            >
                              {group.name}
                            </Button>
                          ))}
                        </div>
                      )
                    }
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <label className='text-sm font-medium'>
                    {t('参与官方同步')}
                  </label>
                  <Switch
                    checked={formValues.sync_official ?? true}
                    onCheckedChange={(checked) =>
                      updateField('sync_official', checked)
                    }
                  />
                  <span className='text-xs text-muted-foreground'>
                    {t('关闭后，此模型将不会被"同步官方"自动覆盖或创建')}
                  </span>
                </div>

                <div className='flex items-center gap-3'>
                  <label className='text-sm font-medium'>{t('状态')}</label>
                  <Switch
                    checked={formValues.status ?? true}
                    onCheckedChange={(checked) =>
                      updateField('status', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const actionButtons = (
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
  );

  if (!isEdit) {
    return (
      <Dialog
        open={props.visiable}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent
          className={
            isMobile
              ? 'flex h-full max-h-screen w-full max-w-full flex-col overflow-hidden rounded-none p-0'
              : 'flex max-h-[90vh] max-w-[760px] flex-col overflow-hidden p-0'
          }
        >
          <DialogHeader className='shrink-0 px-6 pt-6'>
            <DialogTitle>{titleNode}</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter className='shrink-0 border-t px-6 py-4'>
            {actionButtons}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet
      open={props.visiable}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <SheetContent
        side={placement}
        className={isMobile ? 'w-full' : 'w-[600px] sm:max-w-[600px]'}
      >
        <SheetHeader>
          <SheetTitle>{titleNode}</SheetTitle>
        </SheetHeader>
        {formContent}
        <SheetFooter>{actionButtons}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditModelModal;
