import { mutation } from "./_generated/server";

// Seed sample travel data for testing
export const seedSampleData = mutation({
  handler: async (ctx) => {
    // Sample travels across India
    const sampleTravels = [
      {
        title: "Taj Mahal Visit",
        description:
          "Explored the magnificent Taj Mahal, one of the Seven Wonders of the World. The marble structure was breathtaking at sunrise.",
        location: {
          lat: 27.1751,
          lng: 78.0421,
          address: "Dharmapuri, Forest Colony, Tajganj",
          city: "Agra",
          state: "Uttar Pradesh",
          country: "India",
        },
        visitDate: "2024-03-15",
        tags: ["monument", "unesco", "heritage"],
        isPublished: true,
      },
      {
        title: "Gateway of India",
        description:
          "Visited the iconic Gateway of India monument overlooking the Arabian Sea. A perfect blend of history and stunning architecture.",
        location: {
          lat: 18.922,
          lng: 72.8347,
          address: "Apollo Bandar, Colaba",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
        },
        visitDate: "2024-05-20",
        tags: ["monument", "heritage", "mumbai"],
        isPublished: true,
      },
      {
        title: "Jaipur Pink City",
        description:
          "Explored the Pink City of Jaipur, visiting the majestic Hawa Mahal and Amber Fort. The vibrant colors and rich history were amazing.",
        location: {
          lat: 26.9124,
          lng: 75.7873,
          address: "Hawa Mahal Rd",
          city: "Jaipur",
          state: "Rajasthan",
          country: "India",
        },
        visitDate: "2024-02-10",
        tags: ["palace", "heritage", "rajasthan"],
        isPublished: true,
      },
      {
        title: "Kerala Backwaters",
        description:
          "Peaceful houseboat journey through the serene backwaters of Kerala. Surrounded by palm trees and traditional village life.",
        location: {
          lat: 9.4981,
          lng: 76.3389,
          address: "Vembanad Lake",
          city: "Alappuzha",
          state: "Kerala",
          country: "India",
        },
        visitDate: "2024-07-12",
        tags: ["nature", "backwaters", "kerala"],
        isPublished: true,
      },
      {
        title: "Golden Temple Amritsar",
        description:
          "Visited the spiritual Golden Temple. The peaceful atmosphere and the community kitchen serving thousands daily was inspiring.",
        location: {
          lat: 31.62,
          lng: 74.8765,
          address: "Golden Temple Rd",
          city: "Amritsar",
          state: "Punjab",
          country: "India",
        },
        visitDate: "2024-01-25",
        tags: ["spiritual", "temple", "punjab"],
        isPublished: true,
      },
      {
        title: "Goa Beaches",
        description:
          "Relaxed on the beautiful beaches of Goa, enjoying the sun, sand, and seafood. Perfect tropical paradise.",
        location: {
          lat: 15.2993,
          lng: 74.124,
          address: "Calangute Beach",
          city: "Calangute",
          state: "Goa",
          country: "India",
        },
        visitDate: "2024-06-05",
        tags: ["beach", "goa", "relaxation"],
        isPublished: true,
      },
      {
        title: "Varanasi Ghats",
        description:
          "Witnessed the spiritual rituals at the Ganges ghats in Varanasi. The evening Ganga Aarti was a mesmerizing experience.",
        location: {
          lat: 25.282,
          lng: 82.9548,
          address: "Dashashwamedh Ghat",
          city: "Varanasi",
          state: "Uttar Pradesh",
          country: "India",
        },
        visitDate: "2024-04-18",
        tags: ["spiritual", "ganges", "culture"],
        isPublished: true,
      },
    ];

    const createdIds: string[] = [];
    for (const travel of sampleTravels) {
      const id = await ctx.db.insert("travels", {
        ...travel,
        createdAt: Date.now(),
      });
      createdIds.push(id);
    }

    return {
      message: "Successfully seeded sample travel data",
      count: createdIds.length,
      ids: createdIds,
    };
  },
});

// Clear all travels (for testing)
export const clearAllTravels = mutation({
  handler: async (ctx) => {
    const allTravels = await ctx.db.query("travels").collect();

    for (const travel of allTravels) {
      // Delete associated media
      const media = await ctx.db
        .query("media")
        .withIndex("by_travel", (q) => q.eq("travelId", travel._id))
        .collect();

      for (const item of media) {
        await ctx.db.delete(item._id);
      }

      // Delete travel
      await ctx.db.delete(travel._id);
    }

    return {
      message: "All travels cleared",
      count: allTravels.length,
    };
  },
});
