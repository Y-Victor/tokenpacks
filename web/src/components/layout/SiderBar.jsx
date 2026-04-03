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

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLucideIcon } from '../../helpers/render';
import { ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useSidebarCollapsed } from '../../hooks/common/useSidebarCollapsed';
import { useSidebar } from '../../hooks/common/useSidebar';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import { isAdmin, isRoot, showError } from '../../helpers';
import SkeletonWrapper from './components/SkeletonWrapper';
import { cn } from '../../lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

const routerMap = {
  home: '/',
  channel: '/console/channel',
  token: '/console/token',
  redemption: '/console/redemption',
  topup: '/console/topup',
  user: '/console/user',
  subscription: '/console/subscription',
  log: '/console/log',
  midjourney: '/console/midjourney',
  setting: '/console/setting',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  task: '/console/task',
  models: '/console/models',
  deployment: '/console/deployment',
  playground: '/console/playground',
  personal: '/console/personal',
};

const SiderBar = ({ onNavigate = () => {} }) => {
  const { t } = useTranslation();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const {
    isModuleVisible,
    hasSectionVisibleModules,
    loading: sidebarLoading,
  } = useSidebar();

  const showSkeleton = useMinimumLoadingTime(sidebarLoading, 200);

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  const workspaceItems = useMemo(() => {
    const items = [
      {
        text: t('数据看板'),
        itemKey: 'detail',
        to: '/detail',
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('令牌管理'),
        itemKey: 'token',
        to: '/token',
      },
      {
        text: t('使用日志'),
        itemKey: 'log',
        to: '/log',
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        className:
          localStorage.getItem('enable_drawing') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        className:
          localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
      },
    ];

    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('console', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [
    localStorage.getItem('enable_data_export'),
    localStorage.getItem('enable_drawing'),
    localStorage.getItem('enable_task'),
    t,
    isModuleVisible,
  ]);

  const financeItems = useMemo(() => {
    const items = [
      {
        text: t('钱包管理'),
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
      },
    ];

    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('personal', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [t, isModuleVisible]);

  const adminItems = useMemo(() => {
    const items = [
      {
        text: t('渠道管理'),
        itemKey: 'channel',
        to: '/channel',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('订阅管理'),
        itemKey: 'subscription',
        to: '/subscription',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型管理'),
        itemKey: 'models',
        to: '/console/models',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型部署'),
        itemKey: 'deployment',
        to: '/deployment',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('兑换码管理'),
        itemKey: 'redemption',
        to: '/redemption',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        className: isRoot() ? '' : 'tableHiddle',
      },
    ];

    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('admin', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [isAdmin(), isRoot(), t, isModuleVisible]);

  const chatMenuItems = useMemo(() => {
    const items = [
      {
        text: t('操练场'),
        itemKey: 'playground',
        to: '/playground',
      },
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
      },
    ];

    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('chat', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [chatItems, t, isModuleVisible]);

  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };

    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/console/chat/' + i;
      }
    }

    setRouterMapState(newRouterMap);
    return newRouterMap;
  };

  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatItems = [];
          for (let i = 0; i < chats.length; i++) {
            let shouldSkip = false;
            let chat = {};
            for (let key in chats[i]) {
              let link = chats[i][key];
              if (typeof link !== 'string') continue;
              if (link.startsWith('fluent') || link.startsWith('ccswitch')) {
                shouldSkip = true;
                break;
              }
              chat.text = key;
              chat.itemKey = 'chat' + i;
              chat.to = '/console/chat/' + i;
            }
            if (shouldSkip || !chat.text) continue;
            chatItems.push(chat);
          }
          setChatItems(chatItems);
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        showError('聊天数据解析失败');
      }
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMapState).find(
      (key) => routerMapState[key] === currentPath,
    );

    if (!matchingKey && currentPath.startsWith('/console/chat/')) {
      const chatIndex = currentPath.split('/').pop();
      if (!isNaN(chatIndex)) {
        matchingKey = 'chat' + chatIndex;
      } else {
        matchingKey = 'chat';
      }
    }

    if (matchingKey) {
      setSelectedKeys([matchingKey]);
    }
  }, [location.pathname, routerMapState]);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  const renderNavItem = (item) => {
    if (item.className === 'tableHiddle') return null;

    const isSelected = selectedKeys.includes(item.itemKey);
    const to = routerMapState[item.itemKey] || routerMap[item.itemKey];

    const content = (
      <div
        className={cn(
          'sidebar-nav-item group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer',
          isSelected
            ? 'sidebar-nav-item-selected text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
        onClick={() => {
          setSelectedKeys([item.itemKey]);
          onNavigate();
        }}
      >
        <div className='sidebar-icon-container flex-shrink-0'>
          {getLucideIcon(item.itemKey, isSelected)}
        </div>
        {!collapsed && <span className='truncate'>{item.text}</span>}
      </div>
    );

    if (to) {
      return (
        <Link
          key={item.itemKey}
          to={to}
          className='block'
          style={{ textDecoration: 'none' }}
        >
          {content}
        </Link>
      );
    }

    return <div key={item.itemKey}>{content}</div>;
  };

  const renderSubItem = (item) => {
    if (item.items && item.items.length > 0) {
      const isOpen = openedKeys.includes(item.itemKey);
      const isSelected = selectedKeys.includes(item.itemKey);

      return (
        <div key={item.itemKey}>
          <div
            className={cn(
              'sidebar-nav-item group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer',
              isSelected
                ? 'sidebar-nav-item-selected text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={() => {
              if (isOpen) {
                setOpenedKeys(openedKeys.filter((k) => k !== item.itemKey));
              } else {
                setOpenedKeys([...openedKeys, item.itemKey]);
              }
            }}
          >
            <div className='sidebar-icon-container flex-shrink-0'>
              {getLucideIcon(item.itemKey, isSelected)}
            </div>
            {!collapsed && (
              <>
                <span className='truncate flex-1'>{item.text}</span>
                <ChevronRightIcon
                  size={14}
                  className={cn(
                    'transition-transform',
                    isOpen && 'rotate-90',
                  )}
                />
              </>
            )}
          </div>
          {isOpen && !collapsed && (
            <div className='sidebar-sub-list ml-4 mt-2 flex flex-col gap-1'>
              {item.items.map((subItem) => {
                const isSubSelected = selectedKeys.includes(subItem.itemKey);
                const to =
                  routerMapState[subItem.itemKey] ||
                  routerMap[subItem.itemKey];

                const subContent = (
                  <div
                    className={cn(
                      'sidebar-sub-item flex items-center rounded-xl px-3 py-2 text-sm transition-all cursor-pointer',
                      isSubSelected
                        ? 'sidebar-sub-item-selected text-primary font-medium'
                        : 'text-muted-foreground hover:text-accent-foreground',
                    )}
                    onClick={() => {
                      setSelectedKeys([subItem.itemKey]);
                      onNavigate();
                    }}
                  >
                    <span className='truncate'>{subItem.text}</span>
                  </div>
                );

                if (to) {
                  return (
                    <Link
                      key={subItem.itemKey}
                      to={to}
                      className='block'
                      style={{ textDecoration: 'none' }}
                    >
                      {subContent}
                    </Link>
                  );
                }
                return <div key={subItem.itemKey}>{subContent}</div>;
              })}
            </div>
          )}
        </div>
      );
    } else {
      return renderNavItem(item);
    }
  };

  return (
    <div
      className='sidebar-container'
      style={{
        width: 'var(--sidebar-current-width)',
      }}
    >
      <SkeletonWrapper
        loading={showSkeleton}
        type='sidebar'
        className=''
        collapsed={collapsed}
        showAdmin={isAdmin()}
      >
        <ScrollArea className='sidebar-nav h-full'>
          <div className='flex flex-col gap-3 px-2 py-3'>
            {/* 聊天区域 */}
            {hasSectionVisibleModules('chat') && (
              <div className='sidebar-section sidebar-section-card'>
                {!collapsed && (
                  <div className='sidebar-group-label'>{t('聊天')}</div>
                )}
                {chatMenuItems.map((item) => renderSubItem(item))}
              </div>
            )}

            {/* 控制台区域 */}
            {hasSectionVisibleModules('console') && (
              <>
                {!collapsed && <Separator className='sidebar-divider my-2' />}
                <div className='sidebar-section sidebar-section-card'>
                  {!collapsed && (
                    <div className='sidebar-group-label'>{t('控制台')}</div>
                  )}
                  {workspaceItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}

            {/* 个人中心区域 */}
            {hasSectionVisibleModules('personal') && (
              <>
                {!collapsed && <Separator className='sidebar-divider my-2' />}
                <div className='sidebar-section sidebar-section-card'>
                  {!collapsed && (
                    <div className='sidebar-group-label'>{t('个人中心')}</div>
                  )}
                  {financeItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}

            {/* 管理员区域 */}
            {isAdmin() && hasSectionVisibleModules('admin') && (
              <>
                {!collapsed && <Separator className='sidebar-divider my-2' />}
                <div className='sidebar-section sidebar-section-card'>
                  {!collapsed && (
                    <div className='sidebar-group-label'>{t('管理员')}</div>
                  )}
                  {adminItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SkeletonWrapper>

      {/* 底部折叠按钮 */}
      <div className='sidebar-collapse-button'>
        <SkeletonWrapper
          loading={showSkeleton}
          type='button'
          width={collapsed ? 36 : 156}
          height={24}
          className='w-full'
        >
          <button
            className={cn(
              'sidebar-collapse-trigger inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              collapsed
                ? 'w-9 h-6 p-0'
                : 'px-3 py-1 w-full',
            )}
            onClick={toggleCollapsed}
          >
            <ChevronLeft
              size={16}
              strokeWidth={2.5}
              className={cn(
                'text-muted-foreground transition-transform',
                collapsed && 'rotate-180',
              )}
            />
            {!collapsed ? (
              <span className='ml-2 text-muted-foreground'>{t('收起侧边栏')}</span>
            ) : null}
          </button>
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default SiderBar;
