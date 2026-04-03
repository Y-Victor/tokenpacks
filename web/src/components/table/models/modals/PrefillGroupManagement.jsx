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

import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../../ui/sheet';
import { Plus, Layers } from 'lucide-react';
import { confirm } from '../../../../lib/confirm';
import {
  API,
  showError,
  showSuccess,
  stringToColor,
} from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import CardTable from '../../../common/ui/CardTable';
import EditPrefillGroupModal from './EditPrefillGroupModal';
import {
  renderLimitedItems,
  renderDescription,
} from '../../../common/ui/RenderUtils';

const PrefillGroupManagement = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editingGroup, setEditingGroup] = useState({ id: undefined });

  const typeOptions = [
    { label: t('模型组'), value: 'model' },
    { label: t('标签组'), value: 'tag' },
    { label: t('端点组'), value: 'endpoint' },
  ];

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/prefill_group');
      if (res.data.success) {
        setGroups(res.data.data || []);
      } else {
        showError(res.data.message || t('获取组列表失败'));
      }
    } catch (error) {
      showError(t('获取组列表失败'));
    }
    setLoading(false);
  };

  const deleteGroup = async (id) => {
    try {
      const res = await API.delete(`/api/prefill_group/${id}`);
      if (res.data.success) {
        showSuccess(t('删除成功'));
        loadGroups();
      } else {
        showError(res.data.message || t('删除失败'));
      }
    } catch (error) {
      showError(t('删除失败'));
    }
  };

  const handleEdit = (group = {}) => {
    setEditingGroup(group);
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setTimeout(() => {
      setEditingGroup({ id: undefined });
    }, 300);
  };

  const handleEditSuccess = () => {
    closeEdit();
    loadGroups();
  };

  const columns = [
    {
      title: t('组名'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className='flex items-center gap-2'>
          <span className='font-semibold'>{text}</span>
          <Badge variant='outline'>
            {typeOptions.find((opt) => opt.value === record.type)?.label ||
              record.type}
          </Badge>
        </div>
      ),
    },
    {
      title: t('描述'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => renderDescription(text, 150),
    },
    {
      title: t('项目内容'),
      dataIndex: 'items',
      key: 'items',
      render: (items, record) => {
        try {
          if (record.type === 'endpoint') {
            const obj =
              typeof items === 'string'
                ? JSON.parse(items || '{}')
                : items || {};
            const keys = Object.keys(obj);
            if (keys.length === 0)
              return <span className='text-muted-foreground'>{t('暂无项目')}</span>;
            return renderLimitedItems({
              items: keys,
              renderItem: (key, idx) => (
                <Badge
                  key={idx}
                  variant='outline'
                  style={{ borderColor: stringToColor(key), color: stringToColor(key) }}
                >
                  {key}
                </Badge>
              ),
              maxDisplay: 3,
            });
          }
          const itemsArray =
            typeof items === 'string' ? JSON.parse(items) : items;
          if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
            return <span className='text-muted-foreground'>{t('暂无项目')}</span>;
          }
          return renderLimitedItems({
            items: itemsArray,
            renderItem: (item, idx) => (
              <Badge
                key={idx}
                variant='outline'
                style={{ borderColor: stringToColor(item), color: stringToColor(item) }}
              >
                {item}
              </Badge>
            ),
            maxDisplay: 3,
          });
        } catch {
          return <span className='text-muted-foreground'>{t('数据格式错误')}</span>;
        }
      },
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <div className='flex items-center gap-1'>
          <Button size='sm' variant='outline' onClick={() => handleEdit(record)}>
            {t('编辑')}
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => {
              confirm({
                title: t('确定删除此组？'),
                onConfirm: () => deleteGroup(record.id),
              });
            }}
          >
            {t('删除')}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (visible) {
      loadGroups();
    }
  }, [visible]);

  return (
    <>
      <Sheet open={visible} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side='left' className={isMobile ? 'w-full' : 'w-[800px] sm:max-w-[800px]'}>
          <SheetHeader>
            <SheetTitle>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-blue-600 border-blue-300'>
                  {t('管理')}
                </Badge>
                <span>{t('预填组管理')}</span>
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
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shadow-md'>
                        <Layers className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <span className='text-lg font-medium'>{t('组列表')}</span>
                        <div className='text-xs text-gray-600'>
                          {t('管理模型、标签、端点等预填组')}
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-end mb-4'>
                      <Button
                        size='sm'
                        onClick={() => handleEdit()}
                      >
                        <Plus className='h-4 w-4 mr-1' />
                        {t('新建组')}
                      </Button>
                    </div>
                    {groups.length > 0 ? (
                      <CardTable
                        columns={columns}
                        dataSource={groups}
                        rowKey='id'
                        hidePagination={true}
                        size='small'
                        scroll={{ x: 'max-content' }}
                      />
                    ) : (
                      <EmptyState title={t('暂无预填组')} />
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <EditPrefillGroupModal
        visible={showEdit}
        onClose={closeEdit}
        editingGroup={editingGroup}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default PrefillGroupManagement;
