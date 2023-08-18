const ENCRYPTED_KEY_TOKEN_STORAGE = window.btoa("user-access-token");

export const SET_ENCRYPTED_OBJ = (token) => localStorage.setItem(ENCRYPTED_KEY_TOKEN_STORAGE, window.btoa(token));

export const GET_UNENCRYPTED_OBJ = () => {
  const item = localStorage.getItem(ENCRYPTED_KEY_TOKEN_STORAGE);
  if (!item) return null;
  return window.atob(item);
};

export const removeToken = () => localStorage.removeItem(ENCRYPTED_KEY_TOKEN_STORAGE);
