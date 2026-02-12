export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <span className="spinner w-8 h-8" />
        <p className="text-sm text-[rgb(var(--muted-foreground))]">Loading...</p>
      </div>
    </div>
  )
}
