import { useInternetIdentity } from "@caffeineai/core-infrastructure";

/**
 * Thin wrapper around the Internet Identity context that exposes the auth
 * surface the app shell needs. Use `isAuthenticated` to gate the main app
 * behind login and `isInitializing` to avoid flashing the welcome screen
 * while a stored session is being restored.
 */
export function useAuth() {
  const {
    identity,
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
  } = useInternetIdentity();

  return {
    identity,
    login,
    logout: clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
  };
}
