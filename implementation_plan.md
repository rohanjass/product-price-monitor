# Frontend Real-time and Animation Implementation Plan

This document outlines the steps to add real-time price update simulations and animations to the React frontend.

## Proposed Changes

### Dependencies
- Install `framer-motion` for smooth, professional animations.
- Install `react-hot-toast` for elegant, non-intrusive toast notifications.

---

### App Level
#### [MODIFY] [App.jsx](file:///c:/Users/HP/OneDrive/Documents/Desktop/VS%20CODE%20FILES/product-price-monitor/frontend/src/App.jsx)
- Import and render `<Toaster />` from `react-hot-toast` at the root level so toast notifications can be displayed anywhere in the application.

---

### Components
#### [MODIFY] [ProductList.jsx](file:///c:/Users/HP/OneDrive/Documents/Desktop/VS%20CODE%20FILES/product-price-monitor/frontend/src/components/ProductList.jsx)
- **Real-time Polling**: Add a `useEffect` that sets up a `setInterval` every 5 seconds.
- **Price Simulation Logic**: Within the interval, randomly select 1-3 products and adjust their prices up or down by a small percentage (1-5%).
- **Toast Notifications**: Trigger a toast notification when a price changes (e.g., "Price dropped for [Product Name]!").
- **Animations**: Wrap the grid rendering in Framer Motion components (`motion.div`) to create a staggered fade-in effect for the list of products on initial load.

#### [MODIFY] [ProductCard.jsx](file:///c:/Users/HP/OneDrive/Documents/Desktop/VS%20CODE%20FILES/product-price-monitor/frontend/src/components/ProductCard.jsx)
- **Framer Motion Integration**: Convert the main wrapper to a `<motion.div>`.
- **Hover Animations**: Add `whileHover={{ scale: 1.02, y: -4 }}` for a smooth, subtle card lift effect on hover.
- **Price Change Detection**: Use a `useRef` to keep track of the `previousPrice`. Compare it with the incoming `price` prop to determine if the price went up or down.
- **Flash Highlights**: Use Framer Motion's `animate` prop to temporarily flash the background color of the price or the card itself (e.g., green for drop, red for increase) when a price change occurs, smoothly transitioning back to the default state.

## Verification Plan

### Automated Tests
- N/A (Project currently does not have automated frontend tests configured).

### Manual Verification
1. Run `npm run dev` in the `frontend` directory.
2. Open the application in the browser.
3. Verify that products smoothly fade in on load.
4. Hover over product cards to verify the lift animation.
5. Leave the "Products" page open and wait for 5 seconds.
6. Verify that 1-3 random products flash green or red as their prices drop or increase.
7. Verify that toast notifications appear in the corner of the screen when price changes occur.
