import { useState } from 'react';
import EditableSelect from './EditableSelect';
import DocumentScanner from './DocumentScanner';
import Modal from './ui/Modal';
import Button from './ui/Button';

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

  const footer = (
    <>
      <Button type="submit" form="add-edit-form" variant="success">
        {record ? 'حفظ التعديلات' : 'إضافة المعاملة'}
      </Button>
      <Button type="button" variant="ghost" onClick={onClose}>
        إلغاء
      </Button>
    </>
  );

  return (
    <>
      <Modal title={title} onClose={onClose} footer={footer}>
        <form id="add-edit-form" onSubmit={handleSubmit}>
          <div className="scanner-trigger">
            <Button type="button" variant="primary" fullWidth onClick={() => setShowScanner(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              مسح المستند ضوئياً (OCR)
            </Button>
          </div>

          <div className="modal-form">
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
              <label className="form-label">ملخص المكاتبة *</label>
              <textarea
                className={`form-textarea ${errors.summary ? 'form-input--error' : ''}`}
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="أدخل ملخص المكاتبة"
              />
              {errors.summary && <div className="form-error">{errors.summary}</div>}
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

            <div className="form-group full-width">
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
        </form>
      </Modal>

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
