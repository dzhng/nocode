import * as trpc from '@trpc/server';
import { z } from 'zod';
import {
  Collections,
  Operation,
  OperationSchema,
  CellDataTupleSchema,
  RecordSchema,
  FieldTypeSchema,
} from 'shared/schema';
import supabase from '~/utils/supabase';
import type { Context } from '~/pages/api/trpc/[trpc]';

import updateField from './operations/updateField';
import createRecord from './operations/createRecord';
import updateCell from './operations/updateCell';
import deleteRecord from './operations/deleteRecord';

async function processOperation(operation: Partial<Operation>, userId: string) {
  if (!operation.type || !operation.sheetId) {
    throw new Error('Operation need at least type and sheetId');
  }

  // make sure slug is included for non field updates
  if (operation.type !== 'update_field' && !operation.slug) {
    throw new Error('Record operations needs slug');
  }

  // make sure there is a value for each operation
  if (operation.type === 'update_record') {
    const [fieldId, data] = CellDataTupleSchema.parse(operation.value);
    await updateCell(operation.sheetId, String(operation.slug), fieldId, data);
  } else if (operation.type === 'create_record') {
    const data = RecordSchema.parse(operation.value);
    await createRecord(data);
  } else if (operation.type === 'update_field') {
    const data = FieldTypeSchema.array().parse(operation.value);
    await updateField(operation.sheetId, data);
  } else if (operation.type === 'delete_record') {
    await deleteRecord(operation.sheetId, String(operation.slug));
  }

  const operationRecord: Operation = {
    type: operation.type,
    userId,
    sheetId: operation.sheetId,
    slug: operation.slug,
    value: operation.value,
    modifiedAt: new Date(),
  };

  const { error: operationError } = await supabase
    .from<Operation>(Collections.OPERATIONS)
    .insert(operationRecord, { returning: 'minimal' });

  if (operationError) {
    throw new trpc.TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: operationError.message,
    });
  }
}

export default trpc.router<Context>().mutation('processOperations', {
  input: z.object({
    operations: z.array(OperationSchema.partial()),
  }),
  async resolve({ input, ctx }) {
    // use for loop since we want to process one at a time, awaiting for each
    for (let i = 0; i < input.operations.length; i++) {
      const operation = input.operations[i];
      await processOperation(operation, String(ctx?.user.id));
    }
  },
});
