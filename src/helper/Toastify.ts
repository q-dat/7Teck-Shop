import { toast, ToastOptions } from 'react-toastify';

type ToastMessage = string | Record<string, string>;

const toastOptions: ToastOptions = {
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

function showToast(message: string, statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) {
    toast.success(message, toastOptions);
    return;
  }

  if (statusCode >= 300 && statusCode < 400) {
    toast.warning(message, toastOptions);
    return;
  }

  if (statusCode >= 400) {
    toast.error(message, toastOptions);
    return;
  }

  toast.info(message, toastOptions);
}

export function Toastify(message: ToastMessage, statusCode: number) {
  if (typeof message === 'string') {
    showToast(message, statusCode);
    return;
  }

  Object.values(message).forEach((item) => {
    showToast(item, statusCode);
  });
}
