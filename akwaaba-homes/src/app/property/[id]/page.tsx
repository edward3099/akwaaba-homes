import { Property } from '@/lib/types/index';
import PropertyPageClient from './PropertyPageClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  
  // Create Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Fetch property data
  const { data: propertyData, error } = await supabase
    .from('properties')
    .select(`
      *,
      users!properties_seller_id_fkey (
        id,
        full_name,
        phone,
        email,
        user_type,
        is_verified
      )
    `)
    .eq('id', id)
    .single();

  if (error || !propertyData) {
    notFound();
  }

  // Transform the data to match the Property interface
  const property: Property = {
    id: propertyData.id,
    title: propertyData.title,
    description: propertyData.description,
    price: propertyData.price,
    currency: propertyData.currency || 'GHS',
    status: propertyData.status,
    type: propertyData.property_type,
    location: {
      address: propertyData.address,
      city: propertyData.city,
      region: propertyData.state,
      country: propertyData.country || 'Ghana',
      coordinates: {
        lat: propertyData.latitude || 0,
        lng: propertyData.longitude || 0
      }
    },
    specifications: {
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      size: propertyData.square_feet,
      sizeUnit: 'sqft',
      yearBuilt: propertyData.year_built
    },
    images: propertyData.image_urls || [],
    features: propertyData.features || [],
    amenities: propertyData.amenities || [],
    seller: {
      id: propertyData.users?.id || '',
      name: propertyData.users?.full_name || 'Unknown',
      type: propertyData.users?.user_type || 'agent',
      phone: propertyData.users?.phone || '',
      email: propertyData.users?.email || '',
      isVerified: propertyData.users?.is_verified || false
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: propertyData.created_at
    },
    createdAt: propertyData.created_at,
    updatedAt: propertyData.updated_at,
    expiresAt: propertyData.expires_at,
    tier: 'premium',
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: true,
      familyRepresentativeContact: propertyData.users?.phone || ''
    }
  };

  return <PropertyPageClient property={property} propertyId={id} />;
}