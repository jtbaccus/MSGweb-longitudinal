import 'next-auth';
import { UserRole } from '@/src/generated/prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      mustChangePassword: boolean;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role: UserRole;
    mustChangePassword: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
  }
}
