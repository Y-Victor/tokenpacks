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
import { confirm } from '../../../lib/confirm';
import {
  timestamp2string,
  getLobeHubIcon,
  stringToColor,
} from '../../../helpers';
import {
  renderLimitedItems,
  renderDescription,
} from '../../common/ui/RenderUtils';

// Render timestamp
function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}

// Render model icon column: prefer model.icon, then fallback to vendor icon
const renderModelIconCol = (record, vendorMap) => {
  const iconKey = record?.icon || vendorMap[record?.vendor_id]?.icon;
  if (!iconKey) return '-';
  return (
    <div className='flex items-center justify-center'>
      {getLobeHubIcon(iconKey, 20)}
    </div>
  );
};

// Render vendor column with icon
const renderVendorTag = (vendorId, vendorMap, t) => {
  if (!vendorId || !vendorMap[vendorId]) return '-';
  const v = vendorMap[vendorId];
  return (
    <Badge variant='outline'>
      <span className='flex items-center gap-1'>
        {getLobeHubIcon(v.icon || 'Layers', 14)}
        {v.name}
      </span>
    </Badge>
  );
};

// Render groups (enable_groups)
const renderGroups = (groups) => {
  if (!groups || groups.length === 0) return '-';
  return renderLimitedItems({
    items: groups,
    renderItem: (g, idx) => (
      <Badge key={idx} variant='outline' style={{ borderColor: stringToColor(g), color: stringToColor(g) }}>
        {g}
      </Badge>
    ),
  });
};

// Render tags
const renderTags = (text) => {
  if (!text) return '-';
  const tagsArr = text.split(',').filter(Boolean);
  return renderLimitedItems({
    items: tagsArr,
    renderItem: (tag, idx) => (
      <Badge key={idx} variant='outline' style={{ borderColor: stringToColor(tag), color: stringToColor(tag) }}>
        {tag}
      </Badge>
    ),
  });
};

// Render endpoints (supports object map or legacy array)
const renderEndpoints = (value) => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed || {});
      if (keys.length === 0) return '-';
      return renderLimitedItems({
        items: keys,
        renderItem: (key, idx) => (
          <Badge key={idx} variant='outline' style={{ borderColor: stringToColor(key), color: stringToColor(key) }}>
            {key}
          </Badge>
        ),
        maxDisplay: 3,
      });
    }
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return '-';
      return renderLimitedItems({
        items: parsed,
        renderItem: (ep, idx) => (
          <Badge key={idx} variant='outline'>
            {ep}
          </Badge>
        ),
        maxDisplay: 3,
      });
    }
    return value || '-';
  } catch (_) {
    return value || '-';
  }
};

// Render quota types (array) using common limited items renderer
const renderQuotaTypes = (arr, t) => {
  if (!Array.isArray(arr) || arr.length === 0) return '-';
  return renderLimitedItems({
    items: arr,
    renderItem: (qt, idx) => {
      if (qt === 1) {
        return (
          <Badge key={`${qt}-${idx}`} variant='outline' className='text-teal-600 border-teal-300'>
            {t('按次计费')}
          </Badge>
        );
      }
      if (qt === 0) {
        return (
          <Badge key={`${qt}-${idx}`} variant='outline' className='text-violet-600 border-violet-300'>
            {t('按量计费')}
          </Badge>
        );
      }
      return (
        <Badge key={`${qt}-${idx}`} variant='outline'>
          {qt}
        </Badge>
      );
    },
    maxDisplay: 3,
  });
};

// Render bound channels
const renderBoundChannels = (channels) => {
  if (!channels || channels.length === 0) return '-';
  return renderLimitedItems({
    items: channels,
    renderItem: (c, idx) => (
      <Badge key={idx} variant='outline'>
        {c.name}({c.type})
      </Badge>
    ),
  });
};

// Render operations column
const renderOperations = (
  text,
  record,
  setEditingModel,
  setShowEdit,
  manageModel,
  refresh,
  t,
) => {
  return (
    <div className='flex items-center gap-1 flex-wrap'>
      {record.status === 1 ? (
        <Button
          variant='destructive'
          size='sm'
          onClick={() => manageModel(record.id, 'disable', record)}
        >
          {t('禁用')}
        </Button>
      ) : (
        <Button
          size='sm'
          onClick={() => manageModel(record.id, 'enable', record)}
        >
          {t('启用')}
        </Button>
      )}

      <Button
        variant='secondary'
        size='sm'
        onClick={() => {
          setEditingModel(record);
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
            title: t('确定是否要删除此模型？'),
            content: t('此修改将不可逆'),
            onConfirm: () => {
              (async () => {
                await manageModel(record.id, 'delete', record);
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

// Name rule rendering (with match count Tooltip)
const renderNameRule = (rule, record, t) => {
  const map = {
    0: { className: 'text-green-600 border-green-300', label: t('精确') },
    1: { className: 'text-blue-600 border-blue-300', label: t('前缀') },
    2: { className: 'text-orange-600 border-orange-300', label: t('包含') },
    3: { className: 'text-purple-600 border-purple-300', label: t('后缀') },
  };
  const cfg = map[rule];
  if (!cfg) return '-';

  let label = cfg.label;
  if (rule !== 0 && record.matched_count) {
    label = `${cfg.label} ${record.matched_count}${t('个模型')}`;
  }

  const badgeElement = (
    <Badge variant='outline' className={cfg.className}>
      {label}
    </Badge>
  );

  if (
    rule === 0 ||
    !record.matched_models ||
    record.matched_models.length === 0
  ) {
    return badgeElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
      <TooltipContent>{record.matched_models.join(', ')}</TooltipContent>
    </Tooltip>
  );
};

export const getModelsColumns = ({
  t,
  manageModel,
  setEditingModel,
  setShowEdit,
  refresh,
  vendorMap,
}) => {
  return [
    {
      title: t('图标'),
      dataIndex: 'icon',
      width: 70,
      align: 'center',
      render: (text, record) => renderModelIconCol(record, vendorMap),
    },
    {
      title: t('模型名称'),
      dataIndex: 'model_name',
      render: (text) => (
        <span
          className='cursor-pointer hover:underline'
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: t('匹配类型'),
      dataIndex: 'name_rule',
      render: (val, record) => renderNameRule(val, record, t),
    },
    {
      title: t('参与官方同步'),
      dataIndex: 'sync_official',
      render: (val) => (
        <Badge variant='outline' className={val === 1 ? 'text-green-600 border-green-300' : 'text-orange-600 border-orange-300'}>
          {val === 1 ? t('是') : t('否')}
        </Badge>
      ),
    },
    {
      title: t('描述'),
      dataIndex: 'description',
      render: (text) => renderDescription(text, 200),
    },
    {
      title: t('供应商'),
      dataIndex: 'vendor_id',
      render: (vendorId, record) => renderVendorTag(vendorId, vendorMap, t),
    },
    {
      title: t('标签'),
      dataIndex: 'tags',
      render: renderTags,
    },
    {
      title: t('端点'),
      dataIndex: 'endpoints',
      render: renderEndpoints,
    },
    {
      title: t('已绑定渠道'),
      dataIndex: 'bound_channels',
      render: renderBoundChannels,
    },
    {
      title: t('可用分组'),
      dataIndex: 'enable_groups',
      render: renderGroups,
    },
    {
      title: t('计费类型'),
      dataIndex: 'quota_types',
      render: (qts) => renderQuotaTypes(qts, t),
    },
    {
      title: t('创建时间'),
      dataIndex: 'created_time',
      render: (text, record, index) => {
        return <div>{renderTimestamp(text)}</div>;
      },
    },
    {
      title: t('更新时间'),
      dataIndex: 'updated_time',
      render: (text, record, index) => {
        return <div>{renderTimestamp(text)}</div>;
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
          setEditingModel,
          setShowEdit,
          manageModel,
          refresh,
          t,
        ),
    },
  ];
};
