# Run in the Sun - RITS

**Status: Alpha**

RITS is a web app for planning and exploring running routes. It helps runners sketch out where they want to go, compare options on a map, and understand what a route will feel like before they head out.

Plan routes in two ways. **Point-to-point** routing lets you pick a start and finish on the map and generate a path between them. **Round trip** routing lets you choose a starting point and target distance to build a loop that returns where you began. When a route is created, a side panel shows analysis of the path, including distance, duration, elevation-related details, and a breakdown of surface types along the way.

The frontend is built with React, TypeScript, and Vite. Maps use Leaflet. Routing and route metadata come from the [OpenRouteService](https://openrouteservice.org/) Directions API. Run `npm install` and `npm run dev` to start locally. Set `VITE_ORS_BASE_URL` in `.env` to your directions endpoint.

This project is in active development. Features, UI, and data presentation may change.