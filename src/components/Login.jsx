import { useState } from 'react';
import { Icons } from './Icons';
import Button from './ui/Button';
import Input from './ui/Input';

function Login({ onLogin, systemLogo }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const MAX_ATTEMPTS = 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (locked) {
      setError('تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة خاطئة. حاول بعد ٥ دقائق');
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    if (password === '1234') {
      onLogin(username);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setError('تم قفل الحساب مؤقتاً لحماية النظام');
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 5 * 60 * 1000);
      } else {
        setError(`كلمة المرور أو اسم المستخدم غير صحيح (${MAX_ATTEMPTS - newAttempts} محاولات متبقية)`);
      }
    }

    setLoading(false);
  };

  const logoContent = systemLogo ? (
    <img src={systemLogo} alt="Logo" />
  ) : (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v12M8 10h8M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-logo">{logoContent}</div>
        <h1 className="login-brand-title">منظومة المكاتبات الرسمية</h1>
        <p className="login-brand-desc">
          نظام إلكتروني حكومي مؤمن لإدارة سجل الوارد والصادر للمكاتبات الرسمية
        </p>
        <div className="login-security-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          اتصال آمن ومشفر
        </div>
      </div>

      <div className="login-form-panel">
        <form className="login-form-card" onSubmit={handleSubmit}>
          <h2 className="login-form-title">تسجيل الدخول</h2>
          <p className="login-form-subtitle">أدخل بيانات الاعتماد للوصول إلى المنظومة</p>

          {error && <div className="login-error">{error}</div>}

          <Input
            label="اسم المستخدم"
            id="login-username"
            icon={Icons.user}
            type="text"
            placeholder="أدخل اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || locked}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="كلمة المرور"
            id="login-password"
            icon={Icons.lock}
            type="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || locked}
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading || locked} id="login-submit">
            {loading ? (
              <>
                <span className="spinner" />
                جاري التحقق...
              </>
            ) : (
              'تسجيل دخول آمن'
            )}
          </Button>

          <div className="login-credentials">
            <div className="login-credentials-title">تسجيل الدخول التجريبي حسب الصلاحيات:</div>
            <div className="login-credentials-list">
              <div><strong>admin</strong> — مدير النظام (صلاحيات كاملة)</div>
              <div><strong>writer</strong> — مدخل بيانات (إضافة وتعديل)</div>
              <div><strong>reader</strong> — مستعرض (قراءة وبحث فقط)</div>
              <div className="login-credentials-footer">كلمة المرور: <strong>1234</strong></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
