/**
 * Semi Design Form compatibility layer using shadcn/ui primitives.
 *
 * This module provides drop-in replacements for Semi Design's Form system,
 * wrapping shadcn/ui components (Input, Switch, Textarea, Select, Checkbox, Slider)
 * with the Semi Form API (field, label, extraText, onChange, getFormApi, etc.).
 *
 * Usage:
 *   import { Form, Spin, Row, Col } from '../../components/ui/form-compat';
 *
 * The Form component exposes a `getFormApi` callback that returns an object
 * with `setValues(obj)` and `setValue(key, val)` methods, matching Semi's API.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useId,
  useState,
} from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { Slider } from './slider';
import { cn } from '../../lib/utils';
import {
  SelectItem,
} from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Loader2 } from 'lucide-react';

// ─── Form Context ──────────────────────────────────────────────────────────

const FormContext = createContext({ values: {}, setFieldValue: () => {} });

// ─── Form ──────────────────────────────────────────────────────────────────

export function Form({
  values: controlledValues,
  initValues,
  getFormApi,
  style,
  className,
  children,
  onSubmit,
  onValueChange,
  allowEmpty,
  autoComplete,
  layout,
  trigger,
  stopValidateWithError,
  ...rest
}) {
  const initValuesRef = useRef(initValues || {});
  const [internalValues, setInternalValues] = React.useState(initValues || {});
  const formElementRef = useRef(null);
  const isControlled = controlledValues !== undefined;
  const values = isControlled ? controlledValues : internalValues;
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const setFieldValue = React.useCallback(
    (key, val) => {
      if (!isControlled) {
        setInternalValues((prev) => ({ ...prev, [key]: val }));
      }
    },
    [isControlled],
  );

  // Build a formApi-compatible object
  const apiRef = useRef(null);
  if (!apiRef.current) {
    apiRef.current = {
      setValues: (newValues) => {
        if (!isControlled) {
          setInternalValues((prev) => ({ ...prev, ...newValues }));
        }
      },
      setValue: (key, val) => {
        if (!isControlled) {
          setInternalValues((prev) => ({ ...prev, [key]: val }));
        }
      },
      getValues: () => valuesRef.current,
      reset: () => {
        if (!isControlled) {
          setInternalValues({ ...initValuesRef.current });
        }
      },
      validate: () => Promise.resolve(valuesRef.current),
      submitForm: () => {
        if (formElementRef.current?.requestSubmit) {
          formElementRef.current.requestSubmit();
          return;
        }
        onSubmit?.(valuesRef.current);
      },
      getValue: (key) => valuesRef.current?.[key],
    };
  }

  useEffect(() => {
    if (getFormApi) {
      getFormApi(apiRef.current);
    }
  }, [getFormApi]);

  useEffect(() => {
    onValueChange?.(valuesRef.current);
  }, [onValueChange, values]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(valuesRef.current);
    }
  };

  return (
    <FormContext.Provider value={{ values: values || {}, setFieldValue }}>
      <form
        ref={formElementRef}
        style={style}
        className={className}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
      >
        {typeof children === 'function'
          ? children({ values: values || {}, formApi: apiRef.current })
          : children}
      </form>
    </FormContext.Provider>
  );
}

// ─── Form.Section ──────────────────────────────────────────────────────────

Form.Section = function FormSection({ text, children }) {
  return (
    <div className='form-section mb-6'>
      {text && (
        <h3 className='text-base font-semibold mb-4 pb-2 border-b'>{text}</h3>
      )}
      {children}
    </div>
  );
};

// ─── Helper: field wrapper with label & extraText ──────────────────────────

function FieldWrapper({ label, extraText, className, children }) {
  return (
    <div className={`form-field-wrapper mb-4 ${className || ''}`}>
      {label && (
        <Label className='block text-sm font-medium mb-1.5'>{label}</Label>
      )}
      {children}
      {extraText && (
        <div className='text-xs text-muted-foreground mt-1'>{extraText}</div>
      )}
    </div>
  );
}

// ─── Form.Input ────────────────────────────────────────────────────────────

Form.Input = function FormInput({
  field,
  label,
  noLabel,
  extraText,
  helpText,
  placeholder,
  onChange,
  value,
  disabled,
  type,
  mode,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  onEnterPress,
  validateStatus,
  rules,
  pure,
  size,
  showClear,
  initValue,
  className,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const inputValue = value ?? (field ? values[field] : '');
  const insidePrefix = pure && prefix && !addonBefore;
  const inputType = type || (mode === 'password' ? 'password' : undefined);

  return (
    <FieldWrapper label={label} extraText={extraText ?? helpText}>
      <div className='flex items-center gap-1'>
        {(prefix || addonBefore) && !insidePrefix && (
          <span className='text-sm text-muted-foreground shrink-0'>
            {prefix || addonBefore}
          </span>
        )}
        <div className='relative flex-1'>
          {insidePrefix ? (
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10'>
              {prefix}
            </span>
          ) : null}
          <Input
            type={inputType}
            value={inputValue ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(insidePrefix && 'pl-10', className)}
            onChange={(e) => {
              const val = e.target.value;
              if (field) setFieldValue(field, val);
              onChange && onChange(val);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEnterPress && onEnterPress(e);
              }
              rest.onKeyDown && rest.onKeyDown(e);
            }}
            {...rest}
          />
        </div>
        {(suffix || addonAfter) && (
          <span className='text-sm text-muted-foreground shrink-0'>
            {suffix || addonAfter}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
};

// ─── Form.InputNumber ──────────────────────────────────────────────────────

Form.InputNumber = function FormInputNumber({
  field,
  label,
  extraText,
  helpText,
  placeholder,
  onChange,
  disabled,
  min,
  max,
  step,
  suffix,
  prefix,
  pure,
  size,
  showClear,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  return (
    <FieldWrapper label={label} extraText={extraText ?? helpText}>
      <div className='flex items-center gap-1'>
        {prefix && (
          <span className='text-sm text-muted-foreground shrink-0'>
            {prefix}
          </span>
        )}
        <Input
          type='number'
          value={values[field] ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = e.target.value;
            const numVal = val === '' ? '' : Number(val);
            if (field) setFieldValue(field, numVal);
            onChange && onChange(numVal);
          }}
        />
        {suffix && (
          <span className='text-sm text-muted-foreground shrink-0'>
            {suffix}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
};

// ─── Form.TextArea ─────────────────────────────────────────────────────────

Form.TextArea = function FormTextArea({
  field,
  label,
  extraText,
  helpText,
  placeholder,
  onChange,
  disabled,
  autosize,
  rows,
  pure,
  size,
  showClear,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const minRows = autosize?.minRows || rows || 3;
  return (
    <FieldWrapper label={label} extraText={extraText ?? helpText}>
      <Textarea
        value={values[field] ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        onChange={(e) => {
          const val = e.target.value;
          if (field) setFieldValue(field, val);
          onChange && onChange(val);
        }}
      />
    </FieldWrapper>
  );
};

// ─── Form.Switch ───────────────────────────────────────────────────────────

Form.Switch = function FormSwitch({
  field,
  label,
  extraText,
  onChange,
  disabled,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  return (
    <FieldWrapper extraText={extraText}>
      <div className='flex items-center gap-2'>
        <Switch
          checked={!!values[field]}
          onCheckedChange={(checked) => {
            if (field) setFieldValue(field, checked);
            onChange && onChange(checked);
          }}
          disabled={disabled}
        />
        {label && <Label className='text-sm cursor-pointer'>{label}</Label>}
      </div>
    </FieldWrapper>
  );
};

// ─── Form.Checkbox ─────────────────────────────────────────────────────────

Form.Checkbox = function FormCheckbox({
  field,
  label,
  extraText,
  onChange,
  disabled,
  children,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  return (
    <FieldWrapper extraText={extraText}>
      <div className='flex items-center gap-2'>
        <Checkbox
          checked={!!values[field]}
          onCheckedChange={(checked) => {
            if (field) setFieldValue(field, checked);
            onChange && onChange(checked);
          }}
          disabled={disabled}
        />
        {(label || children) && (
          <Label className='text-sm cursor-pointer'>{label || children}</Label>
        )}
      </div>
    </FieldWrapper>
  );
};

// ─── Form.Select ───────────────────────────────────────────────────────────

const FORM_SELECT_EMPTY = '__form_select_empty__';
function toFormSelectVal(v) {
  if (v === '' || v === undefined || v === null) return FORM_SELECT_EMPTY;
  return String(v);
}
function fromFormSelectVal(v) {
  return v === FORM_SELECT_EMPTY ? '' : v;
}

Form.Select = function FormSelect({
  field,
  label,
  extraText,
  onChange,
  disabled,
  placeholder,
  optionList,
  children,
  multiple,
  filter,
  renderOptionItem,
  pure,
  size,
  showClear,
  style,
  className,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const currentValue = values[field] ?? (multiple ? [] : '');
  const [open, setOpen] = useState(false);
  const normalizedChildren = React.Children.toArray(children).filter(
    React.isValidElement,
  );

  // If optionList is provided, render from it
  const options =
    optionList ||
    normalizedChildren.map((child) => ({
      value: child.props.value,
      label: child.props.children,
    }));

  if (multiple) {
    const currentItems = Array.isArray(currentValue) ? currentValue : [];
    const selectedValues = currentItems.map((item) => String(item));
    const selectedOptions = options.filter((opt) =>
      selectedValues.includes(String(opt.value)),
    );
    const triggerLabel =
      selectedOptions.length > 0
        ? selectedOptions.map((opt) => opt.label).join(', ')
        : placeholder || '';

    const toggleValue = (optionValue) => {
      const normalizedValue = String(optionValue);
      const nextValues = selectedValues.includes(normalizedValue)
        ? currentItems.filter((item) => String(item) !== normalizedValue)
        : [...currentItems, optionValue];
      if (field) setFieldValue(field, nextValues);
      onChange && onChange(nextValues);
    };

    return (
      <FieldWrapper label={label} extraText={extraText}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={cn(
                'app-field-surface flex min-h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              disabled={disabled}
            >
              <span
                className={cn(
                  'truncate',
                  selectedOptions.length === 0 && 'text-muted-foreground',
                )}
              >
                {triggerLabel}
              </span>
              <span className='ml-2 shrink-0 text-xs text-muted-foreground'>
                {selectedOptions.length > 0 ? `${selectedOptions.length}` : ''}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align='start' className='w-[320px] max-w-[90vw] p-2'>
            <div className='max-h-64 space-y-1 overflow-y-auto'>
              {options.map((opt) => {
                const checked = selectedValues.includes(String(opt.value));
                return (
                  <div
                    key={String(opt.value)}
                    role='button'
                    tabIndex={disabled ? -1 : 0}
                    className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100/90'
                    onClick={() => toggleValue(opt.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleValue(opt.value);
                      }
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span className='min-w-0 flex-1 truncate'>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </FieldWrapper>
    );
  }

  const currentOption = options.find(
    (opt) => String(opt.value) === String(currentValue),
  );
  const triggerContent = currentOption ? (
    <div className='flex min-w-0 flex-col text-left'>
      <span className='truncate font-medium'>{currentOption.value}</span>
      {currentOption.label ? (
        <span className='truncate text-xs text-muted-foreground'>
          {typeof currentOption.label === 'string'
            ? currentOption.label
            : currentOption.value}
        </span>
      ) : null}
    </div>
  ) : (
    <span className='text-muted-foreground'>
      {placeholder || ''}
    </span>
  );

  return (
    <FieldWrapper label={label} extraText={extraText}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className={cn(
              'app-field-surface flex min-h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm',
              disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
            style={style}
            disabled={disabled}
          >
            <span className='min-w-0 flex-1 truncate'>{triggerContent}</span>
            <span className='ml-2 shrink-0 text-xs text-muted-foreground'>
              ▾
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-[320px] max-w-[90vw] p-2'>
          <div className='max-h-72 space-y-1 overflow-y-auto'>
            {options.map((opt) => {
              const selected = String(currentValue) === String(opt.value);
              const handleSelect = () => {
                const real = fromFormSelectVal(toFormSelectVal(opt.value));
                if (field) setFieldValue(field, real);
                onChange && onChange(real);
                setOpen(false);
              };

              if (renderOptionItem) {
                return (
                  <div key={toFormSelectVal(opt.value)}>
                    {renderOptionItem({
                      ...opt,
                      selected,
                      onClick: handleSelect,
                    })}
                  </div>
                );
              }

              return (
                <button
                  key={toFormSelectVal(opt.value)}
                  type='button'
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100/90',
                    selected && 'bg-slate-100/90',
                  )}
                  onClick={handleSelect}
                >
                  <span className='min-w-0 flex-1 truncate'>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
};

Form.Select.Option = function FormSelectOption({ value, children }) {
  return <SelectItem value={toFormSelectVal(value)}>{children}</SelectItem>;
};

// ─── Form.Slider ───────────────────────────────────────────────────────────

Form.Slider = function FormSlider({
  field,
  label,
  extraText,
  onChange,
  disabled,
  min,
  max,
  step,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  return (
    <FieldWrapper label={label} extraText={extraText}>
      <Slider
        value={[values[field] ?? min ?? 0]}
        onValueChange={(vals) => {
          if (field) setFieldValue(field, vals[0]);
          onChange && onChange(vals[0]);
        }}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
    </FieldWrapper>
  );
};

// ─── Form.DatePicker ──────────────────────────────────────────────────────
// Supports type='dateTimeRange' (two datetime-local inputs) and single date/dateTime.

function toDatetimeLocal(str) {
  if (!str) return '';
  if (typeof str !== 'string') str = String(str);
  // "2026-04-02 00:00:00" → "2026-04-02T00:00"
  return str.replace(' ', 'T').slice(0, 16);
}
function fromDatetimeLocal(str) {
  if (!str) return '';
  if (typeof str !== 'string') str = String(str);
  // "2026-04-02T00:00" → "2026-04-02 00:00:00"
  return str.replace('T', ' ') + (str.length <= 16 ? ':00' : '');
}

Form.DatePicker = function FormDatePicker({
  field,
  label,
  extraText,
  onChange,
  disabled,
  type,
  pure,
  size,
  showClear,
  placeholder,
  presets,
  className,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const currentValue = values[field];
  const renderPickerInput = ({
    inputValue,
    inputType,
    inputPlaceholder,
    onInputChange,
    inputClassName,
  }) => {
    return (
      <div className='relative flex-1'>
        <Input
          type={inputType}
          className={cn('w-full', inputClassName)}
          value={inputValue}
          placeholder={inputPlaceholder}
          disabled={disabled}
          onChange={onInputChange}
        />
      </div>
    );
  };

  if (type === 'dateTimeRange') {
    const rangeValue = Array.isArray(currentValue) ? currentValue : ['', ''];
    const ph = Array.isArray(placeholder) ? placeholder : ['', ''];
    const updateRange = (index, val) => {
      const next = [...rangeValue];
      next[index] = fromDatetimeLocal(val);
      if (field) setFieldValue(field, next);
      onChange && onChange(next);
    };
    return (
      <FieldWrapper label={label} extraText={extraText}>
        <div className='flex items-center gap-2'>
          {renderPickerInput({
            inputType: 'datetime-local',
            inputValue: toDatetimeLocal(rangeValue[0]),
            inputPlaceholder: ph[0],
            inputClassName: 'flex-1',
            onInputChange: (e) => updateRange(0, e.target.value),
          })}
          <span className='text-muted-foreground text-sm'>—</span>
          {renderPickerInput({
            inputType: 'datetime-local',
            inputValue: toDatetimeLocal(rangeValue[1]),
            inputPlaceholder: ph[1],
            inputClassName: 'flex-1',
            onInputChange: (e) => updateRange(1, e.target.value),
          })}
        </div>
      </FieldWrapper>
    );
  }

  // Single date or dateTime
  const inputType = type === 'dateTime' ? 'datetime-local' : 'date';
  const displayValue =
    inputType === 'datetime-local'
      ? toDatetimeLocal(currentValue ?? '')
      : (currentValue ?? '');

  return (
    <FieldWrapper label={label} extraText={extraText}>
      {renderPickerInput({
        inputType,
        inputValue: displayValue,
        inputPlaceholder: placeholder,
        inputClassName: className,
        onInputChange: (e) => {
          const val =
            inputType === 'datetime-local'
              ? fromDatetimeLocal(e.target.value)
              : e.target.value;
          if (field) setFieldValue(field, val);
          onChange && onChange(val);
        },
      })}
    </FieldWrapper>
  );
};

Form.AutoComplete = function FormAutoComplete({
  field,
  label,
  noLabel,
  extraText,
  onChange,
  placeholder,
  disabled,
  data = [],
  value,
  type,
  mode,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  validateStatus,
  rules,
  pure,
  size,
  showClear,
  className,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const inputId = useId();
  const inputValue = value ?? (field ? values[field] : '');
  const insidePrefix = pure && prefix && !addonBefore;
  const inputType = type || (mode === 'password' ? 'password' : undefined);
  return (
    <FieldWrapper label={label} extraText={extraText}>
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          {(prefix || addonBefore) && !insidePrefix && (
            <span className='text-sm text-muted-foreground shrink-0'>
              {prefix || addonBefore}
            </span>
          )}
          <div className='relative flex-1'>
            {insidePrefix ? (
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10'>
                {prefix}
              </span>
            ) : null}
            <Input
              list={inputId}
              type={inputType}
              value={inputValue ?? ''}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(insidePrefix && 'pl-10', className)}
              onChange={(e) => {
                const val = e.target.value;
                if (field) setFieldValue(field, val);
                onChange && onChange(val);
              }}
              {...rest}
            />
          </div>
          {(suffix || addonAfter) && (
            <span className='text-sm text-muted-foreground shrink-0'>
              {suffix || addonAfter}
            </span>
          )}
        </div>
        <datalist id={inputId}>
          {data.map((item) => (
            <option key={`${item.value}-${item.label}`} value={item.value}>
              {item.label}
            </option>
          ))}
        </datalist>
      </div>
    </FieldWrapper>
  );
};

Form.RadioGroup = function FormRadioGroup({
  field,
  label,
  extraText,
  onChange,
  children,
  value,
  direction = 'vertical',
  type,
  ...rest
}) {
  const { values, setFieldValue } = useContext(FormContext);
  const currentValue = value ?? (field ? values[field] : '');
  return (
    <FieldWrapper label={label} extraText={extraText}>
      <div
        className={`${
          direction === 'vertical' ? 'grid gap-3' : 'flex flex-wrap gap-4'
        } ${type === 'button' ? 'gap-2' : ''}`}
        role='radiogroup'
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            checked: String(currentValue) === String(child.props.value),
            onChange: () => {
              if (field) setFieldValue(field, child.props.value);
              onChange && onChange(child.props.value);
            },
          });
        })}
      </div>
    </FieldWrapper>
  );
};

Form.Slot = function FormSlot({ label, extraText, children, className }) {
  return (
    <FieldWrapper label={label} extraText={extraText} className={className}>
      {children}
    </FieldWrapper>
  );
};

Form.Upload = function FormUpload({
  field,
  label,
  extraText,
  onChange,
  accept,
  multiple,
  fileList = [],
  dragMainText,
  dragSubText,
  children,
  style,
}) {
  return (
    <FieldWrapper label={label} extraText={extraText}>
      <label
        className='flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input bg-muted/30 px-4 py-6 text-center text-sm'
        style={style}
      >
        <input
          type='file'
          className='hidden'
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            const files = Array.from(e.target.files || []).map((file) => ({
              uid: `${file.name}-${file.size}-${file.lastModified}`,
              name: file.name,
              size: file.size,
              fileInstance: file,
            }));
            onChange && onChange({ fileList: files, currentFile: files[0] });
          }}
        />
        <span className='font-medium'>
          {dragMainText || children || '点击上传文件'}
        </span>
        {dragSubText ? (
          <span className='mt-1 text-xs text-muted-foreground'>
            {dragSubText}
          </span>
        ) : null}
      </label>
      {fileList.length > 0 ? (
        <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
          {fileList.map((file) => (
            <div key={file.uid || file.name}>{file.name}</div>
          ))}
        </div>
      ) : null}
    </FieldWrapper>
  );
};

// ─── Row / Col (Tailwind grid replacements) ────────────────────────────────

export function Row({ gutter, children, className, style }) {
  const gutterValue =
    typeof gutter === 'number'
      ? gutter
      : gutter && typeof gutter === 'object'
        ? Math.max(
            ...Object.values(gutter).filter(
              (value) => typeof value === 'number',
            ),
            16,
          )
        : 16;
  return (
    <div
      className={`form-grid-row ${className || ''}`}
      style={{
        gap: `${gutterValue}px`,
        ...style,
      }}
    >
      {React.Children.map(children, (child) => {
        if (
          child === null ||
          child === undefined ||
          typeof child === 'boolean'
        ) {
          return child;
        }
        if (!React.isValidElement(child)) {
          return (
            <div
              className='form-grid-col'
              style={{
                '--col-xs': 24,
                '--col-sm': 24,
                '--col-md': 24,
                '--col-lg': 24,
                '--col-xl': 24,
              }}
            >
              {child}
            </div>
          );
        }
        const childClassName = child.props?.className || '';
        if (
          typeof childClassName === 'string' &&
          childClassName.includes('form-grid-col')
        ) {
          return child;
        }
        return (
          <div
            className='form-grid-col'
            style={{
              '--col-xs': 24,
              '--col-sm': 24,
              '--col-md': 24,
              '--col-lg': 24,
              '--col-xl': 24,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export function Col({ xs, sm, md, lg, xl, span, children, className, style }) {
  const xsSpan = xs || span || 24;
  const smSpan = sm || xsSpan;
  const mdSpan = md || smSpan;
  const lgSpan = lg || mdSpan;
  const xlSpan = xl || lgSpan;
  return (
    <div
      className={`form-grid-col ${className || ''}`}
      style={{
        '--col-xs': xsSpan,
        '--col-sm': smSpan,
        '--col-md': mdSpan,
        '--col-lg': lgSpan,
        '--col-xl': xlSpan,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Spin (loading wrapper) ────────────────────────────────────────────────

export function Spin({ spinning, children, tip }) {
  if (!spinning) return <>{children}</>;
  return (
    <div className='relative'>
      <div className='opacity-50 pointer-events-none'>{children}</div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        {tip && (
          <span className='ml-2 text-sm text-muted-foreground'>{tip}</span>
        )}
      </div>
    </div>
  );
}
