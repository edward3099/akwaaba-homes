import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Hero from '@/components/Hero'
import PropertyGrid from '@/components/PropertyGrid'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch active properties with simplified query
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images!property_images_property_id_fkey (
          id,
          image_url,
          image_type,
          is_primary
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6) // Show only 6 properties on homepage

    if (error) {
      console.error('Homepage properties fetch error:', error)
    }

    // Transform the data for the PropertyGrid component
    const transformedProperties = properties?.map(property => ({
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
      agent: {
        id: property.seller_id,
        name: 'Property Owner',
        company: 'AkwaabaHomes',
        role: 'seller'
      },
      images: property.property_images?.filter(img => img.is_primary) || []
    })) || []

    return (
      <main>
        <Hero />
        <PropertyGrid 
          properties={transformedProperties} 
          title="Featured Properties"
          subtitle="Discover your perfect home in Ghana"
          showViewAll={true}
        />
        <Features />
        <Testimonials />
        <Contact />
      </main>
    )
  } catch (error) {
    console.error('Homepage error:', error)
    // Return homepage with empty properties array if there's an error
    return (
      <main>
        <Hero />
        <PropertyGrid 
          properties={[]} 
          title="Featured Properties"
          subtitle="Discover your perfect home in Ghana"
          showViewAll={true}
        />
        <Features />
        <Testimonials />
        <Contact />
      </main>
    )
  }
}

