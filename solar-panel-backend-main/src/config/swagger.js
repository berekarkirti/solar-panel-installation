import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solar Panel Installation System API',
      version: '1.0.0',
      description: `
        ## RESTful API for Solar Panel Installation Management System
        
        This API enables comprehensive management of solar panel installations including:
        - Customer registration and order management
        - Solar panel product catalog with filtering
        - Shopping cart and payment processing (Stripe integration)
        - Technician assignment and installation tracking
        - Review and rating system
        - Admin dashboard and analytics
        
        ### User Roles
        - **ADMIN**: Full system access and management
        - **CUSTOMER**: Browse, purchase, and track installations
        - **TECHNICIAN**: Manage assigned installations and update status
        
        ### Base URL
        \`http://localhost:${process.env.PORT || 5000}\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@solarpanel.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.solarpanel.com',
        description: 'Production server (placeholder)',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints (coming soon)',
      },
      {
        name: 'Solar Panels',
        description: 'Solar panel product management',
      },
      {
        name: 'Orders',
        description: 'Order and cart management (coming soon)',
      },
      {
        name: 'Payments',
        description: 'Payment processing endpoints (coming soon)',
      },
      {
        name: 'Installations',
        description: 'Installation tracking and management (coming soon)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // ═══════════════════════════════════════════════════════
        // USER SCHEMAS
        // ═══════════════════════════════════════════════════════
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
              example: 'CUSTOMER',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890',
            },
            address: {
              type: 'string',
              example: '123 Solar Ave, Clean City',
            },
            city: {
              type: 'string',
              example: 'Mumbai',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/profile.jpg',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UserRole: {
          type: 'string',
          enum: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
          description: 'User role in the system',
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890',
            },
            address: {
              type: 'string',
              example: '123 Solar Ave, Clean City',
            },
            city: {
              type: 'string',
              example: 'Mumbai',
            },
            profileImage: {
              type: 'string',
              example: 'https://example.com/profile.jpg',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'newpassword123',
            },
          },
        },
        // Add to components.schemas
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User registered successfully',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        SolarPanel: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Premium Solar Panel 500W',
            },
            capacityKW: {
              type: 'number',
              example: 0.5,
              description: 'Panel capacity in kilowatts',
            },
            price: {
              type: 'number',
              example: 15000,
              description: 'Price in local currency',
            },
            description: {
              type: 'string',
              example: 'High efficiency monocrystalline solar panel',
            },
            suitableFor: {
              type: 'string',
              enum: ['residential_basic', 'residential_pro', 'commercial'],
              example: 'residential_basic',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              type: 'string',
              description: 'User ID reference',
              example: '507f1f77bcf86cd799439011',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  solarPanel: {
                    $ref: '#/components/schemas/SolarPanel',
                  },
                  quantity: {
                    type: 'number',
                    example: 2,
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
              example: 30000,
              description: 'Total cart value (calculated on server)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  solarPanel: {
                    $ref: '#/components/schemas/SolarPanel',
                  },
                  quantity: {
                    type: 'number',
                    example: 2,
                  },
                  priceAtPurchase: {
                    type: 'number',
                    example: 15000,
                    description: 'Price at the time of order creation',
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
              example: 30000,
            },
            shippingAddress: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
              },
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PAID', 'CANCELLED'],
              example: 'PENDING',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            order: {
              $ref: '#/components/schemas/Order',
            },
            amount: {
              type: 'number',
              example: 35000,
            },
            currency: {
              type: 'string',
              example: 'INR',
            },
            paymentIntentId: {
              type: 'string',
              example: 'pi_3ABC123def456GHI',
            },
            status: {
              type: 'string',
              enum: ['CREATED', 'SUCCESS', 'FAILED'],
              example: 'SUCCESS',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Installation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            order: {
              $ref: '#/components/schemas/Order',
            },
            customer: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            technician: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              example: 'PENDING',
            },
            notes: {
              type: 'string',
              example: 'Installation scheduled for tomorrow',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            order: {
              $ref: '#/components/schemas/Order',
            },
            customer: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            technician: {
              type: 'object',
              nullable: true,
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                firstName: {
                  type: 'string',
                },
                lastName: {
                  type: 'string',
                },
              },
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            comment: {
              type: 'string',
              example: 'Excellent service! Very professional installation.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // ═══════════════════════════════════════════════════════
        // GENERAL SCHEMAS
        // ═══════════════════════════════════════════════════════
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Server is running smoothly',
            },
            data: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  example: 'Solar Panel Installation System',
                },
                environment: {
                  type: 'string',
                  example: 'development',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
                uptime: {
                  type: 'number',
                  example: 123.456,
                },
                database: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'connected',
                    },
                    name: {
                      type: 'string',
                      example: 'solar_panel_db',
                    },
                    host: {
                      type: 'string',
                      example: 'localhost',
                    },
                    port: {
                      type: 'number',
                      example: 27017,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/app.js', './src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;