import type { Issue, Manifest } from "./base";
import logger, { LogLevel } from "@kosko/log";
import { ResolveError } from "./error";
import { isRecord, getManifestMeta } from "@kosko/common-utils";
import pLimit from "p-limit";
import { validateConcurrency } from "./utils";
import { ajvValidationErrorToIssues, isAjvValidationError } from "./ajv";

interface Validator {
  validate(): void | Promise<void>;
}

function isValidator(value: unknown): value is Validator {
  return !!value && typeof (value as any).validate === "function";
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  if (value instanceof Promise) return true;

  return (
    !!value &&
    (typeof value === "function" || typeof value === "object") &&
    typeof (value as any).then === "function"
  );
}

function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    typeof value === "object" &&
    value != null &&
    typeof (value as any)[Symbol.iterator] === "function"
  );
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return isRecord(value) && typeof value[Symbol.asyncIterator] === "function";
}

export class ReportInterrupt {
  constructor(public readonly manifest: Manifest) {}
}

type ResolvePromiseResult =
  | {
      ok: true;
      manifests: Manifest[];
    }
  | {
      ok: false;
      error: unknown;
    };

export async function handleResolvePromises(
  promises: readonly Promise<Manifest[]>[],
  bail?: boolean
): Promise<Manifest[]> {
  // Use a map to avoid sparse array
  const resultMap = new Map<number, ResolvePromiseResult>();

  try {
    await Promise.all(
      promises.map(async (promise, index) => {
        try {
          resultMap.set(index, { ok: true, manifests: await promise });
        } catch (err) {
          if (err instanceof ReportInterrupt) {
            resultMap.set(index, { ok: true, manifests: [err.manifest] });

            // Propagate ValidationInterrupt
            throw err;
          }

          // Throw the error to stop the loop
          if (bail) throw err;

          resultMap.set(index, { ok: false, error: err });
        }
      })
    );
  } catch (err) {
    // Propagate errors
    if (!(err instanceof ReportInterrupt)) throw err;
  }

  const resultArr = [...resultMap.entries()]
    // Sort by index
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);

  const manifests: Manifest[] = [];
  const errors: unknown[] = [];

  for (const result of resultArr) {
    if (result.ok) {
      manifests.push(...result.manifests);
    } else {
      errors.push(result.error);
    }
  }

  if (errors.length === 1) {
    throw errors[0];
  } else if (errors.length) {
    throw new AggregateError(errors);
  }

  return manifests;
}

export function createManifest({
  position,
  data,
  bail,
  throwOnError
}: Pick<Manifest, "position" | "data"> &
  Pick<ResolveOptions, "bail" | "throwOnError">): Manifest {
  const issues: Issue[] = [];

  return {
    position,
    data,
    metadata: getManifestMeta(data),
    issues,
    report(issue) {
      const isError = issue.severity === "error";

      if (isError && throwOnError) {
        if (issue.cause instanceof ResolveError) throw issue.cause;

        throw new ResolveError(issue.message, {
          position: this.position,
          value: this.data,
          cause: issue.cause
        });
      }

      issues.push(issue);

      // Throw to stop validation
      if (isError && bail) {
        throw new ReportInterrupt(this);
      }
    }
  };
}

/**
 * @public
 */
export interface ResolveOptions {
  /**
   * Enable validation.
   *
   * @defaultValue `true`
   */
  validate?: boolean;

  /**
   * Source path of a manifest.
   *
   * @defaultValue `""`
   */
  path?: string;

  /**
   * Source index of a manifest.
   *
   * @defaultValue `[]`
   */
  index?: number[];

  /**
   * Stop immediately when an error occurred.
   */
  bail?: boolean;

  /**
   * Maximum number of concurrent tasks.
   *
   * @defaultValue `10`
   */
  concurrency?: number;

  /**
   * Transform a manifest. This function is called when a new manifest is found,
   * and before the validation. The return value will override the data of the
   * manifest. If the return value is `undefined` or `null`, the manifest will
   * be removed from the result.
   */
  transform?(manifest: Manifest): unknown;

  /**
   * Throw an error when an issue with `error` severity is found.
   */
  throwOnError?: boolean;

  /**
   * Validate a manifest. This function is called after `validate` method of
   * a manifest. No matter `validate` method exists or not, this function will
   * be called.
   *
   * If the `bail` option is `true`, and `validate` method failed, this function
   * will not be called.
   */
  validateManifest?(manifest: Manifest): void | Promise<void>;

  /**
   * Do not transform Ajv errors to issues.
   */
  keepAjvErrors?: boolean;
}

async function doResolve(
  value: unknown,
  options: ResolveOptions
): Promise<Manifest[]> {
  const {
    validate = true,
    index = [],
    path = "",
    bail,
    concurrency,
    transform,
    throwOnError,
    validateManifest,
    keepAjvErrors
  } = options;
  const limit = pLimit(validateConcurrency(concurrency));
  const manifest = createManifest({
    position: { path, index },
    data: value,
    bail,
    throwOnError
  });

  if (typeof value === "function") {
    let val: unknown;

    try {
      val = await value();
    } catch (err) {
      manifest.report({
        severity: "error",
        message: "Input function value threw an error",
        cause: err
      });
      return [manifest];
    }

    return doResolve(val, options);
  }

  if (isPromiseLike(value)) {
    let val: unknown;

    try {
      val = await value;
    } catch (err) {
      manifest.report({
        severity: "error",
        message: "Input promise value rejected",
        cause: err
      });
      return [manifest];
    }

    return doResolve(val, options);
  }

  if (isIterable(value)) {
    const promises: Promise<Manifest[]>[] = [];
    let i = 0;

    try {
      for (const entry of value) {
        promises.push(
          limit(() => doResolve(entry, { ...options, index: [...index, i++] }))
        );
      }
    } catch (err) {
      manifest.report({
        severity: "error",
        message: "Input iterable value threw an error",
        cause: err
      });
      return [manifest];
    }

    return handleResolvePromises(promises, bail);
  }

  if (isAsyncIterable(value)) {
    const promises: Promise<Manifest[]>[] = [];
    let i = 0;

    try {
      for await (const entry of value) {
        promises.push(
          limit(() => doResolve(entry, { ...options, index: [...index, i++] }))
        );
      }
    } catch (err) {
      manifest.report({
        severity: "error",
        message: "Input async iterable value threw an error",
        cause: err
      });
      return [manifest];
    }

    return handleResolvePromises(promises, bail);
  }

  manifest.metadata = getManifestMeta(manifest.data);

  if (typeof transform === "function") {
    try {
      const newValue = await transform(manifest);

      // Remove the manifest if the return value is undefined or null
      if (newValue == null) return [];

      manifest.data = newValue;
      manifest.metadata = getManifestMeta(newValue);
    } catch (err) {
      manifest.report({
        severity: "error",
        message: "An error occurred in transform function",
        cause: err
      });
      return [manifest];
    }
  }

  if (validate) {
    logger.log(
      LogLevel.Debug,
      `Validating manifests ${index.join(".")} in ${path}`
    );

    if (isValidator(manifest.data)) {
      try {
        await manifest.data.validate();
      } catch (err) {
        if (!keepAjvErrors && isAjvValidationError(err)) {
          for (const issue of ajvValidationErrorToIssues(err)) {
            manifest.report(issue);
          }
        } else {
          manifest.report({
            severity: "error",
            message: "Validation error",
            cause: err
          });
        }
      }
    }

    if (typeof validateManifest === "function") {
      try {
        await validateManifest(manifest);
      } catch (err) {
        // Propagate ValidationInterrupt thrown by reportIssue
        if (err instanceof ReportInterrupt) throw err;

        manifest.report({
          severity: "error",
          message: "An error occurred in validateManifest function",
          cause: err
        });
      }
    }
  }

  return [manifest];
}

/**
 * Flattens the input value and validate each values.
 *
 * @remarks
 * The `value` can be an object, an array, a `Promise`, a function, an async
 * function, an iterable, or an async iterable.
 *
 * @throws {@link ResolveError}
 * Thrown if an error occurred.
 *
 * @throws AggregateError
 * Thrown if multiple errors occurred.
 *
 * @public
 */
export async function resolve(
  value: unknown,
  options: ResolveOptions = {}
): Promise<Manifest[]> {
  try {
    return await doResolve(value, options);
  } catch (err) {
    if (err instanceof ReportInterrupt) return [err.manifest];
    throw err;
  }
}
