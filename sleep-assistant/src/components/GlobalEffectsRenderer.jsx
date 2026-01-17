import './AtmosphericEffects.css'

const GlobalEffectsRenderer = ({ activeEffect }) => {
  if (!activeEffect) return null

  const renderEffect = () => {
    switch (activeEffect) {
      case 'rain':
        return (
          <div className="effect-overlay rain-lighting">
            {/* Dynamic ambient lighting with intensity variations */}
            <div className="ambient-lighting rain-ambient rain-base" />
            <div className="ambient-lighting rain-ambient rain-intensity" />
            {/* Screen glow with water reflection effect */}
            <div className="screen-glow rain-glow" />
            {/* Water reflection overlay */}
            <div className="rain-reflection-overlay" />
            {/* Heavy rain particles */}
            {Array.from({ length: 80 }, (_, i) => (
              <div
                key={`heavy-${i}`}
                className="rain-particle rain-heavy"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 1.2}s`,
                }}
              />
            ))}
            {/* Light rain particles */}
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={`light-${i}`}
                className="rain-particle rain-light"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                }}
              />
            ))}
            {/* Rain splash effects */}
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={`splash-${i}`}
                className="rain-splash"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )

      case 'snow':
        return (
          <div className="effect-overlay snow-lighting">
            {/* Dynamic moonlight with intensity variations */}
            <div className="ambient-lighting snow-ambient snow-base" />
            <div className="ambient-lighting snow-ambient snow-intensity" />
            {/* Cool blue screen glow with shimmer */}
            <div className="screen-glow snow-glow" />
            {/* Snow accumulation overlay */}
            <div className="snow-accumulation" />
            {/* Heavy snowflakes */}
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={`heavy-${i}`}
                className="snow-particle snow-heavy"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 3}s`,
                  fontSize: `${10 + Math.random() * 8}px`,
                }}
              >
                ❄
              </div>
            ))}
            {/* Light snowflakes */}
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={`light-${i}`}
                className="snow-particle snow-light"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${8 + Math.random() * 6}s`,
                  fontSize: `${6 + Math.random() * 4}px`,
                }}
              >
                ❅
              </div>
            ))}
            {/* Wind-blown snow */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={`wind-${i}`}
                className="snow-particle snow-wind"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${5 + Math.random() * 4}s`,
                  fontSize: `${4 + Math.random() * 3}px`,
                }}
              >
                ❄
              </div>
            ))}
          </div>
        )

      case 'lightning':
        return (
          <div className="effect-overlay lightning-lighting">
            {/* Dark storm ambient lighting */}
            <div className="ambient-lighting storm-ambient" />
            {/* Multiple dynamic lightning bolts */}
            <div className="lightning-bolt lightning-bolt-main" />
            <div className="lightning-bolt lightning-bolt-secondary" />
            <div className="lightning-bolt lightning-bolt-tertiary" />
            {/* Lightning flash illumination */}
            <div className="lightning-flash-lighting" />
            {/* Screen flash effect */}
            <div className="screen-glow lightning-glow" />
            {/* Moving storm clouds */}
            <div className="storm-clouds-moving" />
            {/* Dynamic rain particles */}
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="lightning-rain-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              />
            ))}
            {/* Subtle storm atmosphere */}
            <div className="storm-atmosphere" />
          </div>
        )

      case 'campfire':
        return (
          <div className="effect-overlay campfire-lighting">
            {/* Multiple flame layers for depth */}
            <div className="ambient-lighting fire-ambient fire-base" />
            <div className="ambient-lighting fire-ambient fire-mid" />
            <div className="ambient-lighting fire-ambient fire-top" />
            {/* Dynamic screen glow */}
            <div className="screen-glow fire-glow" />
            {/* Multiple flicker overlays */}
            <div className="fire-flicker-overlay fire-flicker-main" />
            <div className="fire-flicker-overlay fire-flicker-secondary" />
            {/* Fire sparks */}
            {Array.from({ length: 25 }, (_, i) => (
              <div
                key={`spark-${i}`}
                className="fire-spark"
                style={{
                  left: `${35 + Math.random() * 30}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${2 + Math.random() * 4}s`,
                }}
              />
            ))}
            {/* Enhanced embers */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={`ember-${i}`}
                className="ember-particle"
                style={{
                  left: `${38 + Math.random() * 24}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${3 + Math.random() * 5}s`,
                }}
              />
            ))}
            {/* Fire core glow */}
            <div className="fire-core-glow" />
          </div>
        )

      case 'storm':
        return (
          <div className="effect-overlay storm-lighting">
            {/* Dynamic storm ambient lighting */}
            <div className="ambient-lighting storm-ambient storm-base" />
            <div className="ambient-lighting storm-ambient storm-intensity" />
            {/* Lightning flash illumination */}
            <div className="lightning-flash-lighting" />
            {/* Screen flash effect */}
            <div className="screen-glow lightning-glow" />
            {/* Storm atmosphere with movement */}
            <div className="storm-atmosphere" />
            {/* Storm rain particles */}
            {Array.from({ length: 100 }, (_, i) => (
              <div
                key={`storm-rain-${i}`}
                className="storm-rain-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${0.3 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        )

      case 'wind':
        return (
          <div className="effect-overlay wind-lighting">
            {/* Dynamic wind ambient lighting */}
            <div className="ambient-lighting wind-ambient wind-base" />
            <div className="ambient-lighting wind-ambient wind-flow" />
            {/* Subtle screen glow with movement */}
            <div className="screen-glow wind-glow" />
            {/* Wind light patterns */}
            <div className="wind-light-patterns" />
            {/* Wind particles */}
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={`wind-${i}`}
                className="wind-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return renderEffect()
}

export default GlobalEffectsRenderer