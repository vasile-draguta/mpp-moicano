'use server';

import { LogActionType } from '@prisma/client';
import { logUserAction } from './loggingService';

/**
 * Higher-order function that wraps a server action with logging
 * @param actionType The type of action (CREATE, READ, UPDATE, DELETE)
 * @param entityType The type of entity being acted upon
 * @param getEntityId Function to extract the entity ID from the input
 * @param action The server action to wrap
 * @returns The wrapped server action
 */
export function withLogging<T, R>(
  actionType: LogActionType,
  entityType: string,
  getEntityId?: (input: T) => number | undefined,
  getDetails?: (input: T, result: R) => string | undefined,
) {
  return function wrapAction<TInput extends T>(
    action: (input: TInput) => Promise<R>,
  ) {
    return async (input: TInput): Promise<R> => {
      try {
        // Get entity ID if function provided
        const entityId = getEntityId ? getEntityId(input) : undefined;

        // Execute the original action
        const result = await action(input);

        // Get optional details
        const details = getDetails ? getDetails(input, result) : undefined;

        // Log the action
        await logUserAction(actionType, entityType, entityId, details);

        // Return the original result
        return result;
      } catch (error) {
        // If there was an error, log it as well
        await logUserAction(
          actionType,
          entityType,
          getEntityId ? getEntityId(input) : undefined,
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );

        // Re-throw the error
        throw error;
      }
    };
  };
}

// Convenience wrappers for each action type
export const withCreateLogging = <T, R>(
  entityType: string,
  getEntityId?: (input: T) => number | undefined,
  getDetails?: (input: T, result: R) => string | undefined,
) =>
  withLogging<T, R>(LogActionType.CREATE, entityType, getEntityId, getDetails);

export const withReadLogging = <T, R>(
  entityType: string,
  getEntityId?: (input: T) => number | undefined,
  getDetails?: (input: T, result: R) => string | undefined,
) => withLogging<T, R>(LogActionType.READ, entityType, getEntityId, getDetails);

export const withUpdateLogging = <T, R>(
  entityType: string,
  getEntityId?: (input: T) => number | undefined,
  getDetails?: (input: T, result: R) => string | undefined,
) =>
  withLogging<T, R>(LogActionType.UPDATE, entityType, getEntityId, getDetails);

export const withDeleteLogging = <T, R>(
  entityType: string,
  getEntityId?: (input: T) => number | undefined,
  getDetails?: (input: T, result: R) => string | undefined,
) =>
  withLogging<T, R>(LogActionType.DELETE, entityType, getEntityId, getDetails);
