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
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Chat } from '../ui/semi-compat';
import { MessageSquare, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomInputRender from './CustomInputRender';

const ChatArea = ({
  chatRef,
  message,
  inputs,
  styleState,
  showDebugPanel,
  roleInfo,
  onMessageSend,
  onMessageCopy,
  onMessageReset,
  onMessageDelete,
  onStopGenerator,
  onClearMessages,
  onToggleDebugPanel,
  renderCustomChatContent,
  renderChatBoxAction,
}) => {
  const { t } = useTranslation();

  const renderInputArea = React.useCallback((props) => {
    return <CustomInputRender {...props} />;
  }, []);

  return (
    <Card className='playground-chat-card h-full border-0'>
      <CardContent
        className='playground-chat-content'
        style={{
          padding: 0,
          height: 'calc(100vh - 66px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 聊天头部 */}
        {styleState.isMobile ? (
          <div className='pt-4'></div>
        ) : (
          <div className='playground-chat-topbar rounded-t-[26px] px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center'>
                  <MessageSquare size={20} className='text-white' />
                </div>
                <div>
                  <h5 className='text-white font-semibold mb-0'>
                    {t('AI 对话')}
                  </h5>
                  <span className='text-white/80 text-sm hidden sm:inline'>
                    {inputs.model || t('选择模型开始对话')}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onToggleDebugPanel}
                  className='!rounded-lg !text-white/80 hover:!text-white hover:!bg-white/10'
                >
                  {showDebugPanel ? <EyeOff size={14} className='mr-1' /> : <Eye size={14} className='mr-1' />}
                  {showDebugPanel ? t('隐藏调试') : t('显示调试')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className='flex-1 overflow-hidden'>
          <Chat
            ref={chatRef}
            chatBoxRenderConfig={{
              renderChatBoxContent: renderCustomChatContent,
              renderChatBoxAction: renderChatBoxAction,
              renderChatBoxTitle: () => null,
            }}
            renderInputArea={renderInputArea}
            roleConfig={roleInfo}
            style={{
              height: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
            chats={message}
            onMessageSend={onMessageSend}
            onMessageCopy={onMessageCopy}
            onMessageReset={onMessageReset}
            onMessageDelete={onMessageDelete}
            showClearContext
            showStopGenerate
            onStopGenerator={onStopGenerator}
            onClear={onClearMessages}
            className='h-full'
            placeholder={t('请输入您的问题...')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatArea;
