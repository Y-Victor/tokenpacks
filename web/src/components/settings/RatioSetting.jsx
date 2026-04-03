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

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/semi-compat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import GroupRatioSettings from '../../pages/Setting/Ratio/GroupRatioSettings';
import ModelRatioSettings from '../../pages/Setting/Ratio/ModelRatioSettings';
import ModelSettingsVisualEditor from '../../pages/Setting/Ratio/ModelSettingsVisualEditor';
import ModelRatioNotSetEditor from '../../pages/Setting/Ratio/ModelRationNotSetEditor';
import UpstreamRatioSync from '../../pages/Setting/Ratio/UpstreamRatioSync';

import { API, showError, toBoolean } from '../../helpers';

const RatioSetting = () => {
  const { t } = useTranslation();

  let [inputs, setInputs] = useState({
    ModelPrice: '',
    ModelRatio: '',
    CacheRatio: '',
    CreateCacheRatio: '',
    CompletionRatio: '',
    GroupRatio: '',
    GroupGroupRatio: '',
    ImageRatio: '',
    AudioRatio: '',
    AudioCompletionRatio: '',
    AutoGroups: '',
    DefaultUseAutoGroup: false,
    ExposeRatioEnabled: false,
    UserUsableGroups: '',
    'group_ratio_setting.group_special_usable_group': '',
  });

  const [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (item.value.startsWith('{') || item.value.startsWith('[')) {
          try {
            item.value = JSON.stringify(JSON.parse(item.value), null, 2);
          } catch (e) {
            // 如果后端返回的不是合法 JSON，直接展示
          }
        }
        if (['DefaultUseAutoGroup', 'ExposeRatioEnabled'].includes(item.key)) {
          newInputs[item.key] = toBoolean(item.value);
        } else {
          newInputs[item.key] = item.value;
        }
      });
      setInputs(newInputs);
    } else {
      showError(message);
    }
  };

  const onRefresh = async () => {
    try {
      setLoading(true);
      await getOptions();
    } catch (error) {
      showError('刷新失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="settings-panel-stack relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {/* 模型倍率设置以及价格编辑器 */}
      <Card className="settings-panel-card">
        <Tabs defaultValue='visual'>
          <TabsList className='settings-tabs-list flex h-auto w-full flex-wrap justify-start gap-2'>
            <TabsTrigger className='settings-tabs-trigger' value='model'>{t('模型倍率设置')}</TabsTrigger>
            <TabsTrigger className='settings-tabs-trigger' value='group'>{t('分组相关设置')}</TabsTrigger>
            <TabsTrigger className='settings-tabs-trigger' value='visual'>{t('价格设置')}</TabsTrigger>
            <TabsTrigger className='settings-tabs-trigger' value='unset_models'>{t('未设置价格模型')}</TabsTrigger>
            <TabsTrigger className='settings-tabs-trigger' value='upstream_sync'>{t('上游倍率同步')}</TabsTrigger>
          </TabsList>
          <TabsContent className='settings-tabs-content' value='model'>
            <ModelRatioSettings options={inputs} refresh={onRefresh} />
          </TabsContent>
          <TabsContent className='settings-tabs-content' value='group'>
            <GroupRatioSettings options={inputs} refresh={onRefresh} />
          </TabsContent>
          <TabsContent className='settings-tabs-content' value='visual'>
            <ModelSettingsVisualEditor options={inputs} refresh={onRefresh} />
          </TabsContent>
          <TabsContent className='settings-tabs-content' value='unset_models'>
            <ModelRatioNotSetEditor options={inputs} refresh={onRefresh} />
          </TabsContent>
          <TabsContent className='settings-tabs-content' value='upstream_sync'>
            <UpstreamRatioSync options={inputs} refresh={onRefresh} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default RatioSetting;
