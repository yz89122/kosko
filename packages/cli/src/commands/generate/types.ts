import { PrintFormat } from "@kosko/generate";
import type { RootArguments } from "@kosko/cli-utils";
import { SetOption } from "./set-option";

export interface BaseGenerateArguments extends RootArguments {
  env?: string;
  require?: string[];
  components?: string[];
  validate?: boolean;
  set?: SetOption[];
  loader?: string[];
  config?: string;
  bail?: boolean;
}

export interface GenerateArguments extends BaseGenerateArguments {
  output: PrintFormat;
}
