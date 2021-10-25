import { FieldType, CellType, DataTypes, SelectionMeta, CellDataTuple } from 'shared/schema';

export function dataFieldForCell(field: FieldType, data: CellType | null) {
  if (
    field.type === DataTypes.Text ||
    (field.type === DataTypes.Selection &&
      (field?.typeMetadata as SelectionMeta)?.type === DataTypes.Text)
  ) {
    return { dataString: data === null ? null : String(data) };
  } else if (
    field.type === DataTypes.Number ||
    field.type === DataTypes.Date ||
    (field.type === DataTypes.Selection &&
      (field?.typeMetadata as SelectionMeta)?.type === DataTypes.Number)
  ) {
    return { dataNumber: data === null ? null : Number(data) };
  } else {
    return { dataJSON: data === null ? null : data };
  }
}

export function cellTypeForDataField(
  field: FieldType,
  data: { dataNumber?: number | null; dataString?: string | null; dataJSON?: CellType },
): CellType | undefined {
  if (field.type === DataTypes.Date) {
    return data.dataNumber && new Date(data.dataNumber);
  }

  // only one of these fields should be filled at a time
  return data.dataString ?? data.dataNumber ?? data.dataJSON;
}

export function pruneRecordCellData(fields: FieldType[], cells: CellDataTuple[]): CellDataTuple[] {
  const fieldIds = new Set<string>();
  fields.forEach((field) => fieldIds.add(field.id));

  return cells.filter(([fieldId]) => fieldIds.has(fieldId));
}
