import path from 'path';
import { fileURLToPath } from 'url';

import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'OpenAPI documentation for implemented /todos endpoints.',
    },
    servers: [
      {
        url: '/',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/todos.js')],
};

const openapiSpec = swaggerJsdoc(options);

export default openapiSpec;
