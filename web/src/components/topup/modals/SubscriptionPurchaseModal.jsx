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
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Crown, CalendarClock, Package } from 'lucide-react';
import { SiStripe } from 'react-icons/si';
import { CreditCard } from 'lucide-react';
import { renderQuota } from '../../../helpers';
import { getCurrencyConfig } from '../../../helpers/render';
import {
  formatSubscriptionDuration,
  formatSubscriptionResetPeriod,
} from '../../../helpers/subscriptionFormat';

const SubscriptionPurchaseModal = ({
  t,
  visible,
  onCancel,
  selectedPlan,
  paying,
  selectedEpayMethod,
  setSelectedEpayMethod,
  epayMethods = [],
  enableOnlineTopUp = false,
  enableStripeTopUp = false,
  enableCreemTopUp = false,
  purchaseLimitInfo = null,
  onPayStripe,
  onPayCreem,
  onPayEpay,
}) => {
  const plan = selectedPlan?.plan;
  const totalAmount = Number(plan?.total_amount || 0);
  const { symbol, rate } = getCurrencyConfig();
  const price = plan ? Number(plan.price_amount || 0) : 0;
  const convertedPrice = price * rate;
  const displayPrice = convertedPrice.toFixed(
    Number.isInteger(convertedPrice) ? 0 : 2,
  );
  // 只有当管理员开启支付网关 AND 套餐配置了对应的支付ID时才显示
  const hasStripe = enableStripeTopUp && !!plan?.stripe_price_id;
  const hasCreem = enableCreemTopUp && !!plan?.creem_product_id;
  const hasEpay = enableOnlineTopUp && epayMethods.length > 0;
  const hasAnyPayment = hasStripe || hasCreem || hasEpay;
  const purchaseLimit = Number(purchaseLimitInfo?.limit || 0);
  const purchaseCount = Number(purchaseLimitInfo?.count || 0);
  const purchaseLimitReached =
    purchaseLimit > 0 && purchaseCount >= purchaseLimit;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center'>
              <Crown className='mr-2' size={18} />
              {t('购买订阅套餐')}
            </div>
          </DialogTitle>
        </DialogHeader>
        {plan ? (
          <div className='space-y-4 pb-10'>
            {/* 套餐信息 */}
            <Card className='!rounded-xl !border-0 bg-slate-50 dark:bg-slate-800'>
              <CardContent className='p-4'>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-slate-700 dark:text-slate-200'>
                      {t('套餐名称')}：
                    </span>
                    <span
                      className='text-slate-900 dark:text-slate-100 truncate'
                      style={{ maxWidth: 200 }}
                      title={plan.title}
                    >
                      {plan.title}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-slate-700 dark:text-slate-200'>
                      {t('有效期')}：
                    </span>
                    <div className='flex items-center'>
                      <CalendarClock size={14} className='mr-1 text-slate-500' />
                      <span className='text-slate-900 dark:text-slate-100'>
                        {formatSubscriptionDuration(plan, t)}
                      </span>
                    </div>
                  </div>
                  {formatSubscriptionResetPeriod(plan, t) !== t('不重置') && (
                    <div className='flex justify-between items-center'>
                      <span className='font-semibold text-slate-700 dark:text-slate-200'>
                        {t('重置周期')}：
                      </span>
                      <span className='text-slate-900 dark:text-slate-100'>
                        {formatSubscriptionResetPeriod(plan, t)}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-slate-700 dark:text-slate-200'>
                      {t('总额度')}：
                    </span>
                    <div className='flex items-center'>
                      <Package size={14} className='mr-1 text-slate-500' />
                      {totalAmount > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='text-slate-900 dark:text-slate-100 cursor-help'>
                              {renderQuota(totalAmount)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{`${t('原生额度')}：${totalAmount}`}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className='text-slate-900 dark:text-slate-100'>
                          {t('不限')}
                        </span>
                      )}
                    </div>
                  </div>
                  {plan?.upgrade_group ? (
                    <div className='flex justify-between items-center'>
                      <span className='font-semibold text-slate-700 dark:text-slate-200'>
                        {t('升级分组')}：
                      </span>
                      <span className='text-slate-900 dark:text-slate-100'>
                        {plan.upgrade_group}
                      </span>
                    </div>
                  ) : null}
                  <Separator className='my-2' />
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-slate-700 dark:text-slate-200'>
                      {t('应付金额')}：
                    </span>
                    <span className='font-semibold text-xl text-purple-600'>
                      {symbol}
                      {displayPrice}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 支付方式 */}
            {purchaseLimitReached && (
              <Alert variant='warning' className='!rounded-xl'>
                <AlertDescription>
                  {`${t('已达到购买上限')} (${purchaseCount}/${purchaseLimit})`}
                </AlertDescription>
              </Alert>
            )}

            {hasAnyPayment ? (
              <div className='space-y-3'>
                <span className='text-sm text-muted-foreground'>
                  {t('选择支付方式')}：
                </span>

                {/* Stripe / Creem */}
                {(hasStripe || hasCreem) && (
                  <div className='flex gap-2'>
                    {hasStripe && (
                      <Button
                        variant='outline'
                        className='flex-1'
                        onClick={onPayStripe}
                        disabled={paying || purchaseLimitReached}
                      >
                        <SiStripe size={14} color='#635BFF' className='mr-2' />
                        Stripe
                      </Button>
                    )}
                    {hasCreem && (
                      <Button
                        variant='outline'
                        className='flex-1'
                        onClick={onPayCreem}
                        disabled={paying || purchaseLimitReached}
                      >
                        <CreditCard size={14} className='mr-2' />
                        Creem
                      </Button>
                    )}
                  </div>
                )}

                {/* 易支付 */}
                {hasEpay && (
                  <div className='flex gap-2'>
                    <Select
                      value={selectedEpayMethod}
                      onValueChange={setSelectedEpayMethod}
                      disabled={purchaseLimitReached}
                    >
                      <SelectTrigger className='flex-1'>
                        <SelectValue placeholder={t('选择支付方式')} />
                      </SelectTrigger>
                      <SelectContent>
                        {epayMethods.map((m) => (
                          <SelectItem key={m.type} value={m.type}>
                            {m.name || m.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={onPayEpay}
                      disabled={paying || !selectedEpayMethod || purchaseLimitReached}
                    >
                      {t('支付')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant='info' className='!rounded-xl'>
                <AlertDescription>
                  {t('管理员未开启在线支付功能，请联系管理员配置。')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPurchaseModal;
