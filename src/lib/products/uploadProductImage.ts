import { createClient } from '@/lib/supabase/client'

export async function uploadProductImage(
  file: File,
  productId: string
) {
  const supabase = createClient()

  const extension =
    file.name.split('.').pop()?.toLowerCase() || 'jpg'

  const fileName = `${crypto.randomUUID()}.${extension}`

  const filePath = `${productId}/${fileName}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(error.message)
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl,
  }
}