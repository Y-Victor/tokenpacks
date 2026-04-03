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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { renderGroup, renderNumber, renderQuota } from '../../../helpers';

/**
 * Render user role
 */
const renderRole = (role, t) => {
  switch (role) {
    case 1:
      return (
        <Badge variant='outline' className='text-blue-600 border-blue-300'>
          {t('普通用户')}
        </Badge>
      );
    case 10:
      return (
        <Badge variant='outline' className='text-yellow-600 border-yellow-300'>
          {t('管理员')}
        </Badge>
      );
    case 100:
      return (
        <Badge variant='outline' className='text-orange-600 border-orange-300'>
          {t('超级管理员')}
        </Badge>
      );
    default:
      return (
        <Badge variant='outline' className='text-red-600 border-red-300'>
          {t('未知身份')}
        </Badge>
      );
  }
};

/**
 * Render username with remark
 */
const renderUsername = (text, record) => {
  const remark = record.remark;
  if (!remark) {
    return <span>{text}</span>;
  }
  const maxLen = 10;
  const displayRemark =
    remark.length > maxLen ? remark.slice(0, maxLen) + '\u2026' : remark;
  return (
    <div className='flex items-center gap-0.5'>
      <span>{text}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant='outline' className='text-xs cursor-help'>
            <div className='flex items-center gap-1'>
              <div
                className='w-2 h-2 flex-shrink-0 rounded-full'
                style={{ backgroundColor: '#10b981' }}
              />
              {displayRemark}
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{remark}</TooltipContent>
      </Tooltip>
    </div>
  );
};

/**
 * Render user statistics
 */
const renderStatistics = (text, record, showEnableDisableModal, t) => {
  const isDeleted = record.DeletedAt !== null;

  let badgeClass = 'text-gray-600 border-gray-300';
  let tagText = t('未知状态');
  if (isDeleted) {
    badgeClass = 'text-red-600 border-red-300';
    tagText = t('已注销');
  } else if (record.status === 1) {
    badgeClass = 'text-green-600 border-green-300';
    tagText = t('已启用');
  } else if (record.status === 2) {
    badgeClass = 'text-red-600 border-red-300';
    tagText = t('已禁用');
  }

  const content = (
    <Badge variant='outline' className={badgeClass}>
      {tagText}
    </Badge>
  );

  const tooltipContent = (
    <div className='text-xs'>
      <div>
        {t('调用次数')}: {renderNumber(record.request_count)}
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};

// Render separate quota usage column
const renderQuotaUsage = (text, record, t) => {
  const used = parseInt(record.used_quota) || 0;
  const remain = parseInt(record.quota) || 0;
  const total = used + remain;
  const percent = total > 0 ? (remain / total) * 100 : 0;
  const popoverContent = (
    <div className='text-xs p-2'>
      <p className='cursor-pointer' onClick={() => navigator.clipboard.writeText(renderQuota(used))}>
        {t('已用额度')}: {renderQuota(used)}
      </p>
      <p className='cursor-pointer' onClick={() => navigator.clipboard.writeText(renderQuota(remain))}>
        {t('剩余额度')}: {renderQuota(remain)} ({percent.toFixed(0)}%)
      </p>
      <p className='cursor-pointer' onClick={() => navigator.clipboard.writeText(renderQuota(total))}>
        {t('总额度')}: {renderQuota(total)}
      </p>
    </div>
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant='outline' className='cursor-pointer'>
          <div className='flex flex-col items-end'>
            <span className='text-xs leading-none'>{`${renderQuota(remain)} / ${renderQuota(total)}`}</span>
            <Progress
              value={percent}
              aria-label='quota usage'
              className='w-full mt-0.5 h-1.5'
            />
          </div>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className='w-auto'>{popoverContent}</PopoverContent>
    </Popover>
  );
};

/**
 * Render invite information
 */
const renderInviteInfo = (text, record, t) => {
  return (
    <div>
      <div className='flex items-center gap-1'>
        <Badge variant='outline' className='text-xs'>
          {t('邀请')}: {renderNumber(record.aff_count)}
        </Badge>
        <Badge variant='outline' className='text-xs'>
          {t('收益')}: {renderQuota(record.aff_history_quota)}
        </Badge>
        <Badge variant='outline' className='text-xs'>
          {record.inviter_id === 0
            ? t('无邀请人')
            : `${t('邀请人')}: ${record.inviter_id}`}
        </Badge>
      </div>
    </div>
  );
};

/**
 * Render operations column
 */
const renderOperations = (
  text,
  record,
  {
    setEditingUser,
    setShowEditUser,
    showPromoteModal,
    showDemoteModal,
    showEnableDisableModal,
    showDeleteModal,
    showResetPasskeyModal,
    showResetTwoFAModal,
    showUserSubscriptionsModal,
    t,
  },
) => {
  if (record.DeletedAt !== null) {
    return <></>;
  }

  return (
    <div className='flex items-center gap-1'>
      {record.status === 1 ? (
        <Button
          variant='destructive'
          size='sm'
          onClick={() => showEnableDisableModal(record, 'disable')}
        >
          {t('禁用')}
        </Button>
      ) : (
        <Button
          size='sm'
          onClick={() => showEnableDisableModal(record, 'enable')}
        >
          {t('启用')}
        </Button>
      )}
      <Button
        variant='secondary'
        size='sm'
        onClick={() => {
          setEditingUser(record);
          setShowEditUser(true);
        }}
      >
        {t('编辑')}
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => showPromoteModal(record)}
      >
        {t('提升')}
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => showDemoteModal(record)}
      >
        {t('降级')}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => showUserSubscriptionsModal(record)}>
            {t('订阅管理')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => showResetPasskeyModal(record)}>
            {t('重置 Passkey')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => showResetTwoFAModal(record)}>
            {t('重置 2FA')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive'
            onClick={() => showDeleteModal(record)}
          >
            {t('注销')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/**
 * Get users table column definitions
 */
export const getUsersColumns = ({
  t,
  setEditingUser,
  setShowEditUser,
  showPromoteModal,
  showDemoteModal,
  showEnableDisableModal,
  showDeleteModal,
  showResetPasskeyModal,
  showResetTwoFAModal,
  showUserSubscriptionsModal,
}) => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: t('用户名'),
      dataIndex: 'username',
      render: (text, record) => renderUsername(text, record),
    },
    {
      title: t('状态'),
      dataIndex: 'info',
      render: (text, record, index) =>
        renderStatistics(text, record, showEnableDisableModal, t),
    },
    {
      title: t('剩余额度/总额度'),
      key: 'quota_usage',
      render: (text, record) => renderQuotaUsage(text, record, t),
    },
    {
      title: t('分组'),
      dataIndex: 'group',
      render: (text, record, index) => {
        return <div>{renderGroup(text)}</div>;
      },
    },
    {
      title: t('角色'),
      dataIndex: 'role',
      render: (text, record, index) => {
        return <div>{renderRole(text, t)}</div>;
      },
    },
    {
      title: t('邀请信息'),
      dataIndex: 'invite',
      render: (text, record, index) => renderInviteInfo(text, record, t),
    },
    {
      title: '',
      dataIndex: 'operate',
      fixed: 'right',
      width: 200,
      render: (text, record, index) =>
        renderOperations(text, record, {
          setEditingUser,
          setShowEditUser,
          showPromoteModal,
          showDemoteModal,
          showEnableDisableModal,
          showDeleteModal,
          showResetPasskeyModal,
          showResetTwoFAModal,
          showUserSubscriptionsModal,
          t,
        }),
    },
  ];
};
