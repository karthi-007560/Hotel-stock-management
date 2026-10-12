# HotelStock — Hotel Store & Inventory Management

Light, responsive React (Create React App) frontend with animations.

## Included
- Dashboard with stock/purchase/usage cards and chart
- Inventory, purchases, usage, wastage
- Suppliers, reports, daily closing
- Users and settings
- Responsive sidebar and mobile layout
- Separate JS/CSS files
- Light glassmorphism UI + hover/scroll/fade animations
- React Router + Recharts
- Demo login

## Run
npm install
npm start

## Build for Netlify
npm run build
Upload the generated `build` folder to Netlify Drop.

## Production backend plan
Node.js + Express + MongoDB/Mongoose + JWT + role permissions + stock transaction ledger.

Core stock formula:
Closing Stock = Opening Stock + Purchases - Usage - Wastage +/- Adjustments
