import { useState, useCallback } from 'react';
import { Operation } from 'shared/schema';
import { trpc } from '~/utils/trpc';

// TODO: retry failed operations
export default function useOperationQueue() {
  const [isProcessing, setIsProcessing] = useState(false);

  const sheetOperation = trpc.useMutation('sheet.processOperations', {
    onError: (error) => {
      console.error('Operation mutation error: ', error);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const queueOperation = useCallback(
    (operation: Partial<Operation>) => {
      setIsProcessing(true);
      sheetOperation.mutate({ operations: [operation] });
    },
    [sheetOperation],
  );

  return {
    isProcessing,
    queueOperation,
  };
}
