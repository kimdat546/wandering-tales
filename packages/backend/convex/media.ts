import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

// Save media metadata after upload
export const saveMedia = mutation({
  args: {
    travelId: v.id("travels"),
    type: v.union(v.literal("photo"), v.literal("video"), v.literal("audio")),
    storageId: v.string(),
    thumbnailStorageId: v.optional(v.string()),
    caption: v.optional(v.string()),
    orderIndex: v.number(),
    metadata: v.optional(
      v.object({
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        duration: v.optional(v.number()),
        fileSize: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => await ctx.db.insert("media", args),
});

// Get media URL
export const getMediaUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => await ctx.storage.getUrl(args.storageId),
});

// Get all media for a travel
export const getMediaByTravelId = query({
  args: { travelId: v.id("travels") },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("media")
      .withIndex("by_travel", (q) => q.eq("travelId", args.travelId))
      .collect();

    // Sort by orderIndex
    return media.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Update media metadata
export const updateMedia = mutation({
  args: {
    id: v.id("media"),
    caption: v.optional(v.string()),
    orderIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete media
export const deleteMedia = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.id);
    if (!media) {
      return;
    }

    // Delete from storage
    await ctx.storage.delete(media.storageId);
    if (media.thumbnailStorageId) {
      await ctx.storage.delete(media.thumbnailStorageId);
    }

    // Delete media record
    await ctx.db.delete(args.id);
  },
});
