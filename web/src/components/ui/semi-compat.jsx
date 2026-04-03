import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge as UiBadge } from './badge';
import { Button as UiButton } from './button';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Checkbox as UiCheckbox } from './checkbox';
import {
  Collapsible as UiCollapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { EmptyState } from './empty-state';
import { Form as CompatForm, Row, Col, Spin } from './form-compat';
import { Input as UiInput } from './input';
import { Label } from './label';
import {
  Popover as UiPopover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Progress as UiProgress } from './progress';
import { RadioGroup as UiRadioGroup, RadioGroupItem } from './radio-group';
import { ScrollArea } from './scroll-area';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Separator } from './separator';
import { Skeleton as UiSkeleton } from './skeleton';
import { Switch as UiSwitch } from './switch';
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Textarea as UiTextarea } from './textarea';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { cn } from '../../lib/utils';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Search,
  Send,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  alertError,
  alertInfo,
  alertSuccess,
  alertWarning,
  confirm,
} from '../../lib/confirm';

const buttonThemeMap = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  tertiary: 'outline',
  warning: 'outline',
  danger: 'destructive',
  light: 'outline',
  borderless: 'ghost',
  link: 'link',
};

const buttonSizeMap = {
  default: 'default',
  large: 'lg',
  small: 'sm',
};

const textTypeClassMap = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  tertiary: 'text-muted-foreground',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-destructive',
  success: 'text-green-600 dark:text-green-400',
};

function wrapEventValue(value) {
  return { target: { value } };
}

function useControllableState(valueProp, defaultValue) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  return [value, setInternalValue, isControlled];
}

export const LocaleProvider = ({ children }) => children;

export const Toast = {
  success(message, options) {
    return toast.success(
      typeof message === 'object' ? message.content : message,
      options,
    );
  },
  error(message, options) {
    return toast.error(
      typeof message === 'object' ? message.content : message,
      options,
    );
  },
  warning(message, options) {
    return toast.warning(
      typeof message === 'object' ? message.content : message,
      options,
    );
  },
  info(message, options) {
    return toast.info(
      typeof message === 'object' ? message.content : message,
      options,
    );
  },
};

export const Button = forwardRef(
  (
    {
      theme,
      type,
      size,
      icon,
      iconPosition = 'left',
      loading,
      children,
      className,
      htmlType,
      block,
      ...props
    },
    ref,
  ) => {
    const variant = buttonThemeMap[theme] || buttonThemeMap[type] || 'default';
    const mappedSize = buttonSizeMap[size] || 'default';
    return (
      <UiButton
        ref={ref}
        variant={variant}
        size={mappedSize}
        className={cn('gap-2', block && 'w-full', className)}
        disabled={props.disabled || loading}
        type={htmlType || 'button'}
        {...props}
      >
        {loading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          iconPosition === 'left' && icon
        )}
        {children}
        {!loading && iconPosition === 'right' && icon}
      </UiButton>
    );
  },
);
Button.displayName = 'SemiCompatButton';

export function Divider({ margin, className, children, ...props }) {
  const style = {};
  if (margin !== undefined) {
    const normalized = typeof margin === 'number' ? `${margin}px` : margin;
    style.marginTop = normalized;
    style.marginBottom = normalized;
  }
  if (children) {
    return (
      <div className={cn('flex items-center gap-3', className)} style={style}>
        <Separator className='flex-1' />
        <span className='text-sm text-muted-foreground'>{children}</span>
        <Separator className='flex-1' />
      </div>
    );
  }
  return <Separator className={className} style={style} {...props} />;
}

const textSizeMap = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-semibold',
  5: 'text-base font-semibold',
  6: 'text-sm font-semibold',
};

export const Text = forwardRef(
  (
    {
      className,
      strong,
      type,
      children,
      component = 'span',
      extraText,
      ...props
    },
    ref,
  ) => {
    const Comp = component;
    const content = (
      <Comp
        ref={ref}
        className={cn(
          strong && 'font-semibold',
          textTypeClassMap[type],
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!extraText) {
      return content;
    }

    return (
      <div className='space-y-1'>
        {content}
        <div className='text-xs text-muted-foreground'>{extraText}</div>
      </div>
    );
  },
);
Text.displayName = 'SemiCompatText';

const Title = forwardRef(
  ({ className, heading = 4, children, ...props }, ref) => {
    const Comp = `h${Math.min(Math.max(Number(heading) || 4, 1), 6)}`;
    return (
      <Comp
        ref={ref}
        className={cn(textSizeMap[heading] || textSizeMap[4], className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Title.displayName = 'SemiCompatTitle';

const Paragraph = forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('leading-7', className)} {...props}>
    {children}
  </p>
));
Paragraph.displayName = 'SemiCompatParagraph';

export const Highlight = ({ children, sourceString, searchWords = [] }) => {
  const query = searchWords.find(Boolean);
  if (!query || typeof sourceString !== 'string') {
    return children ?? sourceString;
  }
  const segments = sourceString.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {segments.map((segment, index) =>
        segment.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className='rounded bg-yellow-200 px-0.5 dark:bg-yellow-700/50'
          >
            {segment}
          </mark>
        ) : (
          <React.Fragment key={index}>{segment}</React.Fragment>
        ),
      )}
    </>
  );
};

export const Typography = {
  Text,
  Title,
  Paragraph,
};

export const Card = ({
  title,
  extra,
  headerLine,
  headerStyle,
  bodyStyle,
  footer,
  footerLine,
  loading,
  className,
  children,
  ...props
}) => (
  <UiCard className={cn('rounded-xl', className)} {...props}>
    {(title || extra) && (
      <CardHeader
        className={cn(headerLine !== false && 'border-b')}
        style={headerStyle}
      >
        <div className='flex items-center justify-between gap-4'>
          {typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title}
          {extra ? <div>{extra}</div> : null}
        </div>
      </CardHeader>
    )}
    <CardContent className='pt-6' style={bodyStyle}>
      {loading ? (
        <div className='flex min-h-[120px] items-center justify-center'>
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      ) : (
        children
      )}
    </CardContent>
    {footer ? (
      <CardFooter className={cn(footerLine !== false && 'border-t pt-4')}>
        {footer}
      </CardFooter>
    ) : null}
  </UiCard>
);

const badgeTypeVariantMap = {
  primary: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  tertiary: 'secondary',
};

const badgePositionClassMap = {
  rightTop: '-right-1 -top-1',
  leftTop: '-left-1 -top-1',
  rightBottom: '-right-1 -bottom-1',
  leftBottom: '-left-1 -bottom-1',
};

export function Badge({
  dot,
  count,
  type,
  position = 'rightTop',
  className,
  children,
  ...props
}) {
  const variant = badgeTypeVariantMap[type] || 'secondary';

  if (children) {
    return (
      <span className='relative inline-flex w-fit'>
        {children}
        {dot ? (
          <span
            className={cn(
              'absolute h-2.5 w-2.5 rounded-full border-2 border-background',
              badgePositionClassMap[position] || badgePositionClassMap.rightTop,
              variant === 'success' && 'bg-emerald-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'destructive' && 'bg-red-500',
              variant === 'default' && 'bg-blue-500',
              variant === 'secondary' && 'bg-slate-400',
              className,
            )}
            {...props}
          />
        ) : count !== undefined && count !== null ? (
          <UiBadge
            variant={variant}
            className={cn(
              'absolute min-w-5 justify-center px-1.5 py-0 text-[10px] leading-4 shadow-sm',
              badgePositionClassMap[position] || badgePositionClassMap.rightTop,
              className,
            )}
            {...props}
          >
            {count}
          </UiBadge>
        ) : null}
      </span>
    );
  }

  if (dot) {
    return (
      <span
        className={cn(
          'inline-flex h-2.5 w-2.5 rounded-full',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'destructive' && 'bg-red-500',
          variant === 'default' && 'bg-blue-500',
          variant === 'secondary' && 'bg-slate-400',
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <UiBadge variant={variant} className={className} {...props}>
      {count ?? children}
    </UiBadge>
  );
}

const tagVariantMap = {
  blue: 'default',
  cyan: 'default',
  green: 'success',
  red: 'destructive',
  orange: 'warning',
  yellow: 'warning',
  purple: 'default',
  grey: 'secondary',
  white: 'outline',
};

const tagTypeVariantMap = {
  danger: 'destructive',
  warning: 'warning',
  success: 'success',
  primary: 'default',
};

const tagSizeClassMap = {
  small: 'px-2 py-0 text-[11px]',
  default: 'px-2.5 py-0.5 text-xs',
  large: 'px-3 py-1 text-sm',
};

export function Tag({
  color,
  closable,
  onClose,
  onClick,
  className,
  prefixIcon,
  suffixIcon,
  size = 'default',
  shape,
  type,
  avatar,
  children,
  ...props
}) {
  return (
    <UiBadge
      variant={tagVariantMap[color] || tagTypeVariantMap[type] || 'secondary'}
      className={cn(
        'inline-flex items-center gap-1.5',
        tagSizeClassMap[size] || tagSizeClassMap.default,
        shape === 'circle' && 'rounded-full',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {avatar ? <span className='inline-flex shrink-0'>{avatar}</span> : null}
      {prefixIcon ? (
        <span className='inline-flex shrink-0 items-center'>{prefixIcon}</span>
      ) : null}
      {children ? <span>{children}</span> : null}
      {suffixIcon ? (
        <span className='inline-flex shrink-0 items-center'>{suffixIcon}</span>
      ) : null}
      {closable ? (
        <button
          type='button'
          className='ml-1 inline-flex'
          onClick={(event) => {
            event.stopPropagation();
            onClose?.(event);
          }}
        >
          <X className='h-3 w-3' />
        </button>
      ) : null}
    </UiBadge>
  );
}

export const Input = forwardRef(
  (
    {
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      onChange,
      onEnterPress,
      helpText,
      noLabel,
      validateStatus,
      rules,
      initValue,
      field,
      mode,
      showClear,
      extraText,
      fullMode,
      closeIcon,
      autosize,
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (event) => {
      props.onKeyDown?.(event);
      if (event.key === 'Enter') {
        onEnterPress?.(event);
      }
    };
    return (
      <div className='space-y-1.5'>
        <div className='flex items-center gap-2'>
          {addonBefore || prefix ? (
            <div className='shrink-0 text-sm text-muted-foreground'>
              {addonBefore || prefix}
            </div>
          ) : null}
          <UiInput
            ref={ref}
            type={props.type || (mode === 'password' ? 'password' : undefined)}
            {...props}
            onKeyDown={handleKeyDown}
            onChange={(event) => onChange?.(event.target.value, event)}
          />
          {addonAfter || suffix ? (
            <div className='shrink-0 text-sm text-muted-foreground'>
              {addonAfter || suffix}
            </div>
          ) : null}
        </div>
        {extraText || helpText ? (
          <div className='text-xs text-muted-foreground'>
            {extraText || helpText}
          </div>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'SemiCompatInput';

export const TextArea = forwardRef(
  (
    {
      onChange,
      helpText,
      noLabel,
      validateStatus,
      rules,
      initValue,
      field,
      showClear,
      extraText,
      fullMode,
      closeIcon,
      autosize,
      ...props
    },
    ref,
  ) => (
    <div className='space-y-1.5'>
      <UiTextarea
        ref={ref}
        {...props}
        onChange={(event) => onChange?.(event.target.value, event)}
      />
      {extraText || helpText ? (
        <div className='text-xs text-muted-foreground'>
          {extraText || helpText}
        </div>
      ) : null}
    </div>
  ),
);
TextArea.displayName = 'SemiCompatTextarea';

export function InputNumber({
  value,
  defaultValue,
  onChange,
  prefix,
  suffix,
  noLabel,
  validateStatus,
  rules,
  initValue,
  field,
  showClear,
  extraText,
  helpText,
  fullMode,
  closeIcon,
  ...props
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-2'>
        {prefix ? (
          <span className='text-sm text-muted-foreground'>{prefix}</span>
        ) : null}
        <UiInput
          type='number'
          value={value ?? defaultValue ?? ''}
          {...props}
          onChange={(event) =>
            onChange?.(
              event.target.value === '' ? undefined : Number(event.target.value),
            )
          }
        />
        {suffix ? (
          <span className='text-sm text-muted-foreground'>{suffix}</span>
        ) : null}
      </div>
      {extraText || helpText ? (
        <div className='text-xs text-muted-foreground'>
          {extraText || helpText}
        </div>
      ) : null}
    </div>
  );
}

const SELECT_EMPTY_SENTINEL = '__semi_compat_empty__';

function toSelectValue(v) {
  if (v === '' || v === undefined || v === null) return SELECT_EMPTY_SENTINEL;
  return String(v);
}

function fromSelectValue(v) {
  return v === SELECT_EMPTY_SENTINEL ? '' : v;
}

function normalizeSelectChildren(children) {
  return React.Children.toArray(children)
    .filter(Boolean)
    .map((child) => {
      if (!React.isValidElement(child)) return child;
      return child;
    });
}

export function Select({
  value,
  defaultValue,
  onChange,
  optionList,
  children,
  placeholder,
  disabled,
  style,
  className,
  showClear,
  extraText,
  fullMode,
  closeIcon,
}) {
  const options = optionList?.length
    ? optionList.map((item) => (
        <SelectItem
          key={toSelectValue(item.value)}
          value={toSelectValue(item.value)}
        >
          {item.label}
        </SelectItem>
      ))
    : normalizeSelectChildren(children);

  return (
    <div style={style} className={className}>
      <UiSelect
        value={
          value !== undefined && value !== null
            ? toSelectValue(value)
            : undefined
        }
        defaultValue={
          defaultValue !== undefined && defaultValue !== null
            ? toSelectValue(defaultValue)
            : undefined
        }
        disabled={disabled}
        onValueChange={(nextValue) => {
          const real = fromSelectValue(nextValue);
          onChange?.(real, wrapEventValue(real));
        }}
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{options}</SelectContent>
      </UiSelect>
    </div>
  );
}

Select.Option = ({ value, children }) => (
  <SelectItem value={toSelectValue(value)}>{children}</SelectItem>
);

export const Switch = ({ onChange, checked, ...props }) => (
  <UiSwitch
    checked={checked}
    onCheckedChange={(nextChecked) => onChange?.(nextChecked)}
    {...props}
  />
);

export const Checkbox = ({
  checked,
  onChange,
  onCheckedChange,
  children,
  indeterminate,
  className,
  ...props
}) => (
  <label className={cn('inline-flex items-center gap-2', className)}>
    <UiCheckbox
      checked={checked === undefined ? false : checked}
      onCheckedChange={(nextChecked) => {
        onCheckedChange?.(nextChecked);
        onChange?.({
          target: { checked: !!nextChecked, value: props.value },
        });
      }}
      {...props}
    />
    {children ? <span>{children}</span> : null}
  </label>
);

export function Radio({ value, children, disabled }) {
  return (
    <label className='inline-flex items-center gap-2 text-sm'>
      <RadioGroupItem value={String(value)} disabled={disabled} />
      <span>{children}</span>
    </label>
  );
}

export function RadioGroup({
  value,
  defaultValue,
  onChange,
  children,
  type,
  direction = 'horizontal',
  className,
  ...props
}) {
  return (
    <UiRadioGroup
      value={value !== undefined ? String(value) : undefined}
      defaultValue={
        defaultValue !== undefined ? String(defaultValue) : undefined
      }
      className={cn(
        direction === 'vertical' ? 'grid gap-3' : 'flex flex-wrap gap-4',
        type === 'button' && 'gap-2',
        className,
      )}
      onValueChange={(nextValue) => onChange?.(wrapEventValue(nextValue))}
      {...props}
    >
      {children}
    </UiRadioGroup>
  );
}

Radio.Group = RadioGroup;

export function Space({
  children,
  spacing = 'default',
  align,
  vertical,
  wrap,
  className,
  style,
}) {
  const gapClass =
    spacing === 'tight'
      ? 'gap-1.5'
      : typeof spacing === 'number'
        ? undefined
        : 'gap-3';
  return (
    <div
      className={cn(
        'flex',
        vertical ? 'flex-col' : 'flex-row',
        wrap && 'flex-wrap',
        align === 'center' && 'items-center',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        gapClass,
        className,
      )}
      style={{
        gap: typeof spacing === 'number' ? spacing : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Tooltip({ content, children, position = 'top', ...props }) {
  return (
    <TooltipProvider>
      <UiTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={position} {...props}>
          {content}
        </TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );
}

const bannerTypeMap = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
};

export function Banner({
  type = 'info',
  title,
  description,
  children,
  closable,
  onClose,
  className,
  fullMode,
  closeIcon,
  bordered,
  ...props
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <Alert
      variant={bannerTypeMap[type] || 'info'}
      className={cn('mb-4', className)}
      {...props}
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{description || children}</AlertDescription>
      {closable ? (
        <button
          type='button'
          className='absolute right-3 top-3'
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          <X className='h-4 w-4' />
        </button>
      ) : null}
    </Alert>
  );
}

export function Empty({
  title,
  description,
  image,
  children,
  className,
  ...props
}) {
  const type =
    image?.props?.alt === '403' || title?.includes?.('无权')
      ? 'no-access'
      : image?.props?.alt === '404' || title?.includes?.('不存在')
        ? 'not-found'
        : title?.includes?.('建设')
          ? 'construction'
          : 'no-content';
  return (
    <EmptyState
      type={type}
      title={title || description}
      description={description}
      className={className}
      {...props}
    >
      {children}
    </EmptyState>
  );
}

function normalizeAvatarColor(color) {
  const colorMap = {
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    grey: 'bg-slate-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
  };
  return colorMap[color] || 'bg-primary';
}

export function Avatar({
  src,
  alt,
  children,
  color,
  size = 'default',
  className,
  ...props
}) {
  const sizeClass =
    size === 'small' ? 'h-8 w-8' : size === 'large' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <UiAvatar className={cn(sizeClass, className)} {...props}>
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      <AvatarFallback className={cn('text-white', normalizeAvatarColor(color))}>
        {children}
      </AvatarFallback>
    </UiAvatar>
  );
}

Avatar.Group = ({ children, className }) => (
  <div className={cn('flex -space-x-2', className)}>{children}</div>
);

const CompatSkeleton = ({
  loading,
  placeholder,
  children,
  className,
  ...props
}) => {
  if (loading) {
    return (
      placeholder || (
        <UiSkeleton className={cn('h-5 w-full', className)} {...props} />
      )
    );
  }
  return children ?? <UiSkeleton className={className} {...props} />;
};

CompatSkeleton.Title = ({ style, className }) => (
  <UiSkeleton className={cn('h-5 w-32', className)} style={style} />
);
CompatSkeleton.Button = ({ style, className }) => (
  <UiSkeleton className={cn('h-10 w-20 rounded-md', className)} style={style} />
);
CompatSkeleton.Paragraph = ({ rows = 3, style, className }) => (
  <div className={cn('space-y-2', className)} style={style}>
    {Array.from({ length: rows }).map((_, index) => (
      <UiSkeleton
        key={index}
        className={cn('h-4', index === rows - 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

export const Skeleton = CompatSkeleton;

export function Dropdown({
  trigger,
  render,
  menu,
  children,
  position = 'bottom',
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={position === 'top' ? 'top' : 'bottom'}>
        {render
          ? render()
          : menu?.map?.((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.node || item.name}
              </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

Dropdown.Menu = ({ children }) => <>{children}</>;
Dropdown.Item = ({ children, onClick, ...props }) => (
  <DropdownMenuItem onClick={onClick} {...props}>
    {children}
  </DropdownMenuItem>
);

export function Popconfirm({
  title,
  content,
  children,
  onConfirm,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className='relative inline-flex'>
      <div onClick={() => setOpen((prev) => !prev)}>{children}</div>
      {open ? (
        <div className='absolute right-0 top-full z-[var(--z-floating)] mt-2 w-72 rounded-lg border bg-popover p-4 shadow-lg'>
          {title ? (
            <div className='mb-1 text-sm font-medium'>{title}</div>
          ) : null}
          {content ? (
            <div className='mb-3 text-sm text-muted-foreground'>{content}</div>
          ) : null}
          <div className='flex justify-end gap-2'>
            <UiButton
              variant='outline'
              size='sm'
              onClick={() => {
                setOpen(false);
                onCancel?.();
              }}
            >
              {cancelText}
            </UiButton>
            <UiButton
              size='sm'
              onClick={() => {
                setOpen(false);
                onConfirm?.();
              }}
            >
              {okText}
            </UiButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Descriptions({ data = [], children, className, ...props }) {
  const items = React.Children.toArray(children).length
    ? React.Children.toArray(children)
    : data.map((item, index) => (
        <Descriptions.Item key={index} itemKey={item.key}>
          {item.value}
        </Descriptions.Item>
      ));
  return (
    <div className={cn('grid gap-3', className)} {...props}>
      {items}
    </div>
  );
}

Descriptions.Item = ({ itemKey, children, className }) => (
  <div className={cn('grid gap-1 sm:grid-cols-[140px_1fr]', className)}>
    <span className='text-sm font-medium text-muted-foreground'>{itemKey}</span>
    <div className='text-sm'>{children}</div>
  </div>
);

export function Progress({
  percent = 0,
  showInfo = true,
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <UiProgress value={percent} className='flex-1' {...props} />
      {showInfo ? (
        <span className='text-sm text-muted-foreground'>
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}

export const Table = ({
  columns = [],
  dataSource = [],
  rowKey = 'key',
  rowSelection,
  pagination,
  loading,
  empty,
  className,
  scroll,
  onRow,
  ...props
}) => {
  const getRowValue = (record, index) =>
    typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] ?? index);
  const selectedKeys = rowSelection?.selectedRowKeys || [];
  const allRowsSelected =
    dataSource.length > 0 &&
    dataSource.every((record, index) =>
      selectedKeys.includes(getRowValue(record, index)),
    );
  const someRowsSelected = selectedKeys.length > 0 && !allRowsSelected;

  return (
    <div className={cn('relative', className)} {...props}>
      {loading ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/60'>
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      ) : null}
      {dataSource.length === 0 && !loading ? (
        empty || <EmptyState title='No data' type='no-content' />
      ) : (
        <div className={cn(scroll?.x ? 'overflow-x-auto' : undefined)}>
          <UiTable>
            <TableHeader>
              <TableRow>
                {rowSelection ? (
                  <TableHead className='w-10'>
                    <UiCheckbox
                      checked={
                        allRowsSelected || (someRowsSelected && 'indeterminate')
                      }
                      onCheckedChange={(checked) => {
                        const nextKeys = checked
                          ? dataSource.map((record, index) =>
                              getRowValue(record, index),
                            )
                          : [];
                        const nextRows = dataSource.filter((record, index) =>
                          nextKeys.includes(getRowValue(record, index)),
                        );
                        rowSelection.onChange?.(nextKeys, nextRows);
                      }}
                    />
                  </TableHead>
                ) : null}
                {columns.map((column, index) => (
                  <TableHead
                    key={column.key || column.dataIndex || index}
                    style={{ width: column.width }}
                    className={cn(
                      column.fixed === 'right' &&
                        'sticky right-0 bg-background',
                    )}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSource.map((record, rowIndex) => {
                const recordKey = getRowValue(record, rowIndex);
                const reactRowKey = `${String(recordKey)}-${rowIndex}`;
                const rowProps = onRow?.(record, rowIndex) || {};
                return (
                  <TableRow
                    key={reactRowKey}
                    {...rowProps}
                    className={cn(rowProps.className)}
                  >
                    {rowSelection ? (
                      <TableCell className='w-10'>
                        <UiCheckbox
                          checked={selectedKeys.includes(recordKey)}
                          onCheckedChange={(checked) => {
                            const nextKeys = checked
                              ? [...selectedKeys, recordKey]
                              : selectedKeys.filter(
                                  (item) => item !== recordKey,
                                );
                            const nextRows = dataSource.filter((item, index) =>
                              nextKeys.includes(getRowValue(item, index)),
                            );
                            rowSelection.onChange?.(nextKeys, nextRows);
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((column, columnIndex) => {
                      const rawValue =
                        column.dataIndex !== undefined
                          ? record[column.dataIndex]
                          : undefined;
                      const content = column.render
                        ? column.render(rawValue, record, rowIndex)
                        : rawValue;
                      return (
                        <TableCell
                          key={column.key || column.dataIndex || columnIndex}
                          style={{ width: column.width }}
                          className={cn(
                            column.ellipsis && 'max-w-[240px] truncate',
                            column.fixed === 'right' &&
                              'sticky right-0 bg-background',
                          )}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </UiTable>
        </div>
      )}
      {pagination ? (
        <Pagination
          {...pagination}
          className='mt-4'
          total={pagination.total ?? dataSource.length}
        />
      ) : null}
    </div>
  );
};

export function Pagination({
  currentPage = 1,
  pageSize = 10,
  total = 0,
  onChange,
  className,
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <span className='text-sm text-muted-foreground'>
        {currentPage} / {pageCount}
      </span>
      <UiButton
        variant='outline'
        size='sm'
        disabled={currentPage <= 1}
        onClick={() => onChange?.(currentPage - 1, pageSize)}
      >
        <ChevronLeft className='h-4 w-4' />
      </UiButton>
      <UiButton
        variant='outline'
        size='sm'
        disabled={currentPage >= pageCount}
        onClick={() => onChange?.(currentPage + 1, pageSize)}
      >
        <ChevronRight className='h-4 w-4' />
      </UiButton>
    </div>
  );
}

export const Tabs = ({
  tabList = [],
  activeKey,
  onChange,
  children,
  type,
  className,
}) => (
  <UiTabs
    value={activeKey || tabList[0]?.itemKey}
    onValueChange={onChange}
    className={className}
  >
    {tabList.length ? (
      <TabsList
        className={cn(type === 'card' && 'w-full rounded-xl justify-start')}
      >
        {tabList.map((tab) => (
          <TabsTrigger key={tab.itemKey} value={tab.itemKey}>
            {tab.tab}
          </TabsTrigger>
        ))}
      </TabsList>
    ) : null}
    {children}
  </UiTabs>
);

export const TabPane = ({ itemKey, tab, children }) => (
  <TabsContent value={itemKey}>{children}</TabsContent>
);

Tabs.TabPane = TabPane;

export function Modal({
  visible,
  open,
  title,
  children,
  footer,
  onCancel,
  onOk,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading,
  width,
  bodyStyle,
  centered,
  ...props
}) {
  const isOpen = visible ?? open ?? false;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}
    >
      <DialogContent style={{ maxWidth: width, ...props.style }}>
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {props.description ? (
              <DialogDescription>{props.description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        <div style={bodyStyle}>{children}</div>
        {footer === null ? null : (
          <DialogFooter>
            {footer ?? (
              <>
                <UiButton variant='outline' onClick={onCancel}>
                  {cancelText}
                </UiButton>
                <UiButton onClick={onOk} disabled={confirmLoading}>
                  {confirmLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : null}
                  {okText}
                </UiButton>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

Modal.confirm = (options) => confirm(options);
Modal.info = (options) => alertInfo(options);
Modal.error = (options) => alertError(options);
Modal.warning = (options) => alertWarning(options);
Modal.success = (options) => alertSuccess(options);
Modal.destroyAll = () => {};

export function SideSheet({
  visible,
  title,
  children,
  footer,
  onCancel,
  onOk,
  placement = 'right',
  width,
  bodyStyle,
  closeIcon,
  fullMode,
  ...props
}) {
  const modalWidth =
    typeof width === 'number'
      ? width
      : typeof width === 'string' && width.trim() !== ''
        ? width
        : 760;

  return (
    <Dialog
      open={visible}
      onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}
    >
      <DialogContent style={{ maxWidth: modalWidth, ...props.style }}>
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {props.description ? (
              <DialogDescription>{props.description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        <div
          className='overflow-y-auto'
          style={{
            maxHeight: '78vh',
            ...bodyStyle,
          }}
        >
          {children}
        </div>
        {footer === null ? null : (
          <DialogFooter>
            {footer ?? (
              <>
                <UiButton variant='outline' onClick={onCancel}>
                  Cancel
                </UiButton>
                <UiButton onClick={onOk}>OK</UiButton>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const Layout = ({ children, className, style }) => (
  <div className={cn('flex min-h-0 flex-col', className)} style={style}>
    {children}
  </div>
);

Layout.Header = ({ children, className, style }) => (
  <header className={className} style={style}>
    {children}
  </header>
);
Layout.Content = ({ children, className, style }) => (
  <main className={className} style={style}>
    {children}
  </main>
);
Layout.Footer = ({ children, className, style }) => (
  <footer className={className} style={style}>
    {children}
  </footer>
);
Layout.Sider = ({ children, className, style }) => (
  <aside className={className} style={style}>
    {children}
  </aside>
);

export function Collapse({
  accordion,
  children,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
}) {
  const initialValue = activeKey ?? defaultActiveKey ?? [];
  const [openKeys, setOpenKeys] = useState(
    Array.isArray(initialValue) ? initialValue : [initialValue].filter(Boolean),
  );

  useEffect(() => {
    if (activeKey !== undefined) {
      setOpenKeys(Array.isArray(activeKey) ? activeKey : [activeKey]);
    }
  }, [activeKey]);

  const items = React.Children.toArray(children).filter(Boolean);

  const toggleKey = (itemKey) => {
    let nextKeys;
    if (accordion) {
      nextKeys = openKeys.includes(itemKey) ? [] : [itemKey];
    } else {
      nextKeys = openKeys.includes(itemKey)
        ? openKeys.filter((key) => key !== itemKey)
        : [...openKeys, itemKey];
    }
    if (activeKey === undefined) {
      setOpenKeys(nextKeys);
    }
    onChange?.(accordion ? nextKeys[0] : nextKeys);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        const itemKey = child.props.itemKey ?? index;
        const isOpen = openKeys.includes(itemKey);
        return React.cloneElement(child, {
          isOpen,
          onToggle: () => toggleKey(itemKey),
        });
      })}
    </div>
  );
}

Collapse.Panel = ({ header, children, isOpen, onToggle, extra, className }) => (
  <div className={cn('overflow-hidden rounded-lg border', className)}>
    <button
      type='button'
      className='flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium'
      onClick={onToggle}
    >
      <span>{header}</span>
      <span className='flex items-center gap-2'>
        {extra}
        {isOpen ? (
          <ChevronUp className='h-4 w-4' />
        ) : (
          <ChevronDown className='h-4 w-4' />
        )}
      </span>
    </button>
    {isOpen ? <div className='border-t px-4 py-4'>{children}</div> : null}
  </div>
);

export function Steps({ current = 0, children, className }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {items.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          index,
          status:
            index < current ? 'finish' : index === current ? 'process' : 'wait',
        });
      })}
    </div>
  );
}

Steps.Step = ({ title, description, icon, status, index }) => (
  <div
    className={cn(
      'rounded-xl border p-4 text-sm',
      status === 'process' && 'border-primary bg-primary/5',
      status === 'finish' &&
        'border-green-500 bg-green-50 dark:bg-green-950/20',
    )}
  >
    <div className='mb-2 flex items-center gap-3'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold'>
        {icon || index + 1}
      </div>
      <div className='font-medium'>{title}</div>
    </div>
    {description ? (
      <div className='text-muted-foreground'>{description}</div>
    ) : null}
  </div>
);

export function Image({ src, alt, className, preview, ...props }) {
  return <img src={src} alt={alt} className={className} {...props} />;
}

export function ImagePreview({ src, visible, onVisibleChange, onCancel }) {
  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={() => {
        onVisibleChange?.(false);
        onCancel?.();
      }}
    >
      <img src={src} alt='' className='max-h-[80vh] w-full object-contain' />
    </Modal>
  );
}

function getInitials(value) {
  if (!value) return '?';
  return String(value).trim().slice(0, 1).toUpperCase();
}

export function TagInput({
  value = [],
  onChange,
  placeholder,
  className,
  style,
}) {
  const [inputValue, setInputValue] = useState('');

  const commitValue = () => {
    const normalized = inputValue.trim();
    if (!normalized) return;
    const nextValue = [...value, normalized];
    onChange?.(nextValue);
    setInputValue('');
  };

  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2',
        className,
      )}
      style={style}
    >
      {value.map((item) => (
        <UiBadge key={item} variant='secondary' className='gap-1'>
          {item}
          <button
            type='button'
            onClick={() => onChange?.(value.filter((entry) => entry !== item))}
          >
            <X className='h-3 w-3' />
          </button>
        </UiBadge>
      ))}
      <input
        value={inputValue}
        className='min-w-[120px] flex-1 bg-transparent text-sm outline-none'
        placeholder={placeholder}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitValue();
          }
        }}
        onBlur={commitValue}
      />
    </div>
  );
}

export function Calendar({ onChange, dateGridRender, className }) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [viewDate]);

  const switchMonth = (delta) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className={cn('semi-calendar semi-calendar-month', className)}>
      <div className='semi-calendar-month-header mb-3 flex items-center justify-between'>
        <UiButton variant='ghost' size='icon' onClick={() => switchMonth(-1)}>
          <ChevronLeft className='h-4 w-4' />
        </UiButton>
        <div className='font-medium'>{monthLabel}</div>
        <UiButton variant='ghost' size='icon' onClick={() => switchMonth(1)}>
          <ChevronRight className='h-4 w-4' />
        </UiButton>
      </div>
      <table className='w-full table-fixed'>
        <thead>
          <tr className='semi-calendar-month-week-row'>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
              <th
                key={label}
                className='py-2 text-center text-xs text-muted-foreground'
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr key={rowIndex} className='semi-calendar-month-grid-row'>
              {days.slice(rowIndex * 7, rowIndex * 7 + 7).map((date) => {
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const dateString = date.toString();
                return (
                  <td
                    key={date.toISOString()}
                    className={cn(
                      'semi-calendar-month-grid-row-cell align-top',
                      isCurrentMonth
                        ? 'semi-calendar-month-same'
                        : 'opacity-40',
                      isToday && 'semi-calendar-month-today',
                    )}
                  >
                    <div className='relative min-h-[56px] rounded-md border border-transparent p-1'>
                      <div className='semi-calendar-month-grid-row-cell-day text-center text-xs'>
                        {date.getDate()}
                      </div>
                      {dateGridRender?.(dateString, date)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Collapsible = ({
  isOpen,
  defaultOpen,
  onOpenChange,
  children,
  trigger,
  className,
}) => {
  const [openValue, setOpenValue, isControlled] = useControllableState(
    isOpen,
    defaultOpen ?? false,
  );
  return (
    <UiCollapsible
      open={openValue}
      onOpenChange={(nextOpen) => {
        if (!isControlled) {
          setOpenValue(nextOpen);
        }
        onOpenChange?.(nextOpen);
      }}
      className={className}
    >
      {trigger ? (
        <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
      ) : null}
      <CollapsibleContent>{children}</CollapsibleContent>
    </UiCollapsible>
  );
};

export function Popover({ content, children, ...props }) {
  return (
    <UiPopover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent {...props}>{content}</PopoverContent>
    </UiPopover>
  );
}

const ChatMessageCard = ({
  message,
  roleConfig,
  renderChatBoxContent,
  renderChatBoxAction,
}) => {
  const roleMeta = roleConfig?.[message.role] || {};
  return (
    <div className='semi-chat-chatBox app-panel-card rounded-2xl p-4 shadow-sm'>
      <div className='mb-3 flex items-center gap-3'>
        <Avatar src={roleMeta.avatar} size='small'>
          {getInitials(roleMeta.name || message.role)}
        </Avatar>
        <div>
          <div className='text-sm font-medium'>
            {roleMeta.name || message.role}
          </div>
          <div className='text-xs text-muted-foreground'>{message.role}</div>
        </div>
      </div>
      <div className='semi-chat-chatBox-content'>
        {renderChatBoxContent
          ? renderChatBoxContent({
              message,
              className: 'prose prose-sm max-w-none dark:prose-invert',
            })
          : typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content)}
      </div>
      {renderChatBoxAction ? (
        <div className='semi-chat-chatBox-action mt-3'>
          {renderChatBoxAction({ message })}
        </div>
      ) : null}
    </div>
  );
};

export const Chat = forwardRef(
  (
    {
      chats = [],
      roleConfig,
      chatBoxRenderConfig = {},
      renderInputArea,
      onMessageSend,
      onClear,
      onStopGenerator,
      placeholder,
      className,
    },
    ref,
  ) => {
    const [value, setValue] = useState('');
    const scrollRef = useRef(null);
    useEffect(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, [chats]);

    const submitMessage = () => {
      if (!value.trim()) return;
      onMessageSend?.(value);
      setValue('');
    };

    const inputNode = (
      <UiTextarea
        value={value}
        rows={2}
        placeholder={placeholder}
        className='min-h-[52px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0'
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitMessage();
          }
        }}
      />
    );
    const clearContextNode = (
      <UiButton variant='ghost' size='icon' onClick={onClear}>
        <Trash2 className='h-4 w-4' />
      </UiButton>
    );
    const sendNode = (
      <UiButton size='icon' onClick={submitMessage}>
        <Send className='h-4 w-4' />
      </UiButton>
    );

    return (
      <div
        ref={ref}
        className={cn('semi-chat flex h-full flex-col', className)}
      >
        <ScrollArea className='semi-chat-content flex-1 px-4 py-4'>
          <div ref={scrollRef} className='semi-chat-list space-y-4'>
            {chats.map((message, index) => (
              <ChatMessageCard
                key={`${message.id ?? 'message'}-${message.createAt ?? index}-${index}`}
                message={message}
                roleConfig={roleConfig}
                renderChatBoxContent={chatBoxRenderConfig.renderChatBoxContent}
                renderChatBoxAction={chatBoxRenderConfig.renderChatBoxAction}
              />
            ))}
          </div>
        </ScrollArea>
        <div className='semi-chat-inputBox border-t bg-background'>
          {renderInputArea
            ? renderInputArea({
                detailProps: {
                  clearContextNode,
                  uploadNode: (
                    <UiButton variant='ghost' size='icon'>
                      <Upload className='h-4 w-4' />
                    </UiButton>
                  ),
                  inputNode,
                  sendNode,
                  onClick: undefined,
                },
              })
            : inputNode}
          {onStopGenerator ? (
            <div className='px-4 pb-4'>
              <UiButton variant='outline' size='sm' onClick={onStopGenerator}>
                <Square className='mr-2 h-3.5 w-3.5' />
                Stop
              </UiButton>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
Chat.displayName = 'SemiCompatChat';

export { CompatForm as Form, Row, Col, Spin, ScrollArea };
