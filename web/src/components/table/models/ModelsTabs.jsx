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
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { getLobeHubIcon, showError, showSuccess } from '../../../helpers';
import { API } from '../../../helpers';
import { confirm } from '../../../lib/confirm';

const ModelsTabs = ({
  activeVendorKey,
  setActiveVendorKey,
  vendorCounts,
  vendors,
  loadModels,
  activePage,
  pageSize,
  setActivePage,
  setShowAddVendor,
  setShowEditVendor,
  setEditingVendor,
  loadVendors,
  t,
}) => {
  const handleTabChange = (key) => {
    setActiveVendorKey(key);
    setActivePage(1);
    loadModels(1, pageSize, key);
  };

  const handleEditVendor = (vendor, e) => {
    e.stopPropagation();
    setEditingVendor(vendor);
    setShowEditVendor(true);
  };

  const handleDeleteVendor = async (vendor, e) => {
    e.stopPropagation();
    try {
      const res = await API.delete(`/api/vendors/${vendor.id}`);
      if (res.data.success) {
        showSuccess(t('供应商删除成功'));
        if (activeVendorKey === String(vendor.id)) {
          setActiveVendorKey('all');
          loadModels(1, pageSize, 'all');
        } else {
          loadModels(activePage, pageSize, activeVendorKey);
        }
        loadVendors();
      } else {
        showError(res.data.message || t('删除失败'));
      }
    } catch (error) {
      showError(error.response?.data?.message || t('删除失败'));
    }
  };

  return (
    <div className='mb-2'>
      <div className='flex items-center justify-between gap-2'>
        <Tabs value={activeVendorKey} onValueChange={handleTabChange} className='flex-1 overflow-x-auto'>
          <TabsList className='flex-wrap h-auto gap-1'>
            <TabsTrigger value='all'>
              <span className='flex items-center gap-2'>
                {t('全部')}
                <Badge variant={activeVendorKey === 'all' ? 'destructive' : 'secondary'} className='text-xs'>
                  {vendorCounts['all'] || 0}
                </Badge>
              </span>
            </TabsTrigger>

            {vendors.map((vendor) => {
              const key = String(vendor.id);
              const count = vendorCounts[vendor.id] || 0;
              return (
                <div key={key} className='inline-flex items-center gap-1'>
                  <TabsTrigger value={key} className='gap-2'>
                    {getLobeHubIcon(vendor.icon || 'Layers', 14)}
                    <span>{vendor.name}</span>
                    <Badge
                      variant={activeVendorKey === key ? 'destructive' : 'secondary'}
                      className='text-xs'
                    >
                      {count}
                    </Badge>
                  </TabsTrigger>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 w-9 rounded-xl p-0'
                        onClick={(e) => e.stopPropagation()}
                        aria-label={t('供应商操作')}
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={(e) => handleEditVendor(vendor, e)}>
                        <Pencil className='h-4 w-4 mr-2' />
                        {t('编辑')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-destructive'
                        onClick={(e) => {
                          e.stopPropagation();
                          confirm({
                            title: t('确认删除'),
                            content: t(
                              '确定要删除供应商 "{{name}}" 吗？此操作不可撤销。',
                              { name: vendor.name },
                            ),
                            okText: t('删除'),
                            cancelText: t('取消'),
                            onConfirm: () => handleDeleteVendor(vendor, e),
                          });
                        }}
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        {t('删除')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </TabsList>
        </Tabs>
        <Button
          size='sm'
          onClick={() => setShowAddVendor(true)}
        >
          {t('新增供应商')}
        </Button>
      </div>
    </div>
  );
};

export default ModelsTabs;
