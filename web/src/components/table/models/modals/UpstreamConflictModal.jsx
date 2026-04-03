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

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Checkbox } from '../../../ui/checkbox';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { EmptyState } from '../../../ui/empty-state';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../ui/popover';
import { MousePointerClick, Search } from 'lucide-react';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import { MODEL_TABLE_PAGE_SIZE } from '../../../../constants';
import CardTable from '../../../common/ui/CardTable';

const FIELD_LABELS = {
  description: '描述',
  icon: '图标',
  tags: '标签',
  vendor: '供应商',
  name_rule: '命名规则',
  status: '状态',
};
const FIELD_KEYS = Object.keys(FIELD_LABELS);

const UpstreamConflictModal = ({
  visible,
  onClose,
  conflicts = [],
  onSubmit,
  t,
  loading = false,
}) => {
  const [selections, setSelections] = useState({});
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const formatValue = (v) => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'string') return v || '-';
    try {
      return JSON.stringify(v, null, 2);
    } catch (_) {
      return String(v);
    }
  };

  useEffect(() => {
    if (visible) {
      const init = {};
      conflicts.forEach((item) => {
        init[item.model_name] = new Set();
      });
      setSelections(init);
      setCurrentPage(1);
      setSearchKeyword('');
    } else {
      setSelections({});
    }
  }, [visible, conflicts]);

  const toggleField = useCallback((modelName, field, checked) => {
    setSelections((prev) => {
      const next = { ...prev };
      const set = new Set(next[modelName] || []);
      if (checked) set.add(field);
      else set.delete(field);
      next[modelName] = set;
      return next;
    });
  }, []);

  const dataSource = useMemo(
    () =>
      (conflicts || []).map((c) => ({
        key: c.model_name,
        model_name: c.model_name,
        fields: c.fields || [],
      })),
    [conflicts],
  );

  const filteredDataSource = useMemo(() => {
    const kw = (searchKeyword || '').toLowerCase();
    if (!kw) return dataSource;
    return dataSource.filter((item) =>
      (item.model_name || '').toLowerCase().includes(kw),
    );
  }, [dataSource, searchKeyword]);

  const getPresentRowsForField = useCallback(
    (fieldKey) =>
      (filteredDataSource || []).filter((row) =>
        (row.fields || []).some((f) => f.field === fieldKey),
      ),
    [filteredDataSource],
  );

  const getHeaderState = useCallback(
    (fieldKey) => {
      const presentRows = getPresentRowsForField(fieldKey);
      const selectedCount = presentRows.filter((row) =>
        selections[row.model_name]?.has(fieldKey),
      ).length;
      const allCount = presentRows.length;
      return {
        headerChecked: allCount > 0 && selectedCount === allCount,
        headerIndeterminate: selectedCount > 0 && selectedCount < allCount,
        hasAny: allCount > 0,
      };
    },
    [getPresentRowsForField, selections],
  );

  const applyHeaderChange = useCallback(
    (fieldKey, checked) => {
      setSelections((prev) => {
        const next = { ...prev };
        getPresentRowsForField(fieldKey).forEach((row) => {
          const set = new Set(next[row.model_name] || []);
          if (checked) set.add(fieldKey);
          else set.delete(fieldKey);
          next[row.model_name] = set;
        });
        return next;
      });
    },
    [getPresentRowsForField],
  );

  const columns = useMemo(() => {
    const base = [
      {
        title: t('模型'),
        dataIndex: 'model_name',
        fixed: 'left',
        render: (text) => <span className='font-semibold'>{text}</span>,
      },
    ];

    const cols = FIELD_KEYS.map((fieldKey) => {
      const rawLabel = FIELD_LABELS[fieldKey] || fieldKey;
      const label = t(rawLabel);

      const { headerChecked, headerIndeterminate, hasAny } =
        getHeaderState(fieldKey);
      if (!hasAny) return null;
      const onHeaderChange = (checked) =>
        applyHeaderChange(fieldKey, checked);

      return {
        title: (
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={headerIndeterminate ? 'indeterminate' : headerChecked}
              onCheckedChange={onHeaderChange}
            />
            <span>{label}</span>
          </div>
        ),
        dataIndex: fieldKey,
        render: (_, record) => {
          const f = (record.fields || []).find((x) => x.field === fieldKey);
          if (!f) return <span className='text-muted-foreground'>-</span>;
          const checked = selections[record.model_name]?.has(fieldKey) || false;
          return (
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={checked}
                onCheckedChange={(val) =>
                  toggleField(record.model_name, fieldKey, val)
                }
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Badge variant='outline' className='cursor-pointer'>
                    <span className='flex items-center gap-1'>
                      <MousePointerClick size={14} />
                      {t('点击查看差异')}
                    </span>
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className='max-w-[520px]'>
                  <div className='mb-2'>
                    <span className='text-xs text-muted-foreground'>
                      {t('本地')}
                    </span>
                    <pre className='whitespace-pre-wrap m-0 text-sm'>
                      {formatValue(f.local)}
                    </pre>
                  </div>
                  <div>
                    <span className='text-xs text-muted-foreground'>
                      {t('官方')}
                    </span>
                    <pre className='whitespace-pre-wrap m-0 text-sm'>
                      {formatValue(f.upstream)}
                    </pre>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        },
      };
    });

    return [...base, ...cols.filter(Boolean)];
  }, [
    t,
    selections,
    filteredDataSource,
    getHeaderState,
    applyHeaderChange,
    toggleField,
  ]);

  const pagedDataSource = useMemo(() => {
    const start = (currentPage - 1) * MODEL_TABLE_PAGE_SIZE;
    const end = start + MODEL_TABLE_PAGE_SIZE;
    return filteredDataSource.slice(start, end);
  }, [filteredDataSource, currentPage]);

  const handleOk = async () => {
    const payload = Object.entries(selections)
      .map(([modelName, set]) => ({
        model_name: modelName,
        fields: Array.from(set || []),
      }))
      .filter((x) => x.fields.length > 0);

    const ok = await onSubmit?.(payload);
    if (ok) onClose?.();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? 'w-full max-w-full' : 'max-w-[1000px]'}>
        <DialogHeader>
          <DialogTitle>{t('选择要覆盖的冲突项')}</DialogTitle>
        </DialogHeader>

        {dataSource.length === 0 ? (
          <EmptyState title={t('无冲突项')} />
        ) : (
          <>
            <div className='mb-3 text-muted-foreground'>
              {t('仅会覆盖你勾选的字段，未勾选的字段保持本地不变。')}
            </div>
            <div className='flex items-center justify-end gap-2 w-full mb-4'>
              <div className='relative w-full'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={t('搜索模型...')}
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='pl-8'
                />
              </div>
            </div>
            {filteredDataSource.length > 0 ? (
              <CardTable
                columns={columns}
                dataSource={pagedDataSource}
                pagination={{
                  currentPage: currentPage,
                  pageSize: MODEL_TABLE_PAGE_SIZE,
                  total: filteredDataSource.length,
                  showSizeChanger: false,
                  onPageChange: (page) => setCurrentPage(page),
                }}
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <EmptyState
                title={searchKeyword ? t('未找到匹配的模型') : t('无冲突项')}
              />
            )}
          </>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('取消')}
          </Button>
          <Button onClick={handleOk} disabled={loading}>
            {t('应用覆盖')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpstreamConflictModal;
