# ICP Personas — totalaud.io

**Purpose**: Realistic customer profiles for understanding how indie artists would use totalaud.io
**Last Updated**: December 2025

---

## Testing System

These personas are implemented as automated testing agents. See `apps/aud-web/tests/personas/` for:

```bash
# Run all persona tests
pnpm test:personas

# Run specific persona (e.g., Maya)
pnpm test:persona "Maya"

# Seed realistic content for demos
pnpm seed:persona maya

# Seed all personas
pnpm seed:personas

# Generate localStorage data (no Supabase needed)
pnpm seed:persona --local maya
```

**Files:**

- `personas.ts` — Persona definitions and data factories
- `scenario-runner.ts` — Scenario execution engine
- `persona-tests.spec.ts` — Playwright test specs
- `report-generator.ts` — Session report generation
- `seed-content.ts` — Content seeding utilities

---

## Persona 1: Maya Chen — The Bedroom Producer

### Demographics
- **Age**: 24
- **Location**: Bristol, UK
- **Genre**: Lo-fi / Ambient Electronic
- **Monthly Listeners**: ~2,400 Spotify
- **Release History**: 3 EPs, 12 singles over 2 years
- **Day Job**: Part-time barista, freelance graphic design
- **Budget**: £50-100/month for music promotion

### Situation
Maya makes all her music in her bedroom with Ableton and a MIDI keyboard. She's got a small but engaged audience who found her through a lo-fi playlist placement 18 months ago. Since then, she's been releasing consistently but growth has plateaued. She knows she needs to do more promo but doesn't know where to start.

### Current Pain Points
- Has a Notes app full of random ideas (release concepts, playlist names she's seen, promo tactics someone mentioned on Twitter)
- Tried Groover twice — spent £40, got generic feedback, no placements
- Doesn't know which blogs/playlists actually accept submissions
- Writes terrible artist bios ("I make music that sounds like feelings")
- Releases drop with no plan — just "upload and hope"

### How She'd Use totalaud.io

**Ideas Mode**:
```
Cards she'd create:
- "EP concept: sounds of my commute (field recordings + beats)"
- "Collab idea: reach out to that vocalist from Manchester"
- "Promo tactic: behind-the-scenes reels of production process"
- "Visual aesthetic: 35mm film grain, muted colours"
- "Title idea: 'platform 3' for the train station track"
```
*She'd use this daily, adding ideas from her phone on the bus.*

**Scout Mode**:
```
Filters she'd use:
- Genre: electronic, ambient, lo-fi
- Type: Spotify playlist, blog
- Audience size: small-medium (she knows big ones won't reply)

Opportunities she'd save:
- "Ambient Nights" playlist (12k followers, accepts DMs)
- "The Quietus" blog (longshot but dream placement)
- "Late Night Lo-Fi" curator on Instagram
```
*She'd check this weekly before a release.*

**Timeline Mode**:
```
Her release plan for new single "Platform 3":
- Week -4: Finish master, submit to DistroKid
- Week -3: Teaser clip for Instagram
- Week -2: Submit to 5 playlists from Scout
- Week -1: Share pre-save link
- Week 0: Release day — stories, posts
- Week +1: Follow up with curators, thank anyone who added
- Week +2: Behind-the-scenes video
```
*Finally having a visible plan would reduce her anxiety massively.*

**Pitch Mode**:
```
What she'd ask for help with:
- "Write a bio that doesn't sound cringe"
- "Describe my sound for a playlist pitch"
- "Help me write a submission email to The Quietus"

Output she'd actually use:
"Maya Chen crafts intimate electronic soundscapes from her Bristol
bedroom — blending field recordings, hazy synths, and beats that
feel like 3am train journeys. Her music sits somewhere between
Tycho and Burial, made for headphones and late nights."
```

### Why She'd Pay
£5/month Starter tier. She's already spending money on DistroKid (£20/year), Splice (£15/month), and occasionally Groover. A tool that actually helped her get organised and find real opportunities would be worth it.

### Success Metrics for Maya
- Saves 10+ ideas in first week
- Finds 5 relevant playlists she didn't know existed
- Creates her first release plan
- Gets a bio she's actually proud of
- Returns 3+ times per week

---

## Persona 2: Marcus Thompson — The Hip-Hop Artist with Momentum

### Demographics
- **Age**: 28
- **Location**: Birmingham, UK
- **Genre**: UK Hip-Hop / Grime
- **Monthly Listeners**: ~18,000 Spotify
- **Release History**: 2 mixtapes, 20+ singles
- **Day Job**: None (music full-time, supplemented by features/sessions)
- **Budget**: £200-400/month for promotion

### Situation
Marcus is at a critical point. He's got real momentum — his last single got Radio 1Xtra play and he's been featured on a few major playlists. But he's doing everything himself and it's chaotic. He's got DMs from small labels but doesn't know if they're legit. He needs to level up his strategy or he'll burn out.

### Current Pain Points
- Managing promo across WhatsApp notes, Voice memos, Instagram saves, and random Google Docs
- Gets approached by "promoters" but can't tell real from scam
- Knows he needs radio pluggers but can't afford £3k/month
- His team is just him and his mate who does visuals
- Release strategy is "drop on Friday, pray for the algorithm"
- Bio still says he's "hungry" and "on the come up" (been saying that for 3 years)

### How He'd Use totalaud.io

**Ideas Mode**:
```
Cards he'd create:
- "Link up with [Producer name] — his beats on that Headie track were cold"
- "Music video concept: one-take through the Bullring"
- "Freestyle series idea: 60 seconds every Sunday"
- "Merch drop with release — limited hoodies"
- "Get on SBTV / GRM Daily — research who to contact"
- "Feature wishlist: [5 artists he wants to work with]"
```
*He'd brain-dump everything here instead of scattered notes.*

**Scout Mode**:
```
Filters he'd use:
- Genre: hip-hop, grime, UK rap
- Type: radio, playlist, blog, press
- Audience: medium-large (he's past small playlists now)

Opportunities he'd save:
- BBC Radio 1Xtra shows (specific DJs)
- Clash Magazine (UK hip-hop coverage)
- "Rap Caviar UK" playlist submission process
- LinkUp TV opportunities
- Complex UK features
```
*He needs bigger opportunities and would use this to track who he's contacted.*

**Timeline Mode**:
```
His album rollout plan:
- Month -3: Single 1 + video drop
- Month -2: Single 2 + radio push begins
- Month -1: Single 3 + album pre-order live
- Month 0: Album drop + launch party
- Month +1: Press run + features
- Month +2: Second wave promo + deluxe/remix
```
*He'd finally see his 6-month strategy laid out clearly.*

**Pitch Mode**:
```
What he'd ask for help with:
- "Rewrite my bio — I've levelled up since the old one"
- "Write a press release template for my album"
- "Help me describe my sound without saying 'authentic UK hip-hop'"

Output he'd use:
"Marcus Thompson is the Birmingham voice that won't be ignored.
From council estates to Radio 1Xtra airplay, his bars cut through
with raw honesty and production that bridges grime's aggression
with soulful UK hip-hop. Two mixtapes deep with co-signs from
[notable artists], he's building something that matters."
```

### Why He'd Pay
£19/month Pro tier without hesitation. He's already spending on studio time, visuals, and occasionally PR. A tool that helps him stay organised and strategic is cheaper than one bad decision or missed opportunity.

### Success Metrics for Marcus
- Consolidates all his scattered notes into Ideas Mode
- Finds radio contacts he didn't have
- Creates a proper album rollout plan
- Gets a bio that reflects his current level
- Uses Timeline to stay accountable to his plan

---

## Persona 3: Sarah & James — The Indie Folk Duo

### Demographics
- **Ages**: Both 31
- **Location**: Edinburgh, UK
- **Genre**: Indie Folk / Acoustic
- **Monthly Listeners**: ~8,500 Spotify
- **Release History**: 1 album, 8 singles over 4 years
- **Day Jobs**: Sarah teaches primary school, James is a nurse (shift work)
- **Budget**: £100/month combined

### Situation
They've been making music together since university but life keeps getting in the way. They can only record on weekends when their schedules align. They've got a loyal local following and their one album did well in folk circles, but they struggle to promote consistently. Sarah handles most of the admin but resents that it takes time from songwriting.

### Current Pain Points
- Coordinating between two people's calendars is a nightmare
- Neither knows anything about digital marketing
- They submitted to BBC Radio 2 folk show once and never heard back
- Their music suits sync licensing but they don't know how to approach it
- Last release plan was a shared Google Doc that neither updated
- Press bio was written 3 years ago and mentions venues that have closed

### How They'd Use totalaud.io

**Ideas Mode**:
```
Cards they'd create:
- "Song idea: harmonies based on that hymn from James's nan's funeral"
- "EP theme: songs about Scottish landscapes"
- "Gig opportunity: that new folk club in Leith"
- "Sync angle: our music would suit period dramas"
- "Collab idea: reach out to that fiddle player from the festival"
- "Cover idea: do a folk version of a modern song for TikTok"
```
*They'd both add ideas independently then review together.*

**Scout Mode**:
```
Filters they'd use:
- Genre: folk, acoustic, indie
- Type: radio, playlist, sync, blog
- Audience: any (they're realistic about their niche)

Opportunities they'd save:
- BBC Radio 2 Folk Show (proper submission process)
- Folk Radio UK
- "Acoustic Covers" playlist (good for discovery)
- Sync agencies that represent indie artists
- Folk festival submission deadlines
```
*They'd particularly value the sync and radio opportunities.*

**Timeline Mode**:
```
Their EP release plan:
- Month -6: Finish recording
- Month -5: Mixing/mastering
- Month -4: Photos, artwork, EPK
- Month -3: Submit to radio (folk shows have long lead times)
- Month -2: Sync agency submissions
- Month -1: Press outreach
- Month 0: Release
- Month +1-3: Gig the EP locally
```
*Long lead times mean they need a plan they can actually see.*

**Pitch Mode**:
```
What they'd ask for help with:
- "Update our bio — we're not 'emerging' anymore"
- "Write a folk radio submission that mentions our Scottish connection"
- "Help us pitch to sync agencies"

Output they'd use:
"Sarah & James have been weaving close harmonies and gentle
guitar since 2018 — their sound echoes the Scottish landscape
they call home. With an album praised by Folk Radio UK and
live performances that sell out Edinburgh's intimate venues,
they craft songs for Sunday mornings and long drives north.
Their music has found homes in podcasts and short films,
with sync representation from [agency name]."
```

### Why They'd Pay
£5/month Starter tier initially, upgrade to Pro when preparing for release. They're careful with money but the organisation alone would be worth it. James would insist on the export feature for their shared planning.

### Success Metrics for Sarah & James
- Both add ideas independently throughout the week
- Find sync opportunities they didn't know existed
- Create a shared release timeline they both stick to
- Update their bio after 3 years
- Actually submit to BBC Radio 2 properly this time

---

## Persona 4: Dev Patel — The Electronic Producer Going Full-Time

### Demographics
- **Age**: 26
- **Location**: Manchester, UK
- **Genre**: House / Tech House
- **Monthly Listeners**: ~45,000 Spotify
- **Release History**: 30+ tracks on various labels
- **Day Job**: Just quit his software developer job to go full-time
- **Budget**: £500/month (using savings strategically)

### Situation
Dev has been producing house music for 5 years while working as a developer. He's had releases on decent labels and gets booked for club nights regularly. He just quit his day job to go full-time and needs to be strategic about building his brand. He's technical and organised but knows marketing isn't his strength.

### Current Pain Points
- Has tracks on 8 different labels but no unified artist presence
- Gets lost in the "release and move on" cycle — no real promo strategy
- Doesn't have an artist story beyond "I make house music"
- Knows he should be on Beatport but doesn't understand the editorial process
- His booking enquiries come through random DMs and he loses track
- Compares himself to peers who seem to have PR teams

### How He'd Use totalaud.io

**Ideas Mode**:
```
Cards he'd create:
- "Sample pack idea: South Asian percussion for house producers"
- "Mix series: monthly 1-hour mixes for SoundCloud"
- "Collab target list: [10 producers he respects]"
- "Studio livestream setup — Twitch?"
- "Remix contest to build email list"
- "Heritage angle: incorporate more tabla/Indian elements"
- "DJ set at [festival] — need promo plan for it"
```
*He'd use this to collect all the ideas he has while producing.*

**Scout Mode**:
```
Filters he'd use:
- Genre: house, tech house, electronic
- Type: radio, playlist, blog, label
- Audience: medium-large

Opportunities he'd save:
- Beatport editorial contacts
- Mixmag features/premieres
- Resident Advisor listings
- DJ Mag reviews
- BBC Radio 1 Dance shows
- Key Ibiza-focused playlists
```
*He needs to understand the dance music press landscape.*

**Timeline Mode**:
```
His Q1 strategy:
- January: Finish EP, sign to label
- February: Premiere on Mixmag, radio servicing
- March: EP release, club tour dates
- April: DJ Mag review, festival submissions
```
*He thinks in quarters now that music is his business.*

**Pitch Mode**:
```
What he'd ask for help with:
- "Write a bio that mentions my South Asian background authentically"
- "Help me pitch to Mixmag for a premiere"
- "Write a festival submission that stands out"

Output he'd use:
"Dev Patel brings Manchester's warehouse energy and South Asian
rhythmic DNA to the dancefloor. A coder-turned-producer who traded
startup life for studio sessions, his tech house cuts have found
homes on [label names] and sound systems from Printworks to
Ibiza. Now full-time in the game, he's building something that
merges heritage with four-to-the-floor in ways the scene hasn't
heard yet."
```

### Why He'd Pay
£19/month Pro tier immediately. He's investing his savings strategically and this is a business expense. The export feature matters because he needs to share plans with his manager (who he's hoping to get soon).

### Success Metrics for Dev
- Organises his scattered business ideas
- Understands the dance music press landscape
- Creates quarterly promo plans
- Develops an artist narrative beyond "house producer"
- Tracks who he's pitched and when

---

## Persona 5: Chloe Williams — The Singer-Songwriter Just Starting Out

### Demographics
- **Age**: 19
- **Location**: Cardiff, UK
- **Genre**: Singer-Songwriter / Pop
- **Monthly Listeners**: ~400 Spotify
- **Release History**: 2 singles (first was a cover)
- **Status**: First year music student
- **Budget**: £30/month (student budget)

### Situation
Chloe started posting covers on TikTok during sixth form and got enough encouragement to start writing originals. She's studying music production at university and released her first original single last month. She's completely new to the industry and overwhelmed by how much there is to learn.

### Current Pain Points
- Doesn't know what she doesn't know
- Every "music marketing" YouTube video says something different
- Spent £15 on a Spotify playlist placement scam
- Has ideas everywhere — Notes, Notion, scraps of paper
- No idea how to write a bio (has never had to describe herself)
- Thinks she needs to do everything (TikTok, YouTube, Instagram, Twitter, Spotify, Apple Music...)

### How She'd Use totalaud.io

**Ideas Mode**:
```
Cards she'd create:
- "Song idea: about that argument with my flatmate"
- "Cover idea: slowed down version of Olivia Rodrigo song"
- "Aesthetic: cottagecore but make it Welsh"
- "Learn: how to use a compressor properly"
- "Uni module project: music video for my single"
- "Ask: that second-year who got playlist placement how they did it"
```
*She'd love the simple, unintimidating interface.*

**Scout Mode**:
```
Filters she'd use:
- Genre: pop, singer-songwriter, acoustic
- Type: playlist, blog
- Audience: small (realistic starting point)

Opportunities she'd save:
- "Bedroom Pop" playlists with under 5k followers
- University radio stations
- Student music blogs
- "New Music Friday UK" (dream goal, but good to know it exists)
```
*She needs to learn what opportunities even exist.*

**Timeline Mode**:
```
Her first proper release plan:
- Week -3: Finish song, get feedback from tutor
- Week -2: Record final version, mix
- Week -1: Upload to DistroKid, create artwork
- Week 0: Release day — post everywhere
- Week +1: Thank everyone who listened, post BTS
```
*Simple, achievable, not overwhelming.*

**Pitch Mode**:
```
What she'd ask for help with:
- "Help me write my first ever bio"
- "How do I describe my sound when I don't know what it is yet?"
- "Write something for my Instagram bio"

Output she'd use:
"Chloe Williams writes songs in her Cardiff bedroom about the
small stuff that feels massive at 19 — flatmate drama, missed
calls, and learning who you're becoming. Her acoustic pop sits
somewhere between Phoebe Bridgers and Holly Humberstone,
honest and unhurried."
```

### Why She'd Pay
£5/month Starter tier — it's less than two drinks at the student union. She'd value feeling like a "real artist" with proper tools, not just someone posting covers. The guided nature of the app would help her learn what she should be doing.

### Success Metrics for Chloe
- Feels less overwhelmed within first session
- Discovers opportunities appropriate for her level
- Creates her first release plan (ever)
- Gets a bio she's proud to use
- Returns regularly to add ideas

---

## Summary: ICP Tiers

### Starter Tier (£5/month) — Primary ICP
**Maya, Sarah & James, Chloe**
- Independent artists with limited budgets
- Need organisation more than unlimited features
- Value the calm, non-overwhelming UX
- Would upgrade for a specific release campaign

### Pro Tier (£19/month) — Growth ICP
**Marcus, Dev**
- Artists with momentum who need strategy
- Music is primary focus (approaching or at full-time)
- Need unlimited access during active campaigns
- Value export and tracking features
- Would pay annually to save

---

## How These Personas Inform Product

### Ideas Mode
- Must work on mobile (Maya on the bus, Marcus in the studio)
- Simple enough for Chloe, powerful enough for Dev
- Tags/colours for organisation (Sarah & James coordinating)

### Scout Mode
- Needs opportunities at ALL levels (Chloe's small playlists to Marcus's Radio 1Xtra)
- Genre coverage must include: electronic, hip-hop, folk, pop, house
- "Audience size" filter is crucial for matching to stage

### Timeline Mode
- Must support long lead times (Sarah & James's 6-month folk radio timeline)
- Must support short sprints (Dev's quarterly business planning)
- "Next steps" view for Marcus staying accountable

### Pitch Mode
- Bio help is universal — every persona mentioned it
- Must handle "I don't know my sound yet" (Chloe)
- Must handle "I've levelled up, update my story" (Marcus)
- Export to clipboard is essential for all

---

*These personas should be referenced when designing features, writing copy, and prioritising roadmap items.*
