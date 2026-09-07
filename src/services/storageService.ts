import { isSupabaseConfigured, supabase, WEDDING_HALL_BUCKET } from '@/lib/supabase'
import { AppError } from '@/utils/errors'

// ---------------------------------------------------------------------------
// Image upload to Supabase Storage (bucket: "wedding-halls").
//
// Without Supabase configured, files are converted to local object URLs so
// the registration form still shows a live preview and can be fully tested;
// nothing is actually persisted to a server in that mode.
// ---------------------------------------------------------------------------

export async function uploadWeddingHallImage(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file)
  }

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage.from(WEDDING_HALL_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(WEDDING_HALL_BUCKET).getPublicUrl(path)
    if (!data?.publicUrl) {
      throw new Error('getPublicUrl returned no URL')
    }
    return data.publicUrl
  } catch (err) {
    throw new AppError(
      '이미지 업로드에 실패했습니다. 파일 형식과 용량을 확인한 뒤 다시 시도해주세요.',
      `uploadWeddingHallImage failed: ${err instanceof Error ? err.message : String(err)}`,
      err,
    )
  }
}
