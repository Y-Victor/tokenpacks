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
import { Button } from '../ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';

const FloatingButtons = ({
  styleState,
  showSettings,
  showDebugPanel,
  onToggleSettings,
  onToggleDebugPanel,
}) => {
  if (!styleState.isMobile) return null;

  return (
    <>
      {/* 设置按钮 */}
      {!showSettings && (
        <Button
          size='icon'
          onClick={onToggleSettings}
          className='lg:hidden fixed right-4 bottom-[90px] z-[1000] w-9 h-9 rounded-full p-0 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
          style={{
            background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
          }}
        >
          <Settings size={18} />
        </Button>
      )}

      {/* 调试按钮 */}
      {!showSettings && (
        <Button
          size='icon'
          variant={showDebugPanel ? 'destructive' : 'default'}
          onClick={onToggleDebugPanel}
          className='lg:hidden fixed right-4 bottom-[140px] z-[1000] w-9 h-9 rounded-full p-0 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
          style={{
            background: showDebugPanel
              ? 'linear-gradient(to right, #e11d48, #be123c)'
              : 'linear-gradient(to right, #4f46e5, #6366f1)',
          }}
        >
          {showDebugPanel ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      )}
    </>
  );
};

export default FloatingButtons;
