import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function putDataInStatsSupabase(
  user_id,
  error_count,
  info_count,
  warning_count,
  status,
  job_id
) {
  console.log(
    "Supabase params:",
    process.env.SUPABASE_URL,
    user_id,
    error_count,
    info_count,
    warning_count,
    status,
    job_id
  );

  const { data, error } = await supabase
    .from('log_stats')
    .upsert([{
      job_id: job_id,
      user_id: user_id,
      file_name:"unknown-name",
      error_count: error_count,
      warning_count: warning_count,
      info_count: info_count,
    //   status: status === 'processed' ? 'processed' : 'processing'
    }])
    .select(); // ensures updated/inserted rows are returned

  if (error) {
    console.error(" Supabase error:", error);
  } else {
    console.log(" Supabase response:", data);
  }

  return { data, error };
}

export async function putDataInSpatialSupabase(
  job_id,
  position_x,
  position_y,
  position_z,
  log_level,
  timestamp,
  ip_address,
  message,
) {
    console.log("I am in spatial,",position_x)
  const { data, error } = await supabase
    .from('log_spatial_data')
    .upsert([{
      job_id: job_id,
      log_entry_id:job_id*position_x,
      position_x:position_x,
      position_y:position_y,
      position_z:position_z,
      log_level :log_level,
      timestamp: timestamp,
      ip_address: ip_address,
      message:message,
    }])
    .select();

  if (error) {
    console.error("Supabase error (log_spatial_data):", error);
  } else {
    console.log("Supabase response (log_spatial_data):", data);
  }

  return { data, error };
}