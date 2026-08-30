// app/dashboard/loading.tsx
import { Spinner } from '@/components/ui/spinner';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <Spinner className="w-8 h-8 text-slate-900" />
    </div>
  );
}
