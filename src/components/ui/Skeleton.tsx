export function CardSkeleton() {
  return (
    <div className="glass-card-frost rounded-3xl p-5 space-y-3 animate-pulse border-white">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-indigo-100 rounded-md" />
        <div className="h-4 w-12 bg-indigo-100 rounded-md" />
      </div>
      <div className="h-5 w-3/4 bg-indigo-100 rounded-md" />
      <div className="h-3 w-1/2 bg-indigo-50 rounded-md" />
      <div className="pt-3 border-t border-indigo-100 flex items-center justify-between">
        <div className="h-3 w-20 bg-indigo-50 rounded-md" />
        <div className="h-6 w-16 bg-indigo-100 rounded-lg" />
      </div>
    </div>
  );
}

export function MeetingSkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
