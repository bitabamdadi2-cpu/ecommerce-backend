const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

// سند OpenAPI به‌صورت دستی در docs/openapi.yaml نوشته شده و اینجا لود می‌شود
const openapiPath = path.join(__dirname, '../../docs/openapi.yaml');
const swaggerDocument = YAML.load(fs.readFileSync(openapiPath, 'utf8'));

module.exports = { swaggerUi, swaggerDocument };
