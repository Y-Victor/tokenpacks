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
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Code, Zap, Clock, X, Eye, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CodeViewer from './CodeViewer';
import SSEViewer from './SSEViewer';

const DebugPanel = ({
  debugData,
  activeDebugTab,
  onActiveDebugTabChange,
  styleState,
  onCloseDebugPanel,
  customRequestMode,
}) => {
  const { t } = useTranslation();

  const [activeKey, setActiveKey] = useState(activeDebugTab);

  useEffect(() => {
    setActiveKey(activeDebugTab);
  }, [activeDebugTab]);

  const handleTabChange = (key) => {
    setActiveKey(key);
    onActiveDebugTabChange(key);
  };

  return (
    <Card className='playground-panel-card playground-debug-card h-full flex flex-col border-0'>
      <CardContent
        className='playground-panel-content'
        style={{
          padding: styleState.isMobile ? '16px' : '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className='playground-panel-header flex items-center justify-between mb-6 flex-shrink-0'>
          <div className='flex items-center'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mr-3'>
              <Code size={20} className='text-white' />
            </div>
            <h5 className='text-lg font-semibold mb-0'>
              {t('调试信息')}
            </h5>
          </div>

          {styleState.isMobile && onCloseDebugPanel && (
            <Button
              size='icon'
              variant='ghost'
              onClick={onCloseDebugPanel}
              className='!rounded-lg h-8 w-8'
            >
              <X size={16} />
            </Button>
          )}
        </div>

        <div className='playground-debug-surface flex-1 overflow-hidden debug-panel'>
          <Tabs
            value={activeKey}
            onValueChange={handleTabChange}
            className='h-full flex flex-col'
          >
            <TabsList className='flex-shrink-0'>
              <TabsTrigger value='preview'>
                <div className='flex items-center gap-2'>
                  <Eye size={16} />
                  {t('预览请求体')}
                  {customRequestMode && (
                    <span className='px-1.5 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full'>
                      自定义
                    </span>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value='request'>
                <div className='flex items-center gap-2'>
                  <Send size={16} />
                  {t('实际请求体')}
                </div>
              </TabsTrigger>
              <TabsTrigger value='response'>
                <div className='flex items-center gap-2'>
                  <Zap size={16} />
                  {t('响应')}
                  {debugData.sseMessages && debugData.sseMessages.length > 0 && (
                    <span className='px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full'>
                      SSE ({debugData.sseMessages.length})
                    </span>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='preview' className='flex-1 overflow-hidden'>
              <CodeViewer
                content={debugData.previewRequest}
                title='preview'
                language='json'
              />
            </TabsContent>

            <TabsContent value='request' className='flex-1 overflow-hidden'>
              <CodeViewer
                content={debugData.request}
                title='request'
                language='json'
              />
            </TabsContent>

            <TabsContent value='response' className='flex-1 overflow-hidden'>
              {debugData.sseMessages && debugData.sseMessages.length > 0 ? (
                <SSEViewer sseData={debugData.sseMessages} title='response' />
              ) : (
                <CodeViewer
                  content={debugData.response}
                  title='response'
                  language='json'
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className='flex items-center justify-between mt-4 pt-4 flex-shrink-0'>
          {(debugData.timestamp || debugData.previewTimestamp) && (
            <div className='flex items-center gap-2'>
              <Clock size={14} className='text-gray-500' />
              <span className='text-xs text-gray-500'>
                {activeKey === 'preview' && debugData.previewTimestamp
                  ? `${t('预览更新')}: ${new Date(debugData.previewTimestamp).toLocaleString()}`
                  : debugData.timestamp
                    ? `${t('最后请求')}: ${new Date(debugData.timestamp).toLocaleString()}`
                    : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
