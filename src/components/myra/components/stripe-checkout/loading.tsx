export default function Loading({
  classes
}: {
  classes: string
}) {
  return (
    <aside className={`${classes} rounded-lg bg-white p-6 shadow animate-pulse`}>
      {/* title */}
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />

      {/* 3 summary lines */}
      <div className="space-y-3">
        {[0,1,2].map((_) => (
          <div key={_} className="flex justify-between">
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* divider */}
      <div className="h-px bg-gray-200 my-4" />

      {/* total line */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-1/3 bg-gray-200 rounded" />
        <div className="h-5 w-1/3 bg-gray-200 rounded" />
      </div>

      {/* footer note */}
      <div className="mt-3 h-4 w-1/2 bg-gray-200 rounded" />
    </aside>
  )
}
