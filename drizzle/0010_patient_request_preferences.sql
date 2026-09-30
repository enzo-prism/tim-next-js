-- Additive and repeatable. Existing public submissions remain valid.
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_contact_method text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS visit_for text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_preferred_contact_method_check' AND conrelid = 'contacts'::regclass) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_preferred_contact_method_check
      CHECK (preferred_contact_method IS NULL OR preferred_contact_method IN ('phone', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_visit_for_check' AND conrelid = 'contacts'::regclass) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_visit_for_check
      CHECK (visit_for IS NULL OR visit_for IN ('self', 'child', 'family'));
  END IF;
END $$;
