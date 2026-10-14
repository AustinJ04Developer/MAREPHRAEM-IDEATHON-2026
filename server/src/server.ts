import { app } from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';
import { bootstrapAdmin } from './scripts/bootstrap-admin.js';
import { seedProblemAreas } from './scripts/seed.js';

async function startServer() {
  await connectDB();
  await seedProblemAreas();
  await bootstrapAdmin();

  app.listen(env.PORT, () => {
    console.log(`[Server] MAREPHRAEM IDEATHON 2026 API running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
    console.log(`[Server] Public Health check: http://localhost:${env.PORT}/api/v1/health`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
