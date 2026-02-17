import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hash } from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================
// Helper utilities
// ============================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// Criteria IDs by template
// ============================================

const criteriaByTemplate: Record<string, { honors: string[]; pass: string[]; fail: string[] }> = {
  'internal-medicine': {
    honors: [
      'im-h-prof-1', 'im-h-prof-2', 'im-h-cdt-1', 'im-h-cdt-2', 'im-h-cdt-3',
      'im-h-mk-1', 'im-h-mk-2', 'im-h-mk-3', 'im-h-mk-4',
      'im-h-hpe-1', 'im-h-hpe-2', 'im-h-hpe-3', 'im-h-hpe-4',
      'im-h-pd-1', 'im-h-pd-2', 'im-h-pd-3', 'im-h-pd-4',
    ],
    pass: [
      'im-p-prof-1', 'im-p-prof-2', 'im-p-prof-3', 'im-p-prof-4', 'im-p-prof-5',
      'im-p-prof-6', 'im-p-prof-7', 'im-p-cdt-1', 'im-p-cdt-2', 'im-p-cdt-3',
      'im-p-cdt-4', 'im-p-mk-1', 'im-p-mk-2', 'im-p-mk-3', 'im-p-mk-4',
      'im-p-hpe-1', 'im-p-hpe-2', 'im-p-hpe-3', 'im-p-hpe-4',
      'im-p-pd-1', 'im-p-pd-2', 'im-p-pd-3', 'im-p-pd-4', 'im-p-pd-5',
    ],
    fail: [
      'im-f-prof-1', 'im-f-prof-2', 'im-f-prof-3', 'im-f-prof-4', 'im-f-prof-5',
      'im-f-prof-6', 'im-f-prof-7', 'im-f-prof-8', 'im-f-prof-9',
      'im-f-cdt-1', 'im-f-cdt-2', 'im-f-cdt-3', 'im-f-cdt-4', 'im-f-cdt-5',
      'im-f-mk-1', 'im-f-mk-2', 'im-f-mk-3', 'im-f-mk-4',
      'im-f-hpe-1', 'im-f-hpe-2', 'im-f-hpe-3', 'im-f-hpe-4', 'im-f-hpe-5',
      'im-f-pd-1', 'im-f-pd-2', 'im-f-pd-3', 'im-f-pd-4', 'im-f-pd-5',
    ],
  },
  neurology: {
    honors: [
      'neuro-h-prof-1', 'neuro-h-prof-2', 'neuro-h-cdt-1', 'neuro-h-cdt-2', 'neuro-h-cdt-3',
      'neuro-h-mk-1', 'neuro-h-mk-2', 'neuro-h-mk-3', 'neuro-h-mk-4',
      'neuro-h-hpe-1', 'neuro-h-hpe-2', 'neuro-h-hpe-3', 'neuro-h-hpe-4',
      'neuro-h-pd-1', 'neuro-h-pd-2', 'neuro-h-pd-3', 'neuro-h-pd-4',
    ],
    pass: [
      'neuro-p-prof-1', 'neuro-p-prof-2', 'neuro-p-prof-3', 'neuro-p-prof-4', 'neuro-p-prof-5',
      'neuro-p-prof-6', 'neuro-p-prof-7', 'neuro-p-cdt-1', 'neuro-p-cdt-2', 'neuro-p-cdt-3',
      'neuro-p-cdt-4', 'neuro-p-mk-1', 'neuro-p-mk-2', 'neuro-p-mk-3', 'neuro-p-mk-4',
      'neuro-p-hpe-1', 'neuro-p-hpe-2', 'neuro-p-hpe-3', 'neuro-p-hpe-4',
      'neuro-p-pd-1', 'neuro-p-pd-2', 'neuro-p-pd-3', 'neuro-p-pd-4', 'neuro-p-pd-5',
    ],
    fail: [
      'neuro-f-prof-1', 'neuro-f-prof-2', 'neuro-f-prof-3', 'neuro-f-prof-4', 'neuro-f-prof-5',
      'neuro-f-prof-6', 'neuro-f-prof-7', 'neuro-f-prof-8', 'neuro-f-prof-9',
      'neuro-f-cdt-1', 'neuro-f-cdt-2', 'neuro-f-cdt-3', 'neuro-f-cdt-4', 'neuro-f-cdt-5',
      'neuro-f-mk-1', 'neuro-f-mk-2', 'neuro-f-mk-3', 'neuro-f-mk-4',
      'neuro-f-hpe-1', 'neuro-f-hpe-2', 'neuro-f-hpe-3', 'neuro-f-hpe-4', 'neuro-f-hpe-5',
      'neuro-f-pd-1', 'neuro-f-pd-2', 'neuro-f-pd-3', 'neuro-f-pd-4', 'neuro-f-pd-5',
    ],
  },
  surgery: {
    honors: ['surg-h-1'],
    pass: ['surg-p-1'],
    fail: ['surg-f-1'],
  },
  pediatrics: {
    honors: ['peds-h-1'],
    pass: ['peds-p-1'],
    fail: ['peds-f-1'],
  },
  psychiatry: {
    honors: ['psych-h-1'],
    pass: ['psych-p-1'],
    fail: ['psych-f-1'],
  },
  'ob-gyn': {
    honors: ['obgyn-h-1'],
    pass: ['obgyn-p-1'],
    fail: ['obgyn-f-1'],
  },
  'family-medicine': {
    honors: ['fm-h-1'],
    pass: ['fm-p-1'],
    fail: ['fm-f-1'],
  },
};

function getCriteriaForLevel(templateId: string, level: 'FAIL' | 'PASS' | 'HONORS'): string[] {
  const template = criteriaByTemplate[templateId];
  if (!template) return [];
  const isPlaceholder = ['surgery', 'pediatrics', 'psychiatry', 'ob-gyn', 'family-medicine'].includes(templateId);
  if (isPlaceholder) {
    // Placeholder templates have 3 criteria total — return all 3
    return [...template.fail, ...template.pass, ...template.honors];
  }
  switch (level) {
    case 'HONORS': return pickRandom(template.honors, randomBetween(4, 8));
    case 'PASS': return pickRandom(template.pass, randomBetween(6, 10));
    case 'FAIL': return pickRandom(template.fail, randomBetween(3, 5));
  }
}

function getAttributes(): string[] {
  const allAttrs = Array.from({ length: 26 }, (_, i) => `attr-${i + 1}`);
  return pickRandom(allAttrs, randomBetween(3, 6));
}

// ============================================
// Narrative generation helpers
// ============================================

const honorsNarratives = [
  'This student demonstrated exceptional clinical acumen throughout the evaluation period. They consistently went above and beyond in patient care, showing initiative in researching complex cases and presenting evidence-based management plans. Their interactions with patients and families were marked by genuine empathy and clear communication. The student took ownership of their patients at the level expected of a sub-intern, coordinating care across disciplines and following up on pending results without prompting. They were a valued contributor to team discussions, frequently offering thoughtful differential diagnoses and supporting their reasoning with current literature. Their documentation was consistently organized, thorough, and clinically relevant. Multiple team members commented on their professionalism and reliability. This student shows strong readiness for continued clinical training and will be an asset to any residency program.',
  'An outstanding performance during this evaluation period. The student demonstrated advanced clinical reasoning, consistently arriving to rounds prepared with relevant literature and thoughtful assessments. They built strong therapeutic alliances with patients, earning trust through attentive listening and clear explanations. Their presentations were concise yet comprehensive, reflecting a mature approach to prioritizing clinical information. The student actively sought feedback and incorporated it immediately into their practice. They showed exceptional teamwork, anticipating the needs of residents and attendings while maintaining excellent rapport with nursing and support staff. Their written notes were exemplary in clarity and organization. This student functioned at the level of a high-performing acting intern and is well-prepared for the next stage of training.',
  'The student excelled during this period, showing consistent growth in clinical knowledge and patient care skills. They demonstrated a sophisticated understanding of disease pathophysiology and applied this knowledge effectively in clinical decision-making. Their bedside manner was excellent, with patients frequently expressing appreciation for their thoroughness and compassion. The student took initiative in patient education, spending extra time to ensure patients understood their diagnoses and treatment plans. Team members consistently praised their work ethic and positive attitude. Their oral presentations evolved significantly, becoming more focused and analytically rigorous. Documentation showed attention to detail and clinical reasoning that exceeded expectations for their training level.',
];

const passNarratives = [
  'The student performed solidly during this evaluation period, meeting expectations for their level of training. They demonstrated adequate clinical knowledge and were able to obtain thorough histories and perform focused physical examinations. Their presentations included all expected components and showed appropriate clinical reasoning. The student was reliable in completing assigned tasks and attended all required didactics. They showed respect for patients and worked cooperatively with the healthcare team. Areas for continued growth include developing more confidence in clinical decision-making and taking greater initiative in patient follow-up. Overall, the student has built a solid foundation for continued clinical training and met the competencies expected at this stage.',
  'This student demonstrated competence across the core domains during the evaluation period. They showed consistent professionalism, arriving on time and completing clinical duties reliably. Patient interactions were respectful and the student made appropriate efforts to build rapport. Their medical knowledge was adequate for their training level, with the ability to formulate reasonable differential diagnoses for common presentations. Documentation was generally complete and organized. The student responded well to feedback and showed willingness to improve. With continued practice, they will develop greater independence in clinical reasoning and workflow efficiency. Their performance met expectations for the clerkship.',
  'A solid performance from this student during the evaluation period. They demonstrated dependability in clinical duties and maintained a professional demeanor throughout. The student showed adequate preparation for patient care discussions and contributed meaningfully to team rounds. Their history-taking and physical examination skills met the expected standard, producing reliable findings. Written documentation was appropriate in scope and accuracy. The student worked well within the team structure and sought guidance when needed. Continued focus on developing clinical reasoning skills and taking more ownership of patient care will serve them well in subsequent rotations.',
];

const failNarratives = [
  'The student struggled during this evaluation period with fundamental aspects of clinical performance. Despite feedback and coaching, they had difficulty completing clinical duties in a timely manner and showed inconsistent attendance at required activities. Their medical knowledge base appeared insufficient for the expected training level, with limited ability to formulate differential diagnoses or interpret basic diagnostic studies. Patient interactions, while generally respectful, lacked the thoroughness needed for adequate clinical care. Documentation was frequently incomplete or submitted late. The student is encouraged to engage in focused self-study and to take a more proactive approach to learning from clinical encounters.',
];

function maybeNarrative(narratives: string[], probability: number): string | null {
  return Math.random() < probability ? narratives[randomBetween(0, narratives.length - 1)] : null;
}

function maybeEditedNarrative(narrative: string | null): string | null {
  if (!narrative || Math.random() > 0.25) return null;
  // Slight modification to simulate editor changes
  return narrative.replace(/\. /g, '. ').replace(/throughout/g, 'during').replace(/consistently/g, 'regularly');
}

const narrativeContexts = [
  'Observed during morning rounds and afternoon clinic.',
  'Based on direct observation in inpatient setting over two weeks.',
  'Student was evaluated during ICU rotation and outpatient follow-up.',
  'Observed in emergency department and during didactic sessions.',
  'Based on interactions during ward rounds and patient presentations.',
  'Evaluation covers student performance in both inpatient and outpatient settings.',
  null, null, null, null, // 40% chance of no context
];

// ============================================
// Progress summary content
// ============================================

const strengthParagraphs = [
  'The student has demonstrated consistent strengths across multiple evaluation periods. Their clinical knowledge base has been solid, with the ability to apply medical concepts to patient care scenarios effectively. Evaluators have consistently noted their professionalism, reliability, and enthusiasm for learning. Patient interactions have been characterized by empathy and clear communication. The student has shown particular aptitude in clinical documentation, producing notes that are well-organized and clinically relevant. Their teamwork skills have been a consistent strength, with multiple evaluators commenting on their positive contributions to team dynamics.',
  'Across evaluations, this student has shown reliable clinical competence and strong interpersonal skills. Their history-taking has been thorough and targeted, reflecting good clinical reasoning. They have consistently maintained professional behavior, attending all required activities and completing tasks on time. The student has demonstrated growth in presentation skills, becoming more concise and organized over time. Their patient-centered approach has been noted by multiple evaluators, with patients expressing comfort and trust during clinical encounters.',
  'This student has exhibited noteworthy strengths in several key areas throughout the clerkship. Their medical knowledge has been consistently adequate to above average, with evidence of independent learning and preparation. They have built strong working relationships with residents, attendings, and nursing staff. Documentation quality has been consistently good, reflecting attention to detail and clinical reasoning. The student has shown genuine enthusiasm for patient care and has taken initiative in seeking learning opportunities.',
];

const growthParagraphs = [
  'The student would benefit from developing greater confidence in independently formulating clinical plans. While their knowledge base is solid, there is room for growth in synthesizing information from multiple sources to drive clinical decisions. Continued focus on prioritizing clinical problems by urgency will enhance their effectiveness in acute care settings.',
  'Areas for continued development include clinical reasoning depth and efficiency in workflow management. The student has shown improvement in these areas over time but would benefit from more deliberate practice in oral presentations and written assessments. Taking greater ownership of patient care decisions, with appropriate supervision, will strengthen their readiness for residency.',
  'Growth opportunities remain in developing a more systematic approach to differential diagnosis generation and in building greater independence in clinical decision-making. The student has been receptive to feedback in these areas and has shown incremental improvement.',
];

const progressParagraphs = [
  'Over the course of this clerkship, the student has demonstrated a clear trajectory of growth. Early evaluations reflected a student still adapting to the clinical environment and developing fundamental skills. By the midpoint, evaluators noted improved confidence in patient interactions and more structured clinical reasoning. The most recent evaluations show a student who has integrated feedback effectively, with consistent performance at or above the expected level. The trend across evaluation periods reflects steady improvement in both clinical skills and professional development. The student has successfully transitioned from primarily observing to actively contributing to patient care, and their documentation has matured significantly. Overall, the progression is encouraging and suggests readiness for the demands of subsequent clinical training.',
  'The student has shown meaningful development across the clerkship period. Initial evaluations indicated appropriate baseline knowledge with room for growth in clinical application. Subsequent evaluation periods demonstrated progressive improvement in patient care skills, presentation quality, and clinical reasoning. The student has been receptive to feedback throughout, incorporating suggestions into their practice promptly. By the later evaluation periods, the student was performing with greater independence and contributing more substantively to team discussions. This trajectory of improvement reflects genuine engagement with the learning process and a commitment to professional growth.',
  'This student entered the clerkship with a solid foundation and has built upon it consistently throughout the evaluation periods. Early performance met expectations, with subsequent periods showing incremental gains in clinical reasoning sophistication and patient care quality. The student has maintained consistent professionalism and reliability throughout. Performance trends show stability with upward movement in clinical skills and confidence. The student adapted well to different clinical settings and patient populations encountered during the rotation. Their overall trajectory demonstrates the progressive development expected at this stage of medical education.',
];

const recommendationParagraphs = [
  'Moving forward, the student should focus on developing greater independence in clinical decision-making by actively formulating assessment and plan prior to rounds. Reading broadly about conditions encountered in the clinical setting will deepen their knowledge base. The student would benefit from seeking out procedural opportunities and practicing oral presentations in a structured format. Engaging in self-reflection after challenging clinical encounters will support continued professional development.',
  'For continued growth, the student should pursue opportunities to practice clinical reasoning aloud, using a systematic approach to differential diagnosis. Developing efficiency in documentation will free time for deeper patient engagement. The student is encouraged to seek mentorship from residents and faculty for guidance on career development and to continue cultivating the strong interpersonal skills already demonstrated.',
];

// ============================================
// Main seed function
// ============================================

async function main() {
  console.log('Starting comprehensive seed...\n');

  // -------------------------------------------------------
  // Step 1: Delete existing data (reverse dependency order)
  // -------------------------------------------------------
  console.log('Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.progressSummary.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.rotation.deleteMany();
  await prisma.clerkship.deleteMany();
  console.log('  Existing data cleared.\n');

  // -------------------------------------------------------
  // Step 2: Upsert Users
  // -------------------------------------------------------
  console.log('Seeding users...');
  const adminPassword = await hash('changeme', 12);
  const userPassword = await hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword, mustChangePassword: true, role: 'ADMIN', name: 'Admin' },
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  });

  const jon = await prisma.user.upsert({
    where: { email: 'jon@example.com' },
    update: { password: userPassword, mustChangePassword: false, role: 'ADMIN', name: 'Dr. Jon Baccus' },
    create: {
      email: 'jon@example.com',
      name: 'Dr. Jon Baccus',
      password: userPassword,
      role: 'ADMIN',
      mustChangePassword: false,
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: { password: userPassword, mustChangePassword: false, role: 'USER', name: 'Dr. Sarah Chen' },
    create: {
      email: 'sarah@example.com',
      name: 'Dr. Sarah Chen',
      password: userPassword,
      role: 'USER',
      mustChangePassword: false,
    },
  });

  const michael = await prisma.user.upsert({
    where: { email: 'michael@example.com' },
    update: { password: userPassword, mustChangePassword: false, role: 'USER', name: 'Dr. Michael Torres' },
    create: {
      email: 'michael@example.com',
      name: 'Dr. Michael Torres',
      password: userPassword,
      role: 'USER',
      mustChangePassword: false,
    },
  });

  const faculty = [jon, sarah, michael];
  console.log(`  Created/updated ${4} users.\n`);

  // -------------------------------------------------------
  // Step 3: Create Clerkships
  // -------------------------------------------------------
  console.log('Seeding clerkships...');
  const clerkshipData = [
    { name: 'Internal Medicine', templateId: 'internal-medicine', type: 'MULTI_WEEK' as const, durationWeeks: 8, midpointWeek: 4, evaluationIntervalDays: 7 },
    { name: 'Surgery', templateId: 'surgery', type: 'MULTI_WEEK' as const, durationWeeks: 8, midpointWeek: 4, evaluationIntervalDays: 7 },
    { name: 'Neurology', templateId: 'neurology', type: 'LONGITUDINAL' as const, durationWeeks: 24, midpointWeek: 12, evaluationIntervalDays: 21 },
    { name: 'Family Medicine', templateId: 'family-medicine', type: 'LONGITUDINAL' as const, durationWeeks: 24, midpointWeek: 12, evaluationIntervalDays: 21 },
    { name: 'Psychiatry', templateId: 'psychiatry', type: 'LONGITUDINAL' as const, durationWeeks: 24, midpointWeek: 12, evaluationIntervalDays: 21 },
    { name: 'Pediatrics', templateId: 'pediatrics', type: 'LONGITUDINAL' as const, durationWeeks: 24, midpointWeek: 12, evaluationIntervalDays: 21 },
    { name: 'OB/GYN', templateId: 'ob-gyn', type: 'LONGITUDINAL' as const, durationWeeks: 24, midpointWeek: 12, evaluationIntervalDays: 21 },
  ];

  const clerkships: Record<string, Awaited<ReturnType<typeof prisma.clerkship.create>>> = {};
  for (const c of clerkshipData) {
    const created = await prisma.clerkship.create({ data: c });
    clerkships[c.templateId] = created;
  }
  console.log(`  Created ${clerkshipData.length} clerkships.\n`);

  // -------------------------------------------------------
  // Step 4: Create Rotations
  // -------------------------------------------------------
  console.log('Seeding rotations...');
  const rotationData = [
    { key: 'im-block1', clerkshipId: clerkships['internal-medicine'].id, startDate: new Date('2026-01-12'), endDate: new Date('2026-03-08'), academicYear: '2025-2026' },
    { key: 'surg-block1', clerkshipId: clerkships['surgery'].id, startDate: new Date('2026-03-09'), endDate: new Date('2026-05-03'), academicYear: '2025-2026' },
    { key: 'neuro-long', clerkshipId: clerkships['neurology'].id, startDate: new Date('2025-08-04'), endDate: new Date('2026-01-18'), academicYear: '2025-2026' },
    { key: 'fm-long', clerkshipId: clerkships['family-medicine'].id, startDate: new Date('2025-08-04'), endDate: new Date('2026-01-18'), academicYear: '2025-2026' },
    { key: 'peds-long', clerkshipId: clerkships['pediatrics'].id, startDate: new Date('2025-08-04'), endDate: new Date('2026-01-18'), academicYear: '2025-2026' },
    { key: 'psych-long', clerkshipId: clerkships['psychiatry'].id, startDate: new Date('2025-08-04'), endDate: new Date('2026-01-18'), academicYear: '2025-2026' },
  ];

  const rotations: Record<string, Awaited<ReturnType<typeof prisma.rotation.create>>> = {};
  for (const r of rotationData) {
    const { key, ...data } = r;
    const created = await prisma.rotation.create({ data });
    rotations[key] = created;
  }
  console.log(`  Created ${rotationData.length} rotations.\n`);

  // -------------------------------------------------------
  // Step 5: Create Students
  // -------------------------------------------------------
  console.log('Seeding students...');
  const studentData = [
    { name: 'Emily Nguyen', email: 'emily.nguyen@school.edu', medicalSchoolId: 'MS-2026-001' },
    { name: 'James Patel', email: 'james.patel@school.edu', medicalSchoolId: 'MS-2026-002' },
    { name: 'Maria Rodriguez', email: 'maria.rodriguez@school.edu', medicalSchoolId: 'MS-2026-003' },
    { name: 'David Kim', email: 'david.kim@school.edu', medicalSchoolId: 'MS-2026-004' },
    { name: 'Aisha Johnson', email: 'aisha.johnson@school.edu', medicalSchoolId: 'MS-2026-005' },
    { name: 'Ryan O\'Connor', email: 'ryan.oconnor@school.edu', medicalSchoolId: 'MS-2026-006' },
    { name: 'Priya Sharma', email: 'priya.sharma@school.edu', medicalSchoolId: 'MS-2026-007' },
    { name: 'Carlos Mendez', email: 'carlos.mendez@school.edu', medicalSchoolId: 'MS-2026-008' },
  ];

  const students: Awaited<ReturnType<typeof prisma.student.create>>[] = [];
  for (const s of studentData) {
    const created = await prisma.student.create({ data: s });
    students.push(created);
  }
  console.log(`  Created ${students.length} students.\n`);

  // -------------------------------------------------------
  // Step 6: Create Enrollments
  // -------------------------------------------------------
  console.log('Seeding enrollments...');

  // Helper to lookup student by name
  const studentByName = (name: string) => students.find(s => s.name === name)!;

  const enrollmentSpecs = [
    // IM Block 1: 4 students
    { student: 'Emily Nguyen', rotation: 'im-block1', status: 'COMPLETED' as const },
    { student: 'James Patel', rotation: 'im-block1', status: 'COMPLETED' as const },
    { student: 'Maria Rodriguez', rotation: 'im-block1', status: 'ACTIVE' as const },
    { student: 'David Kim', rotation: 'im-block1', status: 'ACTIVE' as const },

    // Surgery Block 1: 3 students
    { student: 'Aisha Johnson', rotation: 'surg-block1', status: 'COMPLETED' as const },
    { student: 'Ryan O\'Connor', rotation: 'surg-block1', status: 'ACTIVE' as const },
    { student: 'Carlos Mendez', rotation: 'surg-block1', status: 'ACTIVE' as const },

    // Neurology Longitudinal: 3 students
    { student: 'Emily Nguyen', rotation: 'neuro-long', status: 'COMPLETED' as const },
    { student: 'Priya Sharma', rotation: 'neuro-long', status: 'COMPLETED' as const },
    { student: 'James Patel', rotation: 'neuro-long', status: 'ACTIVE' as const },

    // Family Medicine Longitudinal: 2 students
    { student: 'Aisha Johnson', rotation: 'fm-long', status: 'COMPLETED' as const },
    { student: 'David Kim', rotation: 'fm-long', status: 'WITHDRAWN' as const },

    // Pediatrics Longitudinal: 2 students
    { student: 'Maria Rodriguez', rotation: 'peds-long', status: 'COMPLETED' as const },
    { student: 'Carlos Mendez', rotation: 'peds-long', status: 'ACTIVE' as const },

    // Psychiatry Longitudinal: 1 student
    { student: 'Ryan O\'Connor', rotation: 'psych-long', status: 'COMPLETED' as const },
  ];

  type EnrollmentRecord = Awaited<ReturnType<typeof prisma.studentEnrollment.create>>;
  const enrollments: Record<string, EnrollmentRecord> = {};

  for (const spec of enrollmentSpecs) {
    const rot = rotations[spec.rotation];
    const stu = studentByName(spec.student);
    const endDate = spec.status === 'COMPLETED' ? rot.endDate
      : spec.status === 'WITHDRAWN' ? addDays(rot.startDate, 42) // withdrew after 6 weeks
      : null;
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: stu.id,
        rotationId: rot.id,
        startDate: rot.startDate,
        endDate,
        status: spec.status,
      },
    });
    enrollments[`${spec.student}|${spec.rotation}`] = enrollment;
  }
  console.log(`  Created ${enrollmentSpecs.length} enrollments.\n`);

  // -------------------------------------------------------
  // Step 7: Create Evaluations
  // -------------------------------------------------------
  console.log('Seeding evaluations...');

  type EvalRecord = Awaited<ReturnType<typeof prisma.evaluation.create>>;
  const allEvaluations: EvalRecord[] = [];

  // Evaluation plan: define patterns per enrollment
  interface EvalPlan {
    enrollmentKey: string;
    templateId: string;
    intervalDays: number;
    rotationKey: string;
    periods: { periodNumber: number; level: 'FAIL' | 'PASS' | 'HONORS'; isDraft?: boolean }[];
  }

  const evalPlans: EvalPlan[] = [
    // IM Block 1 (weekly, 8 weeks)
    // Emily Nguyen - COMPLETED, trending PASS → HONORS
    {
      enrollmentKey: 'Emily Nguyen|im-block1', templateId: 'internal-medicine', intervalDays: 7, rotationKey: 'im-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 4, level: 'PASS' }, { periodNumber: 5, level: 'HONORS' },
        { periodNumber: 7, level: 'HONORS' }, { periodNumber: 8, level: 'HONORS' },
      ],
    },
    // James Patel - COMPLETED, steady PASS
    {
      enrollmentKey: 'James Patel|im-block1', templateId: 'internal-medicine', intervalDays: 7, rotationKey: 'im-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 3, level: 'PASS' },
        { periodNumber: 5, level: 'PASS' }, { periodNumber: 7, level: 'PASS' },
        { periodNumber: 8, level: 'PASS' },
      ],
    },
    // Maria Rodriguez - ACTIVE
    {
      enrollmentKey: 'Maria Rodriguez|im-block1', templateId: 'internal-medicine', intervalDays: 7, rotationKey: 'im-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'HONORS', isDraft: true },
      ],
    },
    // David Kim - ACTIVE
    {
      enrollmentKey: 'David Kim|im-block1', templateId: 'internal-medicine', intervalDays: 7, rotationKey: 'im-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
      ],
    },

    // Surgery Block 1 (weekly, 8 weeks)
    // Aisha Johnson - COMPLETED
    {
      enrollmentKey: 'Aisha Johnson|surg-block1', templateId: 'surgery', intervalDays: 7, rotationKey: 'surg-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 4, level: 'HONORS' }, { periodNumber: 6, level: 'HONORS' },
        { periodNumber: 8, level: 'HONORS' },
      ],
    },
    // Ryan O'Connor - ACTIVE
    {
      enrollmentKey: 'Ryan O\'Connor|surg-block1', templateId: 'surgery', intervalDays: 7, rotationKey: 'surg-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
      ],
    },
    // Carlos Mendez - ACTIVE
    {
      enrollmentKey: 'Carlos Mendez|surg-block1', templateId: 'surgery', intervalDays: 7, rotationKey: 'surg-block1',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'FAIL', isDraft: true },
      ],
    },

    // Neurology Longitudinal (21-day intervals, ~8 periods over 24 weeks)
    // Emily Nguyen - COMPLETED, early FAIL then recovery story
    {
      enrollmentKey: 'Emily Nguyen|neuro-long', templateId: 'neurology', intervalDays: 21, rotationKey: 'neuro-long',
      periods: [
        { periodNumber: 1, level: 'FAIL' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'PASS' }, { periodNumber: 4, level: 'PASS' },
        { periodNumber: 5, level: 'PASS' }, { periodNumber: 6, level: 'HONORS' },
        { periodNumber: 7, level: 'HONORS' }, { periodNumber: 8, level: 'HONORS' },
      ],
    },
    // Priya Sharma - COMPLETED, steady PASS
    {
      enrollmentKey: 'Priya Sharma|neuro-long', templateId: 'neurology', intervalDays: 21, rotationKey: 'neuro-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'PASS' }, { periodNumber: 5, level: 'PASS' },
        { periodNumber: 6, level: 'PASS' }, { periodNumber: 8, level: 'PASS' },
      ],
    },
    // James Patel - ACTIVE
    {
      enrollmentKey: 'James Patel|neuro-long', templateId: 'neurology', intervalDays: 21, rotationKey: 'neuro-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'HONORS' },
      ],
    },

    // Family Medicine Longitudinal
    // Aisha Johnson - COMPLETED
    {
      enrollmentKey: 'Aisha Johnson|fm-long', templateId: 'family-medicine', intervalDays: 21, rotationKey: 'fm-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'HONORS' }, { periodNumber: 4, level: 'PASS' },
        { periodNumber: 5, level: 'HONORS' }, { periodNumber: 6, level: 'HONORS' },
        { periodNumber: 7, level: 'HONORS' },
      ],
    },

    // Pediatrics Longitudinal
    // Maria Rodriguez - COMPLETED
    {
      enrollmentKey: 'Maria Rodriguez|peds-long', templateId: 'pediatrics', intervalDays: 21, rotationKey: 'peds-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'PASS' }, { periodNumber: 4, level: 'PASS' },
        { periodNumber: 6, level: 'PASS' }, { periodNumber: 8, level: 'HONORS' },
      ],
    },
    // Carlos Mendez - ACTIVE
    {
      enrollmentKey: 'Carlos Mendez|peds-long', templateId: 'pediatrics', intervalDays: 21, rotationKey: 'peds-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'PASS' }, { periodNumber: 4, level: 'PASS', isDraft: true },
      ],
    },

    // Psychiatry Longitudinal
    // Ryan O'Connor - COMPLETED
    {
      enrollmentKey: 'Ryan O\'Connor|psych-long', templateId: 'psychiatry', intervalDays: 21, rotationKey: 'psych-long',
      periods: [
        { periodNumber: 1, level: 'PASS' }, { periodNumber: 2, level: 'PASS' },
        { periodNumber: 3, level: 'PASS' }, { periodNumber: 4, level: 'HONORS' },
        { periodNumber: 5, level: 'PASS' }, { periodNumber: 6, level: 'PASS' },
        { periodNumber: 7, level: 'HONORS' },
      ],
    },
  ];

  for (const plan of evalPlans) {
    const enrollment = enrollments[plan.enrollmentKey];
    if (!enrollment) {
      console.warn(`  Skipping evals for missing enrollment: ${plan.enrollmentKey}`);
      continue;
    }
    const rotStart = rotations[plan.rotationKey].startDate;

    for (const p of plan.periods) {
      const evaluator = faculty[randomBetween(0, faculty.length - 1)];
      const evalDate = addDays(rotStart, (p.periodNumber - 1) * plan.intervalDays + randomBetween(1, plan.intervalDays - 1));
      const isDraft = p.isDraft ?? false;
      const isComplete = !isDraft;

      const narrativePool = p.level === 'HONORS' ? honorsNarratives : p.level === 'PASS' ? passNarratives : failNarratives;
      const generatedNarrative = maybeNarrative(narrativePool, 0.5);
      const editedNarrative = maybeEditedNarrative(generatedNarrative);
      const narrativeContext = narrativeContexts[randomBetween(0, narrativeContexts.length - 1)];

      const evaluation = await prisma.evaluation.create({
        data: {
          enrollmentId: enrollment.id,
          evaluatorId: evaluator.id,
          evaluatorName: evaluator.name!,
          periodNumber: p.periodNumber,
          evaluationDate: evalDate,
          performanceLevel: p.level,
          selectedCriteriaIds: getCriteriaForLevel(plan.templateId, p.level),
          selectedAttributeIds: getAttributes(),
          narrativeContext,
          generatedNarrative,
          editedNarrative,
          templateId: plan.templateId,
          isComplete,
          isDraft,
          submittedAt: isComplete ? evalDate : null,
        },
      });
      allEvaluations.push(evaluation);
    }
  }
  console.log(`  Created ${allEvaluations.length} evaluations.\n`);

  // -------------------------------------------------------
  // Step 8: Create Progress Summaries
  // -------------------------------------------------------
  console.log('Seeding progress summaries...');
  let summaryCount = 0;

  // Helper to get evaluations for an enrollment
  function getEvalsForEnrollment(enrollmentKey: string): EvalRecord[] {
    const enrollment = enrollments[enrollmentKey];
    if (!enrollment) return [];
    return allEvaluations.filter(e => e.enrollmentId === enrollment.id && e.isComplete);
  }

  function modePerformance(evals: EvalRecord[]): 'FAIL' | 'PASS' | 'HONORS' {
    const counts: Record<string, number> = {};
    for (const e of evals) {
      counts[e.performanceLevel] = (counts[e.performanceLevel] || 0) + 1;
    }
    let mode = 'PASS';
    let max = 0;
    for (const [level, count] of Object.entries(counts)) {
      if (count > max) { max = count; mode = level; }
    }
    return mode as 'FAIL' | 'PASS' | 'HONORS';
  }

  // Summary 1: MID_COURSE for Emily Nguyen in Neurology (early fail then recovery)
  {
    const evals = getEvalsForEnrollment('Emily Nguyen|neuro-long');
    const midEvals = evals.filter(e => e.periodNumber <= 4);
    if (midEvals.length > 0) {
      const author = jon;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Emily Nguyen|neuro-long'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'MID_COURSE',
          evaluationsIncluded: midEvals.map(e => e.id),
          overallPerformance: modePerformance(midEvals),
          strengthsSummary: strengthParagraphs[0],
          growthAreasSummary: growthParagraphs[0],
          progressNarrative: 'Emily began the neurology clerkship with some difficulty adapting to the clinical environment, receiving a below-passing evaluation in her first period. However, she responded exceptionally well to feedback and showed rapid improvement. By the fourth evaluation period, she had established a consistent pattern of meeting expectations. Her early struggles appear to have motivated deeper engagement with the material, as subsequent evaluators noted improved preparation and clinical reasoning. The trajectory from her initial evaluation to her mid-course performance is encouraging and suggests strong potential for continued growth in the second half of the clerkship.',
          recommendations: null,
        },
      });
      summaryCount++;
    }
  }

  // Summary 2: END_OF_COURSE for Emily Nguyen in Neurology
  {
    const evals = getEvalsForEnrollment('Emily Nguyen|neuro-long');
    if (evals.length > 0) {
      const author = sarah;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Emily Nguyen|neuro-long'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'END_OF_COURSE',
          evaluationsIncluded: evals.map(e => e.id),
          overallPerformance: modePerformance(evals),
          strengthsSummary: strengthParagraphs[1],
          growthAreasSummary: growthParagraphs[1],
          progressNarrative: progressParagraphs[0],
          recommendations: recommendationParagraphs[0],
        },
      });
      summaryCount++;
    }
  }

  // Summary 3: MID_COURSE for Priya Sharma in Neurology
  {
    const evals = getEvalsForEnrollment('Priya Sharma|neuro-long');
    const midEvals = evals.filter(e => e.periodNumber <= 4);
    if (midEvals.length > 0) {
      const author = michael;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Priya Sharma|neuro-long'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'MID_COURSE',
          evaluationsIncluded: midEvals.map(e => e.id),
          overallPerformance: modePerformance(midEvals),
          strengthsSummary: strengthParagraphs[2],
          growthAreasSummary: growthParagraphs[2],
          progressNarrative: progressParagraphs[1],
          recommendations: null,
        },
      });
      summaryCount++;
    }
  }

  // Summary 4: END_OF_COURSE for Aisha Johnson in Family Medicine
  {
    const evals = getEvalsForEnrollment('Aisha Johnson|fm-long');
    if (evals.length > 0) {
      const author = jon;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Aisha Johnson|fm-long'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'END_OF_COURSE',
          evaluationsIncluded: evals.map(e => e.id),
          overallPerformance: modePerformance(evals),
          strengthsSummary: strengthParagraphs[0],
          growthAreasSummary: growthParagraphs[0],
          progressNarrative: progressParagraphs[2],
          recommendations: recommendationParagraphs[1],
        },
      });
      summaryCount++;
    }
  }

  // Summary 5: PROGRESS for Emily Nguyen in IM Block 1 (mid-rotation check-in)
  {
    const evals = getEvalsForEnrollment('Emily Nguyen|im-block1');
    const earlyEvals = evals.filter(e => e.periodNumber <= 4);
    if (earlyEvals.length > 0) {
      const author = sarah;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Emily Nguyen|im-block1'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'PROGRESS',
          evaluationsIncluded: earlyEvals.map(e => e.id),
          overallPerformance: modePerformance(earlyEvals),
          strengthsSummary: strengthParagraphs[1],
          growthAreasSummary: growthParagraphs[1],
          progressNarrative: 'Emily is performing well in the Internal Medicine clerkship at the mid-rotation point. She has demonstrated consistent competence in patient care and clinical reasoning. Her evaluations show solid performance with evidence of growing confidence. Faculty have noted her enthusiasm and reliability. She is on track for a strong finish to this rotation block.',
          recommendations: null,
        },
      });
      summaryCount++;
    }
  }

  // Summary 6: END_OF_COURSE for Ryan O'Connor in Psychiatry
  {
    const evals = getEvalsForEnrollment('Ryan O\'Connor|psych-long');
    if (evals.length > 0) {
      const author = michael;
      await prisma.progressSummary.create({
        data: {
          enrollmentId: enrollments['Ryan O\'Connor|psych-long'].id,
          authorId: author.id,
          authorName: author.name!,
          type: 'END_OF_COURSE',
          evaluationsIncluded: evals.map(e => e.id),
          overallPerformance: modePerformance(evals),
          strengthsSummary: strengthParagraphs[2],
          growthAreasSummary: growthParagraphs[2],
          progressNarrative: progressParagraphs[1],
          recommendations: recommendationParagraphs[0],
        },
      });
      summaryCount++;
    }
  }

  console.log(`  Created ${summaryCount} progress summaries.\n`);

  // -------------------------------------------------------
  // Summary
  // -------------------------------------------------------
  console.log('=== Seed Complete ===');
  console.log(`  Users: 4`);
  console.log(`  Clerkships: ${clerkshipData.length}`);
  console.log(`  Rotations: ${rotationData.length}`);
  console.log(`  Students: ${students.length}`);
  console.log(`  Enrollments: ${enrollmentSpecs.length}`);
  console.log(`  Evaluations: ${allEvaluations.length}`);
  console.log(`  Progress Summaries: ${summaryCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
