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

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getFooterHTML, getLogo, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';

const FooterBar = () => {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(getFooterHTML());
  const systemName = getSystemName();
  const logo = getLogo();
  const [statusState] = useContext(StatusContext);
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  const currentYear = new Date().getFullYear();

  const customFooter = useMemo(
    () => (
      <footer className='relative w-full overflow-hidden rounded-[28px] border border-white/60 bg-white/85 px-6 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-10'>
        <div className='absolute -left-8 top-8 hidden h-28 w-28 rounded-full bg-primary/10 blur-3xl md:block'></div>
        <div className='absolute -right-10 bottom-6 h-24 w-24 rounded-full bg-sky-200/40 blur-3xl'></div>

        {isDemoSiteMode && (
          <div className='flex flex-col md:flex-row justify-between w-full max-w-[1110px] mb-10 gap-8'>
            <div className='flex-shrink-0'>
              <img
                src={logo}
                alt={systemName}
                className='w-16 h-16 rounded-full bg-gray-800 p-1.5 object-contain'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full'>
              <div className='text-left'>
                <p className='mb-5 font-semibold text-slate-900 dark:text-slate-100'>
                  {t('关于我们')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://docs.newapi.pro/wiki/project-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('关于项目')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/support/community-interaction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('联系我们')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/wiki/features-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('功能特性')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='mb-5 font-semibold text-slate-900 dark:text-slate-100'>
                  {t('文档')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://docs.newapi.pro/getting-started/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('快速开始')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/installation/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('安装指南')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/api/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    {t('API 文档')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='mb-5 font-semibold text-slate-900 dark:text-slate-100'>
                  {t('相关项目')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://github.com/songquanpeng/one-api'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    One API
                  </a>
                  <a
                    href='https://github.com/novicezk/midjourney-proxy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    Midjourney-Proxy
                  </a>
                  <a
                    href='https://github.com/Calcium-Ion/neko-api-key-tool'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    neko-api-key-tool
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='mb-5 font-semibold text-slate-900 dark:text-slate-100'>
                  {t('友情链接')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://github.com/Calcium-Ion/new-api-horizon'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    new-api-horizon
                  </a>
                  <a
                    href='https://github.com/coaidev/coai'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    CoAI
                  </a>
                  <a
                    href='https://www.gpt-load.com/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  >
                    GPT-Load
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col md:flex-row items-center justify-between w-full max-w-[1110px] gap-6'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm text-slate-500 dark:text-slate-400'>
              &copy; {currentYear} {systemName}. {t('版权所有')}
            </span>
          </div>

          <div className='text-sm'>
            <span className='text-slate-500 dark:text-slate-400'>
              {t('设计与开发由')}{' '}
            </span>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-primary'
            >
              TokenPacks
            </a>
          </div>
        </div>
      </footer>
    ),
    [logo, systemName, t, currentYear, isDemoSiteMode],
  );

  useEffect(() => {
    loadFooter();
  }, []);

  return (
    <div className='app-footer-panel w-full'>
      {footer ? (
        <div className='custom-footer-shell relative'>
          <div
            className='custom-footer'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
          <div className='absolute bottom-2 right-4 text-xs !text-semi-color-text-2 opacity-70'>
            <span>{t('设计与开发由')} </span>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-primary'
            >
              TokenPacks
            </a>
          </div>
        </div>
      ) : (
        customFooter
      )}
    </div>
  );
};

export default FooterBar;
