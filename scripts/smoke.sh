#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "== Health =="
curl -s ${BASE_URL}/ | jq .

echo "== Create =="
CREATE=$(curl -s -X POST ${BASE_URL}/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write README","status":"in-progress"}')
echo "$CREATE" | jq .

ID=$(echo "$CREATE" | jq -r '._id')

echo "== List =="
curl -s ${BASE_URL}/todos | jq .

echo "== Update =="
curl -s -X PUT ${BASE_URL}/todos/${ID} \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}' | jq .

echo "== Delete =="
curl -s -X DELETE ${BASE_URL}/todos/${ID} -i | head -n 1

