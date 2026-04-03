import * as React from 'react';
import { cn } from '../../lib/utils';
import { SearchX, Construction, FileQuestion, ShieldX, Inbox } from 'lucide-react';

const illustrationMap = {
  'no-result': SearchX,
  'no-content': Inbox,
  'not-found': FileQuestion,
  'no-access': ShieldX,
  'construction': Construction,
};

function EmptyState({
  type = 'no-result',
  title,
  description,
  icon: CustomIcon,
  className,
  children,
}) {
  const Icon = CustomIcon || illustrationMap[type] || SearchX;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      <Icon className='h-16 w-16 text-muted-foreground/50 mb-4' strokeWidth={1.5} />
      {title && (
        <h3 className='text-lg font-medium text-muted-foreground'>{title}</h3>
      )}
      {description && (
        <p className='mt-1 text-sm text-muted-foreground/70 max-w-sm'>
          {description}
        </p>
      )}
      {children && <div className='mt-4'>{children}</div>}
    </div>
  );
}

export { EmptyState };
