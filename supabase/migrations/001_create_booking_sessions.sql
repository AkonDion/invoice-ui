-- Create booking_sessions table
CREATE TABLE IF NOT EXISTS booking_sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  contact_id INTEGER NOT NULL,
  fsm_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  selected_services INTEGER[] DEFAULT '{}',
  scheduled_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_sessions_token ON booking_sessions(token);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_contact ON booking_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_fsm ON booking_sessions(fsm_id);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_status ON booking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_expires ON booking_sessions(expires_at);

-- Add RLS policies (assuming you have RLS enabled)
ALTER TABLE booking_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading booking sessions by token (for public access)
CREATE POLICY "Allow reading booking sessions by token" ON booking_sessions
  FOR SELECT USING (true);

-- Policy to allow inserting booking sessions (for API)
CREATE POLICY "Allow inserting booking sessions" ON booking_sessions
  FOR INSERT WITH CHECK (true);

-- Policy to allow updating booking sessions (for API)
CREATE POLICY "Allow updating booking sessions" ON booking_sessions
  FOR UPDATE USING (true);

-- Add comments for documentation
COMMENT ON TABLE booking_sessions IS 'Stores booking session data for service scheduling';
COMMENT ON COLUMN booking_sessions.token IS 'Unique token for accessing the booking session';
COMMENT ON COLUMN booking_sessions.contact_id IS 'Reference to the contacts table';
COMMENT ON COLUMN booking_sessions.fsm_id IS 'Reference to the FSM (Field Service Manager) ID';
COMMENT ON COLUMN booking_sessions.selected_services IS 'Array of selected service IDs';
COMMENT ON COLUMN booking_sessions.expires_at IS 'When the booking session expires (default 7 days)';

