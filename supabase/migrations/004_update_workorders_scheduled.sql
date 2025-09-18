-- Update workorders table to support scheduled status
ALTER TABLE workorders 
  DROP CONSTRAINT IF EXISTS workorders_status_check;

ALTER TABLE workorders 
  ADD CONSTRAINT workorders_status_check 
  CHECK (status IN ('ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'EXPIRED'));

-- Add comment for the new status
COMMENT ON COLUMN workorders.status IS 'Work order status: ACTIVE (can be modified), SCHEDULED (locked), COMPLETED, CANCELLED, EXPIRED';


