# Refresh Token Reuse Detection

## Added behavior

- Refresh tokens now track token family metadata:
  - `jti`, `familyId`, `parentJti`, `replacedByJti`
  - `status` (`active` / `rotated` / `revoked`)
  - `revokedReason`
  - `usedAt`
- Reuse detection rule:
  - If a submitted refresh token exists in DB and its status is not `active`, it is treated as a reuse event.

## Reuse response

- Status: `403`
- Body:

```json
{
  "error": "Refresh token reuse detected",
  "code": "REFRESH_TOKEN_REUSE"
}
```

## Security reaction

On reuse detection:

1. Record security event (`refresh_token_reuse_detected`)
2. Revoke all refresh tokens for the same `userId` (`revokedReason = reuse_detected`)
3. Require re-authentication for any new refresh flow

Note: Access tokens are stateless JWTs and remain valid until expiry.

## Migration

- Script: `scripts/migrations/20260223-token-reuse-detection-77.js`
- Purpose:
  - Backfill legacy refresh token documents with new fields
  - Add indexes for new query paths
  - Ensure `securityevents` collection indexes exist
