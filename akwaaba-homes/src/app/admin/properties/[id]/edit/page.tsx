'use client';

import React, { useEffect, useState } from 'react'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'

interface EditPropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const [propertyId, setPropertyId] = useState<string>('')

  useEffect(() => {
    params.then(({ id }) => {
      setPropertyId(id)
    })
  }, [params])

  if (!propertyId) {
    return <div>Loading...</div>
  }

  return <EditPropertyForm propertyId={propertyId} />
}
