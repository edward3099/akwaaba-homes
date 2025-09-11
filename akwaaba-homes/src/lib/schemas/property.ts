import { z } from 'zod'

// Property Types
export const PropertyTypeSchema = z.enum(['house', 'apartment', 'land', 'commercial', 'office'])
export type PropertyType = z.infer<typeof PropertyTypeSchema>

// Listing Types
export const ListingTypeSchema = z.enum(['sale', 'rent', 'lease'])
export type ListingType = z.infer<typeof ListingTypeSchema>

// Property Status
export const PropertyStatusSchema = z.enum(['active', 'pending', 'sold', 'rented', 'inactive'])
export type PropertyStatus = z.infer<typeof PropertyStatusSchema>

// Placeholder validation function
const validateNoPlaceholders = (value: string, fieldName: string) => {
  const placeholderPatterns = [
    /^a{3,}$/i, // aaa, aaaa, aaaaa, etc.
    /^c{3,}$/i, // ccc, cccc, ccccc, etc.
    /^q{3,}$/i, // qqq, qqqq, qqqqq, etc.
    /^w{3,}$/i, // www, wwww, wwwww, etc.
    /^s{3,}$/i, // sss, ssss, sssss, etc.
    /^g{3,}$/i, // ggg, gggg, ggggg, etc.
    /^f{3,}$/i, // fff, ffff, fffff, etc.
    /^d{3,}$/i, // ddd, dddd, ddddd, etc.
    /^h{3,}$/i, // hhh, hhhh, hhhhh, etc.
    /^t{3,}$/i, // ttt, tttt, ttttt, etc.
    /^e{3,}$/i, // eee, eeee, eeeee, etc.
    /^r{3,}$/i, // rrr, rrrr, rrrrr, etc.
    /^y{3,}$/i, // yyy, yyyy, yyyyy, etc.
    /^u{3,}$/i, // uuu, uuuu, uuuuu, etc.
    /^i{3,}$/i, // iii, iiii, iiiii, etc.
    /^o{3,}$/i, // ooo, oooo, ooooo, etc.
    /^p{3,}$/i, // ppp, pppp, ppppp, etc.
    /test/i,    // test, Test, TEST, etc.
    /placeholder/i, // placeholder, Placeholder, etc.
    /^.{1,2}$/  // Too short (1-2 characters)
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(value)) {
      return `${fieldName} contains placeholder data. Please provide a real ${fieldName}.`;
    }
  }
  return null;
};

// Custom validation schemas with placeholder checks
const TitleSchema = z.string()
  .min(3, 'Title must be at least 3 characters')
  .refine((val) => !validateNoPlaceholders(val, 'title'), (val) => ({
    message: validateNoPlaceholders(val, 'title') || 'Invalid title'
  }));

const DescriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .refine((val) => !validateNoPlaceholders(val, 'description'), (val) => ({
    message: validateNoPlaceholders(val, 'description') || 'Invalid description'
  }));

const AddressSchema = z.string()
  .min(5, 'Address must be at least 5 characters')
  .refine((val) => !validateNoPlaceholders(val, 'address'), (val) => ({
    message: validateNoPlaceholders(val, 'address') || 'Invalid address'
  }));

// Base Property Schema
export const PropertySchema = z.object({
  title: TitleSchema,
  description: DescriptionSchema,
  property_type: PropertyTypeSchema,
  listing_type: ListingTypeSchema,
  price: z.number().min(1000, 'Price must be at least ₵1,000').max(100000000, 'Price cannot exceed ₵100,000,000'),
  currency: z.string().default('GHS'),
  address: AddressSchema,
  city: z.string().min(2, 'City must be at least 2 characters'),
  region: z.string().min(2, 'Region must be at least 2 characters'),
  postal_code: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  square_feet: z.number().min(0).optional(),
  land_size: z.number().min(0).optional(),
  year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
  features: z.array(z.string()).min(1, 'At least one feature must be selected'),
  amenities: z.array(z.string()).min(1, 'At least one amenity must be selected'),
  status: PropertyStatusSchema.default('pending'),
  is_featured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    image_type: z.enum(['primary', 'gallery', 'floorplan', 'exterior', 'interior']),
    is_primary: z.boolean(),
    alt_text: z.string().optional(),
    order_index: z.number().min(0)
  })).min(1, 'At least one image is required')
}).refine((data) => {
  // Validate bedrooms and bathrooms for houses and apartments
  if ((data.property_type === 'house' || data.property_type === 'apartment')) {
    if (data.bedrooms === 0 || !data.bedrooms) {
      return false;
    }
    if (data.bathrooms === 0 || !data.bathrooms) {
      return false;
    }
  }
  return true;
}, {
  message: 'Houses and apartments must have at least 1 bedroom and 1 bathroom',
  path: ['bedrooms'] // This will show the error on the bedrooms field
})

// Multi-step form schemas
export const PropertyBasicInfoSchema = z.object({
  title: PropertySchema.shape.title,
  description: PropertySchema.shape.description,
  property_type: PropertySchema.shape.property_type,
  listing_type: PropertySchema.shape.listing_type,
  price: PropertySchema.shape.price,
  currency: PropertySchema.shape.currency
})

export const PropertyLocationSchema = z.object({
  address: PropertySchema.shape.address,
  city: PropertySchema.shape.city,
  region: PropertySchema.shape.region,
  postal_code: PropertySchema.shape.postal_code
})

export const PropertyDetailsSchema = z.object({
  bedrooms: PropertySchema.shape.bedrooms,
  bathrooms: PropertySchema.shape.bathrooms,
  square_feet: PropertySchema.shape.square_feet,
  land_size: PropertySchema.shape.land_size,
  year_built: PropertySchema.shape.year_built,
  features: PropertySchema.shape.features,
  amenities: PropertySchema.shape.amenities
})

export const PropertyImagesSchema = z.object({
  images: PropertySchema.shape.images
})

// Types
export type PropertyBasicInfo = z.infer<typeof PropertyBasicInfoSchema>
export type PropertyLocation = z.infer<typeof PropertyLocationSchema>
export type PropertyDetails = z.infer<typeof PropertyDetailsSchema>
export type PropertyImages = z.infer<typeof PropertyImagesSchema>
export type CreatePropertyForm = z.infer<typeof PropertySchema>

// Predefined options
export const PROPERTY_FEATURES = [
  'Air Conditioning', 'Heating', 'Balcony', 'Garden', 'Parking',
  'Security System', 'Swimming Pool', 'Gym', 'Elevator', 'Fireplace'
]

export const PROPERTY_AMENITIES = [
  'Shopping Center', 'Public Transport', 'Schools', 'Hospitals', 'Parks',
  'Restaurants', 'Banks', 'Post Office', 'Police Station', 'Fire Station'
]
