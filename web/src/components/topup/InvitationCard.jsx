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
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Copy, Users, BarChart2, TrendingUp, Gift, Zap } from 'lucide-react';

const InvitationCard = ({
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  handleAffLinkClick,
}) => {
  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      <CardContent className='p-6'>
        {/* 卡片头部 */}
        <div className='flex items-center mb-4'>
          <Avatar className='mr-3 shadow-md h-8 w-8 bg-green-500'>
            <AvatarFallback className='bg-green-500 text-white'>
              <Gift size={16} />
            </AvatarFallback>
          </Avatar>
          <div>
            <span className='text-lg font-medium block'>
              {t('邀请奖励')}
            </span>
            <div className='text-xs'>{t('邀请好友获得额外奖励')}</div>
          </div>
        </div>

        {/* 收益展示区域 */}
        <div className='flex flex-col gap-4 w-full'>
          {/* 统计数据统一卡片 */}
          <Card className='!rounded-xl w-full overflow-hidden'>
            <div
              className='relative h-30'
              style={{
                '--palette-primary-darkerChannel': '0 75 80',
                backgroundImage: `linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* 标题和按钮 */}
              <div className='relative z-10 h-full flex flex-col justify-between p-4'>
                <div className='flex justify-between items-center'>
                  <span className='font-semibold' style={{ color: 'white', fontSize: '16px' }}>
                    {t('收益统计')}
                  </span>
                  <Button
                    size='sm'
                    disabled={
                      !userState?.user?.aff_quota ||
                      userState?.user?.aff_quota <= 0
                    }
                    onClick={() => setOpenTransfer(true)}
                    className='!rounded-lg'
                  >
                    <Zap size={12} className='mr-1' />
                    {t('划转到余额')}
                  </Button>
                </div>

                {/* 统计数据 */}
                <div className='grid grid-cols-3 gap-6 mt-4'>
                  {/* 待使用收益 */}
                  <div className='text-center'>
                    <div
                      className='text-base sm:text-2xl font-bold mb-2'
                      style={{ color: 'white' }}
                    >
                      {renderQuota(userState?.user?.aff_quota || 0)}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <TrendingUp
                        size={14}
                        className='mr-1'
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '12px',
                        }}
                      >
                        {t('待使用收益')}
                      </span>
                    </div>
                  </div>

                  {/* 总收益 */}
                  <div className='text-center'>
                    <div
                      className='text-base sm:text-2xl font-bold mb-2'
                      style={{ color: 'white' }}
                    >
                      {renderQuota(userState?.user?.aff_history_quota || 0)}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <BarChart2
                        size={14}
                        className='mr-1'
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '12px',
                        }}
                      >
                        {t('总收益')}
                      </span>
                    </div>
                  </div>

                  {/* 邀请人数 */}
                  <div className='text-center'>
                    <div
                      className='text-base sm:text-2xl font-bold mb-2'
                      style={{ color: 'white' }}
                    >
                      {userState?.user?.aff_count || 0}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <Users
                        size={14}
                        className='mr-1'
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '12px',
                        }}
                      >
                        {t('邀请人数')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className='p-4'>
              {/* 邀请链接部分 */}
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground whitespace-nowrap'>{t('邀请链接')}</span>
                <Input
                  value={affLink}
                  readOnly
                  className='!rounded-lg flex-1'
                />
                <Button
                  onClick={handleAffLinkClick}
                  className='!rounded-lg'
                >
                  <Copy size={14} className='mr-1' />
                  {t('复制')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 奖励说明 */}
          <Card className='!rounded-xl w-full'>
            <CardContent className='p-4'>
              <span className='text-muted-foreground font-medium block mb-3'>{t('奖励说明')}</span>
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0' />
                  <span className='text-sm text-muted-foreground'>
                    {t('邀请好友注册，好友充值后您可获得相应奖励')}
                  </span>
                </div>

                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0' />
                  <span className='text-sm text-muted-foreground'>
                    {t('通过划转功能将奖励额度转入到您的账户余额中')}
                  </span>
                </div>

                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0' />
                  <span className='text-sm text-muted-foreground'>
                    {t('邀请的好友越多，获得的奖励越多')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationCard;
