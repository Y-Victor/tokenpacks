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

import React, { useRef } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';

const ModelsFilters = ({
  formInitValues,
  setFormApi,
  searchModels,
  loading,
  searching,
  t,
}) => {
  const formRef = useRef({
    searchKeyword: formInitValues?.searchKeyword || '',
    searchVendor: formInitValues?.searchVendor || '',
  });
  const [, setForceUpdate] = React.useState(0);

  // Expose a form-api-like interface
  React.useEffect(() => {
    const api = {
      getValues: () => ({ ...formRef.current }),
      getValue: (field) => formRef.current[field],
      reset: () => {
        formRef.current = { searchKeyword: '', searchVendor: '' };
        setForceUpdate((n) => n + 1);
      },
    };
    setFormApi(api);
  }, [setFormApi]);

  const handleReset = () => {
    formRef.current = { searchKeyword: '', searchVendor: '' };
    setForceUpdate((n) => n + 1);
    setTimeout(() => {
      searchModels();
    }, 100);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    searchModels();
  };

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete='off'
      className='w-full md:w-auto order-1 md:order-2'
    >
      <div className='flex flex-col md:flex-row items-center gap-2 w-full md:w-auto'>
        <div className='relative w-full md:w-56'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={formRef.current.searchKeyword}
            onChange={(e) => {
              formRef.current.searchKeyword = e.target.value;
              setForceUpdate((n) => n + 1);
            }}
            placeholder={t('搜索模型名称')}
            className='pl-8 h-8'
          />
        </div>

        <div className='relative w-full md:w-56'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={formRef.current.searchVendor}
            onChange={(e) => {
              formRef.current.searchVendor = e.target.value;
              setForceUpdate((n) => n + 1);
            }}
            placeholder={t('搜索供应商')}
            className='pl-8 h-8'
          />
        </div>

        <div className='flex gap-2 w-full md:w-auto'>
          <Button
            variant='secondary'
            type='submit'
            disabled={loading || searching}
            className='flex-1 md:flex-initial md:w-auto'
            size='sm'
          >
            {t('查询')}
          </Button>

          <Button
            variant='secondary'
            type='button'
            onClick={handleReset}
            className='flex-1 md:flex-initial md:w-auto'
            size='sm'
          >
            {t('重置')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ModelsFilters;
