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
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../ui/tooltip';
import { confirm } from '../../../../lib/confirm';
import {
  API,
  showError,
  showSuccess,
  timestamp2string,
} from '../../../../helpers';

const MultiKeyManageModal = ({ visible, onCancel, channel, onRefresh }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [keyStatusList, setKeyStatusList] = useState([]);
  const [operationLoading, setOperationLoading] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Statistics states
  const [enabledCount, setEnabledCount] = useState(0);
  const [manualDisabledCount, setManualDisabledCount] = useState(0);
  const [autoDisabledCount, setAutoDisabledCount] = useState(0);

  // Filter states
  const [statusFilter, setStatusFilter] = useState(null); // null=all, 1=enabled, 2=manual_disabled, 3=auto_disabled

  // Load key status data
  const loadKeyStatus = async (
    page = currentPage,
    size = pageSize,
    status = statusFilter,
  ) => {
    if (!channel?.id) return;

    setLoading(true);
    try {
      const requestData = {
        channel_id: channel.id,
        action: 'get_key_status',
        page: page,
        page_size: size,
      };

      // Add status filter if specified
      if (status !== null) {
        requestData.status = status;
      }

      const res = await API.post('/api/channel/multi_key/manage', requestData);

      if (res.data.success) {
        const data = res.data.data;
        setKeyStatusList(data.keys || []);
        setTotal(data.total || 0);
        setCurrentPage(data.page || 1);
        setPageSize(data.page_size || 10);
        setTotalPages(data.total_pages || 0);

        // Update statistics (these are always the overall statistics)
        setEnabledCount(data.enabled_count || 0);
        setManualDisabledCount(data.manual_disabled_count || 0);
        setAutoDisabledCount(data.auto_disabled_count || 0);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      console.error(error);
      showError(t('获取密钥状态失败'));
    } finally {
      setLoading(false);
    }
  };

  // Disable a specific key
  const handleDisableKey = async (keyIndex) => {
    const operationId = `disable_${keyIndex}`;
    setOperationLoading((prev) => ({ ...prev, [operationId]: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'disable_key',
        key_index: keyIndex,
      });

      if (res.data.success) {
        showSuccess(t('密钥已禁用'));
        await loadKeyStatus(currentPage, pageSize); // Reload current page
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('禁用密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationId]: false }));
    }
  };

  // Enable a specific key
  const handleEnableKey = async (keyIndex) => {
    const operationId = `enable_${keyIndex}`;
    setOperationLoading((prev) => ({ ...prev, [operationId]: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'enable_key',
        key_index: keyIndex,
      });

      if (res.data.success) {
        showSuccess(t('密钥已启用'));
        await loadKeyStatus(currentPage, pageSize); // Reload current page
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('启用密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationId]: false }));
    }
  };

  // Enable all disabled keys
  const handleEnableAll = async () => {
    setOperationLoading((prev) => ({ ...prev, enable_all: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'enable_all_keys',
      });

      if (res.data.success) {
        showSuccess(res.data.message || t('已启用所有密钥'));
        // Reset to first page after bulk operation
        setCurrentPage(1);
        await loadKeyStatus(1, pageSize);
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('启用所有密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, enable_all: false }));
    }
  };

  // Disable all enabled keys
  const handleDisableAll = async () => {
    setOperationLoading((prev) => ({ ...prev, disable_all: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'disable_all_keys',
      });

      if (res.data.success) {
        showSuccess(res.data.message || t('已禁用所有密钥'));
        // Reset to first page after bulk operation
        setCurrentPage(1);
        await loadKeyStatus(1, pageSize);
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('禁用所有密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, disable_all: false }));
    }
  };

  // Delete all disabled keys
  const handleDeleteDisabledKeys = async () => {
    setOperationLoading((prev) => ({ ...prev, delete_disabled: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'delete_disabled_keys',
      });

      if (res.data.success) {
        showSuccess(res.data.message);
        // Reset to first page after deletion as data structure might change
        setCurrentPage(1);
        await loadKeyStatus(1, pageSize);
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('删除禁用密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, delete_disabled: false }));
    }
  };

  // Delete a specific key
  const handleDeleteKey = async (keyIndex) => {
    const operationId = `delete_${keyIndex}`;
    setOperationLoading((prev) => ({ ...prev, [operationId]: true }));

    try {
      const res = await API.post('/api/channel/multi_key/manage', {
        channel_id: channel.id,
        action: 'delete_key',
        key_index: keyIndex,
      });

      if (res.data.success) {
        showSuccess(t('密钥已删除'));
        await loadKeyStatus(currentPage, pageSize); // Reload current page
        onRefresh && onRefresh(); // Refresh parent component
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('删除密钥失败'));
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationId]: false }));
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadKeyStatus(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    loadKeyStatus(1, size);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
    loadKeyStatus(1, pageSize, status);
  };

  // Effect to load data when modal opens
  useEffect(() => {
    if (visible && channel?.id) {
      setCurrentPage(1); // Reset to first page when opening
      loadKeyStatus(1, pageSize);
    }
  }, [visible, channel?.id]);

  // Reset pagination when modal closes
  useEffect(() => {
    if (!visible) {
      setCurrentPage(1);
      setKeyStatusList([]);
      setTotal(0);
      setTotalPages(0);
      setEnabledCount(0);
      setManualDisabledCount(0);
      setAutoDisabledCount(0);
      setStatusFilter(null); // Reset filter
    }
  }, [visible]);

  // Percentages for progress display
  const enabledPercent =
    total > 0 ? Math.round((enabledCount / total) * 100) : 0;
  const manualDisabledPercent =
    total > 0 ? Math.round((manualDisabledCount / total) * 100) : 0;
  const autoDisabledPercent =
    total > 0 ? Math.round((autoDisabledCount / total) * 100) : 0;

  // 取消饼图：不再需要图表数据与配置

  // Get status tag component
  const renderStatusTag = (status) => {
    switch (status) {
      case 1:
        return (
          <Badge className='bg-green-500 text-white'>
            {t('已启用')}
          </Badge>
        );
      case 2:
        return (
          <Badge className='bg-red-500 text-white'>
            {t('已禁用')}
          </Badge>
        );
      case 3:
        return (
          <Badge className='bg-orange-500 text-white'>
            {t('自动禁用')}
          </Badge>
        );
      default:
        return (
          <Badge variant='secondary'>
            {t('未知状态')}
          </Badge>
        );
    }
  };

  // Table columns definition
  const columns = [
    {
      title: t('索引'),
      dataIndex: 'index',
      render: (text) => `#${text}`,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (status) => renderStatusTag(status),
    },
    {
      title: t('禁用原因'),
      dataIndex: 'reason',
      render: (reason, record) => {
        if (record.status === 1 || !reason) {
          return <span className='text-muted-foreground'>-</span>;
        }
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='text-sm truncate block max-w-[200px]'>
                {reason}
              </span>
            </TooltipTrigger>
            <TooltipContent>{reason}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      title: t('禁用时间'),
      dataIndex: 'disabled_time',
      render: (time, record) => {
        if (record.status === 1 || !time) {
          return <span className='text-muted-foreground'>-</span>;
        }
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='text-xs'>{timestamp2string(time)}</span>
            </TooltipTrigger>
            <TooltipContent>{timestamp2string(time)}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      title: t('操作'),
      key: 'action',
      render: (_, record) => (
        <div className='flex items-center gap-2'>
          {record.status === 1 ? (
            <Button
              variant='destructive'
              size='sm'
              disabled={operationLoading[`disable_${record.index}`]}
              onClick={() => handleDisableKey(record.index)}
            >
              {operationLoading[`disable_${record.index}`] ? '...' : t('禁用')}
            </Button>
          ) : (
            <Button
              size='sm'
              disabled={operationLoading[`enable_${record.index}`]}
              onClick={() => handleEnableKey(record.index)}
            >
              {operationLoading[`enable_${record.index}`] ? '...' : t('启用')}
            </Button>
          )}
          <Button
            variant='destructive'
            size='sm'
            disabled={operationLoading[`delete_${record.index}`]}
            onClick={() => {
              confirm({
                title: t('确定要删除此密钥吗？'),
                description: t('此操作不可撤销，将永久删除该密钥'),
                onConfirm: () => handleDeleteKey(record.index),
              });
            }}
          >
            {operationLoading[`delete_${record.index}`] ? '...' : t('删除')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center gap-2 flex-wrap'>
              <span>{t('多密钥管理')}</span>
              {channel?.name && (
                <Badge variant='secondary'>{channel.name}</Badge>
              )}
              <Badge variant='secondary'>
                {t('总密钥数')}: {total}
              </Badge>
              {channel?.channel_info?.multi_key_mode && (
                <Badge variant='secondary'>
                  {channel.channel_info.multi_key_mode === 'random'
                    ? t('随机模式')
                    : t('轮询模式')}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col mb-5'>
          {/* Stats */}
          <div className='rounded-xl p-4 mb-3 border bg-muted/30'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-xl border bg-background p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-sm text-muted-foreground'>{t('已启用')}</span>
                </div>
                <div className='flex items-end gap-2 mb-2'>
                  <span className='text-lg font-bold text-green-500'>{enabledCount}</span>
                  <span className='text-lg text-muted-foreground'>/ {total}</span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full rounded-full bg-green-500 transition-all' style={{ width: `${enabledPercent}%` }} />
                </div>
              </div>
              <div className='rounded-xl border bg-background p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='h-2 w-2 rounded-full bg-red-500' />
                  <span className='text-sm text-muted-foreground'>{t('手动禁用')}</span>
                </div>
                <div className='flex items-end gap-2 mb-2'>
                  <span className='text-lg font-bold text-red-500'>{manualDisabledCount}</span>
                  <span className='text-lg text-muted-foreground'>/ {total}</span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full rounded-full bg-red-500 transition-all' style={{ width: `${manualDisabledPercent}%` }} />
                </div>
              </div>
              <div className='rounded-xl border bg-background p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='h-2 w-2 rounded-full bg-amber-500' />
                  <span className='text-sm text-muted-foreground'>{t('自动禁用')}</span>
                </div>
                <div className='flex items-end gap-2 mb-2'>
                  <span className='text-lg font-bold text-amber-500'>{autoDisabledCount}</span>
                  <span className='text-lg text-muted-foreground'>/ {total}</span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full rounded-full bg-amber-500 transition-all' style={{ width: `${autoDisabledPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className='flex-1 flex flex-col min-h-0'>
            {loading && (
              <div className='flex justify-center py-4'>
                <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
              </div>
            )}
            <div className='rounded-xl border'>
              {/* Toolbar */}
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border-b'>
                <div>
                  <select
                    className='flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    value={statusFilter ?? ''}
                    onChange={(e) => handleStatusFilterChange(e.target.value === '' ? null : Number(e.target.value))}
                  >
                    <option value=''>{t('全部状态')}</option>
                    <option value='1'>{t('已启用')}</option>
                    <option value='2'>{t('手动禁用')}</option>
                    <option value='3'>{t('自动禁用')}</option>
                  </select>
                </div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => loadKeyStatus(currentPage, pageSize)}
                    disabled={loading}
                  >
                    {loading ? '...' : t('刷新')}
                  </Button>
                  {manualDisabledCount + autoDisabledCount > 0 && (
                    <Button
                      size='sm'
                      disabled={operationLoading.enable_all}
                      onClick={() => {
                        confirm({
                          title: t('确定要启用所有密钥吗？'),
                          onConfirm: handleEnableAll,
                        });
                      }}
                    >
                      {operationLoading.enable_all ? '...' : t('启用全部')}
                    </Button>
                  )}
                  {enabledCount > 0 && (
                    <Button
                      variant='destructive'
                      size='sm'
                      disabled={operationLoading.disable_all}
                      onClick={() => {
                        confirm({
                          title: t('确定要禁用所有的密钥吗？'),
                          onConfirm: handleDisableAll,
                        });
                      }}
                    >
                      {operationLoading.disable_all ? '...' : t('禁用全部')}
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-amber-600 border-amber-300 hover:bg-amber-50'
                    disabled={operationLoading.delete_disabled}
                    onClick={() => {
                      confirm({
                        title: t('确定要删除所有已自动禁用的密钥吗？'),
                        description: t('此操作不可撤销，将永久删除已自动禁用的密钥'),
                        onConfirm: handleDeleteDisabledKeys,
                      });
                    }}
                  >
                    {operationLoading.delete_disabled ? '...' : t('删除自动禁用密钥')}
                  </Button>
                </div>
              </div>

              {/* Table content */}
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b bg-muted/50'>
                      {columns.map((col) => (
                        <th key={col.dataIndex || col.key || col.title} className='p-2 text-left font-medium'>
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {keyStatusList.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className='p-8 text-center text-muted-foreground'>
                          {t('暂无密钥数据')}
                        </td>
                      </tr>
                    ) : (
                      keyStatusList.map((row) => (
                        <tr key={row.index} className='border-b'>
                          {columns.map((col) => (
                            <td key={col.dataIndex || col.key || col.title} className='p-2'>
                              {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between p-3 border-t text-sm'>
                <span className='text-muted-foreground'>
                  {t('共')} {total} {t('条')}
                </span>
                <div className='flex items-center gap-2'>
                  <select
                    className='flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs'
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {[10, 20, 50, 100].map((size) => (
                      <option key={size} value={size}>{size} / {t('页')}</option>
                    ))}
                  </select>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {'<'}
                  </Button>
                  <span className='px-2'>{currentPage} / {totalPages || 1}</span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {'>'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiKeyManageModal;
