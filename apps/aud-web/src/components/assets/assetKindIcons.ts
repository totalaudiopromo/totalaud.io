import type { LucideIcon } from 'lucide-react'
import { FileArchive, FileAudio2, FileImage, FileText, Link2, Paperclip } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  audio: FileAudio2,
  image: FileImage,
  document: FileText,
  archive: FileArchive,
  link: Link2,
  other: Paperclip,
}

export function getAssetKindIcon(kind: string): LucideIcon {
  return iconMap[kind] ?? Paperclip
}

