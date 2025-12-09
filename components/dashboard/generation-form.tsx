'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Upload, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, X, RotateCcw, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ProtectedImage } from '@/components/dashboard/protected-image'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGeneration } from '@/contexts/generation-context'

interface GeneratedImage {
  id: string
  imageUrl: string | null
  prompt: string
  createdAt: string
}

export function GenerationForm() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('super-high')
  const [quantity, setQuantity] = useState([1])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [showRegenerate, setShowRegenerate] = useState(false)
  const [regenerateFeedback, setRegenerateFeedback] = useState('')
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const [freeTrialUsed, setFreeTrialUsed] = useState<number | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const supabase = createClient()
  const { 
    isGenerating, 
    progress, 
    result, 
    error, 
    startGeneration, 
    cancel,
    setProgressWidgetOpen,
    setProgressWidgetMinimized,
    formState,
    setFormState,
  } = useGeneration()

  // Handle generation result
  useEffect(() => {
    if (result && result.images.length > 0) {
      toast.success(`Success! Generated ${result.images.length} image${result.images.length > 1 ? 's' : ''}.`)
      
      // Update credits/trial status
      if (result.usedFreeTrial) {
        setFreeTrialUsed(result.freeTrialUsed)
      } else {
        setCreditsBalance(result.creditsRemaining)
      }
      
      // Dispatch event to update credits display in nav
      window.dispatchEvent(new CustomEvent('creditsUpdated'))
      
      // Notification is created in the context
      // Dispatch event for notification system (only on completion)
      window.dispatchEvent(new CustomEvent('generationComplete', { detail: result }))
      
      // Open results modal
      setGeneratedImages(result.images)
      setCurrentImageIndex(0)
      setModalOpen(true)
      setShowRegenerate(false)
      setRegenerateFeedback('')
    }
  }, [result])

  // Handle generation errors
  useEffect(() => {
    if (error) {
      // Check if error is about insufficient credits and make it more actionable
      if (error.toLowerCase().includes('insufficient credits') || (error.toLowerCase().includes('need') && error.toLowerCase().includes('credit'))) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>{error}</span>
            <a href="/dashboard/credits" className="text-sm underline font-medium hover:text-primary">
              Buy credits to continue →
            </a>
          </div>,
          { duration: 8000 }
        )
      } else {
        toast.error(error)
      }
    }
  }, [error])

  // Restore form state from context when component mounts or when returning during generation
  useEffect(() => {
    if (formState) {
      setPrompt(formState.prompt)
      setQuality(formState.quality)
      setQuantity(formState.quantity)
      // Restore file preview (stored as base64 data URL for persistence)
      if (formState.filePreview && !filePreview) {
        setFilePreview(formState.filePreview)
      }
    }
  }, [formState]) // Only depend on formState, not isGenerating

  // Clean up old blob URLs when filePreview changes (if it's a blob URL)
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  // Listen for notification click to reopen progress widget or show results
  useEffect(() => {
    const handleNotificationClick = () => {
      if (isGenerating) {
        setProgressWidgetOpen(true)
        setProgressWidgetMinimized(false)
      } else if (result && result.images.length > 0) {
        // If complete, show results modal
        setGeneratedImages(result.images)
        setCurrentImageIndex(0)
        setModalOpen(true)
      }
    }

    const handleOpenResultsModal = () => {
      if (result && result.images.length > 0) {
        setGeneratedImages(result.images)
        setCurrentImageIndex(0)
        setModalOpen(true)
      }
    }

    window.addEventListener('openProgressModal', handleNotificationClick)
    window.addEventListener('openResultsModal', handleOpenResultsModal)
    return () => {
      window.removeEventListener('openProgressModal', handleNotificationClick)
      window.removeEventListener('openResultsModal', handleOpenResultsModal)
    }
  }, [isGenerating, result, setProgressWidgetOpen, setProgressWidgetMinimized])

  useEffect(() => {
    // Fetch user profile for credits/trial status
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_balance, free_trial_images_used')
          .eq('id', user.id)
          .single()

        if (profile) {
          setCreditsBalance(profile.credits_balance || 0)
          setFreeTrialUsed(profile.free_trial_images_used || 0)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [supabase])

  // Cleanup is now handled in the effect above that checks for blob URLs

  // Vercel Hobby plan has a 4.5MB body size limit for API routes
  // Setting to 4MB to provide a safe buffer
  const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
        const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
        toast.error(`Image is too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB. Please compress your image and try again.`)
        e.target.value = '' // Clear the input
        setFile(null)
        setFilePreview(null)
        setFileSize(null)
        return
      }

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select a valid image file.')
        e.target.value = '' // Clear the input
        setFile(null)
        setFilePreview(null)
        setFileSize(null)
        return
      }

      setFileSize(selectedFile.size)
    } else {
      setFileSize(null)
    }

    setFile(selectedFile)

    if (selectedFile) {
      // Convert file to base64 data URL for persistence across navigation
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    // Store original prompt and file for regeneration
    setOriginalPrompt(prompt)
    setOriginalFile(file)
    
    // Save form state to context for persistence across navigation
    setFormState({
      file: file,
      filePreview: filePreview,
      prompt: prompt,
      quality: quality,
      quantity: quantity,
    })
    
    // Clear previous results
    setGeneratedImages([])
    
    // Create form data
    const formData = new FormData()
    formData.append('image', file)
    formData.append('prompt', prompt)
    formData.append('quality', quality)
    formData.append('quantity', quantity[0].toString())

    // Start generation with SSE
    await startGeneration(formData)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setShowRegenerate(false)
    setRegenerateFeedback('')
    setCurrentImageIndex(0)
  }

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentImageIndex < generatedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentImageIndex < generatedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const handleRegenerate = async () => {
    if (!originalFile) return

    setModalOpen(false)
    setShowRegenerate(false)
    
    // Combine original prompt with feedback
    const newPrompt = regenerateFeedback.trim() 
      ? `${originalPrompt} ${regenerateFeedback}`.trim()
      : originalPrompt

    // Update original prompt with new one
    setOriginalPrompt(newPrompt)
    setRegenerateFeedback('')
    
    // Clear previous results
    setGeneratedImages([])
    
    // Create form data
    const formData = new FormData()
    formData.append('image', originalFile)
    formData.append('prompt', newPrompt)
    formData.append('quality', quality)
    formData.append('quantity', quantity[0].toString())

    // Start generation with SSE
    await startGeneration(formData)
  }

  const handleDownload = async () => {
    const imageUrl = generatedImages[currentImageIndex]?.imageUrl
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="h-full">
        <div className="grid gap-6 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] h-full">
          
          {/* Left Column: Source Image */}
          <div className="flex flex-col h-full min-h-[300px]">
             <Card className="h-full flex flex-col overflow-hidden">
                <CardContent className="p-0 h-full relative flex flex-col">
                   <div className="flex-1 relative border-2 border-dashed m-4 rounded-lg hover:bg-muted/50 transition cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-muted/10 group">
                      <Input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full z-50"
                        onChange={handleFileChange}
                      />
                      {filePreview ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain shadow-sm" 
                            />
                            <div className="absolute bottom-4 right-4 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full z-20 pointer-events-none font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to change
                            </div>
                            {fileSize !== null && (
                              <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium z-20 ${
                                fileSize > MAX_FILE_SIZE 
                                  ? 'bg-red-500/90 text-white' 
                                  : fileSize > MAX_FILE_SIZE * 0.9
                                  ? 'bg-yellow-500/90 text-white'
                                  : 'bg-green-500/90 text-white'
                              }`}>
                                {formatFileSize(fileSize)}
                              </div>
                            )}
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground p-6 text-center">
                           <div className="p-4 rounded-full bg-muted group-hover:bg-background transition-colors">
                             <Upload className="h-8 w-8" />
                           </div>
                           <div>
                             <p className="font-medium text-foreground">Upload source image</p>
                             <p className="text-sm mt-1">Drop your product image here or click to browse</p>
                           </div>
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Right Column: Controls */}
          <div className="flex flex-col h-full">
             <Card className="h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full gap-6">
                   <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-3">
                        <Label className="text-lg font-semibold">Describe scene (optional)</Label>
                        <Textarea 
                          placeholder="E.g. On a rustic wooden table with soft morning light..." 
                          className="resize-none h-32 md:h-48"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                        <div className="text-xs text-muted-foreground space-y-2 pt-1">
                          <p className="font-medium text-foreground">Tips for better results:</p>
                          <div className="space-y-1.5">
                            <p>Describe the background or setting (e.g., "marble table", "outdoor garden")</p>
                            <p>Mention lighting conditions (e.g., "soft natural light", "dramatic shadows")</p>
                            <p>Specify the mood or style (e.g., "minimalist", "luxury", "rustic")</p>
                            <p>Add context about placement or angle (e.g., "from above", "at eye level")</p>
                          </div>
                        </div>
                      </div>

                      {/* Credit/Trial Status */}
                      {!loadingProfile && file && creditsBalance !== null && freeTrialUsed !== null && (
                        <div className="pt-4 border-t">
                          {(() => {
                            const freeTrialRemaining = Math.max(0, 3 - freeTrialUsed)
                            const freeTrialToUse = Math.min(quantity[0], freeTrialRemaining)
                            const creditsNeeded = quantity[0] - freeTrialToUse
                            const hasEnoughCredits = creditsBalance >= creditsNeeded

                            if (freeTrialRemaining > 0 && freeTrialToUse === quantity[0]) {
                              // Using only free trial
                              return (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    This will use {quantity[0]} of your free trial image{quantity[0] > 1 ? 's' : ''}. 
                                    {freeTrialRemaining - quantity[0] > 0 && (
                                      <> {freeTrialRemaining - quantity[0]} free trial image{freeTrialRemaining - quantity[0] > 1 ? 's' : ''} remaining after this.</>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )
                            } else if (freeTrialRemaining > 0 && creditsNeeded > 0) {
                              // Using partial free trial + credits
                              if (!hasEnoughCredits) {
                                return (
                                  <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        <AlertDescription className="text-sm font-semibold">
                                          Insufficient credits
                                        </AlertDescription>
                                      </div>
                                      <Link href="/dashboard/credits">
                                        <Button size="lg" className="w-full font-semibold">
                                          Buy credits to continue
                                        </Button>
                                      </Link>
                                    </div>
                                  </Alert>
                                )
                              }
                              return (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    This will use {freeTrialToUse} free trial image{freeTrialToUse > 1 ? 's' : ''} 
                                    and {creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''}. 
                                    {creditsBalance - creditsNeeded > 0 && (
                                      <> {creditsBalance - creditsNeeded} credit{creditsBalance - creditsNeeded !== 1 ? 's' : ''} remaining.</>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )
                            } else if (!hasEnoughCredits) {
                              // No free trial, insufficient credits
                              return (
                                <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <AlertCircle className="h-5 w-5" />
                                      <AlertDescription className="text-sm font-semibold">
                                        Insufficient credits
                                      </AlertDescription>
                                    </div>
                                    <Link href="/dashboard/credits">
                                      <Button size="lg" className="w-full font-semibold">
                                        Buy credits to continue
                                      </Button>
                                    </Link>
                                  </div>
                                </Alert>
                              )
                            } else {
                              // Using only credits
                              return (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    This will use {quantity[0]} credit{quantity[0] > 1 ? 's' : ''}. 
                                    {creditsBalance - quantity[0] > 0 && (
                                      <> {creditsBalance - quantity[0]} credit{creditsBalance - quantity[0] !== 1 ? 's' : ''} remaining.</>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )
                            }
                          })()}
                        </div>
                      )}
                   </div>

                   <Button 
                     size="lg" 
                     className="w-full mt-4" 
                     disabled={isGenerating || !file || loadingProfile || (() => {
                       if (creditsBalance === null || freeTrialUsed === null) return false
                       const freeTrialRemaining = Math.max(0, 3 - freeTrialUsed)
                       const freeTrialToUse = Math.min(quantity[0], freeTrialRemaining)
                       const creditsNeeded = quantity[0] - freeTrialToUse
                       return creditsBalance < creditsNeeded
                     })()}
                   >
                      {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isGenerating ? 'Generating...' : 'Generate images'}
                   </Button>
                </CardContent>
             </Card>
          </div>

        </div>
      </form>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 flex flex-col" showCloseButton={true}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <DialogTitle>Generated images</DialogTitle>
              </div>
              <DialogDescription className="mt-1">
                {generatedImages.length} image{generatedImages.length > 1 ? 's' : ''} generated
                {generatedImages.length > 1 && ` • ${currentImageIndex + 1} of ${generatedImages.length}`}
              </DialogDescription>
            </div>
          </div>

          {/* Image Carousel */}
          <div className={`relative bg-black/5 overflow-hidden ${showRegenerate ? 'flex-1 min-h-[50vh]' : 'flex-1 min-h-[60vh]'}`}>
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Navigation Arrows */}
              {generatedImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentImageIndex === generatedImages.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image Display */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                {generatedImages[currentImageIndex]?.imageUrl ? (
                  <div className="relative group w-full h-full max-w-5xl flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImages[currentImageIndex].imageUrl!}
                      alt={`Generated image ${currentImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                      style={{ maxHeight: showRegenerate ? '50vh' : '70vh' }}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                    {/* Download button overlay - centered on hover */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg">
                      <div className="pointer-events-auto">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleDownload}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Image unavailable
                  </div>
                )}
              </div>

              {/* Image Indicator Dots */}
              {generatedImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {generatedImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Regenerate Section */}
          {showRegenerate ? (
            <div className="p-6 border-t space-y-4">
              <div className="space-y-2">
                <Label>What would you like to change?</Label>
                <Textarea
                  placeholder="E.g. Make the background darker, add more lighting, change the angle..."
                  value={regenerateFeedback}
                  onChange={(e) => setRegenerateFeedback(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Your original prompt will be combined with your feedback
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRegenerate(false)
                    setRegenerateFeedback('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRegenerate(true)}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1"
              >
                Save to dashboard
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}
