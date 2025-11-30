'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Upload, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ProtectedImage } from '@/components/dashboard/protected-image'

interface GeneratedImage {
  id: string
  imageUrl: string | null
  prompt: string
  createdAt: string
}

export function GenerationForm() {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('super-high')
  const [quantity, setQuantity] = useState([1])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    // Cleanup preview URL to avoid memory leaks
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

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
      const objectUrl = URL.createObjectURL(selectedFile)
      setFilePreview(objectUrl)
    } else {
      setFilePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setGeneratedImages([]) // Clear previous results
    const formData = new FormData()
    formData.append('image', file)
    formData.append('prompt', prompt) // Optional prompt
    formData.append('quality', quality)
    formData.append('quantity', quantity[0].toString())

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        // Handle 413 (Payload Too Large) specifically
        if (res.status === 413) {
          // Try to get error message from response, but if body is too large, use default message
          let errorMessage = `Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress your image and try again.`
          try {
            const errorData = await res.json()
            if (errorData.error) {
              errorMessage = errorData.error
            }
          } catch {
            // Response body might not be readable for 413 errors, use default message
          }
          throw new Error(errorMessage)
        }
        
        // For other errors, try to parse JSON response
        let errorMessage = `Server error: ${res.status} ${res.statusText}`
        try {
          const error = await res.json()
          errorMessage = error.error || errorMessage
        } catch {
          // If response body can't be parsed, use status text
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      toast.success(`Success! Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}.`)
      
      // Set generated images and open modal
      setGeneratedImages(data.images || [])
      setModalOpen(true)
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
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
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">Describe scene (optional)</Label>
                        <Textarea 
                          placeholder="E.g. On a rustic wooden table with soft morning light..." 
                          className="resize-none h-32 md:h-48"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                      </div>

                      <div className="space-y-6 pt-4 border-t">
                         <div className="space-y-3">
                            <Label>Quality</Label>
                            <Select value={quality} onValueChange={setQuality}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High quality (fast)</SelectItem>
                                <SelectItem value="super-high">Super high quality (pro)</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label>Quantity</Label>
                              <span className="text-sm font-medium px-2 py-1 bg-muted rounded-md min-w-[3rem] text-center">
                                {quantity[0]}
                              </span>
                            </div>
                            <Slider 
                              value={quantity} 
                              onValueChange={setQuantity}
                              min={1}
                              max={10}
                              step={1}
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                              <span>1</span>
                              <span>10</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <Button size="lg" className="w-full mt-4" disabled={loading || !file}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? 'Generating...' : 'Generate images'}
                   </Button>
                </CardContent>
             </Card>
          </div>

        </div>
      </form>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <DialogTitle>Generated images</DialogTitle>
            </div>
            <DialogDescription>
              Successfully generated {generatedImages.length} image{generatedImages.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {generatedImages.map((img, idx) => (
              <div key={img.id || idx} className="relative aspect-square rounded-lg overflow-hidden border">
                {img.imageUrl ? (
                  <ProtectedImage
                    src={img.imageUrl}
                    alt={`Generated image ${idx + 1}`}
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    Image unavailable
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleModalClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
              View all in dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
