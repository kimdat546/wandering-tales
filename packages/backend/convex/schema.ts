import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  travels: defineTable({
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
    visitDate: v.string(), // ISO date string
    createdAt: v.number(), // timestamp
    tags: v.array(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_date", ["visitDate"])
    .index("by_country", ["location.country"])
    .index("by_published", ["isPublished"]),

  media: defineTable({
    travelId: v.id("travels"),
    type: v.union(v.literal("photo"), v.literal("video"), v.literal("audio")),
    storageId: v.string(), // Convex file storage ID
    thumbnailStorageId: v.optional(v.string()),
    caption: v.optional(v.string()),
    orderIndex: v.number(), // for sorting
    metadata: v.optional(
      v.object({
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        duration: v.optional(v.number()), // for video/audio
        fileSize: v.number(),
      })
    ),
  })
    .index("by_travel", ["travelId"])
    .index("by_type", ["type"]),
});
