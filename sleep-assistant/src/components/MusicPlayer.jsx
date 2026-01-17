import { Play, Pause, Volume2, VolumeX, TreePine, CloudRain, Zap, Radio } from 'lucide-react'
import './MusicPlayer.css'

const MusicPlayer = ({ 
  isPlaying, 
  setIsPlaying, 
  currentTrack, 
  setCurrentTrack, 
  ambientAudioEnabled, 
  audioRef, 
  volume, 
  setVolume, 
  isMuted, 
  setIsMuted 
}) => {

  // Sleep assistant ambient sounds - looped for continuous relaxation
  const ambientSounds = [
    {
      id: 1,
      name: 'Rainforest',
      description: 'Gentle sounds of tropical rainforest with birds and flowing water',
      url: '/audio/ambient/rainforest.mp3',
      duration: 'Loop',
      color: 'from-green-600 to-emerald-800',
      icon: TreePine
    },
    {
      id: 2,
      name: 'Rain',
      description: 'Soft rainfall for peaceful relaxation',
      url: '/audio/ambient/rain.mp3',
      duration: 'Loop',
      color: 'from-blue-600 to-indigo-800',
      icon: CloudRain
    },
    {
      id: 3,
      name: 'Thunder',
      description: 'Gentle thunder sounds for deep sleep',
      url: '/audio/ambient/thunder.mp3',
      duration: 'Loop',
      color: 'from-purple-600 to-indigo-800',
      icon: Zap
    },
    {
      id: 4,
      name: 'White Noise',
      description: 'Consistent white noise for deep focus and sleep',
      url: '/audio/ambient/whitenoise.mp3',
      duration: 'Loop',
      color: 'from-gray-600 to-slate-800',
      icon: Radio
    }
  ]



  const playTrack = (track) => {
    // Don't play if ambient audio is disabled
    if (!ambientAudioEnabled) return

    if (currentTrack?.id === track.id) {
      togglePlayPause()
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      // Autoplay the track after a short delay to ensure audio element is ready
      setTimeout(() => {
        if (audioRef.current && ambientAudioEnabled) {
          audioRef.current.play().catch(console.error)
        }
      }, 100)
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  return (
    <div className="music-player">


      {/* Current Track Display */}
      {currentTrack && (
        <div className="current-track card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`track-artwork bg-gradient-to-br ${currentTrack.color}`}>
                <div className="track-icon">♪</div>
              </div>
              <div>
                <h3 className="text-medium text-gradient">{currentTrack.name}</h3>
                <p className="text-small">{currentTrack.description}</p>
              </div>
            </div>
            <div className="player-controls flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="btn btn-secondary"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={togglePlayPause}
                className="btn btn-primary"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>



          {/* Volume Control */}
          <div className="volume-control mt-4">
            <div className="flex items-center gap-3">
              <Volume2 size={16} className="text-muted" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="text-small">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Sounds Grid */}
      <div className="ambient-sounds">
        <h2 className="text-medium text-gradient mb-6">Choose Your Ambient Sound</h2>
        <div className="sounds-grid">
          {ambientSounds.map((sound) => (
            <div
              key={sound.id}
              className={`sound-card card ${currentTrack?.id === sound.id ? 'active' : ''}`}
              onClick={() => playTrack(sound)}
            >
              <div className={`sound-artwork bg-gradient-to-br ${sound.color}`}>
                <div className="sound-ambient-icon">
                  <sound.icon size={32} />
                </div>
                <div className="sound-play-icon">
                  {currentTrack?.id === sound.id && isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} />
                  )}
                </div>
              </div>
              <div className="sound-info">
                <h3 className="sound-name">{sound.name}</h3>
                <p className="sound-description">{sound.description}</p>
                <div className="sound-duration">{sound.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer
