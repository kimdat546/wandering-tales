# Wandering Tales - 3D Travel Map Implementation Plan

## Project Overview
An interactive 3D globe-based travel website showcasing travels across India with photos, videos, and audio recordings using Google Maps 3D.

## Technology Stack
- **Frontend:** Next.js 15 + React 19
- **Backend:** Convex
- **3D Maps:** @vis.gl/react-google-maps (Google Maps 3D)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript

---

## Phase 1: Google Maps 3D Integration (Week 1)

### Step 1.1: Setup Google Maps API ✓ NEXT
**Objective:** Get Google Maps API key and configure environment

**Tasks:**
1. Create/login to Google Cloud Console
2. Create new project "Wandering Tales"
3. Enable APIs:
   - Maps JavaScript API
   - Map Tiles API (for 3D features)
4. Create API key with restrictions:
   - Application restrictions: HTTP referrers (localhost:3001, production domain)
   - API restrictions: Only selected APIs
5. Add to environment variables:
   ```
   # apps/web/.env.local
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

**Reference:** https://developers.google.com/maps/documentation/javascript/get-api-key

**Estimated Time:** 30 minutes

---

### Step 1.2: Install Dependencies
**Objective:** Add required packages

**Commands:**
```bash
cd apps/web
bun add @vis.gl/react-google-maps
```

**Files Modified:**
- `apps/web/package.json`

**Estimated Time:** 5 minutes

---

### Step 1.3: Create Map3D Component Structure
**Objective:** Build basic 3D globe component based on vis.gl example

**Files to Create:**
```
apps/web/src/
├── components/
│   └── map/
│       ├── Map3DView.tsx           # Main 3D globe component
│       ├── MiniMap.tsx              # Navigation mini-map
│       └── MapControlPanel.tsx      # Info/controls panel
└── types/
    └── map.ts                       # Map-related types
```

**Implementation Details:**

**`map.ts`** - Type definitions:
```typescript
export type Map3DCameraProps = {
  center: { lat: number; lng: number; altitude?: number };
  range: number;
  heading: number;
  tilt: number;
  roll: number;
};

export type TravelLocation = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  date: string;
  thumbnail?: string;
};
```

**`Map3DView.tsx`** - Main component (based on vis.gl example):
```typescript
'use client';

import { useState, useCallback } from 'react';
import { APIProvider, Map3D } from '@vis.gl/react-google-maps';
import type { Map3DCameraProps } from '@/types/map';

const INITIAL_CAMERA: Map3DCameraProps = {
  center: { lat: 20.5937, lng: 78.9629 }, // India center
  range: 5000000,
  heading: 0,
  tilt: 45,
  roll: 0
};

export function Map3DView() {
  const [cameraProps, setCameraProps] = useState<Map3DCameraProps>(INITIAL_CAMERA);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setCameraProps(props);
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="h-screen w-full">
        <Map3D
          {...cameraProps}
          onCameraChange={handleCameraChange}
          defaultLabelsDisabled={false}
        />
      </div>
    </APIProvider>
  );
}
```

**`MiniMap.tsx`** - Navigation helper:
```typescript
'use client';

import { Map } from '@vis.gl/react-google-maps';

type MiniMapProps = {
  center: { lat: number; lng: number };
  heading: number;
  onCenterChange: (center: { lat: number; lng: number }) => void;
};

export function MiniMap({ center, heading, onCenterChange }: MiniMapProps) {
  return (
    <div className="absolute bottom-4 right-4 h-48 w-48 overflow-hidden rounded-lg border-2 border-white shadow-lg">
      <Map
        defaultZoom={4}
        center={center}
        disableDefaultUI
        onClick={(e) => {
          if (e.detail.latLng) {
            onCenterChange(e.detail.latLng);
          }
        }}
      />
    </div>
  );
}
```

**Estimated Time:** 2 hours

---

### Step 1.4: Create Map Page
**Objective:** Add new route for 3D map

**File:** `apps/web/src/app/map/page.tsx`
```typescript
import { Map3DView } from '@/components/map/Map3DView';

export default function MapPage() {
  return (
    <main className="h-screen w-full">
      <Map3DView />
    </main>
  );
}
```

**Update:** `apps/web/src/app/page.tsx`
```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">Wandering Tales</h1>
      <Link
        href="/map"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        View Travel Map
      </Link>
    </main>
  );
}
```

**Estimated Time:** 30 minutes

---

### Step 1.5: Test Basic Integration
**Objective:** Verify 3D map loads correctly

**Testing Checklist:**
- [ ] Start dev server: `bun run dev:web`
- [ ] Navigate to http://localhost:3001/map
- [ ] Verify 3D globe renders
- [ ] Test camera controls (rotate, zoom, tilt)
- [ ] Check browser console for errors
- [ ] Verify API key is working (no billing errors)

**Estimated Time:** 30 minutes

---

## Phase 2: Database Schema & Backend (Week 1-2)

### Step 2.1: Define Convex Schema
**Objective:** Create database tables for travel data

**File:** `packages/backend/convex/schema.ts`
```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  travels: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string()
    }),
    visitDate: v.string(), // ISO date string
    createdAt: v.number(), // timestamp
    tags: v.array(v.string()),
    isPublished: v.boolean()
  })
    .index('by_date', ['visitDate'])
    .index('by_country', ['location.country'])
    .index('by_published', ['isPublished']),

  media: defineTable({
    travelId: v.id('travels'),
    type: v.union(
      v.literal('photo'),
      v.literal('video'),
      v.literal('audio')
    ),
    storageId: v.string(), // Convex file storage ID
    thumbnailStorageId: v.optional(v.string()),
    caption: v.optional(v.string()),
    orderIndex: v.number(), // for sorting
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      duration: v.optional(v.number()), // for video/audio
      fileSize: v.number()
    }))
  })
    .index('by_travel', ['travelId'])
    .index('by_type', ['type'])
});
```

**Estimated Time:** 1 hour

---

### Step 2.2: Create Convex Queries
**Objective:** Build API for fetching travel data

**File:** `packages/backend/convex/travels.ts`
```typescript
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get all published travels for map
export const getAllTravels = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('travels')
      .withIndex('by_published', (q) => q.eq('isPublished', true))
      .collect();
  }
});

// Get single travel with media
export const getTravelById = query({
  args: { id: v.id('travels') },
  handler: async (ctx, args) => {
    const travel = await ctx.db.get(args.id);
    if (!travel) return null;

    const media = await ctx.db
      .query('media')
      .withIndex('by_travel', (q) => q.eq('travelId', args.id))
      .collect();

    return { ...travel, media };
  }
});

// Get travels by date range
export const getTravelsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string()
  },
  handler: async (ctx, args) => {
    const allTravels = await ctx.db
      .query('travels')
      .withIndex('by_published', (q) => q.eq('isPublished', true))
      .collect();

    return allTravels.filter(
      t => t.visitDate >= args.startDate && t.visitDate <= args.endDate
    );
  }
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
      country: v.string()
    }),
    visitDate: v.string(),
    tags: v.array(v.string()),
    isPublished: v.boolean()
  },
  handler: async (ctx, args) => {
    const travelId = await ctx.db.insert('travels', {
      ...args,
      createdAt: Date.now()
    });
    return travelId;
  }
});
```

**Estimated Time:** 2 hours

---

### Step 2.3: File Upload System
**Objective:** Enable photo/video/audio uploads

**File:** `packages/backend/convex/media.ts`
```typescript
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Generate upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

// Save media metadata after upload
export const saveMedia = mutation({
  args: {
    travelId: v.id('travels'),
    type: v.union(v.literal('photo'), v.literal('video'), v.literal('audio')),
    storageId: v.string(),
    thumbnailStorageId: v.optional(v.string()),
    caption: v.optional(v.string()),
    orderIndex: v.number(),
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      duration: v.optional(v.number()),
      fileSize: v.number()
    }))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('media', args);
  }
});

// Get media URL
export const getMediaUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});
```

**Estimated Time:** 1.5 hours

---

## Phase 3: Interactive Markers & Popups (Week 2)

### Step 3.1: Add Markers to Map
**Objective:** Show travel locations on 3D globe

**File:** `apps/web/src/components/map/TravelMarker.tsx`
```typescript
'use client';

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

type TravelMarkerProps = {
  position: { lat: number; lng: number };
  title: string;
  thumbnail?: string;
  onClick: () => void;
};

export function TravelMarker({ position, title, thumbnail, onClick }: TravelMarkerProps) {
  return (
    <AdvancedMarker position={position} onClick={onClick}>
      {thumbnail ? (
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-lg">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <Pin background="#0ea5e9" borderColor="#0369a1" glyphColor="#ffffff" />
      )}
    </AdvancedMarker>
  );
}
```

**Update:** `Map3DView.tsx` to include markers
```typescript
// Add markers to Map3D component
import { TravelMarker } from './TravelMarker';
import { useQuery } from 'convex/react';
import { api } from '@wandering-tales/backend';

// Inside Map3DView component:
const travels = useQuery(api.travels.getAllTravels);

// In JSX:
{travels?.map((travel) => (
  <TravelMarker
    key={travel._id}
    position={{ lat: travel.location.lat, lng: travel.location.lng }}
    title={travel.title}
    onClick={() => handleMarkerClick(travel._id)}
  />
))}
```

**Estimated Time:** 2 hours

---

### Step 3.2: Media Viewer Popup
**Objective:** Show photos/videos when clicking markers

**File:** `apps/web/src/components/map/MediaPopup.tsx`
```typescript
'use client';

import { InfoWindow } from '@vis.gl/react-google-maps';
import { X } from 'lucide-react';

type MediaPopupProps = {
  position: { lat: number; lng: number };
  title: string;
  description: string;
  media: Array<{
    type: 'photo' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  }>;
  onClose: () => void;
};

export function MediaPopup({ position, title, description, media, onClose }: MediaPopupProps) {
  return (
    <InfoWindow position={position} onCloseClick={onClose}>
      <div className="max-w-sm p-2">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-600">{description}</p>

        {/* Media preview */}
        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {media.slice(0, 4).map((item, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded">
                {item.type === 'photo' && (
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                )}
                {item.type === 'video' && (
                  <video src={item.url} className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        <button className="mt-3 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          View Full Story
        </button>
      </div>
    </InfoWindow>
  );
}
```

**Estimated Time:** 2.5 hours

---

## Phase 4: Travel Detail Page (Week 3)

### Step 4.1: Create Detail Route
**Objective:** Full-screen media gallery for each location

**File:** `apps/web/src/app/travel/[id]/page.tsx`
```typescript
import { TravelDetailView } from '@/components/travel/TravelDetailView';

export default function TravelDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  return <TravelDetailView travelId={params.id} />;
}
```

**Estimated Time:** 1 hour

---

### Step 4.2: Photo Gallery Component
**File:** `apps/web/src/components/travel/PhotoGallery.tsx`

**Features:**
- Lightbox viewer
- Swipe navigation
- Zoom functionality
- Caption display

**Estimated Time:** 3 hours

---

### Step 4.3: Video/Audio Players
**Files:**
- `VideoPlayer.tsx` - Custom video player with controls
- `AudioPlayer.tsx` - Waveform audio player

**Estimated Time:** 2 hours

---

## Phase 5: Advanced Features (Week 3-4)

### Step 5.1: Timeline Filter
**Objective:** Filter travels by date range

**Component:** `apps/web/src/components/map/Timeline.tsx`
- Slider for date range selection
- Animation through locations chronologically

**Estimated Time:** 3 hours

---

### Step 5.2: Journey Paths
**Objective:** Connect locations with animated lines

**Implementation:**
- Use Polyline to connect locations
- Animate travel routes
- Show direction of travel

**Estimated Time:** 4 hours

---

### Step 5.3: Search & Filter Panel
**Features:**
- Search by location name
- Filter by state/city
- Filter by media type
- Tag filtering

**Estimated Time:** 3 hours

---

## Phase 6: Admin Panel (Week 4)

### Step 6.1: Upload Interface
**Route:** `/admin/upload`

**Features:**
- Drag-and-drop file upload
- Location picker (map click)
- Date picker
- Tag editor
- Bulk upload support

**Estimated Time:** 5 hours

---

### Step 6.2: Content Management
**Route:** `/admin/travels`

**Features:**
- List all travels
- Edit existing entries
- Delete entries
- Publish/unpublish toggle

**Estimated Time:** 4 hours

---

## Phase 7: Polish & Optimization (Week 5)

### Step 7.1: Performance
- Image optimization (Next.js Image)
- Lazy loading
- Code splitting
- Caching strategy

**Estimated Time:** 3 hours

---

### Step 7.2: Mobile Responsive
- Touch gestures
- Responsive layout
- Bottom sheet for mobile

**Estimated Time:** 4 hours

---

### Step 7.3: Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels
- Alt text

**Estimated Time:** 2 hours

---

## Deployment Checklist

### Pre-deployment:
- [ ] Google Maps API key configured for production domain
- [ ] Environment variables set in production
- [ ] Convex deployment configured
- [ ] Build succeeds without errors
- [ ] All media uploads working
- [ ] Test on mobile devices

### Deployment Options:
1. **Vercel** (Recommended for Next.js)
2. **Cloudflare Pages**
3. **Netlify**

---

## Total Estimated Timeline: 5 weeks

**Week 1:** Google Maps integration + Database setup
**Week 2:** Markers, popups, and basic interactivity
**Week 3:** Detail pages and media viewers
**Week 4:** Advanced features + Admin panel
**Week 5:** Polish, optimization, and deployment

---

## Progress Tracker

### ✅ Completed (as of 2025-11-03)
- **Phase 1:** Google Maps 3D Integration - DONE
- **Phase 2:** Database Schema & Backend - DONE
- **Phase 3:** Interactive Markers & Popups - DONE
- **Image Gallery:** Swipeable card stack gallery (ImageSwiper) - DONE

### 🚧 Next Up
- **Phase 4:** Travel Detail Page
- **Phase 5:** Advanced Features (Timeline, Journey Paths, Search)
- **Phase 6:** Admin Panel
