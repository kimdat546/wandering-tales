import { mutation } from "./_generated/server";

// Sample data with photos for testing peek cards gallery
const SAMPLE_TRAVELS_WITH_MEDIA = [
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop",
        caption: "Taj Mahal at golden hour",
      },
      {
        url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop",
        caption: "The marble dome reflecting the sky",
      },
      {
        url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop",
        caption: "Intricate marble inlay work",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&h=600&fit=crop",
        caption: "Gateway of India at sunset",
      },
      {
        url: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=600&fit=crop",
        caption: "View from the Arabian Sea",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop",
        caption: "Hawa Mahal - Palace of Winds",
      },
      {
        url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop",
        caption: "Amber Fort at sunrise",
      },
      {
        url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
        caption: "Colorful streets of Jaipur",
      },
      {
        url: "https://images.unsplash.com/photo-1603262110225-83c3df1436b7?w=800&h=600&fit=crop",
        caption: "Traditional Rajasthani architecture",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
        caption: "Houseboat on the backwaters",
      },
      {
        url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
        caption: "Traditional Kerala village",
      },
      {
        url: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=800&h=600&fit=crop",
        caption: "Palm trees reflecting in water",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&h=600&fit=crop",
        caption: "Golden Temple at night",
      },
      {
        url: "https://images.unsplash.com/photo-1595131135182-0e2f6b1e1b8f?w=800&h=600&fit=crop",
        caption: "Reflection in the sacred pool",
      },
      {
        url: "https://images.unsplash.com/photo-1605649487212-47a251f3e643?w=800&h=600&fit=crop",
        caption: "Evening prayer ceremony",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop",
        caption: "Sunset at Calangute Beach",
      },
      {
        url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
        caption: "Beach shacks and palm trees",
      },
      {
        url: "https://images.unsplash.com/photo-1618135835826-80e7d5c1c5ed?w=800&h=600&fit=crop",
        caption: "Local fishing boats",
      },
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        caption: "Crystal clear waters",
      },
    ],
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
    photos: [
      {
        url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop",
        caption: "Ganga Aarti ceremony at dusk",
      },
      {
        url: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=800&h=600&fit=crop",
        caption: "Morning rituals at the ghats",
      },
    ],
  },
];

// Seed sample travel data for testing
export const seedSampleData = mutation({
  handler: async (ctx) => {
    const createdTravels: Array<{
      id: string;
      title: string;
      photoCount: number;
    }> = [];

    for (const travel of SAMPLE_TRAVELS_WITH_MEDIA) {
      const { photos, ...travelData } = travel;

      // Create travel entry
      const travelId = await ctx.db.insert("travels", {
        ...travelData,
        createdAt: Date.now(),
      });

      // Create media entries for each photo
      // Note: Using external URLs directly in storageId for testing
      // In production, you'd upload to Convex storage
      for (let i = 0; i < photos.length; i++) {
        await ctx.db.insert("media", {
          travelId,
          type: "photo" as const,
          storageId: photos[i].url, // Using external URL for testing
          caption: photos[i].caption,
          orderIndex: i,
          metadata: {
            fileSize: 0, // Mock size for testing
          },
        });
      }

      createdTravels.push({
        id: travelId,
        title: travel.title,
        photoCount: photos.length,
      });
    }

    return {
      message: "Successfully seeded sample travel data with photos",
      count: createdTravels.length,
      travels: createdTravels,
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
