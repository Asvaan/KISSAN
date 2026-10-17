# Kisaan Credit

Agricultural loan registry for Punjab: cadastral map, farmer register, field audit, season analytics, compliance, and desk settings. Mirrors the deployment at https://kisaan-credit.vercel.app/.

## Run locally

**Prerequisites:** Node.js

1. `npm install`
2. `npm run dev` (opens http://localhost:3000)

## Layout

- `index.html` – entry page
- `public/assets/` – compiled app bundle and stylesheet. The bundle is patched to show each farm's acreage and to treat illegal construction as a verified violation, with a direct officer-assign dropdown on the land record, Field audit and Compliance.
- `public/data/` – parcel registry, XGBoost risk model, model metrics, sample CSV
- `public/data/training/` – training datasets (`training_features.csv`, `monthly_observations.csv`) and model figures
- `src/chatbot/` – Kisaan Mitra crop advisor (bottom-right button)
  - `engine.ts` – crop scoring
  - `conversation.ts` – guided flows, intent parsing and conversation memory
  - `render.ts` – answer cards and tables
  - `widget.ts`, `chatbot.css` – chat UI
- `src/motion/` – site-wide entrance, hover and count-up animations layered on the compiled app

## Kisaan Mitra (crop advisor)

Suggests what to grow for a farmer ID or name, a district (optionally with a village), or typed soil readings such as "fertility 35, rainfall 420, moisture 26". It runs entirely in the browser on `public/data/punjab_parcels.json`.

The chat opens with a main menu and guided flows (advise a farmer, best crops for a district, a 3-step soil check, what to sow this month, ask about a crop, land holdings). Every farmer answer states the holding size; land questions such as "how much land does PB-ASR-0001 have?", "land holdings in Moga" or "farms over 20 acres in Bathinda" get acreage, district averages and rankings. Every answer ends with quick-reply chips and a helpful/not helpful prompt. It remembers the last farmer, district or soil profile, so follow-ups such as "why?", "compare maize and potato" or "when to sow it?" work without repeating details. It tolerates typos in names, districts and crops, and supports voice input where the browser provides speech recognition.

Each of the seven crops is scored out of 100:

- 50% agronomic fit: the field's soil fertility, soil moisture, rainfall, temperature and altitude against the crop's ideal ranges (`CROPS` in `src/chatbot/engine.ts`)
- 25% similarity to approved, violation-free growers of that crop in the registry
- 10% NDVI and risk of the 12 most similar approved growers
- 15% bonus when the district is in the crop's established belt

Answers also flag holdings with open violations, show whether the crop's sowing window is open this month, and name the least suited crop.
