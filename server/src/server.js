import dotenv from 'dotenv';

dotenv.config({ path: ['/vercel/share/.env.project', '.env.local', '.env'] });

const { default: app } = await import('./app.js');
const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}

export default app;
