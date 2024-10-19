export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const PORT = process.env.PORT || 3000;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in the environment variables');
  process.exit(1);
}
