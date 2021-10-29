import { SheetProvider } from './Context';
import { Sheet } from 'shared/schema';
import DataTable from './DataTable';

export default function DataTableIndex({ sheet }: { sheet: Sheet }) {
  return (
    <SheetProvider sheet={sheet}>
      <DataTable />
    </SheetProvider>
  );
}
