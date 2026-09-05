import { App } from 'antd';

let messageInstance = null;
let notificationInstance = null;
let modalInstance = null;

export const AntdStaticBridge = () => {
  const staticFunctions = App.useApp();
  messageInstance = staticFunctions.message;
  notificationInstance = staticFunctions.notification;
  modalInstance = staticFunctions.modal;
  return null;
};

export const message = {
  success: (...args) => messageInstance ? messageInstance.success(...args) : null,
  error: (...args) => messageInstance ? messageInstance.error(...args) : null,
  warning: (...args) => messageInstance ? messageInstance.warning(...args) : null,
  info: (...args) => messageInstance ? messageInstance.info(...args) : null,
  loading: (...args) => messageInstance ? messageInstance.loading(...args) : null,
  open: (...args) => messageInstance ? messageInstance.open(...args) : null,
  destroy: (...args) => messageInstance ? messageInstance.destroy(...args) : null,
};

export const notification = {
  success: (...args) => notificationInstance ? notificationInstance.success(...args) : null,
  error: (...args) => notificationInstance ? notificationInstance.error(...args) : null,
  warning: (...args) => notificationInstance ? notificationInstance.warning(...args) : null,
  info: (...args) => notificationInstance ? notificationInstance.info(...args) : null,
  open: (...args) => notificationInstance ? notificationInstance.open(...args) : null,
  destroy: (...args) => notificationInstance ? notificationInstance.destroy(...args) : null,
};
