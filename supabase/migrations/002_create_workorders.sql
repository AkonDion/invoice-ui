-- Create workorders table
CREATE TABLE workorders (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  work_order_id VARCHAR(255) NOT NULL,
  work_order_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  work_order_type VARCHAR(100),
  grand_total DECIMAL(10,2),
  sub_total DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  billing_status VARCHAR(50),
  quickbooks_invoice_id VARCHAR(255),
  quickbooks_invoice_number VARCHAR(255),
  sale_order_id VARCHAR(255),
  contact_id VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(255),
  service_address_id VARCHAR(255),
  service_street VARCHAR(255),
  service_city VARCHAR(255),
  service_state VARCHAR(255),
  service_postal VARCHAR(255),
  service_country VARCHAR(255),
  billing_address_id VARCHAR(255),
  billing_street VARCHAR(255),
  billing_city VARCHAR(255),
  billing_state VARCHAR(255),
  billing_postal VARCHAR(255),
  billing_country VARCHAR(255),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes
CREATE INDEX idx_workorders_token ON workorders(token);
CREATE INDEX idx_workorders_work_order_id ON workorders(work_order_id);
CREATE INDEX idx_workorders_contact ON workorders(contact_id);
CREATE INDEX idx_workorders_status ON workorders(status);

-- Create workorder_line_items table for service and part line items
CREATE TABLE workorder_line_items (
  id SERIAL PRIMARY KEY,
  workorder_id INTEGER REFERENCES workorders(id) ON DELETE CASCADE,
  line_item_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit VARCHAR(100),
  amount DECIMAL(10,2) DEFAULT 0,
  list_price DECIMAL(10,2),
  part_name VARCHAR(255),
  item_type VARCHAR(50) NOT NULL, -- 'service' or 'part'
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for line items
CREATE INDEX idx_workorder_line_items_workorder ON workorder_line_items(workorder_id);
CREATE INDEX idx_workorder_line_items_type ON workorder_line_items(item_type);

-- Create workorder_appointments table
CREATE TABLE workorder_appointments (
  id SERIAL PRIMARY KEY,
  workorder_id INTEGER REFERENCES workorders(id) ON DELETE CASCADE,
  appointment_id VARCHAR(255) NOT NULL,
  appointment_name VARCHAR(255) NOT NULL,
  service_appointment_id VARCHAR(255),
  service_appointment_name VARCHAR(255),
  service_line_item_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for appointments
CREATE INDEX idx_workorder_appointments_workorder ON workorder_appointments(workorder_id);

