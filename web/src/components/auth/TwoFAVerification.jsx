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
import { API, showError, showSuccess } from '../../helpers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import React, { useState } from 'react';

const TwoFAVerification = ({ onSuccess, onBack, isModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!verificationCode) {
      showError('请输入验证码');
      return;
    }
    // Validate code format
    if (useBackupCode && verificationCode.length !== 8) {
      showError('备用码必须是8位');
      return;
    } else if (!useBackupCode && !/^\d{6}$/.test(verificationCode)) {
      showError('验证码必须是6位数字');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/login/2fa', {
        code: verificationCode,
      });

      if (res.data.success) {
        showSuccess('登录成功');
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(res.data.data));
        if (onSuccess) {
          onSuccess(res.data.data);
        }
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (isModal) {
    return (
      <div className='space-y-4'>
        <p className='text-gray-600 dark:text-gray-300'>
          请输入认证器应用显示的验证码完成登录
        </p>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <Label htmlFor='code-modal'>
              {useBackupCode ? '备用码' : '验证码'}
            </Label>
            <Input
              id='code-modal'
              placeholder={
                useBackupCode ? '请输入8位备用码' : '请输入6位验证码'
              }
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className='mt-1.5 h-11'
              autoFocus
            />
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='w-full h-11 mb-4'
          >
            {loading ? '验证中...' : '验证并登录'}
          </Button>
        </form>

        <Separator />

        <div className='text-center'>
          <button
            type='button'
            className='text-sm text-blue-500 hover:text-blue-700 mr-4'
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setVerificationCode('');
            }}
          >
            {useBackupCode ? '使用认证器验证码' : '使用备用码'}
          </button>

          {onBack && (
            <button
              type='button'
              className='text-sm text-blue-500 hover:text-blue-700'
              onClick={onBack}
            >
              返回登录
            </button>
          )}
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
          <span className='text-xs text-muted-foreground'>
            <strong>提示：</strong>
            <br />
            • 验证码每30秒更新一次
            <br />
            • 如果无法获取验证码，请使用备用码
            <br />• 每个备用码只能使用一次
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center min-h-[60vh]'>
      <Card className='w-[400px] p-6'>
        <CardContent>
          <div className='text-center mb-6'>
            <h3 className='text-xl font-semibold'>两步验证</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              请输入认证器应用显示的验证码完成登录
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <Label htmlFor='code'>
                {useBackupCode ? '备用码' : '验证码'}
              </Label>
              <Input
                id='code'
                placeholder={
                  useBackupCode ? '请输入8位备用码' : '请输入6位验证码'
                }
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className='mt-1.5 h-11'
                autoFocus
              />
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full h-11 mb-4'
            >
              {loading ? '验证中...' : '验证并登录'}
            </Button>
          </form>

          <Separator />

          <div className='text-center mt-4'>
            <button
              type='button'
              className='text-sm text-blue-500 hover:text-blue-700 mr-4'
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setVerificationCode('');
              }}
            >
              {useBackupCode ? '使用认证器验证码' : '使用备用码'}
            </button>

            {onBack && (
              <button
                type='button'
                className='text-sm text-blue-500 hover:text-blue-700'
                onClick={onBack}
              >
                返回登录
              </button>
            )}
          </div>

          <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md'>
            <span className='text-xs text-muted-foreground'>
              <strong>提示：</strong>
              <br />
              • 验证码每30秒更新一次
              <br />
              • 如果无法获取验证码，请使用备用码
              <br />• 每个备用码只能使用一次
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFAVerification;
