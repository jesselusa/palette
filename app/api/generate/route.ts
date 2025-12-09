import { createClient } from '@/lib/supabase/server'
import { model } from '@/lib/gemini'
import { analyzeImage, constructPrompt } from '@/lib/pipeline'

export const maxDuration = 60 // Set timeout to 60 seconds for long generation

// Ensure FormData is properly handled
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Vercel Hobby plan has a 4.5MB body size limit for API routes
// Setting to 4MB to provide a safe buffer
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  controller.enqueue(new TextEncoder().encode(message))
}

export async function POST(request: Request) {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController | null = null

  const stream = new ReadableStream({
    async start(ctrl) {
      controller = ctrl
      
      try {
        // Parse Input FIRST (before any other async operations that might consume the body)
        let formData: FormData
        try {
          formData = await request.formData()
        } catch (error: any) {
          console.error('FormData parsing error:', error)
          if (error.message?.includes('size') || error.message?.includes('413') || error.message?.includes('too large')) {
            sendSSE(ctrl, 'error', { error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress your image and try again.` })
            ctrl.close()
            return
          }
          sendSSE(ctrl, 'error', { error: `Failed to parse FormData: ${error.message}` })
          ctrl.close()
          return
        }

        // 1. Verify Auth
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          sendSSE(ctrl, 'error', { error: 'Unauthorized' })
          ctrl.close()
          return
        }

        // 2. Check Credits/Free Trial
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits_balance, free_trial_images_used')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          sendSSE(ctrl, 'error', { error: 'Failed to fetch user profile' })
          ctrl.close()
          return
        }

        const creditsBalance = profile?.credits_balance || 0
        const freeTrialUsed = profile?.free_trial_images_used || 0
        const quantity = parseInt(formData.get('quantity') as string || '1')

        // Determine if user can generate (free trial or credits)
        const freeTrialRemaining = Math.max(0, 3 - freeTrialUsed)
        const canUseFreeTrial = freeTrialRemaining > 0
        const freeTrialToUse = Math.min(quantity, freeTrialRemaining)
        const creditsNeeded = Math.max(0, quantity - freeTrialToUse)
        const hasEnoughCredits = creditsBalance >= creditsNeeded

        if (!hasEnoughCredits) {
          sendSSE(ctrl, 'error', { 
            error: `Insufficient credits. You need ${creditsNeeded} credit${creditsNeeded > 1 ? 's' : ''} but have ${creditsBalance}. Buy credits to continue.`,
            creditsNeeded: creditsNeeded,
            creditsAvailable: creditsBalance
          })
          ctrl.close()
          return
        }

        // 3. Rate Limiting (Daily Hard Cap)
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { count, error: countError } = await supabase
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())

        if (countError) throw countError

        if (count && count >= 20) {
          sendSSE(ctrl, 'error', { error: 'Daily limit reached (20 images/day)' })
          ctrl.close()
          return
        }
        
        const userPrompt = formData.get('prompt') as string
        const imageFile = formData.get('image') as File
        const quality = formData.get('quality') as string || 'super-high'

        if (!imageFile) {
          sendSSE(ctrl, 'error', { error: 'Missing image' })
          ctrl.close()
          return
        }

        // Validate file size
        if (imageFile.size > MAX_FILE_SIZE) {
          sendSSE(ctrl, 'error', { error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress your image and try again.` })
          ctrl.close()
          return
        }

        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          sendSSE(ctrl, 'error', { error: 'Invalid file type. Please upload an image file.' })
          ctrl.close()
          return
        }

        // 4. Upload Original Image to Supabase
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user_uploads')
          .upload(fileName, imageFile)

        if (uploadError) {
          sendSSE(ctrl, 'error', { error: uploadError.message || 'Failed to upload image' })
          ctrl.close()
          return
        }

        // 5. Execute "Nano Banana" Pipeline
        const imageBuffer = await imageFile.arrayBuffer()
        const mimeType = imageFile.type
        
        // Step A: Vision Analysis
        sendSSE(ctrl, 'progress', { step: 'analyzing', message: 'Analyzing image...' })
        const analysis = await analyzeImage(imageBuffer, mimeType)

        // Step B & C: Generation Loop with Image-to-Image
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
            sendSSE(ctrl, 'progress', { 
              step: 'generating', 
              image: i + 1, 
              total: quantity,
              message: `Generating image ${i + 1}/${quantity}...` 
            })
            
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
              sendSSE(ctrl, 'error', { error: `Failed to generate image: ${genError.message || 'Unknown error'}` })
              ctrl.close()
              return
            }
          }
        }

        if (generatedImages.length === 0) {
          sendSSE(ctrl, 'error', { error: 'Failed to generate any images. Please try again.' })
          ctrl.close()
          return
        }

        // Deduct credits and/or increment free trial counter
        const freeTrialToDeduct = Math.min(generatedImages.length, freeTrialRemaining)
        const creditsToDeduct = generatedImages.length - freeTrialToDeduct

        if (freeTrialToDeduct > 0) {
          const newTrialCount = freeTrialUsed + freeTrialToDeduct
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ free_trial_images_used: newTrialCount })
            .eq('id', user.id)
          
          if (updateError) {
            console.error('Error updating free trial count:', updateError)
          }
        }

        if (creditsToDeduct > 0) {
          const newBalance = creditsBalance - creditsToDeduct
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits_balance: newBalance })
            .eq('id', user.id)
          
          if (updateError) {
            console.error('Error deducting credits:', updateError)
          }
        }

        // Send completion event with results
        sendSSE(ctrl, 'complete', {
          images: generatedImages,
          usedFreeTrial: freeTrialToDeduct > 0,
          creditsRemaining: creditsBalance - creditsToDeduct,
          freeTrialUsed: freeTrialUsed + freeTrialToDeduct
        })
        
        ctrl.close()
      } catch (error: any) {
        console.error('Generation error:', error)
        if (controller) {
          sendSSE(controller, 'error', { error: error.message || 'Internal Server Error' })
          controller.close()
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
