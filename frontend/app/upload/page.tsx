'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/src/lib/api'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      // Check file size (max 500MB)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a video file')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const { data } = await api.uploadFile(
        '/media/upload',
        file,
        {
          title,
          description,
        },
        (progress) => {
          setUploadProgress(progress)
        }
      )

      // Redirect to video page
      router.push(`/watch/${data.videoId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Navigation */}
      <nav className="border-b border-inferno-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold">
              <span className="text-white">MHC</span>{' '}
              <span className="text-red-600">STREAMING</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/browse" className="text-purgatorio-mist hover:text-white">
                Browse
              </Link>
              <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Upload Video
          </h1>
          <p className="text-purgatorio-mist mb-8">
            Share your content with the MHC community
          </p>

          <div className="card-inferno">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File
                </label>
                <div className="border-2 border-dashed border-inferno-border rounded-lg p-8 text-center hover:border-red-600 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {file ? (
                      <div>
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="mt-2 text-red-600 hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-white font-medium mb-1">
                          Click to select video
                        </p>
                        <p className="text-sm text-gray-400">
                          Max size: 500MB • MP4, MOV, AVI, WebM
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-inferno"
                  placeholder="Give your video a catchy title"
                  maxLength={100}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-inferno min-h-[120px]"
                  placeholder="Describe your video..."
                  maxLength={1000}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </p>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Uploading...</span>
                    <span className="text-sm text-gray-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-inferno-charcoal rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full btn-inferno disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
