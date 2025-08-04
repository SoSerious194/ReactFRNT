-- Forms & Questionnaires Database Schema

-- 1. Forms Table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id) -- Only one form per coach
);

-- 2. Form Elements Table
CREATE TABLE form_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  element_type VARCHAR(50) NOT NULL, -- 'short_text', 'paragraph', 'numeric', 'date', 'time', 'toggle', 'dropdown', 'checkbox', 'checklist', 'range', 'image_upload', 'attachment', 'section_break', 'data_table'
  label VARCHAR(255) NOT NULL,
  placeholder TEXT,
  description TEXT,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  default_value TEXT,
  min_value INTEGER,
  max_value INTEGER,
  min_length INTEGER,
  max_length INTEGER,
  options JSONB, -- For dropdown, checkbox, checklist options
  validation_rules JSONB, -- min/max values, patterns, etc.
  css_class VARCHAR(100),
  help_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Form Responses Table
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- {element_id: value}
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(form_id, client_id) -- One response per client per form
);

-- Indexes for better performance
CREATE INDEX idx_forms_coach_id ON forms(coach_id);
CREATE INDEX idx_form_elements_form_id ON form_elements(form_id);
CREATE INDEX idx_form_elements_order_index ON form_elements(order_index);
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_client_id ON form_responses(client_id);

-- RLS Policies (if using Row Level Security)
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE form_elements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup)
-- CREATE POLICY "Coaches can manage their own forms" ON forms FOR ALL USING (coach_id = auth.uid());
-- CREATE POLICY "Coaches can manage their form elements" ON form_elements FOR ALL USING (form_id IN (SELECT id FROM forms WHERE coach_id = auth.uid()));
-- CREATE POLICY "Coaches can view responses to their forms" ON form_responses FOR SELECT USING (form_id IN (SELECT id FROM forms WHERE coach_id = auth.uid()));
-- CREATE POLICY "Clients can submit responses" ON form_responses FOR INSERT WITH CHECK (client_id = auth.uid()); 