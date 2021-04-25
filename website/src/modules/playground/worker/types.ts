export interface BundleOptions {
  files: Record<string, string>;
  component: string;
  environment: string;
  callback: string;
}

export interface BundleResult {
  code: string;
  warnings: string[];
}

export interface PlaygroundWorker {
  bundle(options: BundleOptions): Promise<BundleResult>;
}
