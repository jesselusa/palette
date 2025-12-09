import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/dashboard/empty-state'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  // Fetch user's generations
  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get signed URLs for generated and original images
  // We need to filter out any nulls to satisfy TypeScript
  const generationsWithUrls = (await Promise.all(
    (generations || []).map(async (gen) => {
      const { data: generatedUrlData } = await supabase.storage
        .from('generated_images')
        .createSignedUrl(gen.generated_image_path, 3600) // 1 hour expiry

      if (!generatedUrlData?.signedUrl) return null

      // Get original image URL if available
      let originalImageUrl: string | null = null
      if (gen.original_image_path) {
        const { data: originalUrlData } = await supabase.storage
          .from('user_uploads')
          .createSignedUrl(gen.original_image_path, 3600) // 1 hour expiry
        originalImageUrl = originalUrlData?.signedUrl || null
      }

      return {
        id: gen.id,
        imageUrl: generatedUrlData.signedUrl,
        originalImageUrl,
        prompt: gen.prompt,
        createdAt: gen.created_at,
      }
    })
  )).filter((gen): gen is { id: string; imageUrl: string; originalImageUrl: string | null; prompt: string; createdAt: string } => gen !== null)

  return (
    <DashboardContent images={generationsWithUrls} />
  )
}
