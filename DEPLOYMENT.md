# Vercel Deployment

Deploy this repository as two Vercel projects connected to the same GitHub repository.

## Backend project

- Root Directory: `backend`
- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty

Add the variables from `backend/.env.example`. Set `FRONTEND_URL` to the deployed frontend URL.

## Frontend project

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Add this variable using the deployed backend URL:

```text
VITE_API_URL=https://your-backend-project.vercel.app/api
```

Both Vercel projects should have GitHub automatic deployments enabled. Every push to `main` then deploys the backend and frontend independently.

After the first frontend deployment, update the backend `FRONTEND_URL` variable with the final frontend URL and redeploy the backend.