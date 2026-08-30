import { UserButton } from '@clerk/nextjs';
import { Suspense } from 'react';
import DashboardLoading from './loading';

export default function Home() {
  return (
    <div>
      <Suspense fallback={<DashboardLoading />}>
        <UserButton />
      </Suspense>
    </div>
  );
}
