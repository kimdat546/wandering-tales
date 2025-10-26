import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all published travels for map
export const getAllTravels = query({
  handler: async (ctx) =>
    await ctx.db
      .query("travels")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

// Get single travel with media
export const getTravelById = query({
  args: { id: v.id("travels") },
  handler: async (ctx, args) => {
    const travel = await ctx.db.get(args.id);
    if (!travel) {
      return null;
    }

    const media = await ctx.db
      .query("media")
      .withIndex("by_travel", (q) => q.eq("travelId", args.id))
      .collect();

    return { ...travel, media };
  },
});

// Get travels by date range
export const getTravelsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const allTravels = await ctx.db
      .query("travels")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    return allTravels.filter(
      (t) => t.visitDate >= args.startDate && t.visitDate <= args.endDate
    );
  },
});

// Create new travel entry
export const createTravel = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
    }),
    visitDate: v.string(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const travelId = await ctx.db.insert("travels", {
      ...args,
      createdAt: Date.now(),
    });
    return travelId;
  },
});

// Update existing travel
export const updateTravel = mutation({
  args: {
    id: v.id("travels"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        country: v.string(),
      })
    ),
    visitDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete travel and its media
export const deleteTravel = mutation({
  args: { id: v.id("travels") },
  handler: async (ctx, args) => {
    // Delete all associated media
    const media = await ctx.db
      .query("media")
      .withIndex("by_travel", (q) => q.eq("travelId", args.id))
      .collect();

    for (const item of media) {
      // Delete from storage
      await ctx.storage.delete(item.storageId);
      if (item.thumbnailStorageId) {
        await ctx.storage.delete(item.thumbnailStorageId);
      }
      // Delete media record
      await ctx.db.delete(item._id);
    }

    // Delete travel
    await ctx.db.delete(args.id);
  },
});
