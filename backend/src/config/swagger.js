const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const swaggerPath = path.join(
  __dirname,
  "../../docs/openapi.yaml"
);

if (!fs.existsSync(swaggerPath)) {
  throw new Error(
    `OpenAPI specification not found at: ${swaggerPath}`
  );
}

const swaggerDocument = YAML.parse(
  fs.readFileSync(swaggerPath, "utf8")
);

module.exports = swaggerDocument;