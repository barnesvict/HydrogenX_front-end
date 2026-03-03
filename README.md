# HydrogenX Frontend

This is the Next.js 15 (App Router) frontend for the HydrogenX green hydrogen modeling platform.

## Features

- Dark-themed dashboard
- Sidebar with sliders for system parameters
- Revenue cards and a monthly stacked bar chart
- Connects to a FastAPI backend at `http://localhost:8000`
- Uses Tailwind CSS, React, TypeScript
- Charting via Recharts

## Setup

```bash
# install dependencies
npm install

# run development server
npm run dev
```

The UI will be available at `http://localhost:3000`.

Make sure the backend is running and exposing `POST /calculate_single_site`.

## Structure

- `app/` — Next.js app router files
- `components/` — UI and dashboard components
- `components/ui/` — primitive UI elements (buttons, sliders, cards)

## Notes

- The sidebar parameters are hardcoded with sensible defaults. Adjust as needed.
- The "Calculate" button sends the current parameters to the backend and updates the revenue cards and chart.
