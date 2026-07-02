import { useState, useEffect } from 'react';

function Header({
  user,
  onLogout,
  sessionStart,
  theme,
  onToggleTheme,
  onOpenLogs,
  systemLogo,
  onLogoChange,
}) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!sessionStart) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [sessionStart]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (.png, .jpg, .jpeg)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onLogoChange(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
    : '؟';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="header-logo" style={{ cursor: user?.role === 'مدير النظام' ? 'pointer' : 'default', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {systemLogo ? (
              <img src={systemLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              /* Default Government / State Crest Emblem */
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          {user?.role === 'مدير النظام' && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '36px',
                height: '36px',
                opacity: 0,
                cursor: 'pointer',
              }}
              title="تعديل الشعار الرسمي للمؤسسة"
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="header-title">سجل الوارد والصادر للمكاتبات الحكومية</h1>
          {systemLogo && user?.role === 'مدير النظام' && (
            <button
              onClick={() => onLogoChange(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-rose)',
                fontSize: '0.7rem',
                cursor: 'pointer',
                textAlign: 'right',
                padding: 0,
                marginTop: '2px',
                width: 'fit-content'
              }}
              title="حذف الشعار المخصص واستعادة الافتراضي"
            >
              🔄 استعادة الشعار الافتراضي
            </button>
          )}
        </div>
      </div>

      <div className="header-actions">
        {/* Intranet Connection / Timer */}
        <div className="session-timer">
          <span className="session-dot"></span>
          <span>اتصال حكومي مؤمن: {elapsed}</span>
        </div>

        {/* Audit Logs Trigger (Admin only) */}
        {user?.role === 'مدير النظام' && (
          <button
            type="button"
            className="btn-logout"
            style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}
            onClick={onOpenLogs}
            title="سجل العمليات الأمني للرقابة"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 6v6l4 2" />
            </svg>
            سجل العمليات الأمني
          </button>
        )}

        {/* Theme Toggler (Light/Dark Mode) */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
          style={{
            background: 'transparent',
            border: '1px solid rgba(100, 116, 139, 0.15)',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'dark' ? (
            // Sun Icon for switching to light mode
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            // Moon Icon for switching to dark mode
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* User Info Badge */}
        <div className="user-badge" style={{ paddingLeft: '0.75rem' }}>
          <div className="user-avatar">{initials}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginRight: '0.1rem' }}>
            <span className="user-name" style={{ fontSize: '0.8rem', lineHeight: 1.1 }}>{user?.name}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.role}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="btn-logout" onClick={onLogout} id="logout-btn">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          خروج
        </button>
      </div>
    </header>
  );
}

export default Header;
