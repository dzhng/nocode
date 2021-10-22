import { useCallback, useMemo } from 'react';
import produce from 'immer';
import { debounce } from 'lodash';
import { Collections, FieldType, Sheet } from 'shared/schema';
import supabase from '~/utils/supabase';
import { trpc } from '~/utils/trpc';
import { useAppSelector } from '~/store';
import sheetStore from '~/store/sheet';

export default function useFields(sheetId?: number) {
  const sheet = useAppSelector((state) => (sheetId ? state.sheet.sheets[sheetId] : undefined));

  const updateFieldMutation = trpc.useMutation('sheet.updateField');

  const debouncedFieldsUpdate = useMemo(
    () =>
      debounce((sheetId: number, fields: FieldType[]) => {
        updateFieldMutation.mutate({ sheetId, fields });
      }, 500),
    [updateFieldMutation],
  );

  // generate a new field ID client side that doesn't conflict with existing fields
  const generateFieldId = useCallback(() => {
    const fields = sheet ? sheet.fields : [];
    const largestId = Math.max(0, ...fields.map((c) => c.id));
    return largestId + 1;
  }, [sheet]);

  const addField = useCallback(
    async (field: FieldType, index: number) => {
      if (!sheet || !sheetId) {
        return;
      }

      const newFields = [...sheet.fields];
      newFields.splice(index, 0, field);

      sheetStore.actions.updateFields({ sheetId, fields: newFields });

      const { error } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .update({ fields: newFields }, { returning: 'minimal' })
        .eq('id', sheetId);

      if (error) {
        console.error('Error updating fields');
      }
    },
    [sheet, sheetId],
  );

  const removeField = useCallback(
    async (index: number) => {
      if (!sheet || !sheetId) {
        return;
      }

      const newFields = [...sheet.fields];
      newFields.splice(index, 1);

      sheetStore.actions.updateFields({ sheetId, fields: newFields });

      const { error } = await supabase
        .from<Sheet>(Collections.SHEETS)
        .update({ fields: newFields }, { returning: 'minimal' })
        .eq('id', sheetId);

      if (error) {
        console.error('Error updating fields');
      }
    },
    [sheet, sheetId],
  );

  const changeField = useCallback(
    async (fieldId: number, data: Partial<FieldType>) => {
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

      sheetStore.actions.updateFields({ sheetId, fields: newFields });
      debouncedFieldsUpdate(sheetId, newFields);
    },
    [sheet, sheetId, debouncedFieldsUpdate],
  );

  return {
    generateFieldId,
    addField,
    changeField,
    removeField,
  };
}
