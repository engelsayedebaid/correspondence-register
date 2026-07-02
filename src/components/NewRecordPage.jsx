import { useState } from 'react';
import EditableSelect from './EditableSelect';
import DocumentScanner from './DocumentScanner';
import Button from './ui/Button';
import { Icons } from './Icons';

function NewRecordPage({
  onSave,
  onCancel,
  departmentsList,
  responsibleList,
  commandersList,
  typesList,
  statusesList,
  prioritiesList,
  classificationsList,
  onDepartmentsChange,
  onResponsibleChange,
  onCommandersChange,
  onTypesChange,
  onStatusesChange,
  onPrioritiesChange,
  onClassificationsChange,
}) {
  const [form, setForm] = useState({
    registrationNumber: '',
    registrationDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    type: 'وارد',
    source: '',
    summary: '',
    attachments: [],
    commander: '',
    responsible: '',
    status: 'قيد المعالجة',
    priority: 'متوسط',
    classification: 'عام',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [showScanner, setShowScanner] = useState(false);

  const handleScanComplete = (scannedFields) => {
    setForm(prev => ({ ...prev, ...scannedFields }));
  };

  const validate = () => {
    const e = {};
    if (!form.registrationNumber.trim()) e.registrationNumber = 'مطلوب';
    if (!form.source.trim()) e.source = 'مطلوب';
    if (!form.summary.trim()) e.summary = 'مطلوب';
    if (!form.responsible.trim()) e.responsible = 'مطلوب';
    if (!form.commander.trim()) e.commander = 'مطلوب';
    if (!form.type.trim()) e.type = 'مطلوب';
    if (!form.status.trim()) e.status = 'مطلوب';
    if (!form.priority.trim()) e.priority = 'مطلوب';
    if (!form.classification.trim()) e.classification = 'مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="nrp">
      {/* Page Header */}
      <div className="nrp-header">
        <div>
          <h1 className="nrp-title">إضافة معاملة جديدة</h1>
          <p className="nrp-subtitle">قم بتعبئة البيانات المطلوبة لتسجيل مكاتبة جديدة في النظام</p>
        </div>
        <div className="nrp-actions">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            العودة للسجل
          </Button>
          <Button type="button" variant="success" onClick={handleSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            حفظ المعاملة
          </Button>
        </div>
      </div>

      <form id="new-record-form" onSubmit={handleSubmit}>
        {/* OCR Scanner Banner */}
        <div className="nrp-scanner">
          <div className="nrp-scanner-info">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <div>
              <strong>المسح الضوئي الذكي (OCR)</strong>
              <span>استخدم الكاميرا لقراءة بيانات المكاتبة تلقائياً</span>
            </div>
          </div>
          <Button type="button" variant="primary" onClick={() => setShowScanner(true)}>
            بدء المسح
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="nrp-grid">
          {/* Left Column - Registration Info */}
          <div className="nrp-card">
            <div className="nrp-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <h3>بيانات القيد</h3>
            </div>

            <div className="nrp-form-row">
              <div className="form-group">
                <label className="form-label">رقم القيد *</label>
                <input
                  className={`form-input ${errors.registrationNumber ? 'form-input--error' : ''}`}
                  type="text"
                  value={form.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  placeholder="أدخل رقم القيد"
                />
                {errors.registrationNumber && <div className="form-error">{errors.registrationNumber}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">التاريخ</label>
                <input
                  className="form-input"
                  type="text"
                  value={form.registrationDate}
                  onChange={(e) => handleChange('registrationDate', e.target.value)}
                  placeholder="YYYY/MM/DD"
                />
              </div>
            </div>

            <div className="nrp-form-row">
              <div className="form-group">
                <EditableSelect
                  label="النوع *"
                  value={form.type}
                  onChange={(val) => handleChange('type', val)}
                  options={typesList}
                  onOptionsChange={onTypesChange}
                  placeholder="اختر النوع"
                  error={errors.type}
                />
              </div>
              <div className="form-group">
                <EditableSelect
                  label="الدرجة السرية *"
                  value={form.classification}
                  onChange={(val) => handleChange('classification', val)}
                  options={classificationsList}
                  onOptionsChange={onClassificationsChange}
                  placeholder="اختر الدرجة السرية"
                  error={errors.classification}
                />
              </div>
            </div>

            <div className="form-group">
              <EditableSelect
                label="الجهة *"
                value={form.source}
                onChange={(val) => handleChange('source', val)}
                options={departmentsList}
                onOptionsChange={onDepartmentsChange}
                placeholder="اختر الجهة"
                error={errors.source}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ملخص المكاتبة ومضمونها *</label>
              <textarea
                className={`form-textarea ${errors.summary ? 'form-input--error' : ''}`}
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="أدخل ملخص المكاتبة بالتفصيل..."
                rows="4"
              />
              {errors.summary && <div className="form-error">{errors.summary}</div>}
            </div>
          </div>

          {/* Right Column - Assignment & Attachments */}
          <div className="nrp-card">
            <div className="nrp-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              <h3>التكليف والمتابعة</h3>
            </div>

            <div className="nrp-form-row">
              <div className="form-group">
                <EditableSelect
                  label="المسؤول *"
                  value={form.responsible}
                  onChange={(val) => handleChange('responsible', val)}
                  options={responsibleList}
                  onOptionsChange={onResponsibleChange}
                  placeholder="اختر المسؤول"
                  error={errors.responsible}
                />
              </div>
              <div className="form-group">
                <EditableSelect
                  label="القائد / الوحدة *"
                  value={form.commander}
                  onChange={(val) => handleChange('commander', val)}
                  options={commandersList}
                  onOptionsChange={onCommandersChange}
                  placeholder="اختر القائد"
                  error={errors.commander}
                />
              </div>
            </div>

            <div className="nrp-form-row">
              <div className="form-group">
                <EditableSelect
                  label="الحالة *"
                  value={form.status}
                  onChange={(val) => handleChange('status', val)}
                  options={statusesList}
                  onOptionsChange={onStatusesChange}
                  placeholder="اختر الحالة"
                  error={errors.status}
                />
              </div>
              <div className="form-group">
                <EditableSelect
                  label="الأولوية *"
                  value={form.priority}
                  onChange={(val) => handleChange('priority', val)}
                  options={prioritiesList}
                  onOptionsChange={onPrioritiesChange}
                  placeholder="اختر الأولوية"
                  error={errors.priority}
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="form-group">
              <label className="form-label">المرفقات (PDF, صور, Word)</label>
              <div className="nrp-upload">
                <input
                  type="file"
                  multiple
                  id="nrp-file-input"
                  className="hidden-file-input"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;

                    const newAttachments = files.map(file => ({
                      id: Math.random().toString(36).substr(2, 9),
                      name: file.name,
                      type: file.type,
                      size: file.size,
                      url: URL.createObjectURL(file),
                      progress: 0,
                      uploading: true,
                    }));

                    handleChange('attachments', [...(form.attachments || []), ...newAttachments]);

                    // Simulate upload progress for each file
                    newAttachments.forEach((att) => {
                      const totalDuration = 800 + Math.random() * 1200; // 0.8-2s
                      const steps = 20;
                      const interval = totalDuration / steps;
                      let step = 0;

                      const timer = setInterval(() => {
                        step++;
                        const progress = Math.min(Math.round((step / steps) * 100), 100);

                        setForm(prev => ({
                          ...prev,
                          attachments: prev.attachments.map(a =>
                            a.id === att.id
                              ? { ...a, progress, uploading: progress < 100 }
                              : a
                          ),
                        }));

                        if (step >= steps) clearInterval(timer);
                      }, interval);
                    });

                    e.target.value = '';
                  }}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label htmlFor="nrp-file-input" className="nrp-upload-label">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <strong>اسحب الملفات هنا أو اضغط للاختيار</strong>
                  <span>PDF, Word, صور — الحد الأقصى 10 ميجا للملف</span>
                </label>
              </div>
              {form.attachments && form.attachments.length > 0 && (
                <div className="attachments-list" style={{ marginTop: '0.75rem' }}>
                  {form.attachments.map((file, idx) => (
                    <div key={file.id || idx} className="attachment-item">
                      <div className="attachment-icon">
                        {file.type?.includes('image') ? Icons.image : Icons.fileText}
                      </div>
                      <div className="attachment-info" style={{ flex: 1 }}>
                        <span className="attachment-name">{file.name}</span>
                        <span className="attachment-size">
                          {file.uploading
                            ? `جاري الرفع... ${file.progress}%`
                            : `${(file.size / 1024).toFixed(1)} KB`
                          }
                        </span>
                        {file.uploading && (
                          <div className="upload-progress-bar">
                            <div
                              className="upload-progress-fill"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {!file.uploading && (
                        <button
                          type="button"
                          className="attachment-remove"
                          onClick={() => {
                            const next = form.attachments.filter((_, i) => i !== idx);
                            handleChange('attachments', next);
                          }}
                        >
                          {Icons.x}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">ملاحظات إضافية</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="أي ملاحظات إضافية تتعلق بهذه المعاملة..."
                rows="3"
              />
            </div>
          </div>
        </div>
      </form>

      {showScanner && (
        <DocumentScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
          departments={departmentsList}
          responsiblePersons={responsibleList}
          commanders={commandersList}
        />
      )}
    </div>
  );
}

export default NewRecordPage;
