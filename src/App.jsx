import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Register from './components/Register';
import Toast from './components/Toast';
import AuditLogModal from './components/AuditLogModal';

// Intranet IP simulator
const getSimulatedIP = () => {
  const ipList = ['10.140.12.33', '10.140.12.45', '10.140.15.12', '10.140.12.89'];
  return ipList[Math.floor(Math.random() * ipList.length)];
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);

  // Security features: Theme and Logs
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [systemLogo, setSystemLogo] = useState(() => localStorage.getItem('system_logo') || null);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('audit_logs');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  const handleLogoChange = (newLogoBase64) => {
    if (newLogoBase64 === null) {
      localStorage.removeItem('system_logo');
      setSystemLogo(null);
      addToast('تمت استعادة الشعار الافتراضي للنظام', 'info');
      addLogEntry('استعادة الشعار الافتراضي للمنظومة');
    } else {
      localStorage.setItem('system_logo', newLogoBase64);
      setSystemLogo(newLogoBase64);
      addToast('تم تحديث الشعار الرسمي للمنظومة بنجاح', 'success');
      addLogEntry('تحديث الشعار الرسمي للمنظومة');
    }
  };

  // Apply theme class on body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Check for existing session
  useEffect(() => {
    const session = sessionStorage.getItem('auth_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setIsAuthenticated(true);
          setUser(parsed.user);
          setSessionStart(parsed.timestamp);
        } else {
          sessionStorage.removeItem('auth_session');
          addToast('انتهت الجلسة، يرجى تسجيل الدخول مجدداً', 'error');
        }
      } catch {
        sessionStorage.removeItem('auth_session');
      }
    }
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Write log to the Security Audit Log list
  const addLogEntry = useCallback((action, customUser = null) => {
    const currentUser = customUser || user;
    if (!currentUser) return;
    
    const newLog = {
      timestamp: new Date().toLocaleString('ar-EG', { hour12: true }),
      username: currentUser.name,
      role: currentUser.role,
      action: action,
      ip: getSimulatedIP(),
    };

    setAuditLogs(prev => {
      const updated = [...prev, newLog];
      localStorage.setItem('audit_logs', JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const handleLogin = (username) => {
    let role = 'مدير النظام';
    let fullName = username;

    // Detect user role based on username credentials
    if (username.toLowerCase() === 'admin') {
      role = 'مدير النظام';
      fullName = 'المسؤول العام / أدمن (Admin)';
    } else if (username.toLowerCase() === 'writer') {
      role = 'مدخل بيانات';
      fullName = 'النقيب خالد (Writer)';
    } else if (username.toLowerCase() === 'reader') {
      role = 'مستعرض';
      fullName = 'الملازم سعد (Reader)';
    }

    const sessionUser = { name: fullName, username: username.toLowerCase(), role };
    const session = {
      user: sessionUser,
      timestamp: Date.now(),
      token: btoa(`${username}:${Date.now()}:${Math.random().toString(36)}`),
    };

    sessionStorage.setItem('auth_session', JSON.stringify(session));
    setIsAuthenticated(true);
    setUser(session.user);
    setSessionStart(session.timestamp);
    
    // Log login success
    addLogEntry('تسجيل دخول ناجح للمنظومة', session.user);
    addToast(`مرحباً بك في المنظومة الحكومية الأمنية، تم تسجيل الدخول بنجاح`, 'success');
  };

  const handleLogout = () => {
    if (user) {
      addLogEntry('تسجيل خروج آمن من المنظومة');
    }
    sessionStorage.removeItem('auth_session');
    setIsAuthenticated(false);
    setUser(null);
    setSessionStart(null);
    addToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const handleClearLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem('audit_logs');
    addToast('تم تصفير سجل العمليات الأمني بالكامل', 'info');
  };

  return (
    <>
      <Toast toasts={toasts} />
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} systemLogo={systemLogo} />
      ) : (
        <div className="app-layout">
          <Header
            user={user}
            onLogout={handleLogout}
            sessionStart={sessionStart}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onOpenLogs={() => setShowAuditLogs(true)}
            systemLogo={systemLogo}
            onLogoChange={handleLogoChange}
          />
          <main className="main-content">
            <Register
              user={user}
              addToast={addToast}
              addLogEntry={addLogEntry}
            />
          </main>
        </div>
      )}

      {showAuditLogs && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setShowAuditLogs(false)}
          onClear={handleClearLogs}
        />
      )}
    </>
  );
}

export default App;
