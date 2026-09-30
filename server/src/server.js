import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });
const { default: app } = await import('./app.js');
const { connectDB } = await import('./config/db.js');
const port = process.env.PORT || 5000;
try {
  await connectDB();
  if (!process.env.VERCEL) app.listen(port, () => console.log(`API on http://localhost:${port}`));
} catch (e) {
  console.error(e);
  process.exit(1);
}
export default app;
