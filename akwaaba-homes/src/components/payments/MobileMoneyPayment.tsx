'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentData {
  id: string
  amount: number
  currency: string
  provider: string
  phoneNumber: string
  merchantNumber: string
  reference: string
  instructions: {
    provider: string
    steps: string[]
    note: string
  }
  expiresAt: string
}

interface MobileMoneyPaymentProps {
  propertyId: string
  propertyTitle: string
  tier: 'premium' | 'featured' | 'urgent'
  amount: number
  onPaymentComplete: () => void
  onCancel: () => void
}

export default function MobileMoneyPayment({
  propertyId,
  propertyTitle,
  tier,
  amount,
  onPaymentComplete,
  onCancel
}: MobileMoneyPaymentProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [provider, setProvider] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (!paymentData) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000))
      } else {
        setTimeLeft(0)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [paymentData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          amount,
          currency: 'GHS',
          provider,
          phoneNumber: phoneNumber.trim(),
          tier
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      setPaymentData(data.payment)
      toast.success('Payment instructions generated')
    } catch (error) {
      console.error('Payment initiation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentData) return

    setIsVerifying(true)
    try {
      const response = await fetch(`/api/payments/mobile-money?paymentId=${paymentData.id}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment')
      }

      if (data.status === 'completed') {
        toast.success('Payment verified successfully!')
        onPaymentComplete()
      } else {
        toast.info('Payment still pending. Please complete the transaction and try again.')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify payment')
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const providerNames = {
    mtn: 'MTN Mobile Money',
    vodafone: 'Vodafone Cash',
    airteltigo: 'AirtelTigo Money'
  }

  if (paymentData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-ghana-green" />
            Complete Payment
          </CardTitle>
          <CardDescription>
            Follow the instructions below to complete your {tier} listing payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Property:</span>
                <span className="font-medium">{propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Listing Tier:</span>
                <Badge variant="secondary" className="bg-ghana-gold text-white">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-ghana-green">GHS {amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Instructions
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {paymentData.instructions.provider}
              </h4>
              <ol className="space-y-2 text-sm text-blue-800">
                {paymentData.instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Merchant Number</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={paymentData.merchantNumber}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.merchantNumber, 'Merchant number')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Reference</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={paymentData.reference}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.reference, 'Reference')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Payment expires in: <strong>{formatTime(timeLeft)}</strong>
                  </span>
                </div>
              </div>
            )}

            {timeLeft === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">
                    Payment has expired. Please start a new payment.
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              {paymentData.instructions.note}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleVerifyPayment}
              disabled={isVerifying || timeLeft === 0}
              className="flex-1 bg-ghana-green hover:bg-ghana-green-dark text-white"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Payment
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-ghana-green" />
          Mobile Money Payment
        </CardTitle>
        <CardDescription>
          Upgrade your property to {tier} listing for GHS {amount}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Property:</span>
              <span className="font-medium">{propertyTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>Listing Tier:</span>
              <Badge variant="secondary" className="bg-ghana-gold text-white">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold text-ghana-green">GHS {amount}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0241234567 or +233241234567"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the phone number registered with your mobile money account
            </p>
          </div>

          <div>
            <Label htmlFor="provider">Mobile Money Provider</Label>
            <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={handleInitiatePayment}
            disabled={isLoading || !phoneNumber.trim()}
            className="flex-1 bg-ghana-green hover:bg-ghana-green-dark text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay GHS {amount}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
