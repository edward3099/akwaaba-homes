import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import PropertyPageClient from './PropertyPageClient'

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch property data with agent and image information
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_seller_id_fkey (
          id,
          full_name,
          company_name,
          user_role,
          phone,
          bio
        ),
        property_images!property_images_property_id_fkey (
          id,
          image_url,
          image_type,
          alt_text,
          is_primary,
          order
        )
      `)
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error || !property) {
      console.error('Property fetch error:', error)
      notFound()
    }

    // Transform the data for the client component
    const transformedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      currency: property.currency,
      property_type: property.property_type,
      listing_type: property.listing_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.square_feet,
      address: property.address,
      city: property.city,
      region: property.region,
      latitude: property.latitude,
      longitude: property.longitude,
      features: property.features || [],
      amenities: property.amenities || [],
      status: property.status,
      created_at: property.created_at,
      updated_at: property.updated_at,
      agent: property.profiles ? {
        id: property.profiles.id,
        name: property.profiles.full_name,
        company: property.profiles.company_name,
        role: property.profiles.user_role,
        phone: property.profiles.phone,
        bio: property.profiles.bio
      } : null,
      images: property.property_images?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []
    }

    return <PropertyPageClient property={transformedProperty} />
  } catch (error) {
    console.error('Property page error:', error)
    notFound()
  }
}
