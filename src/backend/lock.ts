const lockedResources = new Set<string>();

export function acquireLock(resourceId: string): boolean {
  if (lockedResources.has(resourceId)) {
    return false;
  }
  lockedResources.add(resourceId);
  return true;
}

export function releaseLock(resourceId: string): void {
  lockedResources.delete(resourceId);
}
