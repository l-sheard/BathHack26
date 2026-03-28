import type { TripPreferenceTag } from "../types/models";

export type DestinationCatalogItem = {
  destination: string;
  country: string;
  tags: TripPreferenceTag[];
  avgDailyCost: number;
  trainFriendly: boolean;
  ecoScore: number;
  accessibilityScore: number;
};

export const DESTINATIONS: DestinationCatalogItem[] = [
  {
    destination: "Lisbon",
    country: "Portugal",
    tags: ["city", "culture", "nightlife", "relaxation"],
    avgDailyCost: 115,
    trainFriendly: false,
    ecoScore: 58,
    accessibilityScore: 68
  },
  {
    destination: "Amsterdam",
    country: "Netherlands",
    tags: ["city", "culture", "nature"],
    avgDailyCost: 140,
    trainFriendly: true,
    ecoScore: 84,
    accessibilityScore: 88
  },
  {
    destination: "Split",
    country: "Croatia",
    tags: ["beach", "adventure", "relaxation"],
    avgDailyCost: 105,
    trainFriendly: false,
    ecoScore: 60,
    accessibilityScore: 55
  },
  {
    destination: "Copenhagen",
    country: "Denmark",
    tags: ["city", "culture", "nature", "relaxation"],
    avgDailyCost: 165,
    trainFriendly: true,
    ecoScore: 92,
    accessibilityScore: 90
  },
  {
    destination: "Lake Bled",
    country: "Slovenia",
    tags: ["nature", "adventure", "relaxation"],
    avgDailyCost: 110,
    trainFriendly: true,
    ecoScore: 86,
    accessibilityScore: 62
  }
];

export const RESTAURANTS = [
  {
    destination: "Lisbon",
    name: "Verde Alma",
    cuisine: "Portuguese",
    priceBand: "$$" as const,
    dietaryTags: ["vegetarian", "vegan", "gluten_free"],
    baseCost: 24
  },
  {
    destination: "Lisbon",
    name: "Tagus Grill",
    cuisine: "Mediterranean",
    priceBand: "$" as const,
    dietaryTags: ["halal", "dairy_free", "nut_allergy"],
    baseCost: 16
  },
  {
    destination: "Amsterdam",
    name: "Canal Harvest",
    cuisine: "Modern European",
    priceBand: "$$" as const,
    dietaryTags: ["vegetarian", "kosher", "gluten_free"],
    baseCost: 28
  },
  {
    destination: "Amsterdam",
    name: "Bloom Commons",
    cuisine: "Plant-based",
    priceBand: "$" as const,
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "nut_allergy"],
    baseCost: 18
  },
  {
    destination: "Split",
    name: "Adriatic Table",
    cuisine: "Seafood",
    priceBand: "$$" as const,
    dietaryTags: ["gluten_free", "dairy_free"],
    baseCost: 22
  },
  {
    destination: "Split",
    name: "Olive Court",
    cuisine: "Dalmatian",
    priceBand: "$" as const,
    dietaryTags: ["vegetarian", "halal", "gluten_free"],
    baseCost: 17
  },
  {
    destination: "Copenhagen",
    name: "Nordic Greenhouse",
    cuisine: "Nordic",
    priceBand: "$$$" as const,
    dietaryTags: ["vegan", "vegetarian", "halal", "gluten_free"],
    baseCost: 36
  },
  {
    destination: "Copenhagen",
    name: "Harbor Grain",
    cuisine: "Scandi",
    priceBand: "$$" as const,
    dietaryTags: ["vegetarian", "dairy_free", "nut_allergy"],
    baseCost: 26
  },
  {
    destination: "Lake Bled",
    name: "Forest Spoon",
    cuisine: "Slovenian",
    priceBand: "$" as const,
    dietaryTags: ["vegetarian", "halal", "dairy_free"],
    baseCost: 17
  },
  {
    destination: "Lake Bled",
    name: "Alpine Garden Kitchen",
    cuisine: "European",
    priceBand: "$$" as const,
    dietaryTags: ["vegan", "vegetarian", "gluten_free"],
    baseCost: 23
  }
];

export const ACCOMMODATIONS = [
  {
    destination: "Lisbon",
    name: "Tramline Suites",
    description: "Central aparthotel near metro with lift.",
    nightlyCost: 85,
    accessibilityFeatures: ["lift", "step_free", "accessible_bathroom"],
    ecoRating: 3
  },
  {
    destination: "Amsterdam",
    name: "Canal Light Hotel",
    description: "Eco-certified hotel with accessible rooms and bike rental.",
    nightlyCost: 120,
    accessibilityFeatures: ["lift", "wheelchair", "accessible_bathroom", "step_free"],
    ecoRating: 5
  },
  {
    destination: "Split",
    name: "Harbor Flats",
    description: "Budget apartments by old town and ferry port.",
    nightlyCost: 70,
    accessibilityFeatures: ["ground_floor", "close_transport"],
    ecoRating: 2
  },
  {
    destination: "Copenhagen",
    name: "Green Bridge Residence",
    description: "Low-carbon boutique stay with universal design rooms.",
    nightlyCost: 145,
    accessibilityFeatures: ["lift", "wheelchair", "step_free", "accessible_bathroom", "close_transport"],
    ecoRating: 5
  },
  {
    destination: "Lake Bled",
    name: "Bled Lakeside Lodge",
    description: "Nature-forward lodge with step-free access to common areas.",
    nightlyCost: 90,
    accessibilityFeatures: ["step_free", "reduced_walking", "close_transport"],
    ecoRating: 4
  }
];

export const ACTIVITIES = [
  {
    destination: "Lisbon",
    items: [
      { title: "Historic tram and old town walk", type: "culture", sustainable: true, accessibility: "medium", cost: 20 },
      { title: "Miradouro sunset picnic", type: "relaxation", sustainable: true, accessibility: "medium", cost: 12 },
      { title: "Live Fado evening", type: "nightlife", sustainable: false, accessibility: "high", cost: 28 }
    ]
  },
  {
    destination: "Amsterdam",
    items: [
      { title: "Canal museum pass", type: "culture", sustainable: true, accessibility: "high", cost: 25 },
      { title: "Vondelpark bike and brunch", type: "nature", sustainable: true, accessibility: "medium", cost: 18 },
      { title: "Food hall tasting", type: "city", sustainable: false, accessibility: "high", cost: 24 }
    ]
  },
  {
    destination: "Split",
    items: [
      { title: "Seafront easy cycling route", type: "adventure", sustainable: true, accessibility: "medium", cost: 16 },
      { title: "Beach day", type: "beach", sustainable: true, accessibility: "medium", cost: 8 },
      { title: "Old town dinner crawl", type: "city", sustainable: false, accessibility: "high", cost: 20 }
    ]
  },
  {
    destination: "Copenhagen",
    items: [
      { title: "Harbor electric boat tour", type: "city", sustainable: true, accessibility: "high", cost: 28 },
      { title: "Design museum and cafe", type: "culture", sustainable: true, accessibility: "high", cost: 22 },
      { title: "Car-free neighborhood exploration", type: "nature", sustainable: true, accessibility: "high", cost: 12 }
    ]
  },
  {
    destination: "Lake Bled",
    items: [
      { title: "Lakeside boardwalk and viewpoints", type: "nature", sustainable: true, accessibility: "medium", cost: 10 },
      { title: "Rowboat island visit", type: "adventure", sustainable: true, accessibility: "low", cost: 18 },
      { title: "Local farm-to-table evening", type: "culture", sustainable: true, accessibility: "medium", cost: 22 }
    ]
  }
];
