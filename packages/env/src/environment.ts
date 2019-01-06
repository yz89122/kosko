import pkgDir from "pkg-dir";
import { join } from "path";
import { requireDefault } from "@kosko/require";

const ROOT = Symbol("root");
const ENV = Symbol("env");
const ENV_DIR = Symbol("envDir");

function tryRequire(id: string) {
  try {
    return requireDefault(id);
  } catch {
    return {};
  }
}

export class Environment {
  private readonly [ROOT]: string | null;

  private [ENV]: string | undefined;
  private [ENV_DIR]: string | undefined;

  constructor(cwd?: string) {
    this[ROOT] = pkgDir.sync(cwd);
  }

  public get env(): string {
    return this[ENV] || "";
  }

  public set env(env: string) {
    const root = this[ROOT];
    this[ENV] = env;

    if (root) {
      this[ENV_DIR] = join(root, "environments", env);
    }
  }

  public global() {
    const envDir = this[ENV_DIR];
    if (!envDir) return {};

    return tryRequire(envDir);
  }

  public component(name: string) {
    const envDir = this[ENV_DIR];
    if (!envDir) return {};

    return {
      ...this.global(),
      ...tryRequire(join(envDir, name))
    };
  }
}