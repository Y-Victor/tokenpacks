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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { API, showError } from '../../../../helpers';

const clampPercent = (value) => {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
};

const pickStrokeColor = (percent) => {
  const p = clampPercent(percent);
  if (p >= 95) return '#ef4444';
  if (p >= 80) return '#f59e0b';
  return '#3b82f6';
};

const normalizePlanType = (value) => {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
};

const getWindowDurationSeconds = (windowData) => {
  const value = Number(windowData?.limit_window_seconds);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

const classifyWindowByDuration = (windowData) => {
  const seconds = getWindowDurationSeconds(windowData);
  if (seconds == null) return null;
  return seconds >= 24 * 60 * 60 ? 'weekly' : 'fiveHour';
};

const resolveRateLimitWindows = (data) => {
  const rateLimit = data?.rate_limit ?? {};
  const primary = rateLimit?.primary_window ?? null;
  const secondary = rateLimit?.secondary_window ?? null;
  const windows = [primary, secondary].filter(Boolean);
  const planType = normalizePlanType(data?.plan_type ?? rateLimit?.plan_type);

  let fiveHourWindow = null;
  let weeklyWindow = null;

  for (const windowData of windows) {
    const bucket = classifyWindowByDuration(windowData);
    if (bucket === 'fiveHour' && !fiveHourWindow) {
      fiveHourWindow = windowData;
      continue;
    }
    if (bucket === 'weekly' && !weeklyWindow) {
      weeklyWindow = windowData;
    }
  }

  if (planType === 'free') {
    if (!weeklyWindow) {
      weeklyWindow = primary ?? secondary ?? null;
    }
    return { fiveHourWindow: null, weeklyWindow };
  }

  if (!fiveHourWindow && !weeklyWindow) {
    return {
      fiveHourWindow: primary ?? null,
      weeklyWindow: secondary ?? null,
    };
  }

  if (!fiveHourWindow) {
    fiveHourWindow = windows.find((windowData) => windowData !== weeklyWindow) ?? null;
  }
  if (!weeklyWindow) {
    weeklyWindow = windows.find((windowData) => windowData !== fiveHourWindow) ?? null;
  }

  return { fiveHourWindow, weeklyWindow };
};

const formatDurationSeconds = (seconds, t) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return '-';
  const total = Math.floor(s);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}${tt('小时')} ${minutes}${tt('分钟')}`;
  if (minutes > 0) return `${minutes}${tt('分钟')} ${secs}${tt('秒')}`;
  return `${secs}${tt('秒')}`;
};

const formatUnixSeconds = (unixSeconds) => {
  const v = Number(unixSeconds);
  if (!Number.isFinite(v) || v <= 0) return '-';
  try {
    return new Date(v * 1000).toLocaleString();
  } catch (error) {
    return String(unixSeconds);
  }
};

const getDisplayText = (value) => {
  if (value == null) return '';
  return String(value).trim();
};

const formatAccountTypeLabel = (value, t) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const normalized = normalizePlanType(value);
  switch (normalized) {
    case 'free':
      return 'Free';
    case 'plus':
      return 'Plus';
    case 'pro':
      return 'Pro';
    case 'team':
      return 'Team';
    case 'enterprise':
      return 'Enterprise';
    default:
      return getDisplayText(value) || tt('未识别');
  }
};

const getAccountTypeTagColor = (value) => {
  const normalized = normalizePlanType(value);
  switch (normalized) {
    case 'enterprise':
      return 'green';
    case 'team':
      return 'cyan';
    case 'pro':
      return 'blue';
    case 'plus':
      return 'violet';
    case 'free':
      return 'amber';
    default:
      return 'grey';
  }
};

const resolveUsageStatusTag = (t, rateLimit) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  if (!rateLimit || Object.keys(rateLimit).length === 0) {
    return <Badge variant='secondary'>{tt('待确认')}</Badge>;
  }
  if (rateLimit?.allowed && !rateLimit?.limit_reached) {
    return <Badge className='bg-green-500 text-white'>{tt('可用')}</Badge>;
  }
  return <Badge className='bg-red-500 text-white'>{tt('受限')}</Badge>;
};

const AccountInfoValue = ({ t, value, onCopy, monospace = false }) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const text = getDisplayText(value);
  const hasValue = text !== '';

  return (
    <div className='flex min-w-0 items-start justify-between gap-2'>
      <div
        className={`min-w-0 flex-1 break-all text-xs leading-5 ${
          monospace ? 'font-mono' : ''
        }`}
      >
        {hasValue ? text : '-'}
      </div>
      <Button
        variant='ghost'
        size='sm'
        className='shrink-0 px-1 text-xs'
        disabled={!hasValue}
        onClick={() => onCopy?.(text)}
      >
        {tt('复制')}
      </Button>
    </div>
  );
};

const RateLimitWindowCard = ({ t, title, windowData }) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const hasWindowData =
    !!windowData &&
    typeof windowData === 'object' &&
    Object.keys(windowData).length > 0;
  const percent = clampPercent(windowData?.used_percent ?? 0);
  const resetAt = windowData?.reset_at;
  const resetAfterSeconds = windowData?.reset_after_seconds;
  const limitWindowSeconds = windowData?.limit_window_seconds;

  return (
    <div className='rounded-lg border bg-background p-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='font-medium'>{title}</div>
        <span className='text-xs text-muted-foreground'>
          {tt('重置时间：')}
          {formatUnixSeconds(resetAt)}
        </span>
      </div>

      {hasWindowData ? (
        <div className='mt-2'>
          <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
            <div
              className='h-full rounded-full transition-all'
              style={{
                width: `${percent}%`,
                backgroundColor: pickStrokeColor(percent),
              }}
            />
          </div>
          <div className='text-right text-xs text-muted-foreground mt-1'>
            {percent}%
          </div>
        </div>
      ) : (
        <div className='mt-3 text-sm text-muted-foreground'>-</div>
      )}

      <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
        <div>
          {tt('已使用：')}
          {hasWindowData ? `${percent}%` : '-'}
        </div>
        <div>
          {tt('距离重置：')}
          {hasWindowData ? formatDurationSeconds(resetAfterSeconds, tt) : '-'}
        </div>
        <div>
          {tt('窗口：')}
          {hasWindowData ? formatDurationSeconds(limitWindowSeconds, tt) : '-'}
        </div>
      </div>
    </div>
  );
};

const CodexUsageView = ({ t, record, payload, onCopy, onRefresh }) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const [showRawJson, setShowRawJson] = useState(false);
  const data = payload?.data ?? null;
  const rateLimit = data?.rate_limit ?? {};
  const { fiveHourWindow, weeklyWindow } = resolveRateLimitWindows(data);
  const upstreamStatus = payload?.upstream_status;
  const accountType = data?.plan_type ?? rateLimit?.plan_type;
  const accountTypeLabel = formatAccountTypeLabel(accountType, tt);
  const accountTypeTagColor = getAccountTypeTagColor(accountType);
  const statusTag = resolveUsageStatusTag(tt, rateLimit);
  const userId = data?.user_id;
  const email = data?.email;
  const accountId = data?.account_id;
  const errorMessage =
    payload?.success === false ? getDisplayText(payload?.message) || tt('获取用量失败') : '';

  const rawText =
    typeof data === 'string' ? data : JSON.stringify(data ?? payload, null, 2);

  const tagColorMap = {
    green: 'bg-green-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    blue: 'bg-blue-500 text-white',
    violet: 'bg-violet-500 text-white',
    amber: 'bg-amber-500 text-white',
    grey: 'bg-gray-400 text-white',
  };

  return (
    <div className='flex flex-col gap-4'>
      {errorMessage && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {errorMessage}
        </div>
      )}

      <div className='rounded-xl border bg-background p-3'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='text-xs font-medium text-muted-foreground'>
              {tt('Codex 帐号')}
            </div>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <Badge className={`font-semibold ${tagColorMap[accountTypeTagColor] || tagColorMap.grey}`}>
                {accountTypeLabel}
              </Badge>
              {statusTag}
              <Badge variant='secondary'>
                {tt('上游状态码：')}
                {upstreamStatus ?? '-'}
              </Badge>
            </div>
          </div>
          <Button variant='outline' size='sm' onClick={onRefresh}>
            {tt('刷新')}
          </Button>
        </div>

        <div className='mt-2 rounded-lg bg-muted/50 px-3 py-2'>
          <div className='grid gap-2'>
            <div className='flex items-start gap-2'>
              <span className='text-xs font-medium text-muted-foreground shrink-0 w-24'>User ID</span>
              <AccountInfoValue
                t={tt}
                value={userId}
                onCopy={onCopy}
                monospace={true}
              />
            </div>
            <div className='flex items-start gap-2'>
              <span className='text-xs font-medium text-muted-foreground shrink-0 w-24'>{tt('邮箱')}</span>
              <AccountInfoValue t={tt} value={email} onCopy={onCopy} />
            </div>
            <div className='flex items-start gap-2'>
              <span className='text-xs font-medium text-muted-foreground shrink-0 w-24'>Account ID</span>
              <AccountInfoValue
                t={tt}
                value={accountId}
                onCopy={onCopy}
                monospace={true}
              />
            </div>
          </div>
        </div>

        <div className='mt-2 text-xs text-muted-foreground'>
          {tt('渠道：')}
          {record?.name || '-'} ({tt('编号：')}
          {record?.id || '-'})
        </div>
      </div>

      <div>
        <div className='mb-2'>
          <div className='text-sm font-semibold'>
            {tt('额度窗口')}
          </div>
          <span className='text-xs text-muted-foreground'>
            {tt('用于观察当前帐号在 Codex 上游的限额使用情况')}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <RateLimitWindowCard
          t={tt}
          title={tt('5小时窗口')}
          windowData={fiveHourWindow}
        />
        <RateLimitWindowCard
          t={tt}
          title={tt('每周窗口')}
          windowData={weeklyWindow}
        />
      </div>

      <Collapsible open={showRawJson} onOpenChange={setShowRawJson}>
        <CollapsibleTrigger className='flex items-center gap-2 p-2 hover:bg-muted/50 rounded w-full'>
          <ChevronDown className='h-4 w-4' />
          <span>{tt('原始 JSON')}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='mb-2 flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onCopy?.(rawText)}
              disabled={!rawText}
            >
              {tt('复制')}
            </Button>
          </div>
          <pre className='max-h-[50vh] overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs'>
            {rawText}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const CodexUsageLoader = ({ t, record, initialPayload, onCopy }) => {
  const tt = typeof t === 'function' ? t : (v) => v;
  const [loading, setLoading] = useState(!initialPayload);
  const [payload, setPayload] = useState(initialPayload ?? null);
  const hasShownErrorRef = useRef(false);
  const mountedRef = useRef(true);
  const recordId = record?.id;

  const fetchUsage = useCallback(async () => {
    if (!recordId) {
      if (mountedRef.current) setPayload(null);
      return;
    }

    if (mountedRef.current) setLoading(true);
    try {
      const res = await API.get(`/api/channel/${recordId}/codex/usage`, {
        skipErrorHandler: true,
      });
      if (!mountedRef.current) return;
      setPayload(res?.data ?? null);
      if (!res?.data?.success && !hasShownErrorRef.current) {
        hasShownErrorRef.current = true;
        showError(tt('获取用量失败'));
      }
    } catch (error) {
      if (!mountedRef.current) return;
      if (!hasShownErrorRef.current) {
        hasShownErrorRef.current = true;
        showError(tt('获取用量失败'));
      }
      setPayload({ success: false, message: String(error) });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [recordId, tt]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialPayload) return;
    fetchUsage().catch(() => {});
  }, [fetchUsage, initialPayload]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='flex flex-col items-center gap-2'>
          <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
          <span className='text-sm text-muted-foreground'>{tt('加载中...')}</span>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className='flex flex-col gap-3'>
        <p className='text-sm text-destructive'>{tt('获取用量失败')}</p>
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchUsage}
          >
            {tt('刷新')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CodexUsageView
      t={tt}
      record={record}
      payload={payload}
      onCopy={onCopy}
      onRefresh={fetchUsage}
    />
  );
};

export const CodexUsageModal = ({ visible, onClose, t, record, payload, onCopy }) => {
  const tt = typeof t === 'function' ? t : (v) => v;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className='max-w-4xl' style={{ maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle>{tt('Codex 帐号与用量')}</DialogTitle>
        </DialogHeader>
        <CodexUsageLoader
          t={tt}
          record={record}
          initialPayload={payload}
          onCopy={onCopy}
        />
        <DialogFooter>
          <Button onClick={onClose}>
            {tt('关闭')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Keep backward-compatible imperative API for callers that still use it
// This creates a temporary DOM element and renders the modal into it
export const openCodexUsageModal = ({ t, record, payload, onCopy }) => {
  const tt = typeof t === 'function' ? t : (v) => v;

  // Create a temporary container
  const container = document.createElement('div');
  document.body.appendChild(container);

  const cleanup = () => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Use React 18 createRoot
  const { createRoot } = require('react-dom/client');
  const root = createRoot(container);

  const ModalWrapper = () => {
    const [open, setOpen] = React.useState(true);
    const handleClose = () => {
      setOpen(false);
      setTimeout(cleanup, 300);
    };
    return (
      <CodexUsageModal
        visible={open}
        onClose={handleClose}
        t={tt}
        record={record}
        payload={payload}
        onCopy={onCopy}
      />
    );
  };

  root.render(<ModalWrapper />);
};
