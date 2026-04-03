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

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';

const ChannelsFilters = ({
  setEditingChannel,
  setShowEdit,
  refresh,
  setShowColumnSelector,
  formInitValues,
  setFormApi,
  searchChannels,
  enableTagMode,
  formApi,
  groupOptions,
  loading,
  searching,
  t,
}) => {
  // Local state to replicate Semi Form behavior
  const [searchKeyword, setSearchKeyword] = useState(formInitValues?.searchKeyword || '');
  const [searchModel, setSearchModel] = useState(formInitValues?.searchModel || '');
  const [searchGroup, setSearchGroup] = useState(formInitValues?.searchGroup || '');

  // Expose a formApi-like object to the parent
  React.useEffect(() => {
    const api = {
      getValues: () => ({ searchKeyword, searchModel, searchGroup }),
      getValue: (field) => {
        if (field === 'searchKeyword') return searchKeyword;
        if (field === 'searchModel') return searchModel;
        if (field === 'searchGroup') return searchGroup;
        return '';
      },
      reset: () => {
        setSearchKeyword('');
        setSearchModel('');
        setSearchGroup('');
      },
    };
    setFormApi(api);
  }, [searchKeyword, searchModel, searchGroup, setFormApi]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchChannels(enableTagMode);
  };

  return (
    <div className='flex flex-col md:flex-row justify-between items-center gap-2 w-full'>
      <div className='flex gap-2 w-full md:w-auto order-2 md:order-1'>
        <Button
          size='sm'
          variant='default'
          className='w-full md:w-auto'
          onClick={() => {
            setEditingChannel({
              id: undefined,
            });
            setShowEdit(true);
          }}
        >
          {t('添加渠道')}
        </Button>

        <Button
          size='sm'
          variant='outline'
          className='w-full md:w-auto'
          onClick={refresh}
        >
          {t('刷新')}
        </Button>

        <Button
          size='sm'
          variant='outline'
          onClick={() => setShowColumnSelector(true)}
          className='w-full md:w-auto'
        >
          {t('列设置')}
        </Button>
      </div>

      <div className='flex flex-col md:flex-row items-center gap-2 w-full md:w-auto order-1 md:order-2'>
        <form
          onSubmit={handleSubmit}
          autoComplete='off'
          className='flex flex-col md:flex-row items-center gap-2 w-full'
        >
          <div className='relative w-full md:w-64'>
            <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              className='pl-8 h-8'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('渠道ID，名称，密钥，API地址')}
            />
          </div>
          <div className='w-full md:w-48'>
            <div className='relative'>
              <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                className='pl-8 h-8'
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder={t('模型关键字')}
              />
            </div>
          </div>
          <div className='w-full md:w-32'>
            <select
              className='flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              value={searchGroup}
              onChange={(e) => {
                setSearchGroup(e.target.value);
                setTimeout(() => {
                  searchChannels(enableTagMode);
                }, 0);
              }}
            >
              <option value=''>{t('选择分组')}</option>
              {groupOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            size='sm'
            variant='outline'
            type='submit'
            disabled={loading || searching}
            className='w-full md:w-auto'
          >
            {t('查询')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            type='button'
            onClick={() => {
              setSearchKeyword('');
              setSearchModel('');
              setSearchGroup('');
              setTimeout(() => {
                refresh();
              }, 100);
            }}
            className='w-full md:w-auto'
          >
            {t('重置')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChannelsFilters;
