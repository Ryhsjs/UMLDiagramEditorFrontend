#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE=app

kubectl apply -f "$DIR/namespace.yaml"
kubectl apply -f "$DIR/configmap.yaml"
kubectl apply -f "$DIR/frontend.yaml"
kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=120s

echo "Frontend deployed."
