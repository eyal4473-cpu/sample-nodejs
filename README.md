# DevOps Sample Node.js App

## Overview

A lightweight Node.js application. It features basic web endpoints, Prometheus metrics integration, and is designed for Kubernetes deployment and CI/CD pipeline demonstrations.

## Features

- Express.js web server
- Prometheus metrics integration
- Readiness and liveness probe endpoints
- Customizable port via environment variable

## Prerequisites

- Node.js (v22.1.0)

## Kubernetes

This app is a Deployment. Each pod only answers HTTP requests, keeps nothing on disk, and can be replaced by any other pod. A Deployment rolls those pods forward. A StatefulSet is the fit when a pod needs a stable name and its own volume.

The chart is `chart/sample-nodejs`. It includes:

- liveness on `/live`, readiness on `/ready`, and a startup probe
- a Service and an Ingress, so the browser page is `/my-app`
- CPU and memory requests and limits
- a ConfigMap for `PORT`
- a Secret for `APP_TOKEN`
- a non-root container, a read-only root filesystem, a network policy, and a pod disruption budget

## Pipeline

Work merges through pull requests into `main` (GitHub Flow). A merge bumps the patch version, tags `vX.Y.Z`, and pushes the image to GHCR.

The pipeline fails when Semgrep reports an error-level finding in `app.js`, when `npm audit` reports a critical advisory, or when Trivy finds a fixable high or critical issue in the image. Trivy ignores unfixed findings in the base image, because those have no package update to apply.

Argo CD reads the Helm chart from this repository (`gitops/application.yaml`). The pipeline's deploy step commits the new image tag. Argo CD applies that commit. The chart and the tag that the cluster runs stay in one place. Change `repoURL` in that file to the fork Argo CD should watch.
