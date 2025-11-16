// TAP Console Integration Types

export interface TAPTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  assigned_to?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface TAPCreativeRef {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'link'
  title: string
  url: string
  description?: string
  tags?: string[]
  created_at: string
}

export interface TAPCampaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  start_date?: string
  end_date?: string
  goals?: string[]
  created_at: string
  updated_at: string
}

// TAP Audio Intel Integration Types

export interface TAPAudienceInsight {
  id: string
  artist_name: string
  genre: string
  demographics: {
    age_range: string
    locations: string[]
    gender_split: Record<string, number>
  }
  listening_habits: {
    platforms: Record<string, number>
    peak_times: string[]
    discovery_methods: string[]
  }
  recommendations: {
    blogs: TAPRecommendation[]
    radio_stations: TAPRecommendation[]
    playlists: TAPRecommendation[]
  }
  generated_at: string
}

export interface TAPRecommendation {
  name: string
  type: 'blog' | 'radio' | 'playlist'
  url?: string
  contact?: string
  reach: number
  relevance_score: number
  notes?: string
}

// TAP Tracker Integration Types

export interface TAPSubmission {
  id: string
  target_name: string
  target_type: 'blog' | 'radio' | 'playlist' | 'press' | 'other'
  status: 'draft' | 'pending' | 'submitted' | 'accepted' | 'rejected' | 'follow_up'
  pitch_angle: string
  contact_email?: string
  contact_name?: string
  submitted_at?: string
  response_received_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TAPFollowUp {
  id: string
  submission_id: string
  scheduled_date: string
  completed: boolean
  notes?: string
  created_at: string
}

// TAP Pitch Integration Types

export interface TAPPressRelease {
  id: string
  title: string
  content: string
  artist_name: string
  release_date?: string
  quotes?: string[]
  links?: string[]
  generated_at: string
}

export interface TAPEPKCopy {
  id: string
  artist_name: string
  bio: string
  highlights: string[]
  press_quotes?: string[]
  achievements?: string[]
  links: {
    website?: string
    spotify?: string
    instagram?: string
    youtube?: string
  }
  generated_at: string
}

export interface TAPPluggerBrief {
  id: string
  artist_name: string
  track_title: string
  genre: string
  key_selling_points: string[]
  target_audience: string
  similar_artists: string[]
  radio_hooks: string[]
  generated_at: string
}
