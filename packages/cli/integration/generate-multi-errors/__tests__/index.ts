import { runCLI } from "@kosko/test-utils";
import execa from "execa";
import { dirname } from "node:path";

const testDir = dirname(__dirname);

let args: string[];
let result: execa.ExecaReturnValue;

beforeEach(async () => {
  result = await runCLI(args, {
    cwd: testDir,
    reject: false
  });
});

describe("when bail is not set", () => {
  beforeAll(() => {
    args = ["generate"];
  });

  test("should return status code 1", () => {
    expect(result.exitCode).toEqual(1);
  });

  test("should print the error", () => {
    expect(result.stderr).toMatchSnapshot();
  });
});

describe("when bail is true", () => {
  beforeAll(() => {
    args = ["generate", "--bail"];
  });

  test("should return status code 1", () => {
    expect(result.exitCode).toEqual(1);
  });

  test("should print the error", () => {
    expect(result.stderr).toMatchSnapshot();
  });
});
