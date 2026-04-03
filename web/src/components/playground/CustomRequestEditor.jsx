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

import React, { useState, useEffect } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Code, Edit, Check, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomRequestEditor = ({
  customRequestMode,
  customRequestBody,
  onCustomRequestModeChange,
  onCustomRequestBodyChange,
  defaultPayload,
}) => {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [localValue, setLocalValue] = useState(customRequestBody || '');

  // 当切换到自定义模式时，用默认payload初始化
  useEffect(() => {
    if (
      customRequestMode &&
      (!customRequestBody || customRequestBody.trim() === '')
    ) {
      const defaultJson = defaultPayload
        ? JSON.stringify(defaultPayload, null, 2)
        : '';
      setLocalValue(defaultJson);
      onCustomRequestBodyChange(defaultJson);
    }
  }, [
    customRequestMode,
    defaultPayload,
    customRequestBody,
    onCustomRequestBodyChange,
  ]);

  // 同步外部传入的customRequestBody到本地状态
  useEffect(() => {
    if (customRequestBody !== localValue) {
      setLocalValue(customRequestBody || '');
      validateJson(customRequestBody || '');
    }
  }, [customRequestBody]);

  // 验证JSON格式
  const validateJson = (value) => {
    if (!value.trim()) {
      setIsValid(true);
      setErrorMessage('');
      return true;
    }

    try {
      JSON.parse(value);
      setIsValid(true);
      setErrorMessage('');
      return true;
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`${t('JSON格式错误')}: ${error.message}`);
      return false;
    }
  };

  const handleValueChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);
    validateJson(value);
    // 始终保存用户输入，让预览逻辑处理JSON解析错误
    onCustomRequestBodyChange(value);
  };

  const handleModeToggle = (enabled) => {
    onCustomRequestModeChange(enabled);
    if (enabled && defaultPayload) {
      const defaultJson = JSON.stringify(defaultPayload, null, 2);
      setLocalValue(defaultJson);
      onCustomRequestBodyChange(defaultJson);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onCustomRequestBodyChange(formatted);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      // 如果格式化失败，保持原样
    }
  };

  return (
    <div className='space-y-4'>
      {/* 自定义模式开关 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Code size={16} className='text-gray-500' />
          <span className='text-sm font-semibold'>
            {t('自定义请求体模式')}
          </span>
        </div>
        <Switch
          checked={customRequestMode}
          onCheckedChange={handleModeToggle}
        />
      </div>

      {customRequestMode && (
        <>
          {/* 提示信息 */}
          <Alert variant='warning' className='!rounded-lg'>
            <AlertTriangle size={16} />
            <AlertDescription>
              {t(
                '启用此模式后，将使用您自定义的请求体发送API请求，模型配置面板的参数设置将被忽略。',
              )}
            </AlertDescription>
          </Alert>

          {/* JSON编辑器 */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-semibold'>
                {t('请求体 JSON')}
              </span>
              <div className='flex items-center gap-2'>
                {isValid ? (
                  <div className='flex items-center gap-1 text-green-600'>
                    <Check size={14} />
                    <span className='text-xs'>
                      {t('格式正确')}
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center gap-1 text-red-600'>
                    <X size={14} />
                    <span className='text-xs'>
                      {t('格式错误')}
                    </span>
                  </div>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={formatJson}
                  disabled={!isValid}
                  className='!rounded-lg'
                >
                  <Edit size={14} className='mr-1' />
                  {t('格式化')}
                </Button>
              </div>
            </div>

            <Textarea
              value={localValue}
              onChange={handleValueChange}
              placeholder='{"model": "gpt-4o", "messages": [...], ...}'
              rows={8}
              className={`custom-request-textarea !rounded-lg font-mono text-sm ${!isValid ? '!border-red-500' : ''}`}
              style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                lineHeight: '1.5',
              }}
            />

            {!isValid && errorMessage && (
              <span className='text-xs text-red-500 mt-1 block'>
                {errorMessage}
              </span>
            )}

            <span className='text-xs text-gray-500 mt-2 block'>
              {t(
                '请输入有效的JSON格式的请求体。您可以参考预览面板中的默认请求体格式。',
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomRequestEditor;
