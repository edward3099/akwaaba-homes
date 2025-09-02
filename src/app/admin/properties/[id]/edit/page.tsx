import React from 'react'
import { UpdatePropertyForm } from '@/components/properties/UpdatePropertyForm'

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  return <UpdatePropertyForm propertyId={params.id} />
}
