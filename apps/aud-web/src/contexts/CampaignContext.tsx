'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export interface Campaign {
  id: string
  release: string
  artist: string
  genre: string
  goals: string
  createdAt: string
  status: 'planning' | 'active' | 'tracking' | 'completed'
}

interface CampaignContextValue {
  activeCampaign: Campaign | null
  setActiveCampaign: (campaign: Campaign | null) => void
  campaigns: Campaign[]
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  removeCampaign: (id: string) => void
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [...prev, campaign])
    setActiveCampaign(campaign) // Auto-select newly created campaign
  }

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((campaign) => (campaign.id === id ? { ...campaign, ...updates } : campaign))
    )
    if (activeCampaign?.id === id) {
      setActiveCampaign((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const removeCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id))
    if (activeCampaign?.id === id) {
      setActiveCampaign(null)
    }
  }

  return (
    <CampaignContext.Provider
      value={{
        activeCampaign,
        setActiveCampaign,
        campaigns,
        addCampaign,
        updateCampaign,
        removeCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider')
  }
  return context
}
