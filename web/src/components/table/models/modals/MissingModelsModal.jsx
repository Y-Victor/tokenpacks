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

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { EmptyState } from '../../../ui/empty-state';
import { Search } from 'lucide-react';
import { API, showError } from '../../../../helpers';
import { MODEL_TABLE_PAGE_SIZE } from '../../../../constants';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import CardTable from '../../../common/ui/CardTable';

const MissingModelsModal = ({ visible, onClose, onConfigureModel, t }) => {
  const [loading, setLoading] = useState(false);
  const [missingModels, setMissingModels] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const fetchMissing = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/models/missing');
      if (res.data.success) {
        setMissingModels(res.data.data || []);
      } else {
        showError(res.data.message);
      }
    } catch (_) {
      showError(t('获取未配置模型失败'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      fetchMissing();
      setSearchKeyword('');
      setCurrentPage(1);
    } else {
      setMissingModels([]);
    }
  }, [visible]);

  const filteredModels = missingModels.filter((model) =>
    model.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const dataSource = (() => {
    const start = (currentPage - 1) * MODEL_TABLE_PAGE_SIZE;
    const end = start + MODEL_TABLE_PAGE_SIZE;
    return filteredModels.slice(start, end).map((model) => ({
      model,
      key: model,
    }));
  })();

  const columns = [
    {
      title: t('模型名称'),
      dataIndex: 'model',
      render: (text) => (
        <div className='flex items-center'>
          <span className='font-semibold'>{text}</span>
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'operate',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        <Button
          size='sm'
          onClick={() => onConfigureModel(record.model)}
        >
          {t('配置')}
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? 'w-full max-w-full' : 'max-w-[600px]'}>
        <DialogHeader>
          <DialogTitle>
            <div className='flex flex-col gap-2 w-full'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-base'>
                  {t('未配置的模型列表')}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {t('共')} {missingModels.length} {t('个未配置模型')}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary' />
          </div>
        ) : missingModels.length === 0 && !loading ? (
          <EmptyState title={t('暂无缺失模型')} />
        ) : (
          <div className='missing-models-content'>
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

            {filteredModels.length > 0 ? (
              <CardTable
                columns={columns}
                dataSource={dataSource}
                pagination={{
                  currentPage: currentPage,
                  pageSize: MODEL_TABLE_PAGE_SIZE,
                  total: filteredModels.length,
                  showSizeChanger: false,
                  onPageChange: (page) => setCurrentPage(page),
                }}
              />
            ) : (
              <EmptyState
                title={searchKeyword ? t('未找到匹配的模型') : t('暂无缺失模型')}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MissingModelsModal;
