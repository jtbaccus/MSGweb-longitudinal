import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="card p-8 max-w-md w-full text-center">
        <h2 className="text-4xl font-bold mb-2">404</h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-medical-primary text-white text-sm font-medium hover:bg-medical-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
