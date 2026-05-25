# Git Search

Vite + React app to search GitHub users.

## Deploy to Vercel

1. Push your repository to GitHub.
2. In Vercel, "Import Project" and select the repository.
3. Vercel automatically detects the project. If not, set:
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
4. Deploy. The app will be served as a single-page app (SPA).

Local build:

```bash
npm install
npm run build
npx serve dist # or `vite preview` to preview
```
