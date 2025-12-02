import { LauncherContainer, OSCard, OSGrid, OSIntroHeader } from '@/components/os/launcher'

export default function OSLauncherPage() {
  return (
    <LauncherContainer>
      <OSIntroHeader />

      <OSGrid>
        <OSCard
          os="core"
          title="Core OS"
          subtitle="mission control for the constellation"
          preview="core"
        />
        <OSCard
          os="studio"
          title="Loop Studio"
          subtitle="your creative loop constellation"
          preview="studio"
        />
        <OSCard os="ascii" title="ASCII OS" subtitle="minimal terminal workspace" preview="ascii" />
        <OSCard os="xp" title="XP OS" subtitle="retro desktop environment" preview="xp" />
        <OSCard os="aqua" title="Aqua OS" subtitle="cinematic glass workspace" preview="aqua" />
        <OSCard
          os="daw"
          title="DAW OS"
          subtitle="timeline-based creative interface"
          preview="daw"
        />
        <OSCard
          os="analogue"
          title="Analogue OS"
          subtitle="paper, cards, notebook thinking"
          preview="analogue"
        />
      </OSGrid>
    </LauncherContainer>
  )
}
