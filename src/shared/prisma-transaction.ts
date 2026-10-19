export function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

export async function withTransactionRetry<T>(
  operation: () => Promise<T>,
  retryCodes: readonly string[] = ['P2034'],
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const retryable = retryCodes.some((code) => hasPrismaErrorCode(error, code));
      if (!retryable || attempt === maxAttempts) throw error;
    }
  }

  throw new Error('Transaction retry gagal');
}
