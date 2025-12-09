import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids must be a non-empty array' },
        { status: 400 }
      )
    }

    // Fetch all generations to verify ownership and get file paths
    const { data: generations, error: fetchError } = await supabase
      .from('generations')
      .select('*')
      .in('id', ids)
      .eq('user_id', user.id)

    if (fetchError || !generations || generations.length === 0) {
      return NextResponse.json(
        { error: 'No generations found or unauthorized' },
        { status: 404 }
      )
    }

    // Verify all requested IDs belong to the user
    const foundIds = new Set(generations.map(g => g.id))
    const missingIds = ids.filter(id => !foundIds.has(id))
    
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Some generations not found or unauthorized: ${missingIds.join(', ')}` },
        { status: 403 }
      )
    }

    const errors: string[] = []
    const deletedIds: string[] = []

    // Delete each generation
    for (const generation of generations) {
      try {
        // Delete generated image
        if (generation.generated_image_path) {
          const { error: genImageError } = await supabase.storage
            .from('generated_images')
            .remove([generation.generated_image_path])

          if (genImageError) {
            errors.push(`Failed to delete generated image for ${generation.id}: ${genImageError.message}`)
          }
        }

        // Delete original image
        if (generation.original_image_path) {
          const { error: origImageError } = await supabase.storage
            .from('user_uploads')
            .remove([generation.original_image_path])

          if (origImageError) {
            // Don't fail if original deletion fails - it might be shared
            console.warn(`Failed to delete original image for ${generation.id}: ${origImageError.message}`)
          }
        }

        // Delete database record
        const { error: deleteError } = await supabase
          .from('generations')
          .delete()
          .eq('id', generation.id)
          .eq('user_id', user.id)

        if (deleteError) {
          errors.push(`Failed to delete generation ${generation.id}: ${deleteError.message}`)
        } else {
          deletedIds.push(generation.id)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Error processing generation ${generation.id}: ${message}`)
      }
    }

    if (deletedIds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete any generations', errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted: deletedIds.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Bulk delete generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete generations'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
