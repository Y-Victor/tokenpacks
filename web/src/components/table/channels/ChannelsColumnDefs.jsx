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
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';
import { confirm } from '../../../lib/confirm';
import {
  timestamp2string,
  renderGroup,
  renderQuota,
  getChannelIcon,
  renderQuotaWithAmount,
  showSuccess,
  showError,
  showInfo,
} from '../../../helpers';
import {
  CHANNEL_OPTIONS,
  MODEL_FETCHABLE_CHANNEL_TYPES,
} from '../../../constants';
import { parseUpstreamUpdateMeta } from '../../../hooks/channels/upstreamUpdateUtils';
import { ChevronDown, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { FaRandom } from 'react-icons/fa';

// Render functions
const renderType = (type, record = {}, t) => {
  const channelInfo = record?.channel_info;
  let type2label = new Map();
  for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
    type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
  }
  type2label[0] = { value: 0, label: t('未知类型'), color: 'grey' };

  let icon = getChannelIcon(type);

  if (channelInfo?.is_multi_key) {
    icon =
      channelInfo?.multi_key_mode === 'random' ? (
        <div className='flex items-center gap-1'>
          <FaRandom className='text-blue-500' />
          {icon}
        </div>
      ) : (
        <div className='flex items-center gap-1'>
          <ChevronDown className='text-blue-500 h-4 w-4' />
          {icon}
        </div>
      );
  }

  const typeTag = (
    <Badge variant='outline' className='gap-1'>
      {icon}
      {type2label[type]?.label}
    </Badge>
  );

  let ionetMeta = null;
  if (record?.other_info) {
    try {
      const parsed = JSON.parse(record.other_info);
      if (parsed && typeof parsed === 'object' && parsed.source === 'ionet') {
        ionetMeta = parsed;
      }
    } catch (error) {
      // ignore invalid metadata
    }
  }

  if (!ionetMeta) {
    return typeTag;
  }

  const handleNavigate = (event) => {
    event?.stopPropagation?.();
    if (!ionetMeta?.deployment_id) {
      return;
    }
    const targetUrl = `/console/deployment?deployment_id=${ionetMeta.deployment_id}`;
    window.open(targetUrl, '_blank', 'noopener');
  };

  return (
    <div className='flex items-center gap-1.5'>
      {typeTag}
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Badge
              variant='secondary'
              className='cursor-pointer'
              onClick={handleNavigate}
            >
              IO.NET
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className='max-w-xs'>
            <div className='text-xs text-gray-600'>
              {t('来源于 IO.NET 部署')}
            </div>
            {ionetMeta?.deployment_id && (
              <div className='text-xs text-gray-500 mt-1'>
                {t('部署 ID')}: {ionetMeta.deployment_id}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const renderTagType = (t) => {
  return (
    <Badge variant='secondary'>
      {t('标签聚合')}
    </Badge>
  );
};

const renderStatus = (status, channelInfo = undefined, t) => {
  if (channelInfo) {
    if (channelInfo.is_multi_key) {
      let keySize = channelInfo.multi_key_size;
      let enabledKeySize = keySize;
      if (channelInfo.multi_key_status_list) {
        enabledKeySize =
          keySize - Object.keys(channelInfo.multi_key_status_list).length;
      }
      return renderMultiKeyStatus(status, keySize, enabledKeySize, t);
    }
  }
  switch (status) {
    case 1:
      return (
        <Badge className='bg-green-500 text-white rounded-full'>
          {t('已启用')}
        </Badge>
      );
    case 2:
      return (
        <Badge variant='destructive' className='rounded-full'>
          {t('已禁用')}
        </Badge>
      );
    case 3:
      return (
        <Badge className='bg-yellow-500 text-white rounded-full'>
          {t('自动禁用')}
        </Badge>
      );
    default:
      return (
        <Badge variant='secondary' className='rounded-full'>
          {t('未知状态')}
        </Badge>
      );
  }
};

const renderMultiKeyStatus = (status, keySize, enabledKeySize, t) => {
  switch (status) {
    case 1:
      return (
        <Badge className='bg-green-500 text-white rounded-full'>
          {t('已启用')} {enabledKeySize}/{keySize}
        </Badge>
      );
    case 2:
      return (
        <Badge variant='destructive' className='rounded-full'>
          {t('已禁用')} {enabledKeySize}/{keySize}
        </Badge>
      );
    case 3:
      return (
        <Badge className='bg-yellow-500 text-white rounded-full'>
          {t('自动禁用')} {enabledKeySize}/{keySize}
        </Badge>
      );
    default:
      return (
        <Badge variant='secondary' className='rounded-full'>
          {t('未知状态')} {enabledKeySize}/{keySize}
        </Badge>
      );
  }
};

const renderResponseTime = (responseTime, t) => {
  let time = responseTime / 1000;
  time = time.toFixed(2) + t(' 秒');
  if (responseTime === 0) {
    return (
      <Badge variant='secondary' className='rounded-full'>
        {t('未测试')}
      </Badge>
    );
  } else if (responseTime <= 1000) {
    return (
      <Badge className='bg-green-500 text-white rounded-full'>
        {time}
      </Badge>
    );
  } else if (responseTime <= 3000) {
    return (
      <Badge className='bg-lime-500 text-white rounded-full'>
        {time}
      </Badge>
    );
  } else if (responseTime <= 5000) {
    return (
      <Badge className='bg-yellow-500 text-white rounded-full'>
        {time}
      </Badge>
    );
  } else {
    return (
      <Badge variant='destructive' className='rounded-full'>
        {time}
      </Badge>
    );
  }
};

const isRequestPassThroughEnabled = (record) => {
  if (!record || record.children !== undefined) {
    return false;
  }
  const settingValue = record.setting;
  if (!settingValue) {
    return false;
  }
  if (typeof settingValue === 'object') {
    return settingValue.pass_through_body_enabled === true;
  }
  if (typeof settingValue !== 'string') {
    return false;
  }
  try {
    const parsed = JSON.parse(settingValue);
    return parsed?.pass_through_body_enabled === true;
  } catch (error) {
    return false;
  }
};

const getUpstreamUpdateMeta = (record) => {
  const supported =
    !!record &&
    record.children === undefined &&
    MODEL_FETCHABLE_CHANNEL_TYPES.has(record.type);
  if (!record || record.children !== undefined) {
    return {
      supported: false,
      enabled: false,
      pendingAddModels: [],
      pendingRemoveModels: [],
    };
  }
  const parsed =
    record?.upstreamUpdateMeta && typeof record.upstreamUpdateMeta === 'object'
      ? record.upstreamUpdateMeta
      : parseUpstreamUpdateMeta(record?.settings);
  return {
    supported,
    enabled: parsed?.enabled === true,
    pendingAddModels: Array.isArray(parsed?.pendingAddModels)
      ? parsed.pendingAddModels
      : [],
    pendingRemoveModels: Array.isArray(parsed?.pendingRemoveModels)
      ? parsed.pendingRemoveModels
      : [],
  };
};

export const getChannelsColumns = ({
  t,
  COLUMN_KEYS,
  updateChannelBalance,
  manageChannel,
  manageTag,
  submitTagEdit,
  testChannel,
  setCurrentTestChannel,
  setShowModelTestModal,
  setEditingChannel,
  setShowEdit,
  setShowEditTag,
  setEditingTag,
  copySelectedChannel,
  refresh,
  activePage,
  channels,
  checkOllamaVersion,
  setShowMultiKeyManageModal,
  setCurrentMultiKeyChannel,
  openUpstreamUpdateModal,
  detectChannelUpstreamUpdates,
}) => {
  return [
    {
      key: COLUMN_KEYS.ID,
      title: t('ID'),
      dataIndex: 'id',
    },
    {
      key: COLUMN_KEYS.NAME,
      title: t('名称'),
      dataIndex: 'name',
      render: (text, record, index) => {
        const passThroughEnabled = isRequestPassThroughEnabled(record);
        const upstreamUpdateMeta = getUpstreamUpdateMeta(record);
        const pendingAddCount = upstreamUpdateMeta.pendingAddModels.length;
        const pendingRemoveCount =
          upstreamUpdateMeta.pendingRemoveModels.length;
        const showUpstreamUpdateTag =
          upstreamUpdateMeta.supported &&
          upstreamUpdateMeta.enabled &&
          (pendingAddCount > 0 || pendingRemoveCount > 0);
        const nameNode =
          record.remark && record.remark.trim() !== '' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{text}</span>
              </TooltipTrigger>
              <TooltipContent side='top' align='start'>
                <div className='flex flex-col gap-2 max-w-xs'>
                  <div className='text-sm'>{record.remark}</div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard
                        .writeText(record.remark)
                        .then(() => {
                          showSuccess(t('复制成功'));
                        })
                        .catch(() => {
                          showError(t('复制失败'));
                        });
                    }}
                  >
                    {t('复制')}
                  </Button>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span>{text}</span>
          );

        if (!passThroughEnabled && !showUpstreamUpdateTag) {
          return nameNode;
        }

        return (
          <div className='flex items-center gap-1.5'>
            {nameNode}
            {passThroughEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='inline-flex items-center'>
                    <AlertTriangle className='h-4 w-4 text-yellow-500' />
                  </span>
                </TooltipTrigger>
                <TooltipContent side='top' align='start'>
                  {t(
                    '该渠道已开启请求透传：参数覆写、模型重定向、渠道适配等 TokenPacks 内置功能将失效，非最佳实践；如因此产生问题，请勿提交 issue 反馈。',
                  )}
                </TooltipContent>
              </Tooltip>
            )}
            {showUpstreamUpdateTag && (
              <div className='flex items-center gap-1'>
                {pendingAddCount > 0 ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className='bg-green-100 text-green-700 cursor-pointer transition-all duration-150 hover:opacity-85 hover:-translate-y-px active:scale-95 rounded-full'
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpstreamUpdateModal(
                            record,
                            upstreamUpdateMeta.pendingAddModels,
                            upstreamUpdateMeta.pendingRemoveModels,
                            'add',
                          );
                        }}
                      >
                        +{pendingAddCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{t('点击处理新增模型')}</TooltipContent>
                  </Tooltip>
                ) : null}
                {pendingRemoveCount > 0 ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className='bg-red-100 text-red-700 cursor-pointer transition-all duration-150 hover:opacity-85 hover:-translate-y-px active:scale-95 rounded-full'
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpstreamUpdateModal(
                            record,
                            upstreamUpdateMeta.pendingAddModels,
                            upstreamUpdateMeta.pendingRemoveModels,
                            'remove',
                          );
                        }}
                      >
                        -{pendingRemoveCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{t('点击处理删除模型')}</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: COLUMN_KEYS.GROUP,
      title: t('分组'),
      dataIndex: 'group',
      render: (text, record, index) => (
        <div>
          <div className='flex items-center gap-0.5 flex-wrap'>
            {text
              ?.split(',')
              .sort((a, b) => {
                if (a === 'default') return -1;
                if (b === 'default') return 1;
                return a.localeCompare(b);
              })
              .map((item, index) => renderGroup(item))}
          </div>
        </div>
      ),
    },
    {
      key: COLUMN_KEYS.TYPE,
      title: t('类型'),
      dataIndex: 'type',
      render: (text, record, index) => {
        if (record.children === undefined) {
          return <>{renderType(text, record, t)}</>;
        } else {
          return <>{renderTagType(t)}</>;
        }
      },
    },
    {
      key: COLUMN_KEYS.STATUS,
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record, index) => {
        if (text === 3) {
          if (record.other_info === '') {
            record.other_info = '{}';
          }
          let otherInfo = JSON.parse(record.other_info);
          let reason = otherInfo['status_reason'];
          let time = otherInfo['status_time'];
          return (
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{renderStatus(text, record.channel_info, t)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  {t('原因：') + reason + t('，时间：') + timestamp2string(time)}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        } else {
          return renderStatus(text, record.channel_info, t);
        }
      },
    },
    {
      key: COLUMN_KEYS.RESPONSE_TIME,
      title: t('响应时间'),
      dataIndex: 'response_time',
      render: (text, record, index) => <div>{renderResponseTime(text, t)}</div>,
    },
    {
      key: COLUMN_KEYS.BALANCE,
      title: t('已用/剩余'),
      dataIndex: 'expired_time',
      render: (text, record, index) => {
        if (record.children === undefined) {
          return (
            <div>
              <div className='flex items-center gap-0.5'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant='outline' className='rounded-full'>
                      {renderQuota(record.used_quota)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{t('已用额度')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={record.type === 57 ? 'secondary' : 'outline'}
                      className={`rounded-full ${record.type === 57 ? 'cursor-pointer' : ''}`}
                      onClick={() => updateChannelBalance(record)}
                    >
                      {record.type === 57
                        ? t('帐号信息')
                        : renderQuotaWithAmount(record.balance)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {record.type === 57
                      ? t('查看 Codex 帐号信息与用量')
                      : t('剩余额度') +
                        ': ' +
                        renderQuotaWithAmount(record.balance) +
                        t('，点击更新')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        } else {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant='outline' className='rounded-full'>
                  {renderQuota(record.used_quota)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{t('已用额度')}</TooltipContent>
            </Tooltip>
          );
        }
      },
    },
    {
      key: COLUMN_KEYS.PRIORITY,
      title: t('优先级'),
      dataIndex: 'priority',
      render: (text, record, index) => {
        if (record.children === undefined) {
          return (
            <div>
              <Input
                type='number'
                className='w-[70px] h-7'
                name='priority'
                onBlur={(e) => {
                  manageChannel(record.id, 'priority', record, e.target.value);
                }}
                defaultValue={record.priority}
                min={-999}
              />
            </div>
          );
        } else {
          return (
            <Input
              type='number'
              className='w-[70px] h-7'
              name='priority'
              onBlur={(e) => {
                confirm({
                  title: t('修改子渠道优先级'),
                  description:
                    t('确定要修改所有子渠道优先级为 ') +
                    e.target.value +
                    t(' 吗？'),
                  onConfirm: () => {
                    if (e.target.value === '') {
                      return;
                    }
                    submitTagEdit('priority', {
                      tag: record.key,
                      priority: e.target.value,
                    });
                  },
                });
              }}
              defaultValue={record.priority}
              min={-999}
            />
          );
        }
      },
    },
    {
      key: COLUMN_KEYS.WEIGHT,
      title: t('权重'),
      dataIndex: 'weight',
      render: (text, record, index) => {
        if (record.children === undefined) {
          return (
            <div>
              <Input
                type='number'
                className='w-[70px] h-7'
                name='weight'
                onBlur={(e) => {
                  manageChannel(record.id, 'weight', record, e.target.value);
                }}
                defaultValue={record.weight}
                min={0}
              />
            </div>
          );
        } else {
          return (
            <Input
              type='number'
              className='w-[70px] h-7'
              name='weight'
              onBlur={(e) => {
                confirm({
                  title: t('修改子渠道权重'),
                  description:
                    t('确定要修改所有子渠道权重为 ') +
                    e.target.value +
                    t(' 吗？'),
                  onConfirm: () => {
                    if (e.target.value === '') {
                      return;
                    }
                    submitTagEdit('weight', {
                      tag: record.key,
                      weight: e.target.value,
                    });
                  },
                });
              }}
              defaultValue={record.weight}
              min={-999}
            />
          );
        }
      },
    },
    {
      key: COLUMN_KEYS.OPERATE,
      title: '',
      dataIndex: 'operate',
      fixed: 'right',
      render: (text, record, index) => {
        if (record.children === undefined) {
          const upstreamUpdateMeta = getUpstreamUpdateMeta(record);
          const moreMenuItems = [
            {
              node: 'item',
              name: t('删除'),
              type: 'danger',
              onClick: () => {
                confirm({
                  title: t('确定是否要删除此渠道？'),
                  description: t('此修改将不可逆'),
                  onConfirm: () => {
                    (async () => {
                      await manageChannel(record.id, 'delete', record);
                      await refresh();
                      setTimeout(() => {
                        if (channels.length === 0 && activePage > 1) {
                          refresh(activePage - 1);
                        }
                      }, 100);
                    })();
                  },
                });
              },
            },
            {
              node: 'item',
              name: t('复制'),
              type: 'tertiary',
              onClick: () => {
                confirm({
                  title: t('确定是否要复制此渠道？'),
                  description: t('复制渠道的所有信息'),
                  onConfirm: () => copySelectedChannel(record),
                });
              },
            },
          ];

          if (upstreamUpdateMeta.supported) {
            moreMenuItems.push({
              node: 'item',
              name: t('仅检测上游模型更新'),
              type: 'tertiary',
              onClick: () => {
                detectChannelUpstreamUpdates(record);
              },
            });
            moreMenuItems.push({
              node: 'item',
              name: t('处理上游模型更新'),
              type: 'tertiary',
              onClick: () => {
                if (!upstreamUpdateMeta.enabled) {
                  showInfo(t('该渠道未开启上游模型更新检测'));
                  return;
                }
                if (
                  upstreamUpdateMeta.pendingAddModels.length === 0 &&
                  upstreamUpdateMeta.pendingRemoveModels.length === 0
                ) {
                  showInfo(t('该渠道暂无可处理的上游模型更新'));
                  return;
                }
                openUpstreamUpdateModal(
                  record,
                  upstreamUpdateMeta.pendingAddModels,
                  upstreamUpdateMeta.pendingRemoveModels,
                  upstreamUpdateMeta.pendingAddModels.length > 0
                    ? 'add'
                    : 'remove',
                );
              },
            });
          }

          if (record.type === 4) {
            moreMenuItems.unshift({
              node: 'item',
              name: t('测活'),
              type: 'tertiary',
              onClick: () => checkOllamaVersion(record),
            });
          }

          return (
            <div className='flex items-center gap-1 flex-wrap'>
              <div className='inline-flex rounded-md overflow-hidden' aria-label={t('测试单个渠道操作项目组')}>
                <Button
                  size='sm'
                  variant='outline'
                  className='rounded-r-none'
                  onClick={() => testChannel(record, '')}
                >
                  {t('测试')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='rounded-l-none border-l-0 px-1'
                  onClick={() => {
                    setCurrentTestChannel(record);
                    setShowModelTestModal(true);
                  }}
                >
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </div>

              {record.status === 1 ? (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => manageChannel(record.id, 'disable', record)}
                >
                  {t('禁用')}
                </Button>
              ) : (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => manageChannel(record.id, 'enable', record)}
                >
                  {t('启用')}
                </Button>
              )}

              {record.channel_info?.is_multi_key ? (
                <div className='inline-flex rounded-md overflow-hidden' aria-label={t('多密钥渠道操作项目组')}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-r-none'
                    onClick={() => {
                      setEditingChannel(record);
                      setShowEdit(true);
                    }}
                  >
                    {t('编辑')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='rounded-l-none border-l-0 px-1'
                      >
                        <ChevronDown className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentMultiKeyChannel(record);
                          setShowMultiKeyManageModal(true);
                        }}
                      >
                        {t('多密钥管理')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setEditingChannel(record);
                    setShowEdit(true);
                  }}
                >
                  {t('编辑')}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='px-1'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {moreMenuItems.map((item, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      className={item.type === 'danger' ? 'text-destructive' : ''}
                      onClick={item.onClick}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        } else {
          // 标签操作按钮
          return (
            <div className='flex items-center gap-1 flex-wrap'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => manageTag(record.key, 'enable')}
              >
                {t('启用全部')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => manageTag(record.key, 'disable')}
              >
                {t('禁用全部')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowEditTag(true);
                  setEditingTag(record.key);
                }}
              >
                {t('编辑')}
              </Button>
            </div>
          );
        }
      },
    },
  ];
};
