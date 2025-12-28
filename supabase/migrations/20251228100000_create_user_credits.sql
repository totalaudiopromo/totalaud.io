-- =============================================================================
-- User Credits System
-- =============================================================================
-- Pay-per-contact enrichment system for Scout Mode.
-- Users purchase credits and spend them on contact validation/enrichment.
-- =============================================================================

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  balance_pence integer NOT NULL DEFAULT 0 CHECK (balance_pence >= 0),
  total_purchased_pence integer NOT NULL DEFAULT 0,
  total_spent_pence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount_pence integer NOT NULL, -- Positive for credits added, negative for spent
  balance_after_pence integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'enrichment', 'refund', 'bonus')),
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits row"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_user_credits_updated_at ON user_credits;
CREATE TRIGGER trigger_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credits_updated_at();

-- Function to deduct credits atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id uuid,
  p_amount_pence integer,
  p_description text DEFAULT 'Contact enrichment',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT balance_pence INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has credits record
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_credits_record',
      'message', 'User has no credits record'
    );
  END IF;

  -- Check if user has sufficient balance
  IF v_current_balance < p_amount_pence THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_funds',
      'message', 'Insufficient credit balance',
      'current_balance', v_current_balance,
      'required', p_amount_pence
    );
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount_pence;

  -- Update credits
  UPDATE user_credits
  SET
    balance_pence = v_new_balance,
    total_spent_pence = total_spent_pence + p_amount_pence
  WHERE user_id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount_pence,
    balance_after_pence,
    transaction_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    -p_amount_pence,
    v_new_balance,
    'enrichment',
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'amount_deducted', p_amount_pence
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases/bonuses)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_amount_pence integer,
  p_transaction_type text DEFAULT 'purchase',
  p_description text DEFAULT 'Credits purchased',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Validate transaction type
  IF p_transaction_type NOT IN ('purchase', 'refund', 'bonus') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_transaction_type',
      'message', 'Transaction type must be purchase, refund, or bonus'
    );
  END IF;

  -- Upsert user_credits row
  INSERT INTO user_credits (user_id, balance_pence, total_purchased_pence)
  VALUES (p_user_id, p_amount_pence, p_amount_pence)
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance_pence = user_credits.balance_pence + p_amount_pence,
    total_purchased_pence = user_credits.total_purchased_pence + p_amount_pence
  RETURNING balance_pence INTO v_new_balance;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount_pence,
    balance_after_pence,
    transaction_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_amount_pence,
    v_new_balance,
    p_transaction_type,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance,
    'amount_added', p_amount_pence
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO authenticated;

-- Add comment
COMMENT ON TABLE user_credits IS 'User credit balances for pay-per-contact enrichment';
COMMENT ON TABLE credit_transactions IS 'Audit trail of all credit transactions';
COMMENT ON FUNCTION deduct_credits IS 'Atomically deduct credits from user balance';
COMMENT ON FUNCTION add_credits IS 'Add credits to user balance (purchase/refund/bonus)';
