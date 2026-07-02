import { useState, useMemo, useEffect } from 'react';
import {
  generateFakeData,
  departments as defaultDepartments,
  responsiblePersons as defaultResponsible,
  commanders as defaultCommanders,
  types as defaultTypes,
  statuses as defaultStatuses,
  priorities as defaultPriorities,
  classifications as defaultClassifications,
} from '../data/fakeData';
import { Icons } from './Icons';
import AddEditModal from './AddEditModal';
import ViewModal from './ViewModal';
import DeleteModal from './DeleteModal';
import Button from './ui/Button';
import Badge from './ui/Badge';

const ROWS_OPTIONS = [10, 15, 20, 25, 50];
const FONT_SIZES = [
  { key: 'small', label: 'صغير', size: '0.72rem' },
  { key: 'medium', label: 'متوسط', size: '0.8125rem' },
  { key: 'large', label: 'كبير', size: '0.95rem' },
];
const avatarColors = ['c1', 'c2', 'c3', 'c4', 'c5'];

function loadList(key, defaults) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [...defaults];
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function getClassificationVariant(classification) {
  if (classification === 'سري للغاية') return 'top-secret';
  if (classification === 'سري') return 'secret';
  if (classification === 'محدود') return 'restricted';
  return 'public';
}

function Register({ user, addToast, addLogEntry, records, setRecords, onNavigate }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('reg_rows_per_page');
    return saved ? Number(saved) : 10;
  });
  const [fontSizeKey, setFontSizeKey] = useState(() => {
    return localStorage.getItem('reg_font_size') || 'medium';
  });
  const currentFontSize = FONT_SIZES.find(f => f.key === fontSizeKey) || FONT_SIZES[1];

  const [departmentsList, setDepartmentsList] = useState(() => loadList('reg_departments', defaultDepartments));
  const [responsibleList, setResponsibleList] = useState(() => loadList('reg_responsible', defaultResponsible));
  const [commandersList, setCommandersList] = useState(() => loadList('reg_commanders', defaultCommanders));
  const [typesList, setTypesList] = useState(() => loadList('reg_types', defaultTypes));
  const [statusesList, setStatusesList] = useState(() => loadList('reg_statuses', defaultStatuses));
  const [prioritiesList, setPrioritiesList] = useState(() => loadList('reg_priorities', defaultPriorities));
  const [classificationsList, setClassificationsList] = useState(() => loadList('reg_classifications', defaultClassifications));

  const handleDepartmentsChange = (list) => { setDepartmentsList(list); saveList('reg_departments', list); };
  const handleResponsibleChange = (list) => { setResponsibleList(list); saveList('reg_responsible', list); };
  const handleCommandersChange = (list) => { setCommandersList(list); saveList('reg_commanders', list); };
  const handleTypesChange = (list) => { setTypesList(list); saveList('reg_types', list); };
  const handleStatusesChange = (list) => { setStatusesList(list); saveList('reg_statuses', list); };
  const handlePrioritiesChange = (list) => { setPrioritiesList(list); saveList('reg_priorities', list); };
  const handleClassificationsChange = (list) => { setClassificationsList(list); saveList('reg_classifications', list); };

  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const handleExportExcel = () => {
    const headers = ['رقم القيد', 'التاريخ', 'النوع', 'الجهة', 'الملخص', 'المرفقات', 'المسؤول', 'الحالة', 'الأولوية'];
    const rows = filtered.map(r => [
      r.registrationNumber,
      r.registrationDate,
      r.type,
      r.source,
      r.summary.replace(/,/g, ' '),
      Array.isArray(r.attachments) ? r.attachments.length : (r.attachments || 0),
      r.responsible,
      r.status,
      r.priority
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `سجل_المكاتبات_${new Date().toLocaleDateString('ar-EG')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('تم تصدير ملف الإكسل بنجاح', 'success');
  };

  const handleAdd = (form) => {
    const newRecord = {
      ...form,
      id: `REG-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => [newRecord, ...prev]);
    addToast('تمت إضافة المعاملة بنجاح', 'success');
    addLogEntry(`إضافة معاملة جديدة برقم قيد: ${form.registrationNumber}`);
  };

  const handleEdit = (form) => {
    setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...r, ...form } : r));
    setEditRecord(null);
    addToast('تم تحديث المعاملة بنجاح', 'success');
    addLogEntry(`تعديل معاملة رقم: ${editRecord.registrationNumber}`);
  };

  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteRecord.id));
    setDeleteRecord(null);
    addToast('تم حذف المعاملة نهائياً', 'info');
    addLogEntry(`حذف معاملة رقم: ${deleteRecord.registrationNumber}`);
  };

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.summary.includes(search) ||
        r.source.includes(search) ||
        r.registrationNumber.includes(search) ||
        r.responsible.includes(search) ||
        r.commander.includes(search) ||
        (r.notes && r.notes.includes(search)) ||
        r.id.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'الكل' || r.type === typeFilter;
      const matchStatus = statusFilter === 'الكل' || r.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [records, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = useMemo(() => ({
    total: records.length,
    incoming: records.filter((r) => r.type === 'وارد').length,
    outgoing: records.filter((r) => r.type === 'صادر').length,
    urgent: records.filter((r) => r.status === 'عاجل').length,
  }), [records]);

  const handleShareRecord = (record) => {
    const text = `*تفاصيل المكاتبة رقم: ${record.registrationNumber}*

• *النوع:* ${record.type}
• *الدرجة السرية:* ${record.classification || 'عام'}
• *التاريخ:* ${record.registrationDate}
• *الجهة:* ${record.source}
• *ملخص المكاتبة ومضمونها:* ${record.summary}
• *المسؤول:* ${record.responsible}
• *القائد / الوحدة:* ${record.commander}
• *الحالة:* ${record.status}
• *الأولوية:* ${record.priority}
• *المرفقات:* ${Array.isArray(record.attachments) ? record.attachments.length : (record.attachments || 0)} مرفق
• *ملاحظات:* ${record.notes || 'لا يوجد'}

_تمت المشاركة من نظام سجل الوارد والصادر الإلكتروني_`;

    if (navigator.share) {
      navigator.share({
        title: `مكاتبة رقم ${record.registrationNumber}`,
        text: text,
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const getResponsibleColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const getStatusVariant = (status) => {
    if (status === 'مكتمل') return 'completed';
    if (status === 'قيد المعالجة') return 'pending';
    if (status === 'عاجل') return 'urgent';
    return 'pending';
  };

  const getPriorityClass = (priority) => {
    if (priority === 'عالي') return 'high';
    if (priority === 'متوسط') return 'medium';
    return 'low';
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">سجل الوارد والصادر</h1>
        <p className="page-subtitle">إدارة ومتابعة المعاملات والمكاتبات الرسمية</p>
        <p className="page-meta">{today}</p>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{records.length}</div>
            <div className="stat-label">إجمالي المكاتبات</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
              <path d="M20 17H4c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{records.filter(r => r.type === 'وارد').length}</div>
            <div className="stat-label">وارد</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
              <path d="M20 17H4c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{records.filter(r => r.type === 'صادر').length}</div>
            <div className="stat-label">صادر</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{records.filter(r => r.status === 'قيد التنفيذ').length}</div>
            <div className="stat-label">قيد التنفيذ</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="البحث برقم القيد، الجهة، الملخص، أو المسئول..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <span className="search-icon">{Icons.search}</span>
            {search && (
              <button 
                className="search-clear" 
                onClick={() => { setSearch(''); setCurrentPage(1); }}
                title="مسح البحث"
              >
                {Icons.x}
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-group">
              {['الكل', ...typesList].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="filter-group">
              {['الكل', ...statusesList].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="toolbar-left">
          <Button variant="secondary" onClick={handleExportExcel} title="تصدير إكسل">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>إكسل</span>
          </Button>
          
          <Button variant="secondary" onClick={() => window.print()} title="طباعة PDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>PDF</span>
          </Button>

          {user?.role !== 'مستعرض' && (
            <Button variant="primary" onClick={() => onNavigate('add-record')} id="add-record-btn">
              {Icons.plus}
              <span>إضافة معاملة جديدة</span>
            </Button>
          )}
        </div>
      </div>

      <div className="table-controls">
        <div className="table-control-group">
          <span className="table-control-label">حجم الخط:</span>
          <div className="filter-group">
            {FONT_SIZES.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-chip ${fontSizeKey === f.key ? 'active' : ''}`}
                onClick={() => {
                  setFontSizeKey(f.key);
                  localStorage.setItem('reg_font_size', f.key);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="table-control-group">
          <span className="table-control-label">صفوف / صفحة:</span>
          <select
            className="table-control-select"
            value={rowsPerPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRowsPerPage(val);
              localStorage.setItem('reg_rows_per_page', val);
              setCurrentPage(1);
            }}
          >
            {ROWS_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} صف</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="register-table" id="register-table" style={{ fontSize: currentFontSize.size }}>
            <thead>
              <tr>
                <th>#</th>
                <th>رقم القيد</th>
                <th>التاريخ</th>
                <th>النوع</th>
                <th>الدرجة السرية</th>
                <th>الجهة</th>
                <th>ملخص المكاتبة</th>
                <th>المرفقات</th>
                <th>المسؤول</th>
                <th>القائد / الوحدة</th>
                <th>الحالة</th>
                <th>الأولوية</th>
                <th>ملاحظات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="14">
                    <div className="empty-state">
                      <div className="empty-state-icon">{Icons.inboxEmpty}</div>
                      <h3>لا توجد معاملات</h3>
                      <p>لم يتم العثور على نتائج مطابقة للبحث أو الفلاتر المحددة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((record, index) => (
                  <tr key={record.id}>
                    <td className="row-number" data-label="#">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td data-label="رقم القيد" className="cell-accent">
                      {record.registrationNumber}
                    </td>
                    <td data-label="التاريخ" className="table-date-cell">
                      {record.registrationDate}
                    </td>
                    <td data-label="النوع">
                      <Badge variant={record.type === 'وارد' ? 'incoming' : 'outgoing'}>
                        {record.type === 'وارد' ? Icons.arrowDownLeft : Icons.arrowUpRight}
                        {record.type}
                      </Badge>
                    </td>
                    <td data-label="الدرجة السرية">
                      <Badge variant={getClassificationVariant(record.classification)}>
                        {record.classification || 'عام'}
                      </Badge>
                    </td>
                    <td data-label="الجهة" className="cell-sm">{record.source}</td>
                    <td data-label="ملخص المكاتبة" className="table-summary-cell" title={record.summary}>
                      {record.summary}
                    </td>
                    <td data-label="المرفقات">
                      <span className="attachment-count">
                        {Icons.paperclip}
                        {record.attachments}
                      </span>
                    </td>
                    <td data-label="المسؤول">
                      <span className="responsible-person">
                        <span className={`responsible-avatar ${getResponsibleColor(record.responsible)}`}>
                          {record.responsible.split(' ')[0][0]}
                        </span>
                        <span className="cell-sm">{record.responsible}</span>
                      </span>
                    </td>
                    <td data-label="القائد / الوحدة" className="cell-sm">{record.commander}</td>
                    <td data-label="الحالة">
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td data-label="الأولوية" style={{ textAlign: 'center' }}>
                      <span className={`priority-dot ${getPriorityClass(record.priority)}`} title={record.priority} />
                    </td>
                    <td data-label="ملاحظات" className="cell-muted">
                      {record.notes || '—'}
                    </td>
                    <td data-label="الإجراءات">
                      <div className="actions-cell">
                        <button type="button" className="action-btn view" title="عرض" onClick={() => setViewRecord(record)}>
                          {Icons.eye}
                        </button>
                        <button type="button" className="action-btn share" title="مشاركة" onClick={() => handleShareRecord(record)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                        </button>
                        {user?.role !== 'مستعرض' && (
                          <button type="button" className="action-btn edit" title="تعديل" onClick={() => setEditRecord(record)}>
                            {Icons.edit}
                          </button>
                        )}
                        {user?.role === 'مدير النظام' && (
                          <button type="button" className="action-btn delete" title="حذف" onClick={() => setDeleteRecord(record)}>
                            {Icons.trash}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span className="table-info">
            عرض {Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)} -{' '}
            {Math.min(currentPage * rowsPerPage, filtered.length)} من {filtered.length} معاملة
          </span>
          <div className="pagination">
            <button type="button" className="page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
              ❯
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  type="button"
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button type="button" className="page-btn" disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>
              ❮
            </button>
          </div>
        </div>
      </div>

      {editRecord && (
        <AddEditModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSave={handleEdit}
          title="تعديل المعاملة"
          departmentsList={departmentsList}
          responsibleList={responsibleList}
          commandersList={commandersList}
          typesList={typesList}
          statusesList={statusesList}
          prioritiesList={prioritiesList}
          classificationsList={classificationsList}
          onDepartmentsChange={handleDepartmentsChange}
          onResponsibleChange={handleResponsibleChange}
          onCommandersChange={handleCommandersChange}
          onTypesChange={handleTypesChange}
          onStatusesChange={handleStatusesChange}
          onPrioritiesChange={handlePrioritiesChange}
          onClassificationsChange={handleClassificationsChange}
        />
      )}

      {viewRecord && (
        <ViewModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
          onEdit={user?.role !== 'مستعرض' ? (rec) => {
            setViewRecord(null);
            setEditRecord(rec);
          } : null}
        />
      )}

      {deleteRecord && (
        <DeleteModal
          record={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

export default Register;
