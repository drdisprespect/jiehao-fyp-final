import { useState, useRef } from 'react'
import { Upload, X, Play, Pause, Trash2, Music } from 'lucide-react'
import './CustomMusicUpload.css'

const CustomMusicUpload = ({ onTrackSelect, isPlaying, currentTrack }) => {
  const [uploadedTracks, setUploadedTracks] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (files) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)
    )

    audioFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newTrack = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          file: file,
          url: e.target.result,
          size: file.size,
          duration: null, // Will be set when audio loads
          type: 'custom'
        }
        
        setUploadedTracks(prev => [...prev, newTrack])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeTrack = (trackId) => {
    setUploadedTracks(prev => prev.filter(track => track.id !== trackId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAudioLoad = (trackId, audio) => {
    setUploadedTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, duration: audio.duration }
          : track
      )
    )
  }

  return (
    <div className="custom-music-upload">
      {/* Upload Area */}
      <div 
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <Upload size={48} className="upload-icon" />
          <h3 className="upload-title">Upload Your Music</h3>
          <p className="upload-description">
            Drag and drop audio files here, or click to browse
          </p>
          <p className="upload-formats">
            Supports MP3, WAV, OGG, M4A, AAC, FLAC
          </p>
          <button className="btn btn-primary upload-btn">
            <Upload size={16} />
            Choose Files
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Tracks List */}
      {uploadedTracks.length > 0 && (
        <div className="uploaded-tracks">
          <h3 className="tracks-title">Your Music Library</h3>
          <div className="tracks-list">
            {uploadedTracks.map((track) => (
              <div 
                key={track.id} 
                className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
              >
                <div className="track-info" onClick={() => onTrackSelect(track)}>
                  <div className="track-artwork">
                    <Music size={20} />
                  </div>
                  <div className="track-details">
                    <div className="track-name">{track.name}</div>
                    <div className="track-meta">
                      <span className="track-size">{formatFileSize(track.size)}</span>
                      <span className="track-duration">{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="track-actions">
                  <button
                    onClick={() => onTrackSelect(track)}
                    className="btn btn-secondary track-play-btn"
                    title={currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="btn btn-secondary track-remove-btn"
                    title="Remove track"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Hidden audio element to get duration */}
                <audio
                  onLoadedMetadata={(e) => handleAudioLoad(track.id, e.target)}
                  src={track.url}
                  preload="metadata"
                  style={{ display: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="upload-tips card">
        <h4 className="tips-title">Tips for Better Sleep Music</h4>
        <ul className="tips-list">
          <li>Choose music with a slow tempo (60-80 BPM) to match your resting heart rate</li>
          <li>Instrumental music works better than songs with lyrics</li>
          <li>Nature sounds, white noise, and ambient music are ideal for sleep</li>
          <li>Keep volume low and consistent to avoid sudden changes</li>
          <li>Consider music that gradually fades or has a natural ending</li>
        </ul>
      </div>
    </div>
  )
}

export default CustomMusicUpload