export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-2 border-slate-200 dark:border-slate-700`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-slate-900 dark:border-t-white animate-spin`} />
      </div>
      {text && <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{text}</p>}
    </div>
  )
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
            </div>
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
