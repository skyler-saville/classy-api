// import lodash
const _ = require('lodash')
// Service account credentials for use with Google APIs
const type = process.env.G_TYPE
const project_id = process.env.G_PROJECT_ID
const private_key_id = process.env.G_PRIVATE_KEY_ID
const private_key = _.replace(process.env.G_PRIVATE_KEY, new RegExp("\\\\n", "\g"), "\n")
const client_email = process.env.G_CLIENT_EMAIL
const client_id = process.env.G_CLIENT_ID
const auth_uri = process.env.G_AUTH_URI
const token_uri = process.env.G_TOKEN_URI
const auth_provider_x509_cert_url = process.env.G_AUTH_PROVIDER_CERT_URL
const client_x509_cert_url = process.env.G_CLIENT_CERT_URL
const project_email = process.env.G_PROJECT_EMAIL

module.exports = {
  type,
  project_id,
  private_key_id,
  private_key,
  client_email,
  client_id,
  auth_uri,
  token_uri,
  auth_provider_x509_cert_url,
  client_x509_cert_url,
  project_email
}