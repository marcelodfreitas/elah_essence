import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import MaterialEditForm from './MaterialEditForm'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function MaterialEditPage({
  params,
}: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: material, error } = await supabase
    .from('materials')
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      is_active,
      sort_order
    `)
    .eq('id', id)
    .single()

  if (error || !material) {
    notFound()
  }

  return <MaterialEditForm material={material} />
}