import { useState } from 'react';
import EditableSelect from './EditableSelect';
import DocumentScanner from './DocumentScanner';

function AddEditModal({
  record,
  onClose,
  onSave,
  title,
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
    registrationNumber: record?.registrationNumber || '',
    registrationDate: record?.registrationDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    type: record?.type || 'وارد',
    source: record?.source || '',
    summary: record?.summary || '',
    attachments: record?.attachments ?? 0,
    commander: record?.commander || '',
    responsible: record?.responsible || '',
    status: record?.status || 'قيد المعالجة',
    priority: record?.priority || 'متوسط',
    classification: record?.classification || 'عام',
    notes: record?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [showScanner, setShowScanner] = useState(false);

  const handleScanComplete = (scannedFields) => {
    setForm(prev => ({
      ...prev,
      ...scannedFields
    }));
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
    e.preventDefault();
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
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Scanner trigger button */}
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #1e3a5f, #1a56db)', padding: '0.65rem' }}
                  onClick={() => setShowScanner(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  مسح المستند ضوئياً بالذكاء الاصطناعي لتعبئة البيانات (OCR)
                </button>
              </div>

              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">رقم القيد *</label>
                  <input
                    className="form-input"
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    placeholder="أدخل رقم القيد"
                    style={errors.registrationNumber ? { borderColor: 'var(--accent-rose)' } : {}}
                  />
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
                    label="الجهة *"
                    value={form.source}
                    onChange={(val) => handleChange('source', val)}
                    options={departmentsList}
                    onOptionsChange={onDepartmentsChange}
                    placeholder="اختر الجهة"
                    error={errors.source}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">ملخص المكاتبة الواردة ومضمونها *</label>
                  <textarea
                    className="form-textarea"
                    value={form.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    placeholder="أدخل ملخص المكاتبة الواردة ومضمونها"
                    style={errors.summary ? { borderColor: 'var(--accent-rose)' } : {}}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">عدد المرفقات</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.attachments}
                    onChange={(e) => handleChange('attachments', parseInt(e.target.value) || 0)}
                  />
                </div>

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

                <div className="form-group full-width" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label">ملاحظات</label>
                  <textarea
                    className="form-textarea"
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="أدخل الملاحظات (اختياري)"
                    style={{ minHeight: '60px' }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {record ? (<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> حفظ التعديلات</>) : (<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> إضافة المعاملة</>)}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {showScanner && (
        <DocumentScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
          departments={departmentsList}
          responsiblePersons={responsibleList}
          commanders={commandersList}
        />
      )}
    </>
  );
}

export default AddEditModal;
