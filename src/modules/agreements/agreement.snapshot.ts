import { createHash } from 'node:crypto';
import type { AgreementSnapshot } from './agreement.schema';

export function hashAgreementSnapshot(snapshot: AgreementSnapshot): string {
  const canonicalSnapshot = JSON.stringify({
    scope: snapshot.scope,
    deliverables: snapshot.deliverables,
    amountRupiah: snapshot.amountRupiah,
    deadline: snapshot.deadline,
    revisionLimit: snapshot.revisionLimit,
    cancellationTerms: snapshot.cancellationTerms,
    ipTerms: snapshot.ipTerms,
  });

  return createHash('sha256').update(canonicalSnapshot).digest('hex');
}

export function dateToDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
