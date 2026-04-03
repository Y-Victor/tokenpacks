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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '../../ui/separator';
import { Button } from '../../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

// 唯一 ID 生成器，确保在组件生命周期内稳定且递增
const generateUniqueId = (() => {
  let counter = 0;
  return () => `kv_${counter++}`;
})();

const JSONEditor = ({
  value = '',
  onChange,
  field,
  label,
  placeholder,
  extraText,
  extraFooter,
  showClear = true,
  template,
  templateLabel,
  editorType = 'keyValue',
  rules = [],
  formApi = null,
  renderStringValueSuffix,
  ...props
}) => {
  const { t } = useTranslation();

  // 将对象转换为键值对数组（包含唯一ID）
  const objectToKeyValueArray = useCallback((obj, prevPairs = []) => {
    if (!obj || typeof obj !== 'object') return [];

    const entries = Object.entries(obj);
    return entries.map(([key, value], index) => {
      // 如果上一次转换后同位置的键一致，则沿用其 id，保持 React key 稳定
      const prev = prevPairs[index];
      const shouldReuseId = prev && prev.key === key;
      return {
        id: shouldReuseId ? prev.id : generateUniqueId(),
        key,
        value,
      };
    });
  }, []);

  // 将键值对数组转换为对象（重复键时后面的会覆盖前面的）
  const keyValueArrayToObject = useCallback((arr) => {
    const result = {};
    arr.forEach((item) => {
      if (item.key) {
        result[item.key] = item.value;
      }
    });
    return result;
  }, []);

  // 初始化键值对数组
  const [keyValuePairs, setKeyValuePairs] = useState(() => {
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return objectToKeyValueArray(parsed);
      } catch (error) {
        return [];
      }
    }
    if (typeof value === 'object' && value !== null) {
      return objectToKeyValueArray(value);
    }
    return [];
  });

  // 手动模式下的本地文本缓冲
  const [manualText, setManualText] = useState(() => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object')
      return JSON.stringify(value, null, 2);
    return '';
  });

  // 根据键数量决定默认编辑模式
  const [editMode, setEditMode] = useState(() => {
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const keyCount = Object.keys(parsed).length;
        return keyCount > 10 ? 'manual' : 'visual';
      } catch (error) {
        return 'manual';
      }
    }
    return 'visual';
  });

  const [jsonError, setJsonError] = useState('');

  // 计算重复的键
  const duplicateKeys = useMemo(() => {
    const keyCount = {};
    const duplicates = new Set();

    keyValuePairs.forEach((pair) => {
      if (pair.key) {
        keyCount[pair.key] = (keyCount[pair.key] || 0) + 1;
        if (keyCount[pair.key] > 1) {
          duplicates.add(pair.key);
        }
      }
    });

    return duplicates;
  }, [keyValuePairs]);

  // 数据同步 - 当value变化时更新键值对数组
  useEffect(() => {
    try {
      let parsed = {};
      if (typeof value === 'string' && value.trim()) {
        parsed = JSON.parse(value);
      } else if (typeof value === 'object' && value !== null) {
        parsed = value;
      }

      // 只在外部值真正改变时更新，避免循环更新
      const currentObj = keyValueArrayToObject(keyValuePairs);
      if (JSON.stringify(parsed) !== JSON.stringify(currentObj)) {
        setKeyValuePairs(objectToKeyValueArray(parsed, keyValuePairs));
      }
      setJsonError('');
    } catch (error) {
      console.log('JSON解析失败:', error.message);
      setJsonError(error.message);
    }
  }, [value]);

  // 外部 value 变化时，若不在手动模式，则同步手动文本
  useEffect(() => {
    if (editMode !== 'manual') {
      if (typeof value === 'string') setManualText(value);
      else if (value && typeof value === 'object')
        setManualText(JSON.stringify(value, null, 2));
      else setManualText('');
    }
  }, [value, editMode]);

  // 处理可视化编辑的数据变化
  const handleVisualChange = useCallback(
    (newPairs) => {
      setKeyValuePairs(newPairs);
      const jsonObject = keyValueArrayToObject(newPairs);
      const jsonString =
        Object.keys(jsonObject).length === 0
          ? ''
          : JSON.stringify(jsonObject, null, 2);

      setJsonError('');

      // 通过formApi设置值
      if (formApi && field) {
        formApi.setValue(field, jsonString);
      }

      onChange?.(jsonString);
    },
    [onChange, formApi, field, keyValueArrayToObject],
  );

  // 处理手动编辑的数据变化
  const handleManualChange = useCallback(
    (newValue) => {
      setManualText(newValue);
      if (newValue && newValue.trim()) {
        try {
          const parsed = JSON.parse(newValue);
          setKeyValuePairs(objectToKeyValueArray(parsed, keyValuePairs));
          setJsonError('');
          onChange?.(newValue);
        } catch (error) {
          setJsonError(error.message);
        }
      } else {
        setKeyValuePairs([]);
        setJsonError('');
        onChange?.('');
      }
    },
    [onChange, objectToKeyValueArray, keyValuePairs],
  );

  // 切换编辑模式
  const toggleEditMode = useCallback(() => {
    if (editMode === 'visual') {
      const jsonObject = keyValueArrayToObject(keyValuePairs);
      setManualText(
        Object.keys(jsonObject).length === 0
          ? ''
          : JSON.stringify(jsonObject, null, 2),
      );
      setEditMode('manual');
    } else {
      try {
        let parsed = {};
        if (manualText && manualText.trim()) {
          parsed = JSON.parse(manualText);
        } else if (typeof value === 'string' && value.trim()) {
          parsed = JSON.parse(value);
        } else if (typeof value === 'object' && value !== null) {
          parsed = value;
        }
        setKeyValuePairs(objectToKeyValueArray(parsed, keyValuePairs));
        setJsonError('');
        setEditMode('visual');
      } catch (error) {
        setJsonError(error.message);
        return;
      }
    }
  }, [
    editMode,
    value,
    manualText,
    keyValuePairs,
    keyValueArrayToObject,
    objectToKeyValueArray,
  ]);

  // 添加键值对
  const addKeyValue = useCallback(() => {
    const newPairs = [...keyValuePairs];
    const existingKeys = newPairs.map((p) => p.key);
    let counter = 1;
    let newKey = `field_${counter}`;
    while (existingKeys.includes(newKey)) {
      counter += 1;
      newKey = `field_${counter}`;
    }
    newPairs.push({
      id: generateUniqueId(),
      key: newKey,
      value: '',
    });
    handleVisualChange(newPairs);
  }, [keyValuePairs, handleVisualChange]);

  // 删除键值对
  const removeKeyValue = useCallback(
    (id) => {
      const newPairs = keyValuePairs.filter((pair) => pair.id !== id);
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // 更新键名
  const updateKey = useCallback(
    (id, newKey) => {
      const newPairs = keyValuePairs.map((pair) =>
        pair.id === id ? { ...pair, key: newKey } : pair,
      );
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // 更新值
  const updateValue = useCallback(
    (id, newValue) => {
      const newPairs = keyValuePairs.map((pair) =>
        pair.id === id ? { ...pair, value: newValue } : pair,
      );
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // 填入模板
  const fillTemplate = useCallback(() => {
    if (template) {
      const templateString = JSON.stringify(template, null, 2);

      if (formApi && field) {
        formApi.setValue(field, templateString);
      }

      setManualText(templateString);
      setKeyValuePairs(objectToKeyValueArray(template, keyValuePairs));
      onChange?.(templateString);
      setJsonError('');
    }
  }, [
    template,
    onChange,
    formApi,
    field,
    objectToKeyValueArray,
    keyValuePairs,
  ]);

  // 渲染值输入控件（支持嵌套）
  const renderValueInput = (pairId, pairKey, value) => {
    const valueType = typeof value;

    if (valueType === 'boolean') {
      return (
        <div className='flex items-center'>
          <Switch
            checked={value}
            onCheckedChange={(newValue) => updateValue(pairId, newValue)}
          />
          <span className='text-muted-foreground ml-2'>
            {value ? t('true') : t('false')}
          </span>
        </div>
      );
    }

    if (valueType === 'number') {
      return (
        <Input
          type='number'
          value={String(value)}
          onChange={(e) => {
            const val = e.target.value;
            updateValue(pairId, val === '' ? 0 : Number(val));
          }}
          className='w-full'
          placeholder={t('输入数字')}
        />
      );
    }

    if (valueType === 'object' && value !== null) {
      // 简化嵌套对象的处理，使用Textarea
      return (
        <Textarea
          rows={2}
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            const txt = e.target.value;
            try {
              const obj = txt.trim() ? JSON.parse(txt) : {};
              updateValue(pairId, obj);
            } catch {
              // 忽略解析错误
            }
          }}
          placeholder={t('输入JSON对象')}
        />
      );
    }

    // 字符串或其他原始类型
    return (
      <div className='relative'>
        <Input
          placeholder={t('参数值')}
          value={String(value)}
          onChange={(e) => {
            const newValue = e.target.value;
            let convertedValue = newValue;
            if (newValue === 'true') convertedValue = true;
            else if (newValue === 'false') convertedValue = false;
            else if (!isNaN(newValue) && newValue !== '') {
              const num = Number(newValue);
              // 检查是否为整数
              if (Number.isInteger(num)) {
                convertedValue = num;
              }
            }
            updateValue(pairId, convertedValue);
          }}
        />
        {renderStringValueSuffix?.({ pairId, pairKey, value }) && (
          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
            {renderStringValueSuffix({ pairId, pairKey, value })}
          </div>
        )}
      </div>
    );
  };

  // 渲染键值对编辑器
  const renderKeyValueEditor = () => {
    return (
      <div className='space-y-1'>
        {/* 重复键警告 */}
        {duplicateKeys.size > 0 && (
          <Alert variant='warning' className='mb-3'>
            <AlertDescription>
              <div>
                <span className='font-semibold'>{t('存在重复的键名：')}</span>
                <span>{Array.from(duplicateKeys).join(', ')}</span>
                <br />
                <span className='text-muted-foreground text-xs'>
                  {t('注意：JSON中重复的键只会保留最后一个同名键的值')}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {keyValuePairs.length === 0 && (
          <div className='text-center py-6 px-4'>
            <span className='text-muted-foreground text-sm'>
              {t('暂无数据，点击下方按钮添加键值对')}
            </span>
          </div>
        )}

        {keyValuePairs.map((pair, index) => {
          const isDuplicate = duplicateKeys.has(pair.key);
          const isLastDuplicate =
            isDuplicate &&
            keyValuePairs.slice(index + 1).every((p) => p.key !== pair.key);

          return (
            <div key={pair.id} className='grid grid-cols-24 gap-2 items-center'>
              <div className='col-span-10'>
                <div className='relative'>
                  <Input
                    placeholder={t('键名')}
                    value={pair.key}
                    onChange={(e) => updateKey(pair.id, e.target.value)}
                    className={isDuplicate ? 'border-yellow-500' : ''}
                  />
                  {isDuplicate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle
                            className='absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5'
                            style={{
                              color: isLastDuplicate ? '#ff7d00' : '#faad14',
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {isLastDuplicate
                            ? t('这是重复键中的最后一个，其值将被使用')
                            : t('重复的键名，此值将被后面的同名键覆盖')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <div className='col-span-12'>
                {renderValueInput(pair.id, pair.key, pair.value)}
              </div>
              <div className='col-span-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive w-full'
                  onClick={() => removeKeyValue(pair.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          );
        })}

        <div className='mt-2 flex justify-center'>
          <Button
            variant='outline'
            onClick={addKeyValue}
          >
            <Plus className='h-4 w-4 mr-1' />
            {t('添加键值对')}
          </Button>
        </div>
      </div>
    );
  };

  // 渲染区域编辑器（特殊格式）- 也需要改造以支持重复键
  const renderRegionEditor = () => {
    const defaultPair = keyValuePairs.find((pair) => pair.key === 'default');
    const modelPairs = keyValuePairs.filter((pair) => pair.key !== 'default');

    return (
      <div className='space-y-2'>
        {/* 重复键警告 */}
        {duplicateKeys.size > 0 && (
          <Alert variant='warning' className='mb-3'>
            <AlertDescription>
              <div>
                <span className='font-semibold'>{t('存在重复的键名：')}</span>
                <span>{Array.from(duplicateKeys).join(', ')}</span>
                <br />
                <span className='text-muted-foreground text-xs'>
                  {t('注意：JSON中重复的键只会保留最后一个同名键的值')}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 默认区域 */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1.5'>{t('默认区域')}</label>
          <Input
            placeholder={t('默认区域，如: us-central1')}
            value={defaultPair ? defaultPair.value : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (defaultPair) {
                updateValue(defaultPair.id, val);
              } else {
                const newPairs = [
                  ...keyValuePairs,
                  {
                    id: generateUniqueId(),
                    key: 'default',
                    value: val,
                  },
                ];
                handleVisualChange(newPairs);
              }
            }}
          />
        </div>

        {/* 模型专用区域 */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1.5'>{t('模型专用区域')}</label>
          <div>
            {modelPairs.map((pair) => {
              const isDuplicate = duplicateKeys.has(pair.key);
              return (
                <div key={pair.id} className='grid grid-cols-24 gap-2 items-center mb-2'>
                  <div className='col-span-10'>
                    <div className='relative'>
                      <Input
                        placeholder={t('模型名称')}
                        value={pair.key}
                        onChange={(e) => updateKey(pair.id, e.target.value)}
                        className={isDuplicate ? 'border-yellow-500' : ''}
                      />
                      {isDuplicate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle
                                className='absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5'
                                style={{ color: '#faad14' }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{t('重复的键名')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <div className='col-span-12'>
                    <Input
                      placeholder={t('区域')}
                      value={pair.value}
                      onChange={(e) => updateValue(pair.id, e.target.value)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-destructive w-full'
                      onClick={() => removeKeyValue(pair.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className='mt-2 flex justify-center'>
              <Button
                variant='outline'
                onClick={addKeyValue}
              >
                <Plus className='h-4 w-4 mr-1' />
                {t('添加模型区域')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染可视化编辑器
  const renderVisualEditor = () => {
    switch (editorType) {
      case 'region':
        return renderRegionEditor();
      case 'object':
      case 'keyValue':
      default:
        return renderKeyValueEditor();
    }
  };

  const hasJsonError = jsonError && jsonError.trim() !== '';

  return (
    <div className='mb-4'>
      {label && (
        <label className='block text-sm font-medium mb-1.5'>{label}</label>
      )}
      <Card className='rounded-2xl'>
        <CardHeader className='px-4 py-3'>
          <div className='flex justify-between items-center'>
            <Tabs
              value={editMode}
              onValueChange={(key) => {
                if (key === 'manual' && editMode === 'visual') {
                  setEditMode('manual');
                } else if (key === 'visual' && editMode === 'manual') {
                  toggleEditMode();
                }
              }}
            >
              <TabsList>
                <TabsTrigger value='visual'>{t('可视化')}</TabsTrigger>
                <TabsTrigger value='manual'>{t('手动编辑')}</TabsTrigger>
              </TabsList>
            </Tabs>

            {template && templateLabel && (
              <Button variant='ghost' onClick={fillTemplate} size='sm'>
                {templateLabel}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {/* JSON错误提示 */}
          {hasJsonError && (
            <Alert variant='destructive' className='mb-3'>
              <AlertDescription>{`JSON 格式错误: ${jsonError}`}</AlertDescription>
            </Alert>
          )}

          {/* 编辑器内容 */}
          {editMode === 'visual' ? (
            <div>
              {renderVisualEditor()}
              {/* 隐藏的input用于数据绑定 */}
              <input
                type='hidden'
                name={field}
                value={typeof value === 'string' ? value : JSON.stringify(value)}
              />
            </div>
          ) : (
            <div>
              <Textarea
                placeholder={placeholder}
                value={manualText}
                onChange={(e) => handleManualChange(e.target.value)}
                rows={Math.max(8, manualText ? manualText.split('\n').length : 8)}
              />
              {/* 隐藏的input用于数据绑定 */}
              <input
                type='hidden'
                name={field}
                value={typeof value === 'string' ? value : JSON.stringify(value)}
              />
            </div>
          )}

          {/* 额外文本显示在卡片底部 */}
          {extraText && (
            <div className='flex items-center gap-3 my-3'>
              <Separator className='flex-1' />
              <span className='text-muted-foreground text-xs'>
                {extraText}
              </span>
              <Separator className='flex-1' />
            </div>
          )}
          {extraFooter && <div className='mt-1'>{extraFooter}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default JSONEditor;
