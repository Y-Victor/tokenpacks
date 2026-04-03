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
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import SkeletonWrapper from '../components/SkeletonWrapper';

const HeaderLogo = ({
  isMobile,
  isConsoleRoute,
  logo,
  logoLoaded,
  isLoading,
  systemName,
  isSelfUseMode,
  isDemoSiteMode,
  t,
}) => {
  if (isMobile && isConsoleRoute) {
    return null;
  }

  return (
    <Link to='/' className='header-logo group flex min-w-0 items-center gap-3'>
      <div className='header-logo-mark relative h-10 w-10 overflow-hidden rounded-2xl md:h-11 md:w-11'>
        <SkeletonWrapper loading={isLoading || !logoLoaded} type='image' />
        <img
          src={logo}
          alt='logo'
          className={`absolute inset-0 h-full w-full rounded-2xl object-cover transition-all duration-300 group-hover:scale-105 ${!isLoading && logoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className='hidden min-w-0 md:flex md:flex-col'>
        <div className='flex items-center gap-2'>
          <SkeletonWrapper
            loading={isLoading}
            type='title'
            width={120}
            height={24}
          >
            <h4 className='mb-0 text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50'>
              {systemName}
            </h4>
          </SkeletonWrapper>
          {(isSelfUseMode || isDemoSiteMode) && !isLoading && (
            <Badge
              variant={isSelfUseMode ? 'secondary' : 'default'}
              className='text-xs px-1.5 py-0.5 whitespace-nowrap shadow-sm'
            >
              {isSelfUseMode ? t('自用模式') : t('演示站点')}
            </Badge>
          )}
        </div>
        <span className='header-logo-subtitle text-xs text-slate-500 dark:text-slate-400'>
          AI Gateway Workspace
        </span>
      </div>
    </Link>
  );
};

export default HeaderLogo;
