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

import React, { useEffect, useState, useContext } from 'react';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { StatusContext } from '../../../context/Status';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Switch } from '../../../components/ui/switch';

export default function SettingsHeaderNavModules(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statusState, statusDispatch] = useContext(StatusContext);

  // 顶栏模块管理状态
  const [headerNavModules, setHeaderNavModules] = useState({
    home: true,
    console: true,
    pricing: {
      enabled: true,
      requireAuth: false, // 默认不需要登录鉴权
    },
    docs: true,
    about: true,
  });

  // 处理顶栏模块配置变更
  function handleHeaderNavModuleChange(moduleKey) {
    return (checked) => {
      const newModules = { ...headerNavModules };
      if (moduleKey === 'pricing') {
        // 对于pricing模块，只更新enabled属性
        newModules[moduleKey] = {
          ...newModules[moduleKey],
          enabled: checked,
        };
      } else {
        newModules[moduleKey] = checked;
      }
      setHeaderNavModules(newModules);
    };
  }

  // 处理模型广场权限控制变更
  function handlePricingAuthChange(checked) {
    const newModules = { ...headerNavModules };
    newModules.pricing = {
      ...newModules.pricing,
      requireAuth: checked,
    };
    setHeaderNavModules(newModules);
  }

  // 重置顶栏模块为默认配置
  function resetHeaderNavModules() {
    const defaultModules = {
      home: true,
      console: true,
      pricing: {
        enabled: true,
        requireAuth: false,
      },
      docs: true,
      about: true,
    };
    setHeaderNavModules(defaultModules);
    showSuccess(t('已重置为默认配置'));
  }

  // 保存配置
  async function onSubmit() {
    setLoading(true);
    try {
      const res = await API.put('/api/option/', {
        key: 'HeaderNavModules',
        value: JSON.stringify(headerNavModules),
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('保存成功'));

        // 立即更新StatusContext中的状态
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            HeaderNavModules: JSON.stringify(headerNavModules),
          },
        });

        // 刷新父组件状态
        if (props.refresh) {
          await props.refresh();
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 从 props.options 中获取配置
    if (props.options && props.options.HeaderNavModules) {
      try {
        const modules = JSON.parse(props.options.HeaderNavModules);

        // 处理向后兼容性：如果pricing是boolean，转换为对象格式
        if (typeof modules.pricing === 'boolean') {
          modules.pricing = {
            enabled: modules.pricing,
            requireAuth: false, // 默认不需要登录鉴权
          };
        }

        setHeaderNavModules(modules);
      } catch (error) {
        // 使用默认配置
        const defaultModules = {
          home: true,
          console: true,
          pricing: {
            enabled: true,
            requireAuth: false,
          },
          docs: true,
          about: true,
        };
        setHeaderNavModules(defaultModules);
      }
    }
  }, [props.options]);

  // 模块配置数据
  const moduleConfigs = [
    {
      key: 'home',
      title: t('首页'),
      description: t('用户主页，展示系统信息'),
    },
    {
      key: 'console',
      title: t('控制台'),
      description: t('用户控制面板，管理账户'),
    },
    {
      key: 'pricing',
      title: t('模型广场'),
      description: t('模型定价，需要登录访问'),
      hasSubConfig: true, // 标识该模块有子配置
    },
    {
      key: 'docs',
      title: t('文档'),
      description: t('系统文档和帮助信息'),
    },
    {
      key: 'about',
      title: t('关于'),
      description: t('关于系统的详细信息'),
    },
  ];

  return (
    <Card>
      <CardContent>
        <div className='mb-4'>
          <h4 className='text-base font-semibold'>{t('顶栏管理')}</h4>
          <p className='text-sm text-muted-foreground'>{t('控制顶栏模块显示状态，全局生效')}</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          {moduleConfigs.map((module) => (
            <Card
              key={module.key}
              className='min-h-[80px] hover:shadow-sm transition-all'
            >
              <CardContent className='p-4'>
                <div className='flex justify-between items-center h-full'>
                  <div className='flex-1 text-left'>
                    <div className='font-semibold text-sm mb-1'>
                      {module.title}
                    </div>
                    <span className='text-xs text-muted-foreground block leading-snug'>
                      {module.description}
                    </span>
                  </div>
                  <div className='ml-4'>
                    <Switch
                      checked={
                        module.key === 'pricing'
                          ? headerNavModules[module.key]?.enabled
                          : headerNavModules[module.key]
                      }
                      onCheckedChange={handleHeaderNavModuleChange(module.key)}
                    />
                  </div>
                </div>

                {/* 为模型广场添加权限控制子开关 */}
                {module.key === 'pricing' &&
                  (module.key === 'pricing'
                    ? headerNavModules[module.key]?.enabled
                    : headerNavModules[module.key]) && (
                    <div className='border-t mt-3 pt-3'>
                      <div className='flex justify-between items-center'>
                        <div className='flex-1 text-left'>
                          <div className='font-medium text-xs mb-0.5'>
                            {t('需要登录访问')}
                          </div>
                          <span className='text-[11px] text-muted-foreground block leading-snug'>
                            {t('开启后未登录用户无法访问模型广场')}
                          </span>
                        </div>
                        <div className='ml-4'>
                          <Switch
                            checked={
                              headerNavModules.pricing?.requireAuth || false
                            }
                            onCheckedChange={handlePricingAuthChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='flex gap-3 items-center pt-2 border-t'>
          <Button variant='outline' onClick={resetHeaderNavModules}>
            {t('重置为默认')}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {t('保存设置')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
