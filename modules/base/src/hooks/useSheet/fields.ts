import { useCallback, useMemo } from 'react';
import { v1 as uuid } from 'uuid';
import produce from 'immer';
import { debounce } from 'lodash';
import { FieldType, Operation } from 'shared/schema';
import useOperationQueue from '~/hooks/useOperationQueue';
import { useAppSelector, useAppDispatch } from '~/store';
import sheetStore from '~/store/sheet';

export default function useFields(sheetId?: number) {
  const dispatch = useAppDispatch();
  const { queueOperation } = useOperationQueue();
  const sheet = useAppSelector((state) => (sheetId ? state.sheet.sheets[sheetId] : undefined));

  const queueFieldsUpdate = useCallback(
    (sheetId: number, fields: FieldType[]) => {
      const operation: Partial<Operation> = {
        type: 'update_field',
        sheetId,
        value: fields,
      };

      queueOperation(operation);
    },
    [queueOperation],
  );

  const debouncedFieldsUpdate = useMemo(() => debounce(queueFieldsUpdate, 500), [
    queueFieldsUpdate,
  ]);

  // generate a new field ID client side that doesn't conflict with existing fields
  const generateFieldId = useCallback(uuid, []);

  const addField = useCallback(
    async (field: FieldType, index: number) => {
      if (!sheet || !sheetId) {
        return;
      }

      const newFields = [...sheet.fields];
      newFields.splice(index, 0, field);

      dispatch(sheetStore.actions.updateSheet({ sheetId, data: { fields: newFields } }));
      queueFieldsUpdate(sheetId, newFields);
    },
    [sheet, sheetId, dispatch, queueFieldsUpdate],
  );

  const removeField = useCallback(
    async (index: number) => {
      if (!sheet || !sheetId) {
        return;
      }

      const newFields = [...sheet.fields];
      newFields.splice(index, 1);

      dispatch(sheetStore.actions.updateSheet({ sheetId, data: { fields: newFields } }));
      queueFieldsUpdate(sheetId, newFields);
    },
    [sheet, sheetId, dispatch, queueFieldsUpdate],
  );

  const changeField = useCallback(
    async (fieldId: string, data: Partial<FieldType>, debounce: boolean = true) => {
      if (!sheet || !sheetId) {
        return;
      }

      const { fields } = sheet;
      const fieldIndex = fields.findIndex((c) => c.id === fieldId);
      if (!sheetId || fieldIndex === -1) {
        throw new Error('Field not found');
      }

      const newFields = produce(fields, (draft) => {
        const field = draft[fieldIndex];
        Object.assign(field, data);
      });

      dispatch(sheetStore.actions.updateSheet({ sheetId, data: { fields: newFields } }));
      debounce ? debouncedFieldsUpdate(sheetId, newFields) : queueFieldsUpdate(sheetId, newFields);
    },
    [sheet, sheetId, debouncedFieldsUpdate, queueFieldsUpdate, dispatch],
  );

  return {
    generateFieldId,
    addField,
    changeField,
    removeField,
  };
}
