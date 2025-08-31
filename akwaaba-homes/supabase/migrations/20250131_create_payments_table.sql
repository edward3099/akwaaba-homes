-- Create payments table for mobile money transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_method TEXT NOT NULL DEFAULT 'mobile_money',
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('mtn', 'vodafone', 'airteltigo')),
  phone_number TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'featured', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  merchant_number TEXT,
  reference TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Agents can view their own payments
CREATE POLICY "Agents can view own payments" ON payments
  FOR SELECT USING (auth.uid() = agent_id);

-- Agents can create payments for their properties
CREATE POLICY "Agents can create payments for own properties" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = agent_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = payments.property_id 
      AND properties.agent_id = auth.uid()
    )
  );

-- Agents can update their own pending payments
CREATE POLICY "Agents can update own pending payments" ON payments
  FOR UPDATE USING (
    auth.uid() = agent_id AND 
    status = 'pending'
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Admins can update all payments
CREATE POLICY "Admins can update all payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );
