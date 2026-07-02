import { useState } from 'react';
import { Icons } from './Icons';

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

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1200));

    // Accepted password is "1234" for simplicity
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

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {systemLogo ? (
            <img src={systemLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            /* Default Shield Logo */
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="none" stroke="white" strokeWidth="2"/>
              <path d="M12 6v12M8 10h8M9 14h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>

        <h1 className="login-title">منظومة المكاتبات الرسمية</h1>
        <p className="login-subtitle">نظام إلكتروني حكومي مؤمن لإدارة الصادر والوارد</p>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="login-username">
            اسم المستخدم
          </label>
          <div className="input-icon-wrapper">
            <span className="input-icon">{Icons.user}</span>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || locked}
              autoComplete="username"
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            كلمة المرور
          </label>
          <div className="input-icon-wrapper">
            <span className="input-icon">{Icons.lock}</span>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="أدخل كلمة المرور (1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || locked}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || locked}
          id="login-submit"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #1a56db)' }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              جاري التحقق أمنياً...
            </>
          ) : (
            'تسجيل دخول آمن'
          )}
        </button>

        {/* Informative credentials for testing Roles */}
        <div className="login-credentials">
          <div className="login-credentials-title">تسجيل الدخول التجريبي حسب الصلاحيات:</div>
          <div className="login-credentials-list">
            <div>🔑 <strong>admin</strong> (مدير النظام) - صلاحيات كاملة وسجل أمني</div>
            <div>🔑 <strong>writer</strong> (مدخل بيانات) - إضافة وتعديل فقط (حظر الحذف)</div>
            <div>🔑 <strong>reader</strong> (مستعرض) - قراءة وبحث فقط (حظر التعديل/الحذف)</div>
            <div className="login-credentials-footer">كلمة المرور المشتركة: <strong>1234</strong></div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
