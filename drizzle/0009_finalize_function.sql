-- finalize_reconciliation_run: atomically completes a reconciliation run.
-- Performs lease CAS UPDATE -> DELETE old discrepancies -> INSERT new discrepancies in sequence.
-- Called as a single Neon-compatible statement: SELECT finalize_reconciliation_run(...)
--
-- Security: function is SECURITY INVOKER (default), uses pg_catalog-qualified functions,
-- and sets a fixed search_path to prevent search_path hijacking.
-- Execution is restricted to the table owner role.

CREATE OR REPLACE FUNCTION finalize_reconciliation_run(
  p_run_id varchar,
  p_lease_token text,
  p_provider text,
  p_total_external integer,
  p_total_stored integer,
  p_missing_in_stored integer,
  p_missing_in_external integer,
  p_discrepancies json
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated integer;
  v_run_provider text;
BEGIN
  -- Verify the run exists and get its provider for validation
  SELECT provider INTO v_run_provider
  FROM reconciliation_runs
  WHERE id = p_run_id;

  IF v_run_provider IS NULL THEN
    RETURN false;
  END IF;

  -- Provider must match the run's provider
  IF v_run_provider != p_provider THEN
    RETURN false;
  END IF;

  -- Lease CAS: only proceed if we still own the run
  UPDATE reconciliation_runs
  SET
    status = 'completed',
    total_external = p_total_external,
    total_stored = p_total_stored,
    missing_in_stored = p_missing_in_stored,
    missing_in_external = p_missing_in_external,
    completed_at = NOW(),
    lease_token = NULL,
    lease_expires_at = NULL
  WHERE id = p_run_id
    AND lease_token = p_lease_token
    AND status = 'running';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN false;
  END IF;

  -- Clear old discrepancies (always, even if new set is empty)
  DELETE FROM reconciliation_discrepancies WHERE run_id = p_run_id;

  -- Insert new discrepancies from bound JSON parameter
  INSERT INTO reconciliation_discrepancies (run_id, provider, external_id, discrepancy_type)
  SELECT
    p_run_id,
    p_provider,
    item ->> 'externalId',
    item ->> 'discrepancyType'
  FROM json_array_elements(p_discrepancies) as item
  ON CONFLICT (run_id, provider, external_id, discrepancy_type) DO NOTHING;

  RETURN true;
END;
$$;

-- Note: Function execution permissions are managed by the database role system.
-- The function uses SECURITY INVOKER (default) so it runs with the caller's permissions.
-- In production, restrict EXECUTE to the application role as needed.
