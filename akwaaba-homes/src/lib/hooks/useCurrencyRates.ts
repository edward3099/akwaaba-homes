'use client'

import { useState, useEffect } from 'react'
import { CurrencyCode, CurrencyRate } from '../types'
import { DEFAULT_CURRENCY_RATES, fetchAdminCurrencyRates } from '../utils/currency'

export function useCurrencyRates() {
  const [rates, setRates] = useState<Record<CurrencyCode, CurrencyRate>>(DEFAULT_CURRENCY_RATES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRates = async () => {
      try {
        console.log('Loading currency rates...')
        setIsLoading(true)
        setError(null)
        
        // Try to fetch admin-configured rates first
        const adminRates = await fetchAdminCurrencyRates()
        console.log('Loaded admin currency rates:', adminRates)
        setRates(adminRates)
      } catch (err) {
        console.error('Failed to load currency rates:', err)
        setError('Failed to load currency rates')
        setRates(DEFAULT_CURRENCY_RATES)
      } finally {
        setIsLoading(false)
      }
    }

    loadRates()
  }, [])

  const refreshRates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const adminRates = await fetchAdminCurrencyRates()
      setRates(adminRates)
    } catch (err) {
      console.error('Failed to refresh currency rates:', err)
      setError('Failed to refresh currency rates')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    rates,
    isLoading,
    error,
    refreshRates
  }
}
