#!/usr/bin/env node
//
// Mints the HS256 JWT the frontend sends for PostgREST writes.
//
// The signing secret is read from stdin (preferred) or from PGRST_JWT_SECRET.
// The resulting token is public by design: it is compiled into the SPA bundle,
// so it only proves "this is the app build", not "this is a specific user".
//
// Usage:
//   ssh hosting@hosting "podman secret inspect --showsecret pg_jwt_secret --format '{{.SecretData}}'" \
//     | node deployment/mint-token.mjs [role]
//
import { createHmac } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const MIN_SECRET_LENGTH = 32
const DEFAULT_ROLE = 'laptimes_api'

function base64Url (value) {
  return Buffer.from(value).toString('base64url')
}

export function mintToken (secret, role = DEFAULT_ROLE) {
  const normalizedSecret = secret.trim()

  if (normalizedSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT secret must be at least ${MIN_SECRET_LENGTH} characters`)
  }

  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({ role }))
  const signature = createHmac('sha256', normalizedSecret)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}

async function readStdin () {
  if (process.stdin.isTTY) return ''

  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isCli) {
  const role = process.argv[2] ?? DEFAULT_ROLE
  const secret = process.env.PGRST_JWT_SECRET ?? await readStdin()

  try {
    process.stdout.write(mintToken(secret, role))
  } catch (error) {
    console.error(`mint-token: ${error.message}`)
    process.exitCode = 1
  }
}
