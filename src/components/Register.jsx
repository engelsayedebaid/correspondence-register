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

const ITEMS_PER_PAGE = 10;

const avatarColors = ['c1', 'c2', 'c3', 'c4', 'c5'];

// Helper to load/save lists from localStorage
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

function Register({ user, addToast, addLogEntry }) {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('reg_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local records", e);
      }
    }
    const initial = generateFakeData(25);
    localStorage.setItem('reg_records', JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('reg_records', JSON.stringify(records));
  }, [records]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [currentPage, setCurrentPage] = useState(1);

  // Editable dropdown lists (persisted in localStorage)
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

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  // Filtered data
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.summary.includes(search) ||
        r.source.includes(search) ||
        r.registrationNumber.includes(search) ||
        r.responsible.includes(search) ||
        r.commander.includes(search) ||
        r.id.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'الكل' || r.type === typeFilter;
      const matchStatus = statusFilter === 'الكل' || r.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [records, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => {
    return {
      total: records.length,
      incoming: records.filter((r) => r.type === 'وارد').length,
      outgoing: records.filter((r) => r.type === 'صادر').length,
      urgent: records.filter((r) => r.status === 'عاجل').length,
    };
  }, [records]);

  // Handlers
  const handleAdd = (data) => {
    const newRecord = {
      ...data,
      id: `CR-${(records.length + 1).toString().padStart(4, '0')}`,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setShowAddModal(false);
    addLogEntry('إضافة معاملة جديدة بقيد رقم: ' + data.registrationNumber);
    addToast('تم إضافة المعاملة بنجاح', 'success');
  };

  const handleEdit = (data) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === editRecord.id ? { ...r, ...data } : r))
    );
    setEditRecord(null);
    addLogEntry('تعديل معاملة بقيد رقم: ' + data.registrationNumber);
    addToast('تم تعديل المعاملة بنجاح', 'success');
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteRecord.id));
    addLogEntry('حذف معاملة بقيد رقم: ' + deleteRecord.registrationNumber);
    setDeleteRecord(null);
    addToast('تم حذف المعاملة بنجاح', 'success');
    const newTotal = Math.ceil((filtered.length - 1) / ITEMS_PER_PAGE);
    if (currentPage > newTotal && newTotal > 0) {
      setCurrentPage(newTotal);
    }
  };

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
• *المرفقات:* ${record.attachments} مرفق
• *ملاحظات:* ${record.notes || 'لا يوجد'}

_تمت المشاركة من نظام سجل الوارد والصادر الإلكتروني_`;

    if (navigator.share) {
      navigator.share({
        title: `مكاتبة رقم ${record.registrationNumber}`,
        text: text,
      }).catch(() => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      });
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const getResponsibleColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'مكتمل': return 'completed';
      case 'قيد المعالجة': return 'pending';
      case 'عاجل': return 'urgent';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'عالي': return 'high';
      case 'متوسط': return 'medium';
      case 'منخفض': return 'low';
      default: return '';
    }
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.clipboard}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">إجمالي المعاملات</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.inbox}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.incoming}</div>
            <div className="stat-label">الوارد</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">{Icons.send}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.outgoing}</div>
            <div className="stat-label">الصادر</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rose">{Icons.alertTriangle}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">عاجل</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">{Icons.search}</span>
            <input
              id="search-input"
              type="text"
              placeholder="بحث في المعاملات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            {['الكل', ...typesList].map((t) => (
              <button
                key={t}
                className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="filter-group">
            {['الكل', ...statusesList].map((s) => (
              <button
                key={s}
                className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {user?.role !== 'مستعرض' && (
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
            id="add-record-btn"
          >
            {Icons.plus}
            إضافة معاملة جديدة
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="register-table" id="register-table">
            <thead>
              <tr>
                <th>#</th>
                <th>رقم القيد</th>
                <th>التاريخ</th>
                <th>النوع</th>
                <th>الدرجة السرية</th>
                <th>الجهة الواردة / المرسلة</th>
                <th>ملخص المكاتبة الواردة ومضمونها</th>
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
                      <div className="empty-icon">{Icons.inboxEmpty}</div>
                      <h3>لا توجد معاملات</h3>
                      <p>لم يتم العثور على نتائج مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((record, index) => (
                  <tr key={record.id} className="row-enter">
                    <td className="row-number">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td data-label="رقم القيد" style={{ fontWeight: 700, color: 'var(--text-accent)' }}>
                      {record.registrationNumber}
                    </td>
                    <td data-label="التاريخ" className="table-date-cell">
                      {record.registrationDate}
                    </td>
                    <td data-label="النوع">
                      <span
                        className={`status-badge ${
                          record.type === 'وارد' ? 'incoming' : 'outgoing'
                        }`}
                      >
                        {record.type === 'وارد' ? Icons.arrowDownLeft : Icons.arrowUpRight} {record.type}
                      </span>
                    </td>
                    <td data-label="الدرجة السرية">
                      <span className={`classification-badge ${
                        record.classification === 'سري للغاية' ? 'top-secret' : record.classification === 'سري' ? 'secret' : record.classification === 'محدود' ? 'restricted' : 'public'
                      }`}>
                        {record.classification || 'عام'}
                      </span>
                    </td>
                    <td data-label="الجهة الواردة / المرسلة" style={{ fontSize: '0.8rem' }}>{record.source}</td>
                    <td data-label="ملخص المكاتبة ومضمونها"
                      className="table-summary-cell"
                      title={record.summary}
                    >
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
                        <span
                          className={`responsible-avatar ${getResponsibleColor(
                            record.responsible
                          )}`}
                        >
                          {record.responsible.split(' ')[0][0]}
                        </span>
                        <span style={{ fontSize: '0.8rem' }}>{record.responsible}</span>
                      </span>
                    </td>
                    <td data-label="القائد / الوحدة" style={{ fontSize: '0.8rem' }}>{record.commander}</td>
                    <td data-label="الحالة">
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td data-label="الأولوية" style={{ textAlign: 'center' }}>
                      <span
                        className={`priority-dot ${getPriorityClass(record.priority)}`}
                        title={record.priority}
                      ></span>
                    </td>
                    <td data-label="ملاحظات" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {record.notes || '—'}
                    </td>
                    <td data-label="الإجراءات">
                      <div className="actions-cell">
                        <button
                          className="action-btn view"
                          title="عرض"
                          onClick={() => setViewRecord(record)}
                        >
                          {Icons.eye}
                        </button>
                        <button
                          className="action-btn share"
                          title="مشاركة"
                          onClick={() => handleShareRecord(record)}
                          style={{ color: '#3b82f6' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                        </button>
                        {user?.role !== 'مستعرض' && (
                          <button
                            className="action-btn edit"
                            title="تعديل"
                            onClick={() => setEditRecord(record)}
                          >
                            {Icons.edit}
                          </button>
                        )}
                        {user?.role === 'مدير النظام' && (
                          <button
                            className="action-btn delete"
                            title="حذف"
                            onClick={() => setDeleteRecord(record)}
                          >
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

        {/* Footer */}
        <div className="table-footer">
          <span className="table-info">
            عرض {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)} -{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} من {filtered.length} معاملة
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ❯
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ❮
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEditModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          title="إضافة معاملة جديدة"
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
