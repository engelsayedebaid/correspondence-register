import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Register from './components/Register';
import NewRecordPage from './components/NewRecordPage';
import Toast from './components/Toast';
import AuditLogModal from './components/AuditLogModal';

const getSimulatedIP = () => {
  const ipList = ['10.140.12.33', '10.140.12.45', '10.140.15.12', '10.140.12.89'];
  return ipList[Math.floor(Math.random() * ipList.length)];
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('register');
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

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

    addLogEntry('تسجيل دخول ناجح للمنظومة', sessionUser);
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

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('reg_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local records', e);
      }
    }
    return [];
  });

  const [departmentsList, setDepartmentsList] = useState(() => {
    const saved = localStorage.getItem('reg_departments');
    return saved ? JSON.parse(saved) : [];
  });
  const [responsibleList, setResponsibleList] = useState(() => {
    const saved = localStorage.getItem('reg_responsible');
    return saved ? JSON.parse(saved) : [];
  });
  const [commandersList, setCommandersList] = useState(() => {
    const saved = localStorage.getItem('reg_commanders');
    return saved ? JSON.parse(saved) : [];
  });
  const [typesList, setTypesList] = useState(() => {
    const saved = localStorage.getItem('reg_types');
    return saved ? JSON.parse(saved) : [];
  });
  const [statusesList, setStatusesList] = useState(() => {
    const saved = localStorage.getItem('reg_statuses');
    return saved ? JSON.parse(saved) : [];
  });
  const [prioritiesList, setPrioritiesList] = useState(() => {
    const saved = localStorage.getItem('reg_priorities');
    return saved ? JSON.parse(saved) : [];
  });
  const [classificationsList, setClassificationsList] = useState(() => {
    const saved = localStorage.getItem('reg_classifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('reg_records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (newRecord) => {
    const recordToAdd = {
      ...newRecord,
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => [recordToAdd, ...prev]);
    addToast('تمت إضافة المعاملة بنجاح', 'success');
    addLogEntry(`إضافة معاملة جديدة برقم قيد: ${newRecord.registrationNumber}`);
    setActiveNav('register');
  };

  const handleNavigate = (item) => {
    setActiveNav(item);
    if (item === 'audit') {
      setShowAuditLogs(true);
    }
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
            systemLogo={systemLogo}
            onLogoChange={handleLogoChange}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="app-body">
            <Sidebar
              activeItem={activeNav}
              onNavigate={handleNavigate}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isAdmin={user?.role === 'مدير النظام'}
            />
            <main className="main-content">
              {activeNav === 'register' ? (
                <Register
                  user={user}
                  addToast={addToast}
                  addLogEntry={addLogEntry}
                  records={records}
                  setRecords={setRecords}
                  onNavigate={handleNavigate}
                />
              ) : activeNav === 'add-record' ? (
                <NewRecordPage
                  onSave={handleAddRecord}
                  onCancel={() => setActiveNav('register')}
                  departmentsList={departmentsList}
                  responsibleList={responsibleList}
                  commandersList={commandersList}
                  typesList={typesList}
                  statusesList={statusesList}
                  prioritiesList={prioritiesList}
                  classificationsList={classificationsList}
                  onDepartmentsChange={(l) => { setDepartmentsList(l); localStorage.setItem('reg_departments', JSON.stringify(l)); }}
                  onResponsibleChange={(l) => { setResponsibleList(l); localStorage.setItem('reg_responsible', JSON.stringify(l)); }}
                  onCommandersChange={(l) => { setCommandersList(l); localStorage.setItem('reg_commanders', JSON.stringify(l)); }}
                  onTypesChange={(l) => { setTypesList(l); localStorage.setItem('reg_types', JSON.stringify(l)); }}
                  onStatusesChange={(l) => { setStatusesList(l); localStorage.setItem('reg_statuses', JSON.stringify(l)); }}
                  onPrioritiesChange={(l) => { setPrioritiesList(l); localStorage.setItem('reg_priorities', JSON.stringify(l)); }}
                  onClassificationsChange={(l) => { setClassificationsList(l); localStorage.setItem('reg_classifications', JSON.stringify(l)); }}
                />
              ) : null}
            </main>
          </div>
        </div>
      )}

      {showAuditLogs && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => {
            setShowAuditLogs(false);
            setActiveNav('register');
          }}
          onClear={handleClearLogs}
        />
      )}
    </>
  );
}

export default App;
