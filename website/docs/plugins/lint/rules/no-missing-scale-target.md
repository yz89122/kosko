---
title: no-missing-scale-target
---

Disallow missing scale target references defined in auto scalers (e.g. HPA, VPA).

This rule ensures that all scale target references defined in auto scalers are present by checking if the corresponding manifests are present or not.

Currently this rule supports the following resources:

| API Group            | Kind                      |
| -------------------- | ------------------------- |
| `autoscaling`        | `HorizontalPodAutoscaler` |
| `autoscaling.k8s.io` | `VerticalPodAutoscaler`   |
| `autoscaling.gke.io` | `MultidimPodAutoscaler`   |
| `keda.sh`            | `ScaledObject`            |

## Configuration

### `allow`

Allow scale target references that match the patterns to be missing.

#### Examples {#allow-examples}

Allow a Deployment with a specific namespace and name.

```toml
allow = [{ apiVersion = "apps/v1", kind = "Deployment", namespace = "foo", name = "bar" }]
```
