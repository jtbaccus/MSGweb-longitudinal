'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      // Update session to clear mustChangePassword flag
      await update({ mustChangePassword: false });

      router.push('/');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgb(var(--medical-primary))' }}>
            <span className="text-white font-bold text-xl">MS</span>
          </div>
          <h1 className="text-xl font-semibold text-medical-primary">
            Change Password
          </h1>
          {session?.user?.mustChangePassword && (
            <p className="text-sm mt-2" style={{ color: 'rgb(var(--medical-primary))' }}>
              You must change your password before continuing
            </p>
          )}
        </div>

        <div className="rounded-lg p-6" style={{ backgroundColor: 'rgb(var(--card-background))', border: '1px solid rgb(var(--card-border))' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'rgb(var(--input-background))',
                  borderColor: 'rgb(var(--input-border))',
                  color: 'rgb(var(--foreground))',
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'rgb(var(--input-background))',
                  borderColor: 'rgb(var(--input-border))',
                  color: 'rgb(var(--foreground))',
                }}
                minLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'rgb(var(--input-background))',
                  borderColor: 'rgb(var(--input-border))',
                  color: 'rgb(var(--foreground))',
                }}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-md text-white text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'rgb(var(--medical-primary))' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Changing...
                </span>
              ) : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
