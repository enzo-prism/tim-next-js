CREATE OR REPLACE FUNCTION finalize_reconciliation_run(
  p_run_id varchar,
  p_lease_token text,
  p_provider text,
  p_total_external integer,
  p_total_stored integer,
  p_missing_in_stored integer,
  p_missing_in_external integer,
  p_discrepancies json
) RETURNS boolean AS $$
DECLARE
  v_updated integer;
BEGIN
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

  DELETE FROM reconciliation_discrepancies WHERE run_id = p_run_id;

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
$$ LANGUAGE plpgsql;
