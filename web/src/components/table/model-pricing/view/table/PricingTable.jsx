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

import React, { useMemo } from 'react';
import { Card } from '../../../../ui/card';
import { EmptyState } from '../../../../ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../ui/table';
import { Checkbox } from '../../../../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { Button } from '../../../../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPricingTableColumns } from './PricingTableColumns';

const PricingTable = ({
  filteredModels,
  loading,
  rowSelection,
  pageSize,
  setPageSize,
  selectedGroup,
  groupRatio,
  copyText,
  setModalImageUrl,
  setIsModalOpenurl,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  searchValue,
  showRatio,
  compactMode = false,
  openModelDetail,
  t,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedKeys, setSelectedKeys] = React.useState([]);

  const columns = useMemo(() => {
    return getPricingTableColumns({
      t,
      selectedGroup,
      groupRatio,
      copyText,
      setModalImageUrl,
      setIsModalOpenurl,
      currency,
      siteDisplayType,
      tokenUnit,
      displayPrice,
      showRatio,
    });
  }, [
    t,
    selectedGroup,
    groupRatio,
    copyText,
    setModalImageUrl,
    setIsModalOpenurl,
    currency,
    siteDisplayType,
    tokenUnit,
    displayPrice,
    showRatio,
  ]);

  // Filter data by searchValue
  const filteredData = useMemo(() => {
    if (!searchValue) return filteredModels;
    return filteredModels.filter((row) =>
      row.model_name?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [filteredModels, searchValue]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page if out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handleSelectAll = (checked) => {
    if (checked) {
      const allKeys = paginatedData.map(
        (row) => row.key ?? row.model_name ?? row.id,
      );
      setSelectedKeys(allKeys);
      rowSelection?.onChange?.(allKeys, null);
    } else {
      setSelectedKeys([]);
      rowSelection?.onChange?.([], null);
    }
  };

  const handleSelectRow = (row, checked) => {
    const key = row.key ?? row.model_name ?? row.id;
    const newKeys = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => k !== key);
    setSelectedKeys(newKeys);
    rowSelection?.onChange?.(newKeys, null);
  };

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className='pricing-table-card !rounded-xl overflow-hidden border-0'>
        <div className='p-8'>
          <EmptyState title={t('搜索无结果')} />
        </div>
      </Card>
    );
  }

  const ModelTable = (
    <Card className='pricing-table-card !rounded-xl overflow-hidden border-0'>
      <div className={compactMode ? '' : 'overflow-x-auto'}>
        <Table>
          <TableHeader>
            <TableRow>
              {rowSelection && (
                <TableHead className='w-10'>
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) =>
                        selectedKeys.includes(
                          row.key ?? row.model_name ?? row.id,
                        ),
                      )
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((col, idx) => (
                <TableHead key={col.dataIndex || idx}>
                  {typeof col.title === 'function' ? col.title() : col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className='text-center py-8 text-muted-foreground'
                >
                  {t('加载中...')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const rowKey = row.key ?? row.model_name ?? row.id ?? rowIdx;
                const isSelected = selectedKeys.includes(rowKey);
                return (
                  <TableRow
                    key={`${String(rowKey)}-${rowIdx}`}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => openModelDetail && openModelDetail(row)}
                    data-state={isSelected ? 'selected' : undefined}
                  >
                    {rowSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row, checked)
                          }
                        />
                      </TableCell>
                    )}
                    {columns.map((col, colIdx) => (
                      <TableCell key={col.dataIndex || colIdx}>
                        {col.render
                          ? col.render(row[col.dataIndex], row, rowIdx)
                          : row[col.dataIndex]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className='flex justify-center items-center gap-2 p-4 border-t'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <span className='text-sm text-muted-foreground'>
          {currentPage} / {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            setCurrentPage(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            setPageSize(Number(val));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className='w-[80px] h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );

  return ModelTable;
};

export default PricingTable;
