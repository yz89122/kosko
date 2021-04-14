import env, { createAsyncLoaderReducers } from "@kosko/env";
import { resolve, print, PrintFormat } from "@kosko/generate";

env.setReducers((reducers) => [
  ...reducers,
  ...createAsyncLoaderReducers({
    global: () => import("./environments/dev").then((mod) => mod.default),
    component: (name) =>
      import(`./environments/dev/${name}`).then((mod) => mod.default)
  })
]);

(async () => {
  const manifests = await resolve(
    import("./components/nginx.js").then((mod) => mod.default)
  );

  console.log(manifests);

  print(
    { manifests },
    { format: PrintFormat.YAML, writer: { write: console.log } }
  );
})();