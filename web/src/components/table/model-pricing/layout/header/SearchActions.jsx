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

import React, { memo, useCallback } from 'react';
import { Input } from '../../../../ui/input';
import { Button } from '../../../../ui/button';
import { Switch } from '../../../../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { Separator } from '../../../../ui/separator';
import { Search, Copy, Filter, X } from 'lucide-react';

const SearchActions = memo(
  ({
    selectedRowKeys = [],
    copyText,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isMobile = false,
    searchValue = '',
    setShowFilterModal,
    showWithRecharge,
    setShowWithRecharge,
    currency,
    setCurrency,
    siteDisplayType,
    showRatio,
    setShowRatio,
    viewMode,
    setViewMode,
    tokenUnit,
    setTokenUnit,
    t,
  }) => {
    const supportsCurrencyDisplay = siteDisplayType !== 'TOKENS';

    const handleCopyClick = useCallback(() => {
      if (copyText && selectedRowKeys.length > 0) {
        copyText(selectedRowKeys);
      }
    }, [copyText, selectedRowKeys]);

    const handleFilterClick = useCallback(() => {
      setShowFilterModal?.(true);
    }, [setShowFilterModal]);

    const handleViewModeToggle = useCallback(() => {
      setViewMode?.(viewMode === 'table' ? 'card' : 'table');
    }, [viewMode, setViewMode]);

    const handleTokenUnitToggle = useCallback(() => {
      setTokenUnit?.(tokenUnit === 'K' ? 'M' : 'K');
    }, [tokenUnit, setTokenUnit]);

    return (
      <div className='pricing-search-actions'>
        <div className='pricing-search-input-wrap'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('模糊搜索模型名称')}
            value={searchValue}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onChange={(e) => handleChange(e.target.value)}
            className='pl-9 pr-8'
          />
          {searchValue && (
            <button
              type='button'
              onClick={() => handleChange('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        <Button
          variant='default'
          onClick={handleCopyClick}
          disabled={selectedRowKeys.length === 0}
          className='bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
        >
          <Copy className='h-4 w-4 mr-1' />
          {t('复制')}
        </Button>

        {!isMobile && (
          <div className='pricing-search-toggles'>
            <Separator orientation='vertical' className='h-6 mx-1' />

            {/* 充值价格显示开关 */}
            {supportsCurrencyDisplay && (
              <div className='pricing-toggle-item'>
                <span className='text-sm text-gray-600'>{t('充值价格显示')}</span>
                <Switch
                  checked={showWithRecharge}
                  onCheckedChange={setShowWithRecharge}
                />
              </div>
            )}

            {/* 货币单位选择 */}
            {supportsCurrencyDisplay && showWithRecharge && (
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='CNY'>CNY</SelectItem>
                  <SelectItem value='CUSTOM'>{t('自定义货币')}</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* 显示倍率开关 */}
            <div className='pricing-toggle-item'>
              <span className='text-sm text-gray-600'>{t('倍率')}</span>
              <Switch checked={showRatio} onCheckedChange={setShowRatio} />
            </div>

            {/* 视图模式切换按钮 */}
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={handleViewModeToggle}
            >
              {t('表格视图')}
            </Button>

            {/* Token单位切换按钮 */}
            <Button
              variant={tokenUnit === 'K' ? 'default' : 'outline'}
              onClick={handleTokenUnitToggle}
            >
              {tokenUnit}
            </Button>
          </div>
        )}

        {isMobile && (
          <Button
            variant='outline'
            onClick={handleFilterClick}
          >
            <Filter className='h-4 w-4 mr-1' />
            {t('筛选')}
          </Button>
        )}
      </div>
    );
  },
);

SearchActions.displayName = 'SearchActions';

export default SearchActions;
