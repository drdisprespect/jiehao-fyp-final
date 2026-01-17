import { Zap, Flame, Snowflake, Cloud, CloudRain, Sun, Wind } from 'lucide-react'
import './AtmosphericEffects.css'

const AtmosphericEffects = ({ activeEffect, setActiveEffect }) => {

  const effects = [
    {
      id: 'none',
      name: 'None',
      icon: <Sun size={20} />,
      description: 'Clear atmosphere'
    },
    {
      id: 'rain',
      name: 'Rain',
      icon: <CloudRain size={20} />,
      description: 'Gentle rainfall'
    },
    {
      id: 'snow',
      name: 'Snow',
      icon: <Snowflake size={20} />,
      description: 'Peaceful snowfall'
    },
    {
      id: 'lightning',
      name: 'Lightning',
      icon: <Zap size={20} />,
      description: 'Distant thunder'
    },
    {
      id: 'campfire',
      name: 'Campfire',
      icon: <Flame size={20} />,
      description: 'Cozy firelight'
    },
    {
      id: 'storm',
      name: 'Storm',
      icon: <Cloud size={20} />,
      description: 'Stormy weather'
    },
    {
      id: 'wind',
      name: 'Wind',
      icon: <Wind size={20} />,
      description: 'Gentle breeze'
    }
  ]

  const handleEffectChange = (effectId) => {
    setActiveEffect(effectId === 'none' ? null : effectId)
  }

  return (
    <div className="atmospheric-effects">
      <div className="effects-header">
        <h2 className="text-medium text-gradient">Atmospheric Effects</h2>
        <p className="text-small">Create an immersive sleep environment</p>
      </div>

      <div className="effects-grid">
        {effects.map((effect) => {
          const isActive = effect.id === 'none' ? !activeEffect : activeEffect === effect.id

          return (
            <button
              key={effect.id}
              className={`effect-card ${isActive ? 'active' : ''}`}
              onClick={() => handleEffectChange(effect.id)}
            >
              <div className="effect-icon">{effect.icon}</div>
              <div className="effect-info">
                <h3 className="effect-name">{effect.name}</h3>
                <p className="effect-description">{effect.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AtmosphericEffects
