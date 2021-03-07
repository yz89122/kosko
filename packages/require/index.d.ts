/**
 * Returns true if ECMAScript modules are supported in the current environment.
 * If `ESM_IMPORT_DISABLED=true` environment variable is set, this function will
 * always return `false`.
 */
export function isESMSupported(): Promise<boolean>;

/**
 * Imports a module from the specified path. This function supports both CommonJS
 * and ECMAScript modules. When a CommonJS module is imported, its `module.export`
 * is assigned to `default` in order to match the behavior of ECMAScript modules.
 */
export function importPath(path: string): Promise<any>;

/**
 * Imports a module from the specified path and returns its default export.
 * This function is only compatible with CommonJS modules.
 */
export function requireDefault(path: string): any;

export interface ResolveOptions {
  /**
   * The directory to resolve from.
   */
  baseDir?: string;
}

/**
 * Resolved path to the specified module.
 */
export function resolve(
  id: string,
  options?: ResolveOptions
): Promise<string | undefined>;

/**
 * Resolved path to the specified ECMAScript module.
 */
export function resolveESM(
  id: string,
  options?: ResolveOptions
): Promise<string | undefined>;

/**
 * Returned file extensions which can be handled by `require`.
 *
 * Example:
 *
 * ```js
 * [".js", ".json", ".node"]
 * ```
 */
export function getRequireExtensions(): string[];
