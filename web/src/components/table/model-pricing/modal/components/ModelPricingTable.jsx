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
import { Card } from '../../../../ui/card';
import {
  Avatar,
  AvatarFallback,
} from '../../../../ui/avatar';
import { Badge } from '../../../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../ui/table';
import { Coins } from 'lucide-react';
import { calculateModelPrice, getModelPriceItems } from '../../../../../helpers';

const ModelPricingTable = ({
  modelData,
  groupRatio,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
  usableGroup,
  autoGroups = [],
  t,
}) => {
  const modelEnableGroups = Array.isArray(modelData?.enable_groups)
    ? modelData.enable_groups
    : [];
  const autoChain = autoGroups.filter((g) => modelEnableGroups.includes(g));
  const renderGroupPriceTable = () => {
    // 仅展示模型可用的分组：模型 enable_groups 与用户可用分组的交集

    const availableGroups = Object.keys(usableGroup || {})
      .filter((g) => g !== '')
      .filter((g) => g !== 'auto')
      .filter((g) => modelEnableGroups.includes(g));

    // 准备表格数据
    const tableData = availableGroups.map((group) => {
      const priceData = modelData
        ? calculateModelPrice({
            record: modelData,
            selectedGroup: group,
            groupRatio,
            tokenUnit,
            displayPrice,
            currency,
            quotaDisplayType: siteDisplayType,
          })
        : { inputPrice: '-', outputPrice: '-', price: '-' };

      // 获取分组倍率
      const groupRatioValue =
        groupRatio && groupRatio[group] ? groupRatio[group] : 1;

      return {
        key: group,
        group: group,
        ratio: groupRatioValue,
        billingType:
          modelData?.quota_type === 0
            ? t('按量计费')
            : modelData?.quota_type === 1
              ? t('按次计费')
              : '-',
        priceItems: getModelPriceItems(priceData, t, siteDisplayType),
      };
    });

    return (
      <div className='rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('分组')}</TableHead>
              {showRatio && <TableHead>{t('倍率')}</TableHead>}
              <TableHead>{t('计费类型')}</TableHead>
              <TableHead>
                {siteDisplayType === 'TOKENS' ? t('计费摘要') : t('价格摘要')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => {
              let billingClassName = '';
              if (row.billingType === t('按量计费'))
                billingClassName = 'bg-violet-100 text-violet-800';
              else if (row.billingType === t('按次计费'))
                billingClassName = 'bg-teal-100 text-teal-800';

              return (
                <TableRow key={row.key}>
                  <TableCell>
                    <Badge variant='outline' className='rounded-full'>
                      {row.group}
                      {t('分组')}
                    </Badge>
                  </TableCell>
                  {showRatio && (
                    <TableCell>
                      <Badge variant='outline' className='rounded-full'>
                        {row.ratio}x
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={`rounded-full ${billingClassName}`}
                    >
                      {row.billingType || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {row.priceItems.map((item) => (
                        <div key={item.key}>
                          <div className='font-semibold text-orange-600'>
                            {item.label} {item.value}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {item.suffix}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className='!rounded-2xl shadow-sm border-0 p-6'>
      <div className='flex items-center mb-4'>
        <Avatar className='mr-2 shadow-md h-8 w-8 bg-orange-500'>
          <AvatarFallback className='bg-orange-500 text-white'>
            <Coins size={16} />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className='text-lg font-medium'>{t('分组价格')}</span>
          <div className='text-xs text-gray-600'>
            {t('不同用户分组的价格信息')}
          </div>
        </div>
      </div>
      {autoChain.length > 0 && (
        <div className='flex flex-wrap items-center gap-1 mb-4'>
          <span className='text-sm text-gray-600'>{t('auto分组调用链路')}</span>
          <span className='text-sm'>→</span>
          {autoChain.map((g, idx) => (
            <React.Fragment key={g}>
              <Badge variant='outline' className='rounded-full'>
                {g}
                {t('分组')}
              </Badge>
              {idx < autoChain.length - 1 && <span className='text-sm'>→</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      {renderGroupPriceTable()}
    </Card>
  );
};

export default ModelPricingTable;
