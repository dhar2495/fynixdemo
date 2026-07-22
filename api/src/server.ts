import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SyslaFynix API listening on http://localhost:${PORT}`);
  console.log(`Swagger UI:   http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI JSON: http://localhost:${PORT}/api/openapi.json`);
});
