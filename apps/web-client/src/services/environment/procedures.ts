/**
 * Environment tRPC Procedures — City search & geocoding
 *
 * Provides server-side city autocomplete and geocoding to avoid
 * exposing Google API keys to the client.
 */

import { publicProcedure, createTRPCRouter } from "@/server/init";
import { z } from "zod";
import { searchCities, geocodePlace } from "./geocoding";

export const environmentRouter = createTRPCRouter({
  /**
   * Search for cities by query string.
   * Public — no auth required (lightweight autocomplete).
   */
  searchCities: publicProcedure
    .input(z.object({ query: z.string().min(2).max(100) }))
    .query(async ({ input }) => {
      const suggestions = await searchCities(input.query);
      return { suggestions };
    }),

  /**
   * Resolve a Google Place ID to lat/lng coordinates.
   * Public — no auth required.
   */
  geocodeCity: publicProcedure
    .input(z.object({ placeId: z.string().min(1) }))
    .query(async ({ input }) => {
      const location = await geocodePlace(input.placeId);
      return { location };
    }),
});
