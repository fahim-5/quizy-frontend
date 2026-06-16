# Manual Netlify Upload (build and drag-and-drop)

1. From the project root, install deps and build the frontend:

```powershell
cd frontend
npm install
npm run build
```

2. Zip the `dist` folder (PowerShell):

```powershell
cd frontend
Compress-Archive -Path .\dist\* -DestinationPath ../frontend-dist.zip
```

3. Go to https://app.netlify.com/drop and drop `frontend-dist.zip` (or drag the `dist` folder contents).

4. Set environment variables (if any) in Netlify Dashboard → Site settings → Build & deploy → Environment.

Notes

- `frontend/_redirects` and `netlify.toml` are included to support client-side routing.
- Use Vite env vars prefixed with `VITE_` for values exposed to the browser.
- For automatic deploys, connect your repo in the Netlify dashboard and set the build command to `npm run build` and publish directory to `dist`.
