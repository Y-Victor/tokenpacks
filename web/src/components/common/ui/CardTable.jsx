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

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../ui/table';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../ui/pagination';
import { EmptyState } from '../../ui/empty-state';
import { Button } from '../../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

/**
 * CardTable 响应式表格组件
 *
 * 在桌面端渲染 HTML Table 组件，在移动端则将每一行数据渲染成 Card 形式。
 * 该组件与 Table 组件的大部分 API 保持一致，只需将原 Table 换成 CardTable 即可。
 */
const CardTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = 'key',
  hidePagination = false,
  ...tableProps
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const showSkeleton = useMinimumLoadingTime(loading);
  const wrapperClassName = tableProps.className || '';

  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') return rowKey(record);
    return record[rowKey] !== undefined ? record[rowKey] : index;
  };

  // Internal expanded-row state for expandRowByClick support
  const [internalExpandedKeys, setInternalExpandedKeys] = useState([]);
  const expandedKeys = tableProps.expandedRowKeys || internalExpandedKeys;

  const toggleExpand = (key) => {
    setInternalExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  if (!isMobile) {
    // Desktop: render an HTML table using shadcn Table components
    const pagination = hidePagination ? false : tableProps.pagination;
    const canExpand = !!tableProps.expandedRowRender;
    const expandByClick = tableProps.expandRowByClick;

    return (
      <div className={wrapperClassName}>
        {loading && (
          <div className='space-y-2 p-4'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        )}
        {!loading && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableHead
                      key={col.key || col.dataIndex || idx}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.title || ''}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSource.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='text-center py-8'
                    >
                      {tableProps.empty || (
                        <EmptyState description='No Data' />
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  dataSource.map((record, index) => {
                    const key = getRowKey(record, index);
                    const reactRowKey = `${String(key)}-${index}`;
                    const isExpandable =
                      canExpand &&
                      (!tableProps.rowExpandable ||
                        tableProps.rowExpandable(record));
                    const isExpanded =
                      isExpandable && expandedKeys.includes(key);
                    return (
                      <React.Fragment key={reactRowKey}>
                        <TableRow
                          className={
                            isExpandable && expandByClick
                              ? 'cursor-pointer'
                              : undefined
                          }
                          onClick={
                            isExpandable && expandByClick
                              ? () => toggleExpand(key)
                              : undefined
                          }
                        >
                          {columns.map((col, colIdx) => (
                            <TableCell key={col.key || col.dataIndex || colIdx}>
                              {col.render
                                ? col.render(
                                    record[col.dataIndex],
                                    record,
                                    index,
                                  )
                                : record[col.dataIndex]}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={columns.length}>
                              {tableProps.expandedRowRender(record, index)}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {pagination && dataSource.length > 0 && (
              <div className='mt-4 flex justify-center'>
                <SimplePagination pagination={pagination} />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (showSkeleton) {
    const visibleCols = columns.filter((col) => {
      if (tableProps?.visibleColumns && col.key) {
        return tableProps.visibleColumns[col.key];
      }
      return true;
    });

    const renderSkeletonCard = (key) => {
      return (
        <Card key={key} className='rounded-2xl shadow-sm'>
          <CardContent className='p-2'>
            {visibleCols.map((col, idx) => {
              if (!col.title) {
                return (
                  <div key={idx} className='mt-2 flex justify-end'>
                    <Skeleton className='h-6 w-[100px]' />
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className='flex justify-between items-center py-1 border-b last:border-b-0 border-dashed border-border'
                >
                  <Skeleton className='h-3.5 w-20' />
                  <Skeleton
                    className='h-3.5'
                    style={{
                      width: `${50 + (idx % 3) * 10}%`,
                      maxWidth: 180,
                    }}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    };

    return (
      <div className={cn('flex flex-col gap-2', wrapperClassName)}>
        {[1, 2, 3].map((i) => renderSkeletonCard(i))}
      </div>
    );
  }

  const isEmpty = !showSkeleton && (!dataSource || dataSource.length === 0);

  const MobileRowCard = ({ record, index }) => {
    const [showDetails, setShowDetails] = useState(false);
    const rowKeyVal = getRowKey(record, index);

    const hasDetails =
      tableProps.expandedRowRender &&
      (!tableProps.rowExpandable || tableProps.rowExpandable(record));

    return (
      <Card key={rowKeyVal} className='rounded-2xl shadow-sm'>
        <CardContent className='p-4'>
          {columns.map((col, colIdx) => {
            if (
              tableProps?.visibleColumns &&
              !tableProps.visibleColumns[col.key]
            ) {
              return null;
            }

            const title = col.title;
            const cellContent = col.render
              ? col.render(record[col.dataIndex], record, index)
              : record[col.dataIndex];

            if (!title) {
              return (
                <div key={col.key || colIdx} className='mt-2 flex justify-end'>
                  {cellContent}
                </div>
              );
            }

            return (
              <div
                key={col.key || colIdx}
                className='flex justify-between items-start py-1 border-b last:border-b-0 border-dashed border-border'
              >
                <span className='font-medium text-muted-foreground mr-2 whitespace-nowrap select-none'>
                  {title}
                </span>
                <div className='flex-1 break-all flex justify-end items-center gap-1'>
                  {cellContent !== undefined && cellContent !== null
                    ? cellContent
                    : '-'}
                </div>
              </div>
            );
          })}

          {hasDetails && (
            <>
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full flex justify-center mt-2'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {showDetails ? (
                      <ChevronUp className='h-4 w-4 mr-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 mr-1' />
                    )}
                    {showDetails ? t('收起') : t('详情')}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='pt-2'>
                    {tableProps.expandedRowRender(record, index)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isEmpty) {
    if (tableProps.empty) return tableProps.empty;
    return (
      <div className={cn('flex justify-center p-4', wrapperClassName)}>
        <EmptyState description='No Data' />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      {dataSource.map((record, index) => (
        <MobileRowCard
          key={`${String(getRowKey(record, index))}-${index}`}
          record={record}
          index={index}
        />
      ))}
      {!hidePagination && tableProps.pagination && dataSource.length > 0 && (
        <div className='mt-2 flex justify-center'>
          <SimplePagination pagination={tableProps.pagination} />
        </div>
      )}
    </div>
  );
};

/**
 * SimplePagination - converts Semi-style pagination props to shadcn Pagination
 * Semi pagination props: { currentPage, pageSize, total, onPageChange }
 */
const SimplePagination = ({ pagination }) => {
  const { currentPage = 1, pageSize = 10, total = 0, onPageChange } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        {getPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => onPageChange && onPageChange(page)}
              className='cursor-pointer'
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

CardTable.propTypes = {
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  hidePagination: PropTypes.bool,
};

export default CardTable;
