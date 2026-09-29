import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './OfflineNotice.module.css';

export default function OfflineNotice() {
  const { pathname } = useLocation();
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [reloadReady, setReloadReady] = useState(false);
  const [updateRequested, setUpdateRequested] = useState(false);
  const onTimerPage = pathname.startsWith('/timer/');
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () => setRegistrationFailed(true),
    // Another tab may activate an update; never let that interrupt this brew.
    onNeedReload: () => setReloadReady(true),
  });

  useEffect(() => {
    if (reloadReady && updateRequested && !onTimerPage) window.location.reload();
  }, [reloadReady, updateRequested, onTimerPage]);

  // Keep the worker registered, but defer prompts until the user leaves the timer.
  // Prompt mode never automatically reloads an active or paused brew.
  if (onTimerPage || (!offlineReady && !needRefresh && !reloadReady && !registrationFailed)) return null;

  const hasUpdate = needRefresh || reloadReady;

  function update() {
    if (reloadReady) {
      window.location.reload();
      return;
    }
    setUpdateRequested(true);
    void updateServiceWorker(true).catch(() => {
      setUpdateRequested(false);
      setRegistrationFailed(true);
    });
  }

  function dismiss() {
    setOfflineReady(false);
    setNeedRefresh(false);
    setReloadReady(false);
    setUpdateRequested(false);
    setRegistrationFailed(false);
  }

  return (
    <aside className={styles.notice} aria-label="App availability">
      <p role="status">
        {registrationFailed ? 'Offline setup failed. You can still brew while this page is open. Try reopening when connected.'
          : hasUpdate ? 'A new version of AeroTimer is ready.'
            : 'AeroTimer is ready to use offline.'}
      </p>
      <div className={styles.actions}>
        {hasUpdate && (
          <button onClick={update} disabled={updateRequested}>
            {updateRequested ? 'Updating…' : 'Update now'}
          </button>
        )}
        <button onClick={dismiss}>{hasUpdate ? 'Later' : 'Dismiss'}</button>
      </div>
    </aside>
  );
}
