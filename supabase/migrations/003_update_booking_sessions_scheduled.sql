-- Update booking_sessions table to support scheduled status and correct data types
ALTER TABLE booking_sessions 
  ALTER COLUMN contact_id TYPE VARCHAR(255),
  ALTER COLUMN fsm_id TYPE VARCHAR(255);

-- Add SCHEDULED status to the check constraint
ALTER TABLE booking_sessions 
  DROP CONSTRAINT IF EXISTS booking_sessions_status_check;

ALTER TABLE booking_sessions 
  ADD CONSTRAINT booking_sessions_status_check 
  CHECK (status IN ('ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'EXPIRED'));

-- Add comment for the new status
COMMENT ON COLUMN booking_sessions.status IS 'Booking status: ACTIVE (can be modified), SCHEDULED (locked), COMPLETED, CANCELLED, EXPIRED';


