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
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Sparkles, Users, ToggleLeft, X, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { renderGroupOption, selectFilter } from '../../helpers';
import ParameterControl from './ParameterControl';
import ImageUrlInput from './ImageUrlInput';
import ConfigManager from './ConfigManager';
import CustomRequestEditor from './CustomRequestEditor';

const SettingsPanel = ({
  inputs,
  parameterEnabled,
  models,
  groups,
  styleState,
  showDebugPanel,
  customRequestMode,
  customRequestBody,
  onInputChange,
  onParameterToggle,
  onCloseSettings,
  onConfigImport,
  onConfigReset,
  onCustomRequestModeChange,
  onCustomRequestBodyChange,
  previewPayload,
  messages,
}) => {
  const { t } = useTranslation();

  const currentConfig = {
    inputs,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
  };

  return (
    <Card className='playground-panel-card h-full flex flex-col border-0'>
      <CardContent
        className='playground-panel-content'
        style={{
          padding: styleState.isMobile ? '16px' : '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题区域 - 与调试面板保持一致 */}
        <div className='playground-panel-header flex items-center justify-between mb-6 flex-shrink-0'>
          <div className='flex items-center'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3'>
              <Settings size={20} className='text-white' />
            </div>
            <h5 className='text-lg font-semibold mb-0'>
              {t('模型配置')}
            </h5>
          </div>

          {styleState.isMobile && onCloseSettings && (
            <Button
              size='icon'
              variant='ghost'
              onClick={onCloseSettings}
              className='!rounded-lg h-8 w-8'
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* 移动端配置管理 */}
        {styleState.isMobile && (
          <div className='mb-4 flex-shrink-0'>
            <ConfigManager
              currentConfig={currentConfig}
              onConfigImport={onConfigImport}
              onConfigReset={onConfigReset}
              styleState={{ ...styleState, isMobile: false }}
              messages={messages}
            />
          </div>
        )}

        <div className='space-y-6 overflow-y-auto flex-1 pr-2 model-settings-scroll'>
          {/* 自定义请求体编辑器 */}
          <div className='playground-control-block'>
            <CustomRequestEditor
              customRequestMode={customRequestMode}
              customRequestBody={customRequestBody}
              onCustomRequestModeChange={onCustomRequestModeChange}
              onCustomRequestBodyChange={onCustomRequestBodyChange}
              defaultPayload={previewPayload}
            />
          </div>

          {/* 分组选择 */}
          <div
            className={`playground-control-block ${
              customRequestMode ? 'opacity-50' : ''
            }`}
          >
            <div className='flex items-center gap-2 mb-2'>
              <Users size={16} className='text-gray-500' />
              <span className='text-sm font-semibold'>
                {t('分组')}
              </span>
              {customRequestMode && (
                <span className='text-xs text-orange-600'>
                  ({t('已在自定义模式中忽略')})
                </span>
              )}
            </div>
            <Select
              value={inputs.group}
              onValueChange={(value) => onInputChange('group', value)}
              disabled={customRequestMode}
            >
              <SelectTrigger className='!rounded-lg w-full'>
                <SelectValue placeholder={t('请选择分组')} />
              </SelectTrigger>
              <SelectContent>
                {(groups || []).map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 模型选择 */}
          <div
            className={`playground-control-block ${
              customRequestMode ? 'opacity-50' : ''
            }`}
          >
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles size={16} className='text-gray-500' />
              <span className='text-sm font-semibold'>
                {t('模型')}
              </span>
              {customRequestMode && (
                <span className='text-xs text-orange-600'>
                  ({t('已在自定义模式中忽略')})
                </span>
              )}
            </div>
            <Select
              value={inputs.model}
              onValueChange={(value) => onInputChange('model', value)}
              disabled={customRequestMode}
            >
              <SelectTrigger className='!rounded-lg w-full'>
                <SelectValue placeholder={t('请选择模型')} />
              </SelectTrigger>
              <SelectContent>
                {(models || []).map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 图片URL输入 */}
          <div
            className={`playground-control-block ${
              customRequestMode ? 'opacity-50' : ''
            }`}
          >
            <ImageUrlInput
              imageUrls={inputs.imageUrls}
              imageEnabled={inputs.imageEnabled}
              onImageUrlsChange={(urls) => onInputChange('imageUrls', urls)}
              onImageEnabledChange={(enabled) =>
                onInputChange('imageEnabled', enabled)
              }
              disabled={customRequestMode}
            />
          </div>

          {/* 参数控制组件 */}
          <div
            className={`playground-control-block ${
              customRequestMode ? 'opacity-50' : ''
            }`}
          >
            <ParameterControl
              inputs={inputs}
              parameterEnabled={parameterEnabled}
              onInputChange={onInputChange}
              onParameterToggle={onParameterToggle}
              disabled={customRequestMode}
            />
          </div>

          {/* 流式输出开关 */}
          <div
            className={`playground-control-block ${
              customRequestMode ? 'opacity-50' : ''
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <ToggleLeft size={16} className='text-gray-500' />
                <span className='text-sm font-semibold'>
                  {t('流式输出')}
                </span>
                {customRequestMode && (
                  <span className='text-xs text-orange-600'>
                    ({t('已在自定义模式中忽略')})
                  </span>
                )}
              </div>
              <Switch
                checked={inputs.stream}
                onCheckedChange={(checked) => onInputChange('stream', checked)}
                disabled={customRequestMode}
              />
            </div>
          </div>
        </div>

        {/* 桌面端的配置管理放在底部 */}
        {!styleState.isMobile && (
          <div className='flex-shrink-0 pt-3'>
            <ConfigManager
              currentConfig={currentConfig}
              onConfigImport={onConfigImport}
              onConfigReset={onConfigReset}
              styleState={styleState}
              messages={messages}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
