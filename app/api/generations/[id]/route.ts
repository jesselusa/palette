import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const generationId = id

    // Fetch the generation to verify ownership and get file paths
    const { data: generation, error: fetchError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete storage files
    const errors: string[] = []

    // Delete generated image
    if (generation.generated_image_path) {
      const { error: genImageError } = await supabase.storage
        .from('generated_images')
        .remove([generation.generated_image_path])

      if (genImageError) {
        errors.push(`Failed to delete generated image: ${genImageError.message}`)
      }
    }

    // Delete original image (optional - might be used by other generations)
    // For now, we'll delete it. If you want to keep originals, comment this out.
    if (generation.original_image_path) {
      const { error: origImageError } = await supabase.storage
        .from('user_uploads')
        .remove([generation.original_image_path])

      if (origImageError) {
        // Don't fail if original deletion fails - it might be shared
        console.warn(`Failed to delete original image: ${origImageError.message}`)
      }
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete generation: ${deleteError.message}` },
        { status: 500 }
      )
    }

    if (errors.length > 0) {
      // Still return success if DB deletion worked, but log storage errors
      console.warn('Storage deletion errors:', errors)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete generation' },
      { status: 500 }
    )
  }
}

