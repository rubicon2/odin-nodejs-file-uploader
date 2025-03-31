import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function uploadPublicFile(filePath, fileBody, mimeType) {
  const { data, error } = await supabase.storage
    .from('test-bucket')
    .upload(filePath, fileBody, { contentType: mimeType });
  return { data, error };
}

async function getPublicFileUrl(filePath, downloadName) {
  // If we don't want to download, just leave downloadName undefined.
  const { data } = await supabase.storage
    .from('test-bucket')
    .getPublicUrl(filePath, { download: downloadName });
  return data.publicUrl;
}

async function deletePublicFile(filePath) {
  const { error } = await supabase.storage.from('test-bucket').remove(filePath);
  return { error };
}

export { uploadPublicFile, getPublicFileUrl, deletePublicFile };
