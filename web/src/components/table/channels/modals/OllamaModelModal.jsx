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

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Checkbox } from '../../../ui/checkbox';
import { Download, Trash2, RefreshCw, Search, Plus } from 'lucide-react';
import { confirm } from '../../../../lib/confirm';
import {
  API,
  authHeader,
  getUserIdFromLocalStorage,
  showError,
  showSuccess,
} from '../../../../helpers';

const CHANNEL_TYPE_OLLAMA = 4;

const parseMaybeJSON = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return null;
};

const resolveOllamaBaseUrl = (info) => {
  if (!info) {
    return '';
  }

  const direct = typeof info.base_url === 'string' ? info.base_url.trim() : '';
  if (direct) {
    return direct;
  }

  const alt =
    typeof info.ollama_base_url === 'string' ? info.ollama_base_url.trim() : '';
  if (alt) {
    return alt;
  }

  const parsed = parseMaybeJSON(info.other_info);
  if (parsed && typeof parsed === 'object') {
    const candidate =
      (typeof parsed.base_url === 'string' && parsed.base_url.trim()) ||
      (typeof parsed.public_url === 'string' && parsed.public_url.trim()) ||
      (typeof parsed.api_url === 'string' && parsed.api_url.trim());
    if (candidate) {
      return candidate;
    }
  }

  return '';
};

const normalizeModels = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item) {
        return null;
      }

      if (typeof item === 'string') {
        return {
          id: item,
          owned_by: 'ollama',
        };
      }

      if (typeof item === 'object') {
        const candidateId =
          item.id || item.ID || item.name || item.model || item.Model;
        if (!candidateId) {
          return null;
        }

        const metadata = item.metadata || item.Metadata;
        const normalized = {
          ...item,
          id: candidateId,
          owned_by: item.owned_by || item.ownedBy || 'ollama',
        };

        if (typeof item.size === 'number' && !normalized.size) {
          normalized.size = item.size;
        }
        if (metadata && typeof metadata === 'object') {
          if (typeof metadata.size === 'number' && !normalized.size) {
            normalized.size = metadata.size;
          }
          if (!normalized.digest && typeof metadata.digest === 'string') {
            normalized.digest = metadata.digest;
          }
          if (
            !normalized.modified_at &&
            typeof metadata.modified_at === 'string'
          ) {
            normalized.modified_at = metadata.modified_at;
          }
          if (metadata.details && !normalized.details) {
            normalized.details = metadata.details;
          }
        }

        return normalized;
      }

      return null;
    })
    .filter(Boolean);
};

const OllamaModelModal = ({
  visible,
  onCancel,
  channelId,
  channelInfo,
  onModelsUpdate,
  onApplyModels,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [pullModelName, setPullModelName] = useState('');
  const [pullLoading, setPullLoading] = useState(false);
  const [pullProgress, setPullProgress] = useState(null);
  const [eventSource, setEventSource] = useState(null);
  const [selectedModelIds, setSelectedModelIds] = useState([]);

  const handleApplyAllModels = () => {
    if (!onApplyModels || selectedModelIds.length === 0) {
      return;
    }
    onApplyModels({ mode: 'append', modelIds: selectedModelIds });
  };

  const handleToggleModel = (modelId, checked) => {
    if (!modelId) {
      return;
    }
    setSelectedModelIds((prev) => {
      if (checked) {
        if (prev.includes(modelId)) {
          return prev;
        }
        return [...prev, modelId];
      }
      return prev.filter((id) => id !== modelId);
    });
  };

  const handleSelectAll = () => {
    setSelectedModelIds(models.map((item) => item?.id).filter(Boolean));
  };

  const handleClearSelection = () => {
    setSelectedModelIds([]);
  };

  // 获取模型列表
  const fetchModels = async () => {
    const channelType = Number(channelInfo?.type ?? CHANNEL_TYPE_OLLAMA);
    const shouldTryLiveFetch = channelType === CHANNEL_TYPE_OLLAMA;
    const resolvedBaseUrl = resolveOllamaBaseUrl(channelInfo);

    setLoading(true);
    let liveFetchSucceeded = false;
    let fallbackSucceeded = false;
    let lastError = '';
    let nextModels = [];

    try {
      if (shouldTryLiveFetch && resolvedBaseUrl) {
        try {
          const payload = {
            base_url: resolvedBaseUrl,
            type: CHANNEL_TYPE_OLLAMA,
            key: channelInfo?.key || '',
          };

          const res = await API.post('/api/channel/fetch_models', payload, {
            skipErrorHandler: true,
          });

          if (res?.data?.success) {
            nextModels = normalizeModels(res.data.data);
            liveFetchSucceeded = true;
          } else if (res?.data?.message) {
            lastError = res.data.message;
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;
          if (message) {
            lastError = message;
          }
        }
      } else if (shouldTryLiveFetch && !resolvedBaseUrl && !channelId) {
        lastError = t('请先填写 Ollama API 地址');
      }

      if ((!liveFetchSucceeded || nextModels.length === 0) && channelId) {
        try {
          const res = await API.get(`/api/channel/fetch_models/${channelId}`, {
            skipErrorHandler: true,
          });

          if (res?.data?.success) {
            nextModels = normalizeModels(res.data.data);
            fallbackSucceeded = true;
            lastError = '';
          } else if (res?.data?.message) {
            lastError = res.data.message;
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;
          if (message) {
            lastError = message;
          }
        }
      }

      if (!liveFetchSucceeded && !fallbackSucceeded && lastError) {
        showError(`${t('获取模型列表失败')}: ${lastError}`);
      }

      const normalized = nextModels;
      setModels(normalized);
      setFilteredModels(normalized);
      setSelectedModelIds((prev) => {
        if (!normalized || normalized.length === 0) {
          return [];
        }
        if (!prev || prev.length === 0) {
          return normalized.map((item) => item.id).filter(Boolean);
        }
        const available = prev.filter((id) =>
          normalized.some((item) => item.id === id),
        );
        return available.length > 0
          ? available
          : normalized.map((item) => item.id).filter(Boolean);
      });
    } finally {
      setLoading(false);
    }
  };

  // 拉取模型 (流式，支持进度)
  const pullModel = async () => {
    if (!pullModelName.trim()) {
      showError(t('请输入模型名称'));
      return;
    }

    setPullLoading(true);
    setPullProgress({ status: 'starting', completed: 0, total: 0 });

    let hasRefreshed = false;
    const refreshModels = async () => {
      if (hasRefreshed) return;
      hasRefreshed = true;
      await fetchModels();
      if (onModelsUpdate) {
        onModelsUpdate({ silent: true });
      }
    };

    try {
      // 关闭之前的连接
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }

      const controller = new AbortController();
      const closable = {
        close: () => controller.abort(),
      };
      setEventSource(closable);

      // 使用 fetch 请求 SSE 流
      const authHeaders = authHeader();
      const userId = getUserIdFromLocalStorage();
      const fetchHeaders = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'New-API-User': String(userId),
        ...authHeaders,
      };

      const response = await fetch('/api/channel/ollama/pull/stream', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          channel_id: channelId,
          model_name: pullModelName.trim(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // 读取 SSE 流
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) {
                continue;
              }

              try {
                const eventData = line.substring(6);
                if (eventData === '[DONE]') {
                  setPullLoading(false);
                  setPullProgress(null);
                  setEventSource(null);
                  return;
                }

                const data = JSON.parse(eventData);

                if (data.status) {
                  // 处理进度数据
                  setPullProgress(data);
                } else if (data.error) {
                  // 处理错误
                  showError(data.error);
                  setPullProgress(null);
                  setPullLoading(false);
                  setEventSource(null);
                  return;
                } else if (data.message) {
                  // 处理成功消息
                  showSuccess(data.message);
                  setPullModelName('');
                  setPullProgress(null);
                  setPullLoading(false);
                  setEventSource(null);
                  await fetchModels();
                  if (onModelsUpdate) {
                    onModelsUpdate({ silent: true });
                  }
                  await refreshModels();
                  return;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
          // 正常结束流
          setPullLoading(false);
          setPullProgress(null);
          setEventSource(null);
          await refreshModels();
        } catch (error) {
          if (error?.name === 'AbortError') {
            setPullProgress(null);
            setPullLoading(false);
            setEventSource(null);
            return;
          }
          console.error('Stream processing error:', error);
          showError(t('数据传输中断'));
          setPullProgress(null);
          setPullLoading(false);
          setEventSource(null);
          await refreshModels();
        }
      };

      await processStream();
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showError(t('模型拉取失败: {{error}}', { error: error.message }));
      }
      setPullLoading(false);
      setPullProgress(null);
      setEventSource(null);
      await refreshModels();
    }
  };

  // 删除模型
  const deleteModel = async (modelName) => {
    try {
      const res = await API.delete('/api/channel/ollama/delete', {
        data: {
          channel_id: channelId,
          model_name: modelName,
        },
      });

      if (res.data.success) {
        showSuccess(t('模型删除成功'));
        await fetchModels(); // 重新获取模型列表
        if (onModelsUpdate) {
          onModelsUpdate({ silent: true }); // 通知父组件更新
        }
      } else {
        showError(res.data.message || t('模型删除失败'));
      }
    } catch (error) {
      showError(t('模型删除失败: {{error}}', { error: error.message }));
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (!searchValue) {
      setFilteredModels(models);
    } else {
      const filtered = models.filter((model) =>
        model.id.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setFilteredModels(filtered);
    }
  }, [models, searchValue]);

  useEffect(() => {
    if (!visible) {
      setSelectedModelIds([]);
      setPullModelName('');
      setPullProgress(null);
      setPullLoading(false);
    }
  }, [visible]);

  // 组件加载时获取模型列表
  useEffect(() => {
    if (!visible) {
      return;
    }

    if (channelId || Number(channelInfo?.type) === CHANNEL_TYPE_OLLAMA) {
      fetchModels();
    }
  }, [
    visible,
    channelId,
    channelInfo?.type,
    channelInfo?.base_url,
    channelInfo?.other_info,
    channelInfo?.ollama_base_url,
  ]);

  // 组件卸载时清理 EventSource
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const formatModelSize = (size) => {
    if (!size) return '-';
    const gb = size / (1024 * 1024 * 1024);
    return gb >= 1
      ? `${gb.toFixed(1)} GB`
      : `${(size / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className='max-w-3xl' style={{ maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle>{t('Ollama 模型管理')}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div>
            <span className='text-sm text-muted-foreground'>
              {channelInfo?.name ? `${channelInfo.name} - ` : ''}
              {t('管理 Ollama 模型的拉取和删除')}
            </span>
          </div>

          {/* Pull new model */}
          <div className='rounded-lg border p-4'>
            <h6 className='text-sm font-semibold mb-3'>
              {t('拉取新模型')}
            </h6>

            <div className='grid grid-cols-[1fr_auto] gap-3 items-center'>
              <Input
                placeholder={t('请输入模型名称，例如: llama3.2, qwen2.5:7b')}
                value={pullModelName}
                onChange={(e) => setPullModelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && pullModel()}
                disabled={pullLoading}
              />
              <Button
                onClick={pullModel}
                disabled={!pullModelName.trim() || pullLoading}
              >
                <Download className='h-4 w-4 mr-1' />
                {pullLoading ? t('拉取中...') : t('拉取模型')}
              </Button>
            </div>

            {/* Progress */}
            {pullProgress &&
              (() => {
                const completedBytes = Number(pullProgress.completed) || 0;
                const totalBytes = Number(pullProgress.total) || 0;
                const hasTotal = Number.isFinite(totalBytes) && totalBytes > 0;
                const safePercent = hasTotal
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round((completedBytes / totalBytes) * 100),
                      ),
                    )
                  : null;
                const percentText =
                  hasTotal && safePercent !== null
                    ? `${safePercent.toFixed(0)}%`
                    : pullProgress.status || t('处理中');

                return (
                  <div className='mt-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-semibold'>{t('拉取进度')}</span>
                      <span className='text-xs text-muted-foreground'>
                        {percentText}
                      </span>
                    </div>

                    {hasTotal && safePercent !== null ? (
                      <div>
                        <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                          <div
                            className='h-full rounded-full bg-blue-500 transition-all'
                            style={{ width: `${safePercent}%` }}
                          />
                        </div>
                        <div className='flex justify-between mt-1'>
                          <span className='text-xs text-muted-foreground'>
                            {(completedBytes / (1024 * 1024 * 1024)).toFixed(2)}{' '}
                            GB
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <div className='animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full' />
                        <span>{t('准备中...')}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

            <p className='text-xs text-muted-foreground mt-2'>
              {t(
                '支持拉取 Ollama 官方模型库中的所有模型，拉取过程可能需要几分钟时间',
              )}
            </p>
          </div>

          {/* Existing models */}
          <div className='rounded-lg border p-4'>
            <div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
              <div className='flex items-center gap-2'>
                <h6 className='text-sm font-semibold m-0'>
                  {t('已有模型')}
                </h6>
                {models.length > 0 ? (
                  <Badge className='bg-blue-500 text-white'>{models.length}</Badge>
                ) : null}
              </div>
              <div className='flex items-center gap-2 flex-wrap'>
                <div className='relative'>
                  <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-8 w-[200px]'
                    placeholder={t('搜索模型...')}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSelectAll}
                  disabled={models.length === 0}
                >
                  {t('全选')}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClearSelection}
                  disabled={selectedModelIds.length === 0}
                >
                  {t('清空')}
                </Button>
                <Button
                  size='sm'
                  onClick={handleApplyAllModels}
                  disabled={selectedModelIds.length === 0}
                >
                  <Plus className='h-4 w-4 mr-1' />
                  {t('加入渠道')}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchModels}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  {t('刷新')}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
              </div>
            ) : filteredModels.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
                <p>{searchValue ? t('未找到匹配的模型') : t('暂无模型')}</p>
                <p className='text-xs'>
                  {searchValue
                    ? t('请尝试其他搜索关键词')
                    : t('您可以在上方拉取需要的模型')}
                </p>
              </div>
            ) : (
              <div className='divide-y'>
                {filteredModels.map((model) => (
                  <div key={model.id} className='flex items-center justify-between py-2'>
                    <div className='flex items-center flex-1 min-w-0 gap-3'>
                      <Checkbox
                        checked={selectedModelIds.includes(model.id)}
                        onCheckedChange={(checked) =>
                          handleToggleModel(model.id, !!checked)
                        }
                      />
                      <div className='flex-1 min-w-0'>
                        <span className='font-semibold block truncate text-sm'>
                          {model.id}
                        </span>
                        <div className='flex items-center space-x-2 mt-1'>
                          <Badge className='bg-cyan-500 text-white text-xs'>
                            {model.owned_by || 'ollama'}
                          </Badge>
                          {model.size && (
                            <span className='text-xs text-muted-foreground'>
                              {formatModelSize(model.size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2 ml-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        onClick={() => {
                          confirm({
                            title: t('确认删除模型'),
                            description: t(
                              '删除后无法恢复，确定要删除模型 "{{name}}" 吗？',
                              { name: model.id },
                            ),
                            onConfirm: () => deleteModel(model.id),
                          });
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCancel}>
            {t('关闭')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OllamaModelModal;
