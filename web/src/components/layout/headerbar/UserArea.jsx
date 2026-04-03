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

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, UserCog, Key, CreditCard, LogOut } from 'lucide-react';
import { stringToColor } from '../../../helpers';
import SkeletonWrapper from '../components/SkeletonWrapper';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../ui/avatar';

const UserArea = ({
  userState,
  isLoading,
  isMobile,
  isSelfUseMode,
  logout,
  navigate,
  t,
}) => {
  if (isLoading) {
    return (
      <SkeletonWrapper
        loading={true}
        type='userArea'
        width={50}
        isMobile={isMobile}
      />
    );
  }

  if (userState.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='header-user-trigger flex items-center gap-1.5 rounded-full p-1'
          >
            <Avatar className='h-7 w-7'>
              <AvatarFallback
                style={{ backgroundColor: stringToColor(userState.user.username) }}
                className='text-white text-xs'
              >
                {userState.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className='hidden md:inline text-xs font-medium text-muted-foreground mr-1'>
              {userState.user.username}
            </span>
            <ChevronDown
              size={14}
              className='text-muted-foreground'
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => navigate('/console/personal')}>
            <UserCog size={16} className='mr-2 text-muted-foreground' />
            <span>{t('个人设置')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/console/token')}>
            <Key size={16} className='mr-2 text-muted-foreground' />
            <span>{t('令牌管理')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/console/topup')}>
            <CreditCard size={16} className='mr-2 text-muted-foreground' />
            <span>{t('钱包管理')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut size={16} className='mr-2 text-muted-foreground' />
            <span>{t('退出')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    const showRegisterButton = !isSelfUseMode;

    return (
      <div className='flex items-center'>
        <Link to='/login' className='flex'>
          <Button
            variant='ghost'
            className={`header-auth-button text-xs ${showRegisterButton && !isMobile ? 'rounded-l-full rounded-r-none' : 'rounded-full'}`}
          >
            {t('登录')}
          </Button>
        </Link>
        {showRegisterButton && (
          <div className='hidden md:block'>
            <Link to='/register' className='flex -ml-px'>
              <Button className='text-xs rounded-r-full rounded-l-none'>
                {t('注册')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }
};

export default UserArea;
