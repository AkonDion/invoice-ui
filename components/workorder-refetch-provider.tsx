'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkOrderPayload } from '@/types/workorder';

interface WorkOrderRefetchContextType {
  workOrder: WorkOrderPayload | null;
  isLoading: boolean;
  error: string | null;
  refetchWorkOrder: () => Promise<void>;
}

const WorkOrderRefetchContext = createContext<WorkOrderRefetchContextType | undefined>(undefined);

interface WorkOrderRefetchProviderProps {
  children: ReactNode;
  token: string;
}

export function WorkOrderRefetchProvider({ children, token }: WorkOrderRefetchProviderProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrderPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchWorkOrder = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workorder/refetch?token=${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch work order');
      }

      const data = await response.json();
      setWorkOrder(data.workOrder);
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch work order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchWorkOrder();
  }, [token]);

  return (
    <WorkOrderRefetchContext.Provider
      value={{
        workOrder,
        isLoading,
        error,
        refetchWorkOrder,
      }}
    >
      {children}
    </WorkOrderRefetchContext.Provider>
  );
}

export function useWorkOrderRefetch() {
  const context = useContext(WorkOrderRefetchContext);
  if (context === undefined) {
    throw new Error('useWorkOrderRefetch must be used within a WorkOrderRefetchProvider');
  }
  return context;
}





