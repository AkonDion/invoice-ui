import { WorkOrderRefetchProvider } from '@/components/workorder-refetch-provider';
import { WorkOrderCardWithRefetch } from '@/components/workorder-card-with-refetch';

interface WorkOrderPageProps {
  params: {
    token: string;
  };
  searchParams: {
    status?: string | string[];
  };
}

export default function WorkOrderPage({ params, searchParams }: WorkOrderPageProps) {
  const { token } = params;
  const { status } = searchParams;

  return (
    <WorkOrderRefetchProvider token={token}>
      <WorkOrderPageContent workOrderStatus={status} />
    </WorkOrderRefetchProvider>
  );
}

function WorkOrderPageContent({ workOrderStatus }: { workOrderStatus?: string | string[] }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative flex flex-col items-center min-h-[100dvh] px-4 pt-8 pb-24 md:pb-8 space-y-4">
        {workOrderStatus === 'success' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-green-100 p-4 text-green-800"
          >
            Work order scheduled successfully. Thank you!
          </div>
        )}
        {workOrderStatus === 'cancelled' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-yellow-100 p-4 text-yellow-800"
          >
            Work order scheduling cancelled.
          </div>
        )}
        <WorkOrderCardWithRefetch workOrderStatus={workOrderStatus} />
      </div>
    </div>
  );
}
