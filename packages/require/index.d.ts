/**
 * Returns true if ECMAScript modules are supported in the current environment.
 * If `ESM_IMPORT_DISABLED=true` environment variable is set, this function will
 * always return `false`.
 *
 * @public
 */
export function isESMSupported(): Promise<boolean>;

/**
 * Imports a module from the specified path. This function supports both CommonJS
 * and ECMAScript modules. When a CommonJS module is imported, its `module.export`
 * is assigned to `default` in order to match the behavior of ECMAScript modules.
 *
 * @public
 */
export function importPath(path: string): Promise<any>;

/**
 * Imports a module from the specified path and returns its default export.
 * This function is only compatible with CommonJS modules.
 *
 * @public
 */
export function requireDefault(path: string): any;

/**
 * @public
 */
export interface ResolveOptions {
  /**
   * The directory to resolve from.
   */
  baseDir?: string;

  /**
   * File extensions to resolve.
   */
  extensions?: readonly string[];
}

/**
 * Resolves path to the specified module. Throws `MODULE_NOT_FOUND` error when
 * the given path can't be resolved to a module.
 *
 * @public
 */
export function resolve(id: string, options?: ResolveOptions): Promise<string>;

/**
 * Resolves path to the specified module. Returns ECMAScript module path when
 * available. See `resolve` for more info.
 *
 * @public
 */
export function resolveESM(
  id: string,
  options?: ResolveOptions
): Promise<string>;

/**
 * Returns file extensions which can be imported.
 *
 * @defaultValue
 *
 * ```js
 * [".cjs", ".mjs", ".js", ".json", ".node"]
 * ```
 *
 * @public
 */
export function getRequireExtensions(): string[];
