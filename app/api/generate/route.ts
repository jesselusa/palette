import { createClient } from '@/lib/supabase/server'
import { model } from '@/lib/gemini'
import { NextResponse } from 'next/server'
import { analyzeImage, constructPrompt } from '@/lib/pipeline'

export const maxDuration = 60 // Set timeout to 60 seconds for long generation

// Ensure FormData is properly handled
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Vercel Hobby plan has a 4.5MB body size limit for API routes
// Setting to 4MB to provide a safe buffer
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB

export async function POST(request: Request) {
  try {
    // 3. Parse Input FIRST (before any other async operations that might consume the body)
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error: any) {
      console.error('FormData parsing error:', error)
      // Check if it's a size-related error
      if (error.message?.includes('size') || error.message?.includes('413') || error.message?.includes('too large')) {
        return NextResponse.json(
          { error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress your image and try again.` },
          { status: 413 }
        )
      }
      return NextResponse.json(
        { error: `Failed to parse FormData: ${error.message}` },
        { status: 400 }
      )
    }

    // 1. Verify Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Rate Limiting (Daily Hard Cap Only - Credits Deferred)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())

    if (countError) throw countError

    if (count && count >= 20) {
      return NextResponse.json(
        { error: 'Daily limit reached (20 images/day)' },
        { status: 429 }
      )
    }
    
    const userPrompt = formData.get('prompt') as string
    const imageFile = formData.get('image') as File
    const quality = formData.get('quality') as string || 'super-high' // 'high' | 'super-high'
    const quantity = parseInt(formData.get('quantity') as string || '1')

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image' },
        { status: 400 }
      )
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress your image and try again.` },
        { status: 413 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      )
    }

    // 4. Upload Original Image to Supabase
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user_uploads')
      .upload(fileName, imageFile)

    if (uploadError) throw uploadError

    // 5. Execute "Nano Banana" Pipeline
    const imageBuffer = await imageFile.arrayBuffer()
    const mimeType = imageFile.type
    
    // Step A: Vision Analysis
    const analysis = await analyzeImage(imageBuffer, mimeType)

    // Step B & C: Generation Loop with Image-to-Image
    // Generate unique prompt per image for diversity, then generate with original image
    const modelName = quality === 'super-high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'
    const generatedImages = []
    
    // Convert image buffer to base64 for Image-to-Image generation
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    for (let i = 0; i < quantity; i++) {
      try {
        // Step B: Architect (Prompt Engineering) - Generate unique prompt per image
        const architectOutput = await constructPrompt(analysis, userPrompt || '', quantity, i)
        const { image_prompt, render_prefs } = architectOutput

        // Step C: Image-to-Image Generation
        // Format prompt: short spec first, then main scene (inspired by n8n workflow)
        
        // Format final prompt: start with short spec, then main scene
        const shortSpec = `Shot: ${render_prefs.camera}; Lighting: ${render_prefs.lighting}; Aspect ratio: ${render_prefs.aspect_ratio}; Style: ${render_prefs.output_style}.`
        const formattedPrompt = `${shortSpec} ${image_prompt}`
        
        // Pass original image along with formatted prompt to preserve product design exactly
        const result = await model.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64,
                  },
                },
                { text: formattedPrompt },
              ],
            },
          ],
          config: {
            temperature: 0.7,
            topP: 0.9,
          },
        })

        // Find the part with inlineData
        let generatedImageBase64: string | null = null;
        
        const parts = result.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageBase64 = part.inlineData.data;
            break;
          }
        }
        
        if (!generatedImageBase64) {
          console.error(`Failed to generate image ${i + 1}: No inline data found in any part.`)
          continue
        }

        // Upload Generated Image
        const genFileName = `${user.id}/${Date.now()}-${i}-generated.png`
        const genBuffer = Buffer.from(generatedImageBase64, 'base64')
    
    const { data: genUploadData, error: genUploadError } = await supabase.storage
      .from('generated_images')
          .upload(genFileName, genBuffer, {
        contentType: 'image/png',
      })
      
    if (genUploadError) throw genUploadError

        // Record in DB
        const { data: insertedGen, error: dbError } = await supabase.from('generations').insert({
      user_id: user.id,
      original_image_path: uploadData.path,
      generated_image_path: genUploadData.path,
          prompt: image_prompt,
          // model: modelName, // TODO: Add column to DB schema later
        }).select().single()

    if (dbError) throw dbError

        // Create signed URL for immediate display
        const { data: urlData } = await supabase.storage
          .from('generated_images')
          .createSignedUrl(genUploadData.path, 3600) // 1 hour expiry

        generatedImages.push({
          id: insertedGen.id,
          imageUrl: urlData?.signedUrl || null,
          prompt: image_prompt,
          createdAt: insertedGen.created_at,
        })
      } catch (genError: any) {
        console.error(`Generation loop error for image ${i + 1}:`, genError)
        // If it's the first image and it fails, throw to surface the error immediately
        if (i === 0) {
          throw new Error(`Failed to generate image: ${genError.message || 'Unknown error'}`)
        }
      }
    }

    if (generatedImages.length === 0) {
        return NextResponse.json(
            { error: 'Failed to generate any images. Please try again.' },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true, images: generatedImages })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
