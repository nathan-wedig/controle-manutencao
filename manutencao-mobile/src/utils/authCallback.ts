let _logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: (() => void) | null) => {
  _logoutHandler = handler;
};

export const triggerLogout = () => {
  _logoutHandler?.();
};
