import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';

const ConfirmContext = createContext(null);

let globalConfirmFn = null;

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, options: {} });
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, options });
    });
  }, []);

  // Expose as global function
  globalConfirmFn = confirm;

  const handleConfirm = async () => {
    if (state.options.onConfirm) {
      await state.options.onConfirm();
    }
    if (resolveRef.current) resolveRef.current(true);
    setState({ open: false, options: {} });
  };

  const handleCancel = () => {
    if (state.options.onCancel) {
      state.options.onCancel();
    }
    if (resolveRef.current) resolveRef.current(false);
    setState({ open: false, options: {} });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.options.title || 'Confirm'}</AlertDialogTitle>
            {state.options.content && (
              <AlertDialogDescription asChild>
                <div>{typeof state.options.content === 'string' ? state.options.content : state.options.content}</div>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {state.options.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {state.options.okText || 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}

// Global imperative confirm function (works without hooks)
export function confirm(options) {
  if (globalConfirmFn) {
    return globalConfirmFn(options);
  }
  // Fallback to window.confirm
  const result = window.confirm(options.title || options.content || 'Are you sure?');
  if (result && options.onConfirm) options.onConfirm();
  if (!result && options.onCancel) options.onCancel();
  return Promise.resolve(result);
}

// Compatibility wrappers for Semi Modal.confirm/error/info/warning/success
export function alertError(options) {
  return confirm({ ...options, type: 'error' });
}

export function alertInfo(options) {
  return confirm({ ...options, type: 'info' });
}

export function alertWarning(options) {
  return confirm({ ...options, type: 'warning' });
}

export function alertSuccess(options) {
  return confirm({ ...options, type: 'success' });
}
