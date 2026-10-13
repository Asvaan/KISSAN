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
- `src/chatbot/` – crop advisor widget (bottom-right "Crop advisor" button)

## Crop advisor

Suggests what to grow for a farmer ID or name, a district (optionally with a village), or typed soil readings such as "fertility 35, rainfall 420, moisture 26". It runs entirely in the browser on `public/data/punjab_parcels.json`.

Each of the seven crops is scored out of 100:

- 50% agronomic fit: the field's soil fertility, soil moisture, rainfall, temperature and altitude against the crop's ideal ranges (`CROPS` in `src/chatbot/engine.ts`)
- 25% similarity to approved, violation-free growers of that crop in the registry
- 10% NDVI and risk of the 12 most similar approved growers
- 15% bonus when the district is in the crop's established belt

Answers also flag holdings with open violations, show whether the crop's sowing window is open this month, and name the least suited crop.
