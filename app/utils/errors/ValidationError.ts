import { ValidationResult } from '@/app/utils/validators/expenseValidator';

// Custom error for validation failures
export class ValidationError extends Error {
  validationResult: ValidationResult;

  constructor(validationResult: ValidationResult) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.validationResult = validationResult;
  }
}
