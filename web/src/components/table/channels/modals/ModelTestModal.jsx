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

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import { Switch } from '../../../ui/switch';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Search, Info } from 'lucide-react';
import { copy, showError, showInfo, showSuccess } from '../../../../helpers';
import { MODEL_TABLE_PAGE_SIZE } from '../../../../constants';

const ModelTestModal = ({
  showModelTestModal,
  currentTestChannel,
  handleCloseModal,
  isBatchTesting,
  batchTestModels,
  modelSearchKeyword,
  setModelSearchKeyword,
  selectedModelKeys,
  setSelectedModelKeys,
  modelTestResults,
  testingModels,
  testChannel,
  modelTablePage,
  setModelTablePage,
  selectedEndpointType,
  setSelectedEndpointType,
  isStreamTest,
  setIsStreamTest,
  allSelectingRef,
  isMobile,
  t,
}) => {
  const hasChannel = Boolean(currentTestChannel);
  const streamToggleDisabled = [
    'embeddings',
    'image-generation',
    'jina-rerank',
    'openai-response-compact',
  ].includes(selectedEndpointType);

  React.useEffect(() => {
    if (streamToggleDisabled && isStreamTest) {
      setIsStreamTest(false);
    }
  }, [streamToggleDisabled, isStreamTest, setIsStreamTest]);

  const filteredModels = hasChannel
    ? currentTestChannel.models
        .split(',')
        .filter((model) =>
          model.toLowerCase().includes(modelSearchKeyword.toLowerCase()),
        )
    : [];

  const endpointTypeOptions = [
    { value: '', label: t('自动检测') },
    { value: 'openai', label: 'OpenAI (/v1/chat/completions)' },
    { value: 'openai-response', label: 'OpenAI Response (/v1/responses)' },
    {
      value: 'openai-response-compact',
      label: 'OpenAI Response Compaction (/v1/responses/compact)',
    },
    { value: 'anthropic', label: 'Anthropic (/v1/messages)' },
    {
      value: 'gemini',
      label: 'Gemini (/v1beta/models/{model}:generateContent)',
    },
    { value: 'jina-rerank', label: 'Jina Rerank (/v1/rerank)' },
    {
      value: 'image-generation',
      label: t('图像生成') + ' (/v1/images/generations)',
    },
    { value: 'embeddings', label: 'Embeddings (/v1/embeddings)' },
  ];

  const handleCopySelected = () => {
    if (selectedModelKeys.length === 0) {
      showError(t('请先选择模型！'));
      return;
    }
    copy(selectedModelKeys.join(',')).then((ok) => {
      if (ok) {
        showSuccess(
          t('已复制 ${count} 个模型').replace(
            '${count}',
            selectedModelKeys.length,
          ),
        );
      } else {
        showError(t('复制失败，请手动复制'));
      }
    });
  };

  const handleSelectSuccess = () => {
    if (!currentTestChannel) return;
    const successKeys = currentTestChannel.models
      .split(',')
      .filter((m) => m.toLowerCase().includes(modelSearchKeyword.toLowerCase()))
      .filter((m) => {
        const result = modelTestResults[`${currentTestChannel.id}-${m}`];
        return result && result.success;
      });
    if (successKeys.length === 0) {
      showInfo(t('暂无成功模型'));
    }
    setSelectedModelKeys(successKeys);
  };

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
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record) => {
        const testResult =
          modelTestResults[`${currentTestChannel.id}-${record.model}`];
        const isTesting = testingModels.has(record.model);

        if (isTesting) {
          return (
            <Badge className='bg-blue-500 text-white rounded-full'>
              {t('测试中')}
            </Badge>
          );
        }

        if (!testResult) {
          return (
            <Badge variant='secondary' className='rounded-full'>
              {t('未开始')}
            </Badge>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <Badge className={`rounded-full ${testResult.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {testResult.success ? t('成功') : t('失败')}
            </Badge>
            {testResult.success && (
              <span className='text-sm text-muted-foreground'>
                {t('请求时长: ${time}s').replace(
                  '${time}',
                  testResult.time.toFixed(2),
                )}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'operate',
      render: (text, record) => {
        const isTesting = testingModels.has(record.model);
        return (
          <Button
            variant='outline'
            onClick={() =>
              testChannel(
                currentTestChannel,
                record.model,
                selectedEndpointType,
                isStreamTest,
              )
            }
            disabled={isTesting}
            size='sm'
          >
            {isTesting ? '...' : t('测试')}
          </Button>
        );
      },
    },
  ];

  const dataSource = (() => {
    if (!hasChannel) return [];
    const start = (modelTablePage - 1) * MODEL_TABLE_PAGE_SIZE;
    const end = start + MODEL_TABLE_PAGE_SIZE;
    return filteredModels.slice(start, end).map((model) => ({
      model,
      key: model,
    }));
  })();

  return (
    <Dialog open={showModelTestModal} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className={`!rounded-lg ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
        <DialogHeader>
          <DialogTitle>
            {hasChannel ? (
              <div className='flex flex-col gap-2 w-full'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-base'>
                    {currentTestChannel.name} {t('渠道的模型测试')}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {t('共')} {currentTestChannel.models.split(',').length}{' '}
                    {t('个模型')}
                  </span>
                </div>
              </div>
            ) : null}
          </DialogTitle>
        </DialogHeader>
        {hasChannel && (
          <div className='model-test-scroll'>
            {/* Endpoint toolbar */}
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full mb-2'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <span className='font-semibold shrink-0'>
                  {t('端点类型')}:
                </span>
                <select
                  className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-0'
                  value={selectedEndpointType}
                  onChange={(e) => setSelectedEndpointType(e.target.value)}
                >
                  {endpointTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex items-center justify-between sm:justify-end gap-2 shrink-0'>
                <span className='font-semibold shrink-0'>
                  {t('流式')}:
                </span>
                <Switch
                  checked={isStreamTest}
                  onCheckedChange={setIsStreamTest}
                  disabled={streamToggleDisabled}
                  aria-label={t('流式')}
                />
              </div>
            </div>

            <Alert className='mb-2'>
              <Info className='h-4 w-4' />
              <AlertDescription>
                {t(
                  '说明：本页测试为非流式请求；若渠道仅支持流式返回，可能出现测试失败，请以实际使用为准。',
                )}
              </AlertDescription>
            </Alert>

            {/* 搜索与操作按钮 */}
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full mb-2'>
              <div className='relative w-full sm:flex-1'>
                <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={t('搜索模型...')}
                  value={modelSearchKeyword}
                  onChange={(e) => {
                    setModelSearchKeyword(e.target.value);
                    setModelTablePage(1);
                  }}
                  className='pl-8 w-full'
                />
              </div>

              <div className='flex items-center justify-end gap-2'>
                <Button variant='outline' size='sm' onClick={handleCopySelected}>{t('复制已选')}</Button>
                <Button variant='outline' size='sm' onClick={handleSelectSuccess}>
                  {t('选择成功')}
                </Button>
              </div>
            </div>

            {/* Simple table rendering */}
            <div className='border rounded-md overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='p-2 text-left w-8'>
                      <input
                        type='checkbox'
                        checked={selectedModelKeys.length === filteredModels.length && filteredModels.length > 0}
                        onChange={(e) => {
                          setSelectedModelKeys(e.target.checked ? filteredModels : []);
                        }}
                      />
                    </th>
                    {columns.map((col) => (
                      <th key={col.dataIndex || col.title} className='p-2 text-left font-medium'>
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataSource.map((row) => (
                    <tr key={row.key} className='border-b'>
                      <td className='p-2'>
                        <input
                          type='checkbox'
                          checked={selectedModelKeys.includes(row.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModelKeys([...selectedModelKeys, row.key]);
                            } else {
                              setSelectedModelKeys(selectedModelKeys.filter((k) => k !== row.key));
                            }
                          }}
                        />
                      </td>
                      {columns.map((col) => (
                        <td key={col.dataIndex || col.title} className='p-2'>
                          {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Simple pagination */}
            <div className='flex items-center justify-between mt-2 text-sm'>
              <span className='text-muted-foreground'>
                {t('共')} {filteredModels.length} {t('个模型')}
              </span>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={modelTablePage <= 1}
                  onClick={() => setModelTablePage(modelTablePage - 1)}
                >
                  {'<'}
                </Button>
                <span className='px-2'>{modelTablePage} / {Math.ceil(filteredModels.length / MODEL_TABLE_PAGE_SIZE) || 1}</span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={modelTablePage >= Math.ceil(filteredModels.length / MODEL_TABLE_PAGE_SIZE)}
                  onClick={() => setModelTablePage(modelTablePage + 1)}
                >
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {hasChannel && (
            <>
              {isBatchTesting ? (
                <Button variant='destructive' onClick={handleCloseModal}>
                  {t('停止测试')}
                </Button>
              ) : (
                <Button variant='outline' onClick={handleCloseModal}>
                  {t('取消')}
                </Button>
              )}
              <Button
                onClick={batchTestModels}
                disabled={isBatchTesting}
              >
                {isBatchTesting
                  ? t('测试中...')
                  : t('批量测试${count}个模型').replace(
                      '${count}',
                      filteredModels.length,
                    )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModelTestModal;
