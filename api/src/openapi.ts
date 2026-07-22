export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SyslaFynix API',
    version: '1.0.0',
    description:
      'Demo finance API for automation showcases. Login to obtain a JWT, then ' +
      'explore accounts, transactions and the loan calculator. Use **Authorize** ' +
      '(top right) with the token from `/auth/login`.\n\n' +
      'Demo credentials: `demo@SyslaFynix.dev` / `Demo@123`.',
  },
  servers: [
    { url: '/api', description: 'Same-origin (served by this API)' },
  ],
  tags: [
    { name: 'Auth', description: 'Login and token issuance' },
    { name: 'Accounts', description: 'Accounts and dashboard summary' },
    { name: 'Transactions', description: 'Transaction CRUD, filter, sort, page' },
    { name: 'Loans', description: 'EMI and amortization calculation' },
    { name: 'System', description: 'Reset and health' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'demo@SyslaFynix.dev' },
          password: { type: 'string', example: 'Demo@123' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 't-1' },
          accountId: { type: 'string', example: 'a-1' },
          date: { type: 'string', example: '2025-01-05' },
          type: { type: 'string', enum: ['income', 'expense'] },
          category: {
            type: 'string',
            enum: ['salary', 'investment', 'transfer', 'groceries', 'utilities', 'rent', 'entertainment', 'travel', 'other'],
          },
          amount: { type: 'number', example: 85000 },
          description: { type: 'string', example: 'January salary' },
        },
      },
      TransactionInput: {
        type: 'object',
        required: ['accountId', 'date', 'type', 'category', 'amount'],
        properties: {
          accountId: { type: 'string', example: 'a-1' },
          date: { type: 'string', example: '2025-02-01' },
          type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          category: { type: 'string', example: 'groceries' },
          amount: { type: 'number', example: 2500 },
          description: { type: 'string', example: 'Monthly groceries' },
        },
      },
      LoanRequest: {
        type: 'object',
        required: ['principal', 'annualRatePct', 'tenureMonths'],
        properties: {
          principal: { type: 'number', example: 500000 },
          annualRatePct: { type: 'number', example: 9.5 },
          tenureMonths: { type: 'integer', example: 24 },
        },
      },
      LoanResult: {
        type: 'object',
        properties: {
          emi: { type: 'number', example: 22994.13 },
          totalPayment: { type: 'number' },
          totalInterest: { type: 'number' },
          schedule: { type: 'array', items: { type: 'object' } },
        },
      },
      Error: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: { '200': { description: 'Service is up' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': { description: 'Token issued' },
          '400': { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List accounts',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Accounts list' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/accounts/summary': {
      get: {
        tags: ['Accounts'],
        summary: 'Dashboard KPIs (income, expense, net, balance)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Summary' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions (filter, search, sort, page)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['date', 'amount'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Paged list' }, '401': { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionInput' } } },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'], summary: 'Get one transaction', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Found' }, '404': { description: 'Not found' } },
      },
      put: {
        tags: ['Transactions'], summary: 'Update a transaction', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionInput' } } } },
        responses: { '200': { description: 'Updated' }, '400': { description: 'Validation error' }, '404': { description: 'Not found' } },
      },
      delete: {
        tags: ['Transactions'], summary: 'Delete a transaction', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } },
      },
    },
    '/loans/calculate': {
      post: {
        tags: ['Loans'],
        summary: 'Compute EMI + amortization schedule',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanRequest' } } } },
        responses: {
          '200': { description: 'Loan result', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanResult' } } } },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/reset': {
      post: {
        tags: ['System'],
        summary: 'Reset all data to the deterministic seed',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Reset done' }, '401': { description: 'Unauthorized' } },
      },
    },
  },
} as const;
