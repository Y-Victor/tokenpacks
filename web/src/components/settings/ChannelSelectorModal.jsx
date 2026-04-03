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

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search } from 'lucide-react';

const OFFICIAL_RATIO_PRESET_ID = -100;
const MODELS_DEV_PRESET_ID = -101;
const OFFICIAL_RATIO_PRESET_NAME = '官方倍率预设';
const MODELS_DEV_PRESET_NAME = 'models.dev 价格预设';
const OFFICIAL_RATIO_PRESET_BASE_URL = 'https://basellm.github.io';
const MODELS_DEV_PRESET_BASE_URL = 'https://models.dev';

const ChannelSelectorModal = forwardRef(
  (
    {
      visible,
      onCancel,
      onOk,
      allChannels,
      selectedChannelIds,
      setSelectedChannelIds,
      channelEndpoints,
      updateChannelEndpoint,
      t,
    },
    ref,
  ) => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const isMobile = useIsMobile();

    const [filteredData, setFilteredData] = useState([]);

    useImperativeHandle(ref, () => ({
      resetPagination: () => {
        setCurrentPage(1);
        setSearchText('');
      },
    }));

    // 官方渠道识别
    const isOfficialChannel = (record) => {
      const id = record?.key ?? record?.value ?? record?._originalData?.id;
      const base = record?._originalData?.base_url || '';
      const name = record?.label || '';
      return (
        id === OFFICIAL_RATIO_PRESET_ID ||
        id === MODELS_DEV_PRESET_ID ||
        base === OFFICIAL_RATIO_PRESET_BASE_URL ||
        base === MODELS_DEV_PRESET_BASE_URL ||
        name === OFFICIAL_RATIO_PRESET_NAME ||
        name === MODELS_DEV_PRESET_NAME
      );
    };

    useEffect(() => {
      if (!allChannels) return;

      const searchLower = searchText.trim().toLowerCase();
      const matched = searchLower
        ? allChannels.filter((item) => {
            const name = (item.label || '').toLowerCase();
            const baseUrl = (item._originalData?.base_url || '').toLowerCase();
            return name.includes(searchLower) || baseUrl.includes(searchLower);
          })
        : allChannels;

      const sorted = [...matched].sort((a, b) => {
        const wa = isOfficialChannel(a) ? 0 : 1;
        const wb = isOfficialChannel(b) ? 0 : 1;
        return wa - wb;
      });

      setFilteredData(sorted);
    }, [allChannels, searchText]);

    const total = filteredData.length;

    const paginatedData = filteredData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

    const updateEndpoint = (channelId, endpoint) => {
      if (typeof updateChannelEndpoint === 'function') {
        updateChannelEndpoint(channelId, endpoint);
      }
    };

    const highlightText = (text, search) => {
      if (!search || !text) return text;
      const idx = text.toLowerCase().indexOf(search.toLowerCase());
      if (idx === -1) return text;
      return (
        <>
          {text.slice(0, idx)}
          <mark className="bg-yellow-200 dark:bg-yellow-800">{text.slice(idx, idx + search.length)}</mark>
          {text.slice(idx + search.length)}
        </>
      );
    };

    const renderEndpointCell = (record) => {
      const channelId = record.key || record.value;
      const currentEndpoint = channelEndpoints[channelId] || '';

      const getEndpointType = (ep) => {
        if (ep === '/api/ratio_config') return 'ratio_config';
        if (ep === '/api/pricing') return 'pricing';
        if (ep === 'openrouter') return 'openrouter';
        return 'custom';
      };

      const currentType = getEndpointType(currentEndpoint);

      const handleTypeChange = (val) => {
        if (val === 'ratio_config') {
          updateEndpoint(channelId, '/api/ratio_config');
        } else if (val === 'pricing') {
          updateEndpoint(channelId, '/api/pricing');
        } else if (val === 'openrouter') {
          updateEndpoint(channelId, 'openrouter');
        } else {
          if (currentType !== 'custom') {
            updateEndpoint(channelId, '');
          }
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Select value={currentType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ratio_config">ratio_config</SelectItem>
              <SelectItem value="pricing">pricing</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="custom">custom</SelectItem>
            </SelectContent>
          </Select>
          {currentType === 'custom' && (
            <Input
              value={currentEndpoint}
              onChange={(e) => updateEndpoint(channelId, e.target.value)}
              placeholder='/your/endpoint'
              className="w-[160px] h-8 text-xs"
            />
          )}
        </div>
      );
    };

    const renderStatusCell = (record) => {
      const status = record?._originalData?.status || 0;
      const official = isOfficialChannel(record);
      let statusBadge = null;
      switch (status) {
        case 1:
          statusBadge = <Badge className="bg-green-500 text-white">{t('已启用')}</Badge>;
          break;
        case 2:
          statusBadge = <Badge variant="destructive">{t('已禁用')}</Badge>;
          break;
        case 3:
          statusBadge = <Badge className="bg-yellow-500 text-white">{t('自动禁用')}</Badge>;
          break;
        default:
          statusBadge = <Badge variant="secondary">{t('未知状态')}</Badge>;
      }
      return (
        <div className="flex items-center gap-2">
          {statusBadge}
          {official && (
            <Badge className="bg-green-100 text-green-700">{t('官方')}</Badge>
          )}
        </div>
      );
    };

    const isSelected = (key) => selectedChannelIds.includes(key);

    const toggleSelection = (key) => {
      if (isSelected(key)) {
        setSelectedChannelIds(selectedChannelIds.filter((k) => k !== key));
      } else {
        setSelectedChannelIds([...selectedChannelIds, key]);
      }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
      <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className={isMobile ? 'max-w-full' : 'max-w-4xl'}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{t('选择同步渠道')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('搜索渠道名称或地址')}
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>

            <div className="border rounded-md overflow-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 w-8"></th>
                    <th className="p-2 text-left font-medium">{t('名称')}</th>
                    <th className="p-2 text-left font-medium">{t('源地址')}</th>
                    <th className="p-2 text-left font-medium">{t('状态')}</th>
                    <th className="p-2 text-left font-medium">{t('同步接口')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record) => {
                    const key = record.key || record.value;
                    return (
                      <tr key={key} className="border-t hover:bg-muted/30">
                        <td className="p-2">
                          <Checkbox
                            checked={isSelected(key)}
                            onCheckedChange={() => toggleSelection(key)}
                          />
                        </td>
                        <td className="p-2">{highlightText(record.label, searchText)}</td>
                        <td className="p-2 text-xs text-muted-foreground">{highlightText(record._originalData?.base_url || '', searchText)}</td>
                        <td className="p-2">{renderStatusCell(record)}</td>
                        <td className="p-2">{renderEndpointCell(record)}</td>
                      </tr>
                    );
                  })}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {t('暂无数据')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('共')} {total} {t('条')}
              </span>
              <div className="flex items-center gap-2">
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  {'<'}
                </Button>
                <span>{currentPage} / {totalPages || 1}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>{t('取消')}</Button>
            <Button onClick={onOk}>{t('确认')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default ChannelSelectorModal;
