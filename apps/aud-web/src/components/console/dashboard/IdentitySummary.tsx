import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface IdentitySummaryProps {
  identity: {
    brandVoice: {
      tone: string
      themes: string[]
    }
    sceneIdentity: {
      primaryScene: string
    }
    microgenreMap: {
      primary: string
      secondary: string[]
    }
  }
}

export function IdentitySummary({ identity }: IdentitySummaryProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">identity profile</h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">brand voice</p>
          <p className="text-sm text-tap-white lowercase">{identity.brandVoice.tone}</p>
        </div>

        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">primary scene</p>
          <Badge variant="info">{identity.sceneIdentity.primaryScene}</Badge>
        </div>

        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">microgenres</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{identity.microgenreMap.primary}</Badge>
            {identity.microgenreMap.secondary.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="default" size="sm">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-tap-panel/30">
          <a
            href="/identity"
            className="text-xs text-tap-cyan hover:text-tap-cyan/80 lowercase transition-colors duration-180"
          >
            view full identity profile →
          </a>
        </div>
      </div>
    </Card>
  )
}
