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
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';
import { Coins, Search } from 'lucide-react';
import { API, timestamp2string } from '../../../helpers';
import { isAdmin } from '../../../helpers/utils';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { confirm } from '../../../lib/confirm';

// 状态映射配置
const STATUS_CONFIG = {
  success: { variant: 'success', key: '成功' },
  pending: { variant: 'warning', key: '待支付' },
  failed: { variant: 'destructive', key: '失败' },
  expired: { variant: 'destructive', key: '已过期' },
};

// 支付方式映射
const PAYMENT_METHOD_MAP = {
  stripe: 'Stripe',
  creem: 'Creem',
  waffo: 'Waffo',
  alipay: '支付宝',
  wxpay: '微信',
};

const TopupHistoryModal = ({ visible, onCancel, t }) => {
  const [loading, setLoading] = useState(false);
  const [topups, setTopups] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const isMobile = useIsMobile();

  const loadTopups = async (currentPage, currentPageSize) => {
    setLoading(true);
    try {
      const base = isAdmin() ? '/api/user/topup' : '/api/user/topup/self';
      const qs =
        `p=${currentPage}&page_size=${currentPageSize}` +
        (keyword ? `&keyword=${encodeURIComponent(keyword)}` : '');
      const endpoint = `${base}?${qs}`;
      const res = await API.get(endpoint);
      const { success, message, data } = res.data;
      if (success) {
        setTopups(data.items || []);
        setTotal(data.total || 0);
      } else {
        toast.error(message || t('加载失败'));
      }
    } catch (error) {
      toast.error(t('加载账单失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadTopups(page, pageSize);
    }
  }, [visible, page, pageSize, keyword]);

  const handlePageChange = (currentPage) => {
    setPage(currentPage);
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  // 管理员补单
  const handleAdminComplete = async (tradeNo) => {
    try {
      const res = await API.post('/api/user/topup/complete', {
        trade_no: tradeNo,
      });
      const { success, message } = res.data;
      if (success) {
        toast.success(t('补单成功'));
        await loadTopups(page, pageSize);
      } else {
        toast.error(message || t('补单失败'));
      }
    } catch (e) {
      toast.error(t('补单失败'));
    }
  };

  const confirmAdminComplete = (tradeNo) => {
    confirm({
      title: t('确认补单'),
      content: t('是否将该订单标记为成功并为用户入账？'),
      onConfirm: () => handleAdminComplete(tradeNo),
    });
  };

  // 渲染状态徽章
  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { variant: 'default', key: status };
    return (
      <Badge variant={config.variant}>
        {t(config.key)}
      </Badge>
    );
  };

  // 渲染支付方式
  const renderPaymentMethod = (pm) => {
    const displayName = PAYMENT_METHOD_MAP[pm];
    return <span>{displayName ? t(displayName) : pm || '-'}</span>;
  };

  const isSubscriptionTopup = (record) => {
    const tradeNo = (record?.trade_no || '').toLowerCase();
    return Number(record?.amount || 0) === 0 && tradeNo.startsWith('sub');
  };

  // 检查是否为管理员
  const userIsAdmin = useMemo(() => isAdmin(), []);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={isMobile ? 'max-w-full h-full' : 'max-w-4xl'}>
        <DialogHeader>
          <DialogTitle>{t('充值账单')}</DialogTitle>
        </DialogHeader>
        <div className='mb-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('订单号')}
              value={keyword}
              onChange={handleKeywordChange}
              className='pl-9'
            />
          </div>
        </div>
        <div className='overflow-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left p-2 font-medium'>{t('订单号')}</th>
                <th className='text-left p-2 font-medium'>{t('支付方式')}</th>
                <th className='text-left p-2 font-medium'>{t('充值额度')}</th>
                <th className='text-left p-2 font-medium'>{t('支付金额')}</th>
                <th className='text-left p-2 font-medium'>{t('状态')}</th>
                {userIsAdmin && <th className='text-left p-2 font-medium'>{t('操作')}</th>}
                <th className='text-left p-2 font-medium'>{t('创建时间')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={userIsAdmin ? 7 : 6} className='text-center p-8 text-muted-foreground'>
                    {t('加载中...')}
                  </td>
                </tr>
              ) : topups.length === 0 ? (
                <tr>
                  <td colSpan={userIsAdmin ? 7 : 6} className='text-center p-8 text-muted-foreground'>
                    {t('暂无充值记录')}
                  </td>
                </tr>
              ) : (
                topups.map((record) => (
                  <tr key={record.id} className='border-b hover:bg-muted/50'>
                    <td className='p-2'>
                      <span className='font-mono text-xs'>{record.trade_no}</span>
                    </td>
                    <td className='p-2'>{renderPaymentMethod(record.payment_method)}</td>
                    <td className='p-2'>
                      {isSubscriptionTopup(record) ? (
                        <Badge variant='secondary'>{t('订阅套餐')}</Badge>
                      ) : (
                        <span className='flex items-center gap-1'>
                          <Coins size={16} />
                          {record.amount}
                        </span>
                      )}
                    </td>
                    <td className='p-2'>
                      <span className='text-red-500'>¥{record.money?.toFixed(2)}</span>
                    </td>
                    <td className='p-2'>{renderStatusBadge(record.status)}</td>
                    {userIsAdmin && (
                      <td className='p-2'>
                        {record.status === 'pending' && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => confirmAdminComplete(record.trade_no)}
                          >
                            {t('补单')}
                          </Button>
                        )}
                      </td>
                    )}
                    <td className='p-2 text-muted-foreground text-xs'>
                      {timestamp2string(record.create_time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Simple pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between pt-4'>
            <span className='text-sm text-muted-foreground'>
              {t('共')} {total} {t('条')}
            </span>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                {t('上一页')}
              </Button>
              <span className='text-sm'>
                {page} / {totalPages}
              </span>
              <Button
                size='sm'
                variant='outline'
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                {t('下一页')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TopupHistoryModal;
