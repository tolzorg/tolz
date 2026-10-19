export class TimeoutError extends Error {
  constructor(label, ms) {
    super(`${label} timed out after ${ms / 1000}s`);
    this.name = "TimeoutError";
  }
}

/**
 * Rejects with a TimeoutError if `promise` hasn't settled within `ms`.
 * The caller is responsible for stopping the underlying work (e.g.
 * terminating a worker) when this rejects.
 */
export function withTimeout(promise, ms, label = "Operation") {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
