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
import { Skeleton } from '../../ui/skeleton';

const SkeletonBlock = ({ width, height, rounded = 'md', className = '' }) => (
  <Skeleton
    className={className}
    style={{ width, height, borderRadius: rounded === 'full' ? 9999 : undefined }}
  />
);

const SkeletonWrapper = ({
  loading = false,
  type = 'text',
  count = 1,
  width = 60,
  height = 16,
  isMobile = false,
  className = '',
  collapsed = false,
  showAdmin = true,
  children,
  ...props
}) => {
  if (!loading) {
    return children;
  }

  const renderNavigationSkeleton = () => {
    const skeletonLinkClasses = isMobile
      ? 'flex items-center gap-1 p-1 w-full rounded-md'
      : 'flex items-center gap-1 p-2 rounded-md';

    return Array(count)
      .fill(null)
      .map((_, index) => (
        <div key={index} className={skeletonLinkClasses}>
          <SkeletonBlock width={isMobile ? 40 : width} height={height} />
        </div>
      ));
  };

  const renderUserAreaSkeleton = () => {
    return (
      <div className={`flex items-center p-1 rounded-full bg-muted ${className}`}>
        <Skeleton className='h-6 w-6 rounded-full' />
        <div className='ml-1.5 mr-1'>
          <SkeletonBlock width={isMobile ? 15 : width} height={12} />
        </div>
      </div>
    );
  };

  const renderImageSkeleton = () => {
    return (
      <Skeleton
        className={`absolute inset-0 rounded-full ${className}`}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  const renderTitleSkeleton = () => {
    return <SkeletonBlock width={width} height={24} />;
  };

  const renderTextSkeleton = () => {
    return (
      <div className={className}>
        <SkeletonBlock width={width} height={height} />
      </div>
    );
  };

  const renderButtonSkeleton = () => {
    return (
      <div className={className}>
        <SkeletonBlock width={width} height={height} rounded='full' />
      </div>
    );
  };

  const renderSidebarNavItemSkeleton = () => {
    return Array(count)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className={`flex items-center p-2 mb-1 rounded-md ${className}`}
        >
          <div className='sidebar-icon-container flex-shrink-0'>
            <Skeleton className='h-4 w-4 rounded-sm' />
          </div>
          <SkeletonBlock width={width || 80} height={height || 14} />
        </div>
      ));
  };

  const renderSidebarGroupTitleSkeleton = () => {
    return (
      <div className={`mb-2 ${className}`}>
        <SkeletonBlock width={width || 60} height={height || 12} />
      </div>
    );
  };

  const renderSidebarSkeleton = () => {
    const NAV_WIDTH = 164;
    const NAV_HEIGHT = 30;
    const COLLAPSED_WIDTH = 44;
    const COLLAPSED_HEIGHT = 44;
    const ICON_SIZE = 16;
    const TITLE_HEIGHT = 12;
    const TEXT_HEIGHT = 16;

    const NavRow = ({ labelWidth }) => (
      <div
        className='flex items-center p-2 mb-1 rounded-md'
        style={{
          width: `${NAV_WIDTH}px`,
          height: `${NAV_HEIGHT}px`,
          margin: '3px 8px',
        }}
      >
        <div className='sidebar-icon-container flex-shrink-0'>
          <Skeleton className='rounded-sm' style={{ width: ICON_SIZE, height: ICON_SIZE }} />
        </div>
        <SkeletonBlock width={labelWidth} height={TEXT_HEIGHT} />
      </div>
    );

    const CollapsedRow = ({ keyPrefix, index }) => (
      <div
        key={`${keyPrefix}-${index}`}
        className='flex items-center justify-center'
        style={{
          width: `${COLLAPSED_WIDTH}px`,
          height: `${COLLAPSED_HEIGHT}px`,
          margin: '0 8px 4px 8px',
        }}
      >
        <Skeleton className='rounded-sm' style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      </div>
    );

    if (collapsed) {
      return (
        <div className={`w-full ${className}`} style={{ paddingTop: '12px' }}>
          {Array(2).fill(null).map((_, i) => (
            <CollapsedRow key={`c-chat-${i}`} keyPrefix='c-chat' index={i} />
          ))}
          {Array(5).fill(null).map((_, i) => (
            <CollapsedRow key={`c-console-${i}`} keyPrefix='c-console' index={i} />
          ))}
          {Array(2).fill(null).map((_, i) => (
            <CollapsedRow key={`c-personal-${i}`} keyPrefix='c-personal' index={i} />
          ))}
          {Array(5).fill(null).map((_, i) => (
            <CollapsedRow key={`c-admin-${i}`} keyPrefix='c-admin' index={i} />
          ))}
        </div>
      );
    }

    const sections = [
      { key: 'chat', titleWidth: 32, itemWidths: [54, 32], wrapper: 'section' },
      { key: 'console', titleWidth: 48, itemWidths: [64, 64, 64, 64, 64] },
      { key: 'personal', titleWidth: 64, itemWidths: [64, 64] },
      ...(showAdmin
        ? [{ key: 'admin', titleWidth: 48, itemWidths: [64, 64, 80, 64, 64] }]
        : []),
    ];

    return (
      <div className={`w-full ${className}`} style={{ paddingTop: '12px' }}>
        {sections.map((sec) => (
          <React.Fragment key={sec.key}>
            <div className={sec.wrapper === 'section' ? 'sidebar-section' : ''}>
              <div
                className='sidebar-group-label'
                style={{ padding: '4px 15px 8px' }}
              >
                <SkeletonBlock width={sec.titleWidth} height={TITLE_HEIGHT} />
              </div>
              {sec.itemWidths.map((w, i) => (
                <NavRow key={`${sec.key}-${i}`} labelWidth={w} />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  switch (type) {
    case 'navigation':
      return renderNavigationSkeleton();
    case 'userArea':
      return renderUserAreaSkeleton();
    case 'image':
      return renderImageSkeleton();
    case 'title':
      return renderTitleSkeleton();
    case 'sidebarNavItem':
      return renderSidebarNavItemSkeleton();
    case 'sidebarGroupTitle':
      return renderSidebarGroupTitleSkeleton();
    case 'sidebar':
      return renderSidebarSkeleton();
    case 'button':
      return renderButtonSkeleton();
    case 'text':
    default:
      return renderTextSkeleton();
  }
};

export default SkeletonWrapper;
