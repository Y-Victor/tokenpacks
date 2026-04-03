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

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { Badge } from '../ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { toast } from 'sonner';
import {
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { copy } from '../../helpers';

/**
 * SSEViewer component for displaying Server-Sent Events in an interactive format
 * @param {Object} props - Component props
 * @param {Array} props.sseData - Array of SSE messages to display
 * @returns {JSX.Element} Rendered SSE viewer component
 */
const SSEViewer = ({ sseData }) => {
  const { t } = useTranslation();
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const parsedSSEData = useMemo(() => {
    if (!sseData || !Array.isArray(sseData)) {
      return [];
    }

    return sseData.map((item, index) => {
      let parsed = null;
      let error = null;
      let isDone = false;

      if (item === '[DONE]') {
        isDone = true;
      } else {
        try {
          parsed = typeof item === 'string' ? JSON.parse(item) : item;
        } catch (e) {
          error = e.message;
        }
      }

      return {
        index,
        raw: item,
        parsed,
        error,
        isDone,
        key: `sse-${index}`,
      };
    });
  }, [sseData]);

  const stats = useMemo(() => {
    const total = parsedSSEData.length;
    const errors = parsedSSEData.filter((item) => item.error).length;
    const done = parsedSSEData.filter((item) => item.isDone).length;
    const valid = total - errors - done;

    return { total, errors, done, valid };
  }, [parsedSSEData]);

  const handleToggleAll = useCallback(() => {
    setExpandedKeys((prev) => {
      if (prev.size === parsedSSEData.length) {
        return new Set();
      } else {
        return new Set(parsedSSEData.map((item) => item.key));
      }
    });
  }, [parsedSSEData]);

  const handleToggleItem = useCallback((key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleCopyAll = useCallback(async () => {
    try {
      const allData = parsedSSEData
        .map((item) =>
          item.parsed ? JSON.stringify(item.parsed, null, 2) : item.raw,
        )
        .join('\n\n');

      await copy(allData);
      setCopied(true);
      toast.success(t('已复制全部数据'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('复制失败'));
      console.error('Copy failed:', err);
    }
  }, [parsedSSEData, t]);

  const handleCopySingle = useCallback(
    async (item) => {
      try {
        const textToCopy = item.parsed
          ? JSON.stringify(item.parsed, null, 2)
          : item.raw;
        await copy(textToCopy);
        toast.success(t('已复制'));
      } catch (err) {
        toast.error(t('复制失败'));
      }
    },
    [t],
  );

  const renderSSEItem = (item) => {
    if (item.isDone) {
      return (
        <div className='flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
          <CheckCircle size={16} className='text-green-600' />
          <span className='text-green-600 font-medium'>
            {t('流式响应完成')} [DONE]
          </span>
        </div>
      );
    }

    if (item.error) {
      return (
        <div className='space-y-2'>
          <div className='flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
            <XCircle size={16} className='text-red-600' />
            <span className='text-red-600'>
              {t('解析错误')}: {item.error}
            </span>
          </div>
          <div className='p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-xs overflow-auto'>
            <pre>{item.raw}</pre>
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-2'>
        {/* JSON 格式化显示 */}
        <div className='relative'>
          <pre className='p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-xs font-mono leading-relaxed'>
            {JSON.stringify(item.parsed, null, 2)}
          </pre>
          <Button
            size='icon'
            variant='ghost'
            onClick={() => handleCopySingle(item)}
            className='absolute top-2 right-2 !bg-gray-800/80 !text-gray-300 hover:!bg-gray-700 h-6 w-6'
          >
            <Copy size={12} />
          </Button>
        </div>

        {/* 关键信息摘要 */}
        {item.parsed?.choices?.[0] && (
          <div className='flex flex-wrap gap-2 text-xs'>
            {item.parsed.choices[0].delta?.content && (
              <Badge variant='default'>
                {t('内容')}: &quot;{String(item.parsed.choices[0].delta.content).substring(0, 20)}...&quot;
              </Badge>
            )}
            {item.parsed.choices[0].delta?.reasoning_content && (
              <Badge variant='warning'>{t('有 Reasoning')}</Badge>
            )}
            {item.parsed.choices[0].finish_reason && (
              <Badge variant='success'>
                {t('完成')}: {item.parsed.choices[0].finish_reason}
              </Badge>
            )}
            {item.parsed.usage && (
              <Badge variant='secondary'>
                {t('令牌')}: {item.parsed.usage.prompt_tokens || 0}/{item.parsed.usage.completion_tokens || 0}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!parsedSSEData || parsedSSEData.length === 0) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px] text-gray-500'>
        <span>{t('暂无SSE响应数据')}</span>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-lg'>
      {/* 头部工具栏 */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <Zap size={16} className='text-blue-500' />
          <span className='font-semibold'>{t('SSE数据流')}</span>
          <Badge variant='default'>{stats.total}</Badge>
          {stats.errors > 0 && (
            <Badge variant='destructive'>{stats.errors} {t('错误')}</Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                onClick={handleCopyAll}
              >
                <Copy size={14} className='mr-1' />
                {copied ? t('已复制') : t('复制全部')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('复制全部')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                onClick={handleToggleAll}
              >
                {expandedKeys.size === parsedSSEData.length ? (
                  <ChevronUp size={14} className='mr-1' />
                ) : (
                  <ChevronDown size={14} className='mr-1' />
                )}
                {expandedKeys.size === parsedSSEData.length
                  ? t('收起')
                  : t('展开')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {expandedKeys.size === parsedSSEData.length
                ? t('全部收起')
                : t('全部展开')}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* SSE 数据列表 */}
      <div className='flex-1 overflow-auto p-4'>
        <div className='bg-white dark:bg-gray-800 rounded-lg'>
          {parsedSSEData.map((item) => (
            <Collapsible
              key={item.key}
              open={expandedKeys.has(item.key)}
              onOpenChange={() => handleToggleItem(item.key)}
            >
              <CollapsibleTrigger className='flex items-center gap-2 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b border-gray-100 dark:border-gray-700'>
                <Badge variant='secondary'>#{item.index + 1}</Badge>
                {item.isDone ? (
                  <span className='text-green-600 font-medium'>[DONE]</span>
                ) : item.error ? (
                  <span className='text-red-600'>{t('解析错误')}</span>
                ) : (
                  <>
                    <span className='text-gray-600'>
                      {item.parsed?.id ||
                        item.parsed?.object ||
                        t('SSE 事件')}
                    </span>
                    {item.parsed?.choices?.[0]?.delta && (
                      <span className='text-xs text-gray-400'>
                        •{' '}
                        {Object.keys(item.parsed.choices[0].delta)
                          .filter((k) => item.parsed.choices[0].delta[k])
                          .join(', ')}
                      </span>
                    )}
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className='p-3'>
                {renderSSEItem(item)}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SSEViewer;
