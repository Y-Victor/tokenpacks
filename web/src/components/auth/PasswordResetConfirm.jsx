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
import {
  API,
  copy,
  showError,
  showNotice,
  getLogo,
  getSystemName,
} from '../../helpers';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, Lock, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PasswordResetConfirm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
    token: '',
  });
  const { email, token } = inputs;
  const isValidResetLink = email && token;

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    let token = searchParams.get('token');
    let email = searchParams.get('email');
    setInputs({
      token: token || '',
      email: email || '',
    });
  }, [searchParams]);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!email || !token) {
      showError(t('无效的重置链接，请重新发起密码重置请求'));
      return;
    }
    setDisableButton(true);
    setLoading(true);
    const res = await API.post(`/api/user/reset`, {
      email,
      token,
    });
    const { success, message } = res.data;
    if (success) {
      let password = res.data.data;
      setNewPassword(password);
      await copy(password);
      showNotice(`${t('密码已重置并已复制到剪贴板：')} ${password}`);
    } else {
      showError(message);
    }
    setLoading(false);
  }

  return (
    <div className='relative overflow-hidden bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      {/* 背景模糊晕染球 */}
      <div
        className='blur-ball blur-ball-indigo'
        style={{ top: '-80px', right: '-80px', transform: 'none' }}
      />
      <div
        className='blur-ball blur-ball-teal'
        style={{ top: '50%', left: '-120px' }}
      />
      <div className='w-full max-w-sm mt-[60px]'>
        <div className='flex flex-col items-center'>
          <div className='w-full max-w-md'>
            <div className='flex items-center justify-center mb-6 gap-2'>
              <img src={logo} alt='Logo' className='h-10 rounded-full' />
              <h3 className='text-xl font-semibold text-gray-800'>
                {systemName}
              </h3>
            </div>

            <Card className='border-0 rounded-2xl overflow-hidden'>
              <div className='flex justify-center pt-6 pb-2'>
                <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                  {t('密码重置确认')}
                </h3>
              </div>
              <div className='px-6 py-8'>
                {!isValidResetLink && (
                  <Alert variant='destructive' className='mb-4 rounded-lg'>
                    <AlertDescription>
                      {t('无效的重置链接，请重新发起密码重置请求')}
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <Label htmlFor='email'>{t('邮箱')}</Label>
                    <div className='relative mt-1.5'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='email'
                        name='email'
                        disabled={true}
                        value={email}
                        readOnly
                        placeholder={email ? '' : t('等待获取邮箱信息...')}
                        className='pl-9'
                      />
                    </div>
                  </div>

                  {newPassword && (
                    <div>
                      <Label htmlFor='newPassword'>{t('新密码')}</Label>
                      <div className='relative mt-1.5'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                          id='newPassword'
                          name='newPassword'
                          disabled={true}
                          value={newPassword}
                          readOnly
                          className='pl-9 pr-20'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-1 top-1/2 -translate-y-1/2'
                          onClick={async () => {
                            await copy(newPassword);
                            showNotice(
                              `${t('密码已复制到剪贴板：')} ${newPassword}`,
                            );
                          }}
                        >
                          <Copy className='h-4 w-4 mr-1' />
                          {t('复制')}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className='space-y-2 pt-2'>
                    <Button
                      type='submit'
                      className='w-full rounded-full'
                      disabled={
                        loading ||
                        disableButton ||
                        !!newPassword ||
                        !isValidResetLink
                      }
                    >
                      {loading
                        ? '...'
                        : newPassword
                          ? t('密码重置完成')
                          : t('确认重置密码')}
                    </Button>
                  </div>
                </form>

                <div className='mt-6 text-center text-sm'>
                  <span>
                    <Link
                      to='/login'
                      className='text-blue-600 hover:text-blue-800 font-medium'
                    >
                      {t('返回登录')}
                    </Link>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
