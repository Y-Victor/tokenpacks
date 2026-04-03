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
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import { Progress } from '../../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  timestamp2string,
  renderGroup,
  renderQuota,
  getModelCategories,
  showError,
} from '../../../helpers';
import { confirm } from '../../../lib/confirm';
import { ChevronDown, Copy, Eye, EyeOff } from 'lucide-react';

// progress color helper
const getProgressColor = (pct) => {
  if (pct === 100) return 'bg-green-500';
  if (pct <= 10) return 'bg-red-500';
  if (pct <= 30) return 'bg-yellow-500';
  return undefined;
};

// Render functions
function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}

// Render status column only (no usage)
const renderStatus = (text, record, t) => {
  const enabled = text === 1;

  let variant = 'secondary';
  let tagText = t('未知状态');
  if (enabled) {
    variant = 'default';
    tagText = t('已启用');
  } else if (text === 2) {
    variant = 'destructive';
    tagText = t('已禁用');
  } else if (text === 3) {
    variant = 'outline';
    tagText = t('已过期');
  } else if (text === 4) {
    variant = 'secondary';
    tagText = t('已耗尽');
  }

  return (
    <Badge variant={variant}>
      {tagText}
    </Badge>
  );
};

// Render group column
const renderGroupColumn = (text, record, t) => {
  if (text === 'auto') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Badge variant='outline'>
              {t('智能熔断')}
              {record && record.cross_group_retry ? `(${t('跨分组')})` : ''}
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {t(
            '当前分组为 auto，会自动选择最优分组，当一个组不可用时自动降级到下一个组（熔断机制）',
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
  return renderGroup(text);
};

// Render token key column with show/hide and copy functionality
const renderTokenKey = (
  text,
  record,
  showKeys,
  resolvedTokenKeys,
  loadingTokenKeys,
  toggleTokenVisibility,
  copyTokenKey,
) => {
  const revealed = !!showKeys[record.id];
  const loading = !!loadingTokenKeys[record.id];
  const keyValue =
    revealed && resolvedTokenKeys[record.id]
      ? resolvedTokenKeys[record.id]
      : record.key || '';
  const displayedKey = keyValue ? `sk-${keyValue}` : '';

  return (
    <div className='w-[200px]'>
      <div className='flex items-center'>
        <Input
          readOnly
          value={displayedKey}
          className='h-8 text-sm'
        />
        <div className='flex items-center ml-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            disabled={loading}
            aria-label='toggle token visibility'
            onClick={async (e) => {
              e.stopPropagation();
              await toggleTokenVisibility(record);
            }}
          >
            {revealed ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            disabled={loading}
            aria-label='copy token key'
            onClick={async (e) => {
              e.stopPropagation();
              await copyTokenKey(record);
            }}
          >
            <Copy className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Render model limits column
const renderModelLimits = (text, record, t) => {
  if (record.model_limits_enabled && text) {
    const models = text.split(',').filter(Boolean);
    const categories = getModelCategories(t);

    const vendorAvatars = [];
    const matchedModels = new Set();
    Object.entries(categories).forEach(([key, category]) => {
      if (key === 'all') return;
      if (!category.icon || !category.filter) return;
      const vendorModels = models.filter((m) =>
        category.filter({ model_name: m }),
      );
      if (vendorModels.length > 0) {
        vendorAvatars.push(
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <span className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs'>
                {category.icon}
              </span>
            </TooltipTrigger>
            <TooltipContent>{vendorModels.join(', ')}</TooltipContent>
          </Tooltip>,
        );
        vendorModels.forEach((m) => matchedModels.add(m));
      }
    });

    const unmatchedModels = models.filter((m) => !matchedModels.has(m));
    if (unmatchedModels.length > 0) {
      vendorAvatars.push(
        <Tooltip key='unknown'>
          <TooltipTrigger asChild>
            <span className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs'>
              {t('其他')}
            </span>
          </TooltipTrigger>
          <TooltipContent>{unmatchedModels.join(', ')}</TooltipContent>
        </Tooltip>,
      );
    }

    return <div className='flex items-center -space-x-1'>{vendorAvatars}</div>;
  } else {
    return (
      <Badge variant='outline'>
        {t('无限制')}
      </Badge>
    );
  }
};

// Render IP restrictions column
const renderAllowIps = (text, t) => {
  if (!text || text.trim() === '') {
    return (
      <Badge variant='outline'>
        {t('无限制')}
      </Badge>
    );
  }

  const ips = text
    .split('\n')
    .map((ip) => ip.trim())
    .filter(Boolean);

  const displayIps = ips.slice(0, 1);
  const extraCount = ips.length - displayIps.length;

  const ipTags = displayIps.map((ip, idx) => (
    <Badge key={idx} variant='secondary'>
      {ip}
    </Badge>
  ));

  if (extraCount > 0) {
    ipTags.push(
      <Tooltip key='extra'>
        <TooltipTrigger asChild>
          <span>
            <Badge variant='secondary'>{'+' + extraCount}</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>{ips.slice(1).join(', ')}</TooltipContent>
      </Tooltip>,
    );
  }

  return <div className='flex items-center gap-1 flex-wrap'>{ipTags}</div>;
};

// Render separate quota usage column
const renderQuotaUsage = (text, record, t) => {
  const used = parseInt(record.used_quota) || 0;
  const remain = parseInt(record.remain_quota) || 0;
  const total = used + remain;
  if (record.unlimited_quota) {
    const popoverContent = (
      <div className='text-xs p-2'>
        <p>{t('已用额度')}: {renderQuota(used)}</p>
      </div>
    );
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className='cursor-pointer'>
            <Badge variant='outline'>
              {t('无限额度')}
            </Badge>
          </span>
        </PopoverTrigger>
        <PopoverContent className='w-auto'>{popoverContent}</PopoverContent>
      </Popover>
    );
  }
  const percent = total > 0 ? (remain / total) * 100 : 0;
  const popoverContent = (
    <div className='text-xs p-2 space-y-1'>
      <p>{t('已用额度')}: {renderQuota(used)}</p>
      <p>{t('剩余额度')}: {renderQuota(remain)} ({percent.toFixed(0)}%)</p>
      <p>{t('总额度')}: {renderQuota(total)}</p>
    </div>
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className='cursor-pointer'>
          <Badge variant='outline'>
            <div className='flex flex-col items-end'>
              <span className='text-xs leading-none'>{`${renderQuota(remain)} / ${renderQuota(total)}`}</span>
              <Progress
                value={percent}
                className={`w-full mt-0.5 h-1.5 ${getProgressColor(percent) || ''}`}
                aria-label='quota usage'
              />
            </div>
          </Badge>
        </span>
      </PopoverTrigger>
      <PopoverContent className='w-auto'>{popoverContent}</PopoverContent>
    </Popover>
  );
};

// Render operations column
const renderOperations = (
  text,
  record,
  onOpenLink,
  setEditingToken,
  setShowEdit,
  manageToken,
  refresh,
  t,
) => {
  let chatsArray = [];
  try {
    const raw = localStorage.getItem('chats');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const name = Object.keys(item)[0];
        if (!name) continue;
        chatsArray.push({
          key: i,
          name,
          value: item[name],
          onClick: () => onOpenLink(name, item[name], record),
        });
      }
    }
  } catch (_) {
    showError(t('聊天链接配置错误，请联系管理员'));
  }

  return (
    <div className='flex items-center gap-1 flex-wrap'>
      <div className='inline-flex rounded-md shadow-sm' aria-label={t('项目操作按钮组')}>
        <Button
          size='sm'
          variant='outline'
          className='rounded-r-none'
          onClick={() => {
            if (chatsArray.length === 0) {
              showError(t('请联系管理员配置聊天链接'));
            } else {
              const first = chatsArray[0];
              onOpenLink(first.name, first.value, record);
            }
          }}
        >
          {t('聊天')}
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
            {chatsArray.map((chat) => (
              <DropdownMenuItem key={chat.key} onClick={chat.onClick}>
                {chat.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {record.status === 1 ? (
        <Button
          variant='destructive'
          size='sm'
          onClick={async () => {
            await manageToken(record.id, 'disable', record);
            await refresh();
          }}
        >
          {t('禁用')}
        </Button>
      ) : (
        <Button
          size='sm'
          onClick={async () => {
            await manageToken(record.id, 'enable', record);
            await refresh();
          }}
        >
          {t('启用')}
        </Button>
      )}

      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          setEditingToken(record);
          setShowEdit(true);
        }}
      >
        {t('编辑')}
      </Button>

      <Button
        variant='destructive'
        size='sm'
        onClick={() => {
          confirm({
            title: t('确定是否要删除此令牌？'),
            content: t('此修改将不可逆'),
            onConfirm: () => {
              (async () => {
                await manageToken(record.id, 'delete', record);
                await refresh();
              })();
            },
          });
        }}
      >
        {t('删除')}
      </Button>
    </div>
  );
};

export const getTokensColumns = ({
  t,
  showKeys,
  resolvedTokenKeys,
  loadingTokenKeys,
  toggleTokenVisibility,
  copyTokenKey,
  manageToken,
  onOpenLink,
  setEditingToken,
  setShowEdit,
  refresh,
}) => {
  return [
    {
      title: t('名称'),
      dataIndex: 'name',
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => renderStatus(text, record, t),
    },
    {
      title: t('剩余额度/总额度'),
      key: 'quota_usage',
      render: (text, record) => renderQuotaUsage(text, record, t),
    },
    {
      title: t('分组'),
      dataIndex: 'group',
      key: 'group',
      render: (text, record) => renderGroupColumn(text, record, t),
    },
    {
      title: t('密钥'),
      key: 'token_key',
      render: (text, record) =>
        renderTokenKey(
          text,
          record,
          showKeys,
          resolvedTokenKeys,
          loadingTokenKeys,
          toggleTokenVisibility,
          copyTokenKey,
        ),
    },
    {
      title: t('可用模型'),
      dataIndex: 'model_limits',
      render: (text, record) => renderModelLimits(text, record, t),
    },
    {
      title: t('IP限制'),
      dataIndex: 'allow_ips',
      render: (text) => renderAllowIps(text, t),
    },
    {
      title: t('创建时间'),
      dataIndex: 'created_time',
      render: (text, record, index) => {
        return <div>{renderTimestamp(text)}</div>;
      },
    },
    {
      title: t('过期时间'),
      dataIndex: 'expired_time',
      render: (text, record, index) => {
        return (
          <div>
            {record.expired_time === -1 ? t('永不过期') : renderTimestamp(text)}
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'operate',
      fixed: 'right',
      render: (text, record, index) =>
        renderOperations(
          text,
          record,
          onOpenLink,
          setEditingToken,
          setShowEdit,
          manageToken,
          refresh,
          t,
        ),
    },
  ];
};
