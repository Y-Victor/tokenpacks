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

import React, { useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';

const TokensFilters = ({
  formInitValues,
  setFormApi,
  searchTokens,
  loading,
  searching,
  t,
}) => {
  const [searchKeyword, setSearchKeyword] = useState(formInitValues?.searchKeyword || '');
  const [searchToken, setSearchToken] = useState(formInitValues?.searchToken || '');

  const apiRef = useRef({
    getValue: (field) => {
      if (field === 'searchKeyword') return searchKeyword;
      if (field === 'searchToken') return searchToken;
      return '';
    },
    reset: () => {
      setSearchKeyword('');
      setSearchToken('');
    },
  });

  // Update the API ref whenever state changes
  apiRef.current.getValue = (field) => {
    if (field === 'searchKeyword') return searchKeyword;
    if (field === 'searchToken') return searchToken;
    return '';
  };

  // Expose a form-like API
  React.useEffect(() => {
    setFormApi(apiRef.current);
  }, [setFormApi]);

  const handleReset = () => {
    setSearchKeyword('');
    setSearchToken('');
    setTimeout(() => {
      searchTokens();
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchTokens(1);
  };

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete='off'
      className='w-full md:w-auto order-1 md:order-2'
    >
      <div className='flex flex-col md:flex-row items-center gap-2 w-full md:w-auto'>
        <div className='relative w-full md:w-56'>
          <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={t('搜索关键字')}
            className='pl-8 h-8'
          />
        </div>

        <div className='relative w-full md:w-56'>
          <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            placeholder={t('密钥')}
            className='pl-8 h-8'
          />
        </div>

        <div className='flex gap-2 w-full md:w-auto'>
          <Button
            variant='outline'
            type='submit'
            disabled={loading || searching}
            className='flex-1 md:flex-initial md:w-auto'
            size='sm'
          >
            {t('查询')}
          </Button>

          <Button
            variant='outline'
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

export default TokensFilters;
