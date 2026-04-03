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

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { marked } from 'marked';
import { EmptyState } from '../ui/empty-state';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const FaqPanel = ({
  faqData,
  CARD_PROPS,
  FLEX_CENTER_GAP2,
  ILLUSTRATION_SIZE,
  t,
}) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <Card className='shadow-sm rounded-2xl lg:col-span-1'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>
          <div className={FLEX_CENTER_GAP2}>
            <HelpCircle size={16} />
            {t('常见问答')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <ScrollableContainer maxHeight='24rem'>
          {faqData.length > 0 ? (
            <div className='divide-y'>
              {faqData.map((item, index) => (
                <Collapsible
                  key={index}
                  open={openIndex === index}
                  onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
                >
                  <CollapsibleTrigger className='flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors'>
                    <span>{item.question}</span>
                    {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div
                      className='px-4 pb-3 text-sm text-muted-foreground'
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(item.answer || ''),
                      }}
                    />
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className='flex justify-center items-center py-8'>
              <EmptyState
                type='construction'
                title={t('暂无常见问答')}
                description={t('请联系管理员在系统设置中配置常见问答')}
              />
            </div>
          )}
        </ScrollableContainer>
      </CardContent>
    </Card>
  );
};

export default FaqPanel;
