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
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import {
  Hash,
  Thermometer,
  Target,
  Repeat,
  Ban,
  Shuffle,
  Check,
  X,
} from 'lucide-react';

const ParameterControl = ({
  inputs,
  parameterEnabled,
  onInputChange,
  onParameterToggle,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Temperature */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.temperature || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Thermometer size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Temperature
            </span>
            <Badge variant='secondary' className='text-xs'>
              {inputs.temperature}
            </Badge>
          </div>
          <Button
            variant={parameterEnabled.temperature ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('temperature')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.temperature ? (
              <Check size={10} />
            ) : (
              <X size={10} />
            )}
          </Button>
        </div>
        <span className='text-xs text-gray-500 mb-2'>
          {t('控制输出的随机性和创造性')}
        </span>
        <Slider
          step={0.1}
          min={0.1}
          max={1}
          value={[inputs.temperature]}
          onValueChange={(value) => onInputChange('temperature', value[0])}
          className='mt-2'
          disabled={!parameterEnabled.temperature || disabled}
        />
      </div>

      {/* Top P */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.top_p || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Target size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Top P
            </span>
            <Badge variant='secondary' className='text-xs'>
              {inputs.top_p}
            </Badge>
          </div>
          <Button
            variant={parameterEnabled.top_p ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('top_p')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.top_p ? <Check size={10} /> : <X size={10} />}
          </Button>
        </div>
        <span className='text-xs text-gray-500 mb-2'>
          {t('核采样，控制词汇选择的多样性')}
        </span>
        <Slider
          step={0.1}
          min={0.1}
          max={1}
          value={[inputs.top_p]}
          onValueChange={(value) => onInputChange('top_p', value[0])}
          className='mt-2'
          disabled={!parameterEnabled.top_p || disabled}
        />
      </div>

      {/* Frequency Penalty */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.frequency_penalty || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Repeat size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Frequency Penalty
            </span>
            <Badge variant='secondary' className='text-xs'>
              {inputs.frequency_penalty}
            </Badge>
          </div>
          <Button
            variant={parameterEnabled.frequency_penalty ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('frequency_penalty')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.frequency_penalty ? (
              <Check size={10} />
            ) : (
              <X size={10} />
            )}
          </Button>
        </div>
        <span className='text-xs text-gray-500 mb-2'>
          {t('频率惩罚，减少重复词汇的出现')}
        </span>
        <Slider
          step={0.1}
          min={-2}
          max={2}
          value={[inputs.frequency_penalty]}
          onValueChange={(value) => onInputChange('frequency_penalty', value[0])}
          className='mt-2'
          disabled={!parameterEnabled.frequency_penalty || disabled}
        />
      </div>

      {/* Presence Penalty */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.presence_penalty || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Ban size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Presence Penalty
            </span>
            <Badge variant='secondary' className='text-xs'>
              {inputs.presence_penalty}
            </Badge>
          </div>
          <Button
            variant={parameterEnabled.presence_penalty ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('presence_penalty')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.presence_penalty ? (
              <Check size={10} />
            ) : (
              <X size={10} />
            )}
          </Button>
        </div>
        <span className='text-xs text-gray-500 mb-2'>
          {t('存在惩罚，鼓励讨论新话题')}
        </span>
        <Slider
          step={0.1}
          min={-2}
          max={2}
          value={[inputs.presence_penalty]}
          onValueChange={(value) => onInputChange('presence_penalty', value[0])}
          className='mt-2'
          disabled={!parameterEnabled.presence_penalty || disabled}
        />
      </div>

      {/* MaxTokens */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.max_tokens || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Hash size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Max Tokens
            </span>
          </div>
          <Button
            variant={parameterEnabled.max_tokens ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('max_tokens')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.max_tokens ? (
              <Check size={10} />
            ) : (
              <X size={10} />
            )}
          </Button>
        </div>
        <Input
          placeholder='MaxTokens'
          name='max_tokens'
          required
          autoComplete='new-password'
          value={inputs.max_tokens}
          onChange={(e) => onInputChange('max_tokens', e.target.value)}
          className='!rounded-lg'
          disabled={!parameterEnabled.max_tokens || disabled}
        />
      </div>

      {/* Seed */}
      <div
        className={`transition-opacity duration-200 mb-4 ${!parameterEnabled.seed || disabled ? 'opacity-50' : ''}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Shuffle size={16} className='text-gray-500' />
            <span className='text-sm font-semibold'>
              Seed
            </span>
            <span className='text-xs text-gray-400'>
              ({t('可选，用于复现结果')})
            </span>
          </div>
          <Button
            variant={parameterEnabled.seed ? 'default' : 'ghost'}
            size='icon'
            onClick={() => onParameterToggle('seed')}
            className='!rounded-full !w-4 !h-4 !p-0 !min-w-0'
            disabled={disabled}
          >
            {parameterEnabled.seed ? <Check size={10} /> : <X size={10} />}
          </Button>
        </div>
        <Input
          placeholder={t('随机种子 (留空为随机)')}
          name='seed'
          autoComplete='new-password'
          value={inputs.seed || ''}
          onChange={(e) =>
            onInputChange('seed', e.target.value === '' ? null : e.target.value)
          }
          className='!rounded-lg'
          disabled={!parameterEnabled.seed || disabled}
        />
      </div>
    </>
  );
};

export default ParameterControl;
