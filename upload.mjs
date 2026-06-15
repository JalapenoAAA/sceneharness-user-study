// Upload compressed single-room GLBs to Supabase storage, overwriting originals
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://vhdyfdmtiglimbtuvtvg.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'scenes';
const COMPRESSED_DIR = '/Users/wula/Desktop/projs/scene/compressed';

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

// Single-room file names (17 files)
const SINGLE_ROOM_FILES = [
  'office_origin.glb',
  'sceneharness_office_translate.glb',
  'E2A_office_translate.glb',
  'dining_room_origin.glb',
  'sceneharness_dining_room_translate.glb',
  'E2A_dining_room_translate.glb',
  'kids_room_origin.glb',
  'sceneharness_kids_room_rotate.glb',
  'E2A_kids_room_rotate.glb',
  'living_room_origin.glb',
  'sceneharness_living_room_translate.glb',
  'sceneharness_living_room_rotate.glb',
  'E2A_living_room_translate.glb',
  'vulcan_living_room_rotate.glb',
  'gameroom_origin.glb',
  'sceneharness_gameroom_scale.glb',
  'vulcan_game_room_scale.glb',
];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let ok = 0, fail = 0;
for (const fname of SINGLE_ROOM_FILES) {
  const localPath = path.join(COMPRESSED_DIR, fname);
  const buf = readFileSync(localPath);
  const sizeMB = (buf.length / 1024 / 1024).toFixed(2);
  process.stdout.write(`[${fname}] ${sizeMB} MB ... `);

  const { error } = await supabase.storage.from(BUCKET).upload(fname, buf, {
    contentType: 'model/gltf-binary',
    upsert: true,  // overwrite
    cacheControl: '3600',
  });

  if (error) {
    console.log(`FAIL: ${error.message}`);
    fail++;
  } else {
    console.log('OK');
    ok++;
  }
}
console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
