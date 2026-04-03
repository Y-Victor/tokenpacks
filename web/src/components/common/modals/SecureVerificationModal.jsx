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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Loader2 } from 'lucide-react';

/**
 * 通用安全验证模态框组件
 * 配合 useSecureVerification Hook 使用
 * @param {Object} props
 * @param {boolean} props.visible - 是否显示模态框
 * @param {Object} props.verificationMethods - 可用的验证方式
 * @param {Object} props.verificationState - 当前验证状态
 * @param {Function} props.onVerify - 验证回调
 * @param {Function} props.onCancel - 取消回调
 * @param {Function} props.onCodeChange - 验证码变化回调
 * @param {Function} props.onMethodSwitch - 验证方式切换回调
 * @param {string} props.title - 模态框标题
 * @param {string} props.description - 验证描述文本
 */
const SecureVerificationModal = ({
  visible,
  verificationMethods,
  verificationState,
  onVerify,
  onCancel,
  onCodeChange,
  onMethodSwitch,
  title,
  description,
}) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const { has2FA, hasPasskey, passkeySupported } = verificationMethods;
  const { method, loading, code } = verificationState;

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      setVerifySuccess(false);
    } else {
      setIsAnimating(false);
    }
  }, [visible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && code.trim() && !loading && method === '2fa') {
      onVerify(method, code);
    }
    if (e.key === 'Escape' && !loading) {
      onCancel();
    }
  };

  // 如果用户没有启用任何验证方式
  if (visible && !has2FA && !hasPasskey) {
    return (
      <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className='max-w-[500px] max-w-[90vw]'>
          <DialogHeader>
            <DialogTitle>{title || t('安全验证')}</DialogTitle>
          </DialogHeader>
          <DialogDescription className='sr-only'>
            {t('需要安全验证')}
          </DialogDescription>
          <div className='text-center py-6'>
            <div className='mb-4'>
              <svg
                className='w-16 h-16 text-yellow-500 mx-auto mb-4'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <h4 className='text-lg font-semibold mb-2'>
              {t('需要安全验证')}
            </h4>
            <p className='text-muted-foreground'>
              {t('您需要先启用两步验证或 Passkey 才能查看敏感信息。')}
            </p>
            <br />
            <p className='text-muted-foreground'>
              {t('请前往个人设置 → 安全设置进行配置。')}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onCancel}>{t('确定')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open && !loading) onCancel(); }}>
      <DialogContent className='max-w-[460px]' style={{ maxWidth: 'calc(100vw - 32px)' }}>
        <DialogHeader>
          <DialogTitle>{title || t('安全验证')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {title || t('安全验证')}
        </DialogDescription>
        <div style={{ width: '100%' }}>
          {/* 描述信息 */}
          {description && (
            <p
              className='text-muted-foreground'
              style={{
                margin: '0 0 20px 0',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              {description}
            </p>
          )}

          {/* 验证方式选择 */}
          <Tabs
            value={method}
            onValueChange={onMethodSwitch}
            style={{ margin: 0 }}
          >
            <TabsList className='w-full'>
              {has2FA && (
                <TabsTrigger className='flex-1' value='2fa'>{t('两步验证')}</TabsTrigger>
              )}
              {hasPasskey && passkeySupported && (
                <TabsTrigger className='flex-1' value='passkey'>{t('Passkey')}</TabsTrigger>
              )}
            </TabsList>
            {has2FA && (
              <TabsContent value='2fa'>
                <div style={{ paddingTop: '20px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div className='relative'>
                      <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                        <svg
                          style={{
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                          }}
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <Input
                        placeholder={t('请输入6位验证码或8位备用码')}
                        value={code}
                        onChange={(e) => onCodeChange(e.target.value)}
                        maxLength={8}
                        onKeyDown={handleKeyDown}
                        autoFocus={method === '2fa'}
                        disabled={loading}
                        className='pl-10 h-10'
                      />
                    </div>
                  </div>

                  <p
                    className='text-muted-foreground'
                    style={{
                      display: 'block',
                      marginBottom: '20px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  >
                    {t('从认证器应用中获取验证码，或使用备用码')}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button variant='outline' onClick={onCancel} disabled={loading}>
                      {t('取消')}
                    </Button>
                    <Button
                      variant='default'
                      disabled={!code.trim() || loading}
                      onClick={() => onVerify(method, code)}
                    >
                      {loading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                      {t('验证')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}

            {hasPasskey && passkeySupported && (
              <TabsContent value='passkey'>
                <div style={{ paddingTop: '20px' }}>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                      }}
                      className='bg-primary/10'
                    >
                      <svg
                        style={{
                          width: 28,
                          height: 28,
                        }}
                        className='text-primary'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <h5
                      className='font-semibold'
                      style={{ margin: '0 0 8px', fontSize: '16px' }}
                    >
                      {t('使用 Passkey 验证')}
                    </h5>
                    <p
                      className='text-muted-foreground'
                      style={{
                        display: 'block',
                        margin: 0,
                        fontSize: '13px',
                        lineHeight: '1.5',
                      }}
                    >
                      {t('点击验证按钮，使用您的生物特征或安全密钥')}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button variant='outline' onClick={onCancel} disabled={loading}>
                      {t('取消')}
                    </Button>
                    <Button
                      variant='default'
                      disabled={loading}
                      onClick={() => onVerify(method)}
                    >
                      {loading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                      {t('验证 Passkey')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecureVerificationModal;
