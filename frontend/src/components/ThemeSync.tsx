/**
 * Theme synchronization component
 * Syncs user's theme preference from backend to ThemeContext when authenticated
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetMyPreferencesQuery } from '../features/preferences/preferencesApi';
import { useThemeMode } from '../contexts/ThemeContext';

/**
 * Component that syncs theme preference from backend to ThemeContext
 * Only runs when user is authenticated
 */
const ThemeSync: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const { data: preferences, isSuccess } = useGetMyPreferencesQuery(undefined, {
    skip: !user, // Only fetch preferences if user is logged in
  });
  const { setThemeMode } = useThemeMode();
  const hasAppliedTheme = useRef(false);

  useEffect(() => {
    // Apply theme preference from backend when successfully loaded
    // Only do this once per login session
    if (isSuccess && preferences?.themeMode && !hasAppliedTheme.current) {
      if (preferences.themeMode === 'light' || preferences.themeMode === 'dark') {
        setThemeMode(preferences.themeMode);
        hasAppliedTheme.current = true;
      }
    }

    // Reset flag when user logs out
    if (!user) {
      hasAppliedTheme.current = false;
    }
  }, [isSuccess, preferences, setThemeMode, user]);

  return null; // This component doesn't render anything
};

export default ThemeSync;
