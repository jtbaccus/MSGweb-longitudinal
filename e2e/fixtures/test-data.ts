export const testAdmin = {
  email: 'admin@test.com',
  password: 'testpassword123',
  name: 'Test Admin',
  role: 'ADMIN' as const,
};

export const testUser = {
  email: 'user@test.com',
  password: 'testpassword123',
  name: 'Test User',
  role: 'USER' as const,
};

export const testStudent = {
  name: 'Test Student',
  email: 'student@test.com',
  medicalSchoolId: 'MS001',
};

export const testClerkship = {
  name: 'Internal Medicine',
  templateId: 'internal-medicine',
  type: 'MULTI_WEEK' as const,
  durationWeeks: 8,
  midpointWeek: 4,
};
