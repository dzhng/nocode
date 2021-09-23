import { ColumnType, CellType, DataTypes, SelectionMeta } from 'shared/schema';

export function dataFieldForCell(column: ColumnType, data: CellType | null) {
  if (
    column.type === DataTypes.Text ||
    (column.type === DataTypes.Selection &&
      (column?.typeMetadata as SelectionMeta)?.type === DataTypes.Text)
  ) {
    return { dataString: data === null ? null : String(data) };
  } else if (
    column.type === DataTypes.Number ||
    column.type === DataTypes.Date ||
    (column.type === DataTypes.Selection &&
      (column?.typeMetadata as SelectionMeta)?.type === DataTypes.Number)
  ) {
    return { dataNumber: data === null ? null : Number(data) };
  } else {
    return { dataJSON: data === null ? null : data };
  }
}

export function cellTypeForDataField(
  column: ColumnType,
  data: { dataNumber?: number | null; dataString?: string | null; dataJSON?: CellType },
): CellType | undefined {
  if (column.type === DataTypes.Date) {
    return data.dataNumber && new Date(data.dataNumber);
  }

  // only one of these fields should be filled at a time
  return data.dataString ?? data.dataNumber ?? data.dataJSON;
}
