# Kisaan Credit

Agricultural loan registry for Punjab: cadastral map, farmer register, field audit, season analytics, compliance, and desk settings. Mirrors the deployment at https://kisaan-credit.vercel.app/.

## Run locally

**Prerequisites:** Node.js

1. `npm install`
2. `npm run dev` (opens http://localhost:3000)

## Layout

- `index.html` – entry page
- `public/assets/` – compiled app bundle and stylesheet
- `public/data/` – parcel registry, XGBoost risk model, model metrics, sample CSV
- `public/data/training/` – training datasets (`training_features.csv`, `monthly_observations.csv`) and model figures
