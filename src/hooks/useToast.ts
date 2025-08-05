import { toast, ToastOptions, Id } from 'react-toastify';
import { useCallback } from 'react';

export interface ToastConfig extends ToastOptions {
  autoClose?: number;
}

export const useToast = () => {
  const showSuccess = useCallback((message: string, config?: ToastConfig) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  }, []);

  const showError = useCallback((message: string, config?: ToastConfig) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  }, []);

  const showWarning = useCallback((message: string, config?: ToastConfig) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  }, []);

  const showInfo = useCallback((message: string, config?: ToastConfig) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  }, []);

  const showLoading = useCallback((message: string, config?: ToastConfig) => {
    return toast.loading(message, {
      position: 'top-right',
      ...config,
    });
  }, []);

  const updateToast = useCallback((toastId: Id, type: 'success' | 'error' | 'warning' | 'info', message: string, config?: ToastConfig) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      position: 'top-right',
      autoClose: type === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  }, []);

  const dismiss = useCallback((toastId?: Id) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismiss,
  };
};

// Funciones standalone para usar sin hook
export const toastService = {
  success: (message: string, config?: ToastConfig) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  },

  error: (message: string, config?: ToastConfig) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  },

  warning: (message: string, config?: ToastConfig) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  },

  info: (message: string, config?: ToastConfig) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  },

  loading: (message: string, config?: ToastConfig) => {
    return toast.loading(message, {
      position: 'top-right',
      ...config,
    });
  },

  update: (toastId: Id, type: 'success' | 'error' | 'warning' | 'info', message: string, config?: ToastConfig) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      position: 'top-right',
      autoClose: type === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...config,
    });
  },

  dismiss: (toastId?: Id) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};