// Fake data generator for the correspondence register

const departments = [
  'إدارة الموارد البشرية',
  'الإدارة المالية',
  'إدارة تقنية المعلومات',
  'الإدارة القانونية',
  'إدارة المشاريع',
  'إدارة التخطيط',
  'إدارة العلاقات العامة',
  'إدارة المشتريات',
  'إدارة الجودة',
  'الإدارة العامة',
];

const responsiblePersons = [
  'أحمد محمد العلي',
  'فاطمة سعد الدوسري',
  'خالد عبدالله القحطاني',
  'نورة إبراهيم المطيري',
  'محمد سلطان الشمري',
  'سارة علي الحربي',
  'عبدالرحمن خالد العتيبي',
  'هند فهد السبيعي',
  'يوسف عمر الغامدي',
  'ريم ناصر الزهراني',
];

const summaries = [
  'طلب تعيين موظفين جدد في قسم التطوير',
  'تقرير الميزانية السنوية للربع الثالث',
  'مراسلة بشأن تحديث أنظمة الحماية الإلكترونية',
  'طلب إجازة سنوية للموظف رقم ٤٥٢',
  'مخاطبة وزارة المالية بخصوص المخصصات',
  'تقرير أداء الإدارات للفترة الماضية',
  'عقد صيانة أجهزة الحاسب الآلي',
  'مذكرة داخلية بشأن تنظيم ساعات العمل',
  'طلب شراء أثاث مكتبي جديد',
  'تقرير المراجعة الداخلية للحسابات',
  'مخاطبة شركة التأمين بخصوص تجديد الوثائق',
  'خطاب تعميم إداري بشأن السلامة المهنية',
  'طلب ترقية عدد من الموظفين المستحقين',
  'مراسلة الجهات الحكومية بشأن التراخيص',
  'تقرير إنجاز المشاريع الجارية',
  'طلب تدريب موظفين على النظام الجديد',
  'مذكرة بشأن تحديث سياسات الأمن السيبراني',
  'خطاب شكر وتقدير للموظفين المتميزين',
  'طلب نقل موظف بين الإدارات',
  'تقرير فني عن حالة المبنى الإداري',
];

const commanders = [
  'اللواء / سعد الدوسري',
  'العقيد / فهد المطيري',
  'المقدم / عبدالله القحطاني',
  'الرائد / محمد الشمري',
  'النقيب / خالد العتيبي',
  'المدير العام / إبراهيم السبيعي',
  'مدير الإدارة / علي الحربي',
  'رئيس القسم / عمر الغامدي',
];

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
}

function randomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function randomAttachments() {
  return Math.floor(Math.random() * 6);
}

const types = ['وارد', 'صادر'];
const statuses = ['مكتمل', 'قيد المعالجة', 'عاجل'];
const priorities = ['عالي', 'متوسط', 'منخفض'];
const classifications = ['عام', 'محدود', 'سري', 'سري للغاية'];

export function generateFakeData(count = 25) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    data.push({
      id: `CR-${(i + 1).toString().padStart(4, '0')}`,
      registrationNumber: randomId(),
      registrationDate: randomDate(new Date(2025, 0, 1), new Date(2026, 6, 1)),
      type,
      source: departments[Math.floor(Math.random() * departments.length)],
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      attachments: randomAttachments(),
      commander: commanders[Math.floor(Math.random() * commanders.length)],
      responsible: responsiblePersons[Math.floor(Math.random() * responsiblePersons.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      classification: classifications[Math.floor(Math.random() * classifications.length)],
      notes: Math.random() > 0.5 ? 'لا يوجد ملاحظات' : '',
    });
  }
  return data;
}

export { departments, responsiblePersons, commanders, types, statuses, priorities, classifications };
