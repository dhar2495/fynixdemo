import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import transactionRoutes from './routes/transactions';
import loanRoutes, { resetRouter } from './routes/loans';
import { openapiSpec } from './openapi';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SyslaFynix-finance-api' }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/reset', resetRouter);

  // Raw spec + Swagger UI (this is the live Swagger URL when hosted)
  app.get('/api/openapi.json', (_req, res) => res.json(openapiSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'SyslaFynix API — Swagger',
  }));

  // Optionally serve the built Expo web app if present (single deploy target).
  const webDist = path.resolve(__dirname, '../public');
  app.use(express.static(webDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'), (err) => {
      if (err) res.status(404).json({ error: 'Not found. Try /api-docs or /api/health' });
    });
  });

  return app;
}
