import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://vhdyfdmtiglimbtuvtvg.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'scenes';
const TEST_FILE = '/Users/wula/Desktop/projs/scene/compressed/kids_room_origin.glb';
const REMOTE_NAME = 'kids_room_origin.glb';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const buf = readFileSync(TEST_FILE);
console.log(`Uploading ${REMOTE_NAME} (${(buf.length/1024/1024).toFixed(2)} MB)...`);

const { error, data } = await supabase.storage.from(BUCKET).upload(REMOTE_NAME, buf, {
  contentType: 'model/gltf-binary',
  upsert: true,
  cacheControl: '3600',
});

if (error) {
  console.log('FAIL:', error);
  process.exit(1);
}
console.log('OK:', data);
