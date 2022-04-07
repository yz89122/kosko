"use strict";

module.exports = {
  docs: [
    "getting-started",
    {
      type: "category",
      label: "Components",
      link: {
        type: "doc",
        id: "components/index"
      },
      items: [
        "components/validation",
        "components/loading-kubernetes-yaml",
        "components/loading-helm-chart",
        "components/loading-kustomize"
      ]
    },
    {
      type: "category",
      label: "Environments",
      link: {
        type: "doc",
        id: "environments/index"
      },
      items: ["environments/folder-structure"]
    },
    "templates",
    {
      type: "category",
      label: "Recipes",
      link: {
        type: "generated-index",
        title: "Recipes",
        description:
          "These recipes might give you some ideas about how to reuse and simplify manifests in Kosko.",
        slug: "/recipes"
      },
      items: [{ type: "autogenerated", dirName: "recipes" }]
    },
    "typescript",
    "ecmascript-modules",
    "programmatic-usage",
    "using-in-browser",
    "troubleshooting",
    {
      type: "category",
      label: "CLI",
      link: {
        type: "generated-index",
        title: "CLI",
        slug: "/cli"
      },
      items: [{ type: "autogenerated", dirName: "cli" }]
    },
    "configuration"
  ],
  api: [{ type: "autogenerated", dirName: "api" }]
};
