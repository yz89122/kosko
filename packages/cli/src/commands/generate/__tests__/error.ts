import { CLIError } from "@kosko/cli-utils";
import { printIssues } from "../error";
import BufferList from "bl";

let stderr: BufferList;

jest.spyOn(process.stderr, "write");

beforeEach(() => {
  stderr = new BufferList();
  (process.stderr.write as jest.Mock).mockImplementation((chunk) => {
    stderr.write(chunk);
  });
});

test("single error issue", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("single warning issue", () => {
  printIssues("", {
    manifests: [
      {
        path: "components/foo.ts",
        index: [],
        data: {},
        issues: [
          {
            severity: "warning",
            message: "Warning message"
          }
        ]
      }
    ]
  });

  expect(stderr.toString()).toMatchSnapshot();
});

test("manifest contains component info", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ],
          component: {
            apiVersion: "v1",
            kind: "Pod",
            name: "foo"
          }
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("component info contains namespace", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ],
          component: {
            apiVersion: "v1",
            kind: "Pod",
            namespace: "default",
            name: "foo"
          }
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("index is not empty", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [2, 4],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("component info and index are present", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [2, 4],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ],
          component: {
            apiVersion: "v1",
            kind: "Pod",
            name: "foo"
          }
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("ignore manifests without issues", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: []
        },
        {
          path: "components/bar.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("issue contains a string cause", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message",
              cause: "Cause message"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("issue contains an object cause", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message",
              cause: {
                name: "FooError",
                message: "foobar"
              }
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("issue contains a Error class cause", () => {
  expect(() => {
    const err = new Error("foobar");
    err.stack = "Error: foobar\n  at foo.ts:1:1";

    printIssues;
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message",
              cause: err
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("cause is a empty object", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message",
              cause: {}
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("multiple issues", () => {
  expect(() => {
    printIssues("", {
      manifests: [
        {
          path: "components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error 1"
            },
            {
              severity: "warning",
              message: "Warning 1"
            },
            {
              severity: "error",
              message: "Error 2"
            }
          ]
        },
        {
          path: "components/bar.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error 3"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});

test("cwd is not empty", () => {
  expect(() => {
    printIssues("/foo/bar", {
      manifests: [
        {
          path: "/foo/bar/components/foo.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ]
        },
        {
          path: "/abc/def/components/bar.ts",
          index: [],
          data: {},
          issues: [
            {
              severity: "error",
              message: "Error message"
            }
          ]
        }
      ]
    });
  }).toThrowWithMessage(CLIError, "Generate failed");

  expect(stderr.toString()).toMatchSnapshot();
});
