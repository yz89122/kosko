import execa from "execa";
import { dirname } from "node:path";
import { installPackage, runCLI } from "@kosko/test-utils";

const testDir = dirname(__dirname);
let result: execa.ExecaReturnValue;

beforeAll(async () => {
  await installPackage(testDir, "env");
});

beforeEach(async () => {
  result = await runCLI(["generate", "--env", "dev"], {
    cwd: testDir
  });
});

test("should import ESM files", () => {
  expect(result.stdout).toMatchSnapshot();
});
