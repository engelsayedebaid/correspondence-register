import { useState, useEffect } from 'react';
import IconButton from './ui/IconButton';
import Avatar from './ui/Avatar';

function Header({
  user,
  onLogout,
  sessionStart,
  theme,
  onToggleTheme,
  systemLogo,
  onLogoChange,
  onMenuToggle,
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

  const isAdmin = user?.role === 'مدير النظام';

  return (
    <header className="app-header">
      <div className="header-brand">
        <button type="button" className="sidebar-toggle" onClick={onMenuToggle} aria-label="القائمة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="header-logo-wrapper">
          <div className={`header-logo ${isAdmin ? 'header-logo--editable' : ''}`}>
            {systemLogo ? (
              <img src={systemLogo} alt="Logo" />
            ) : (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          {isAdmin && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="header-logo-input"
              title="تعديل الشعار الرسمي للمؤسسة"
            />
          )}
        </div>
        <div className="header-title-wrap">
          <h1 className="header-title">سجل الوارد والصادر للمكاتبات</h1>
          {systemLogo && isAdmin && (
            <button
              type="button"
              onClick={() => onLogoChange(null)}
              className="header-reset-logo hidden-mobile"
              title="حذف الشعار المخصص واستعادة الافتراضي"
            >
              استعادة الشعار الافتراضي
            </button>
          )}
        </div>
      </div>

      <div className="header-actions">
        <div className="session-timer">
          <span className="session-dot" />
          <span><span className="hidden-mobile">اتصال مؤمن: </span>{elapsed}</span>
        </div>

        <IconButton onClick={onToggleTheme} title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}>
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </IconButton>

        <div className="user-badge">
          <Avatar initials={initials} size="md" />
          <div className="user-info hidden-mobile">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <button type="button" className="btn-logout" onClick={onLogout} id="logout-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden-mobile">خروج</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
