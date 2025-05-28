import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'Simple API to shorten and manage URLs.',
      contact: {
        name: 'Développeur API',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3500',
        description: 'Serveur de développement',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez un token JWT valide'
        }
      },
      schemas: {
        Url: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            original_url: { type: 'string', format: 'uri' },
            shortened_code: { type: 'string' },
            short_url: { type: 'string', format: 'uri' },
            created_at: { type: 'string', format: 'date-time' }
          },
          required: ['original_url']
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'] // Où tu vas documenter tes routes via des commentaires JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
