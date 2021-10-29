import { createContext, useContext } from 'react';
import { Sheet } from 'shared/schema';
import useSheet from '~/hooks/useSheet';

export const SheetContext = createContext<ReturnType<typeof useSheet> & { sheet: Sheet }>(null!);

export function SheetProvider(props: React.PropsWithChildren<{ sheet: Sheet }>) {
  const sheetState = useSheet(props.sheet.id);

  return (
    <SheetContext.Provider
      value={{
        ...sheetState,
        sheet: props.sheet,
      }}
    >
      {props.children}
    </SheetContext.Provider>
  );
}

export default function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheetContext must be used within the SheetProvider');
  }
  return context;
}
