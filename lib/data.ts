// ── Market Baseline (as of week of 14 Mar 2026) ──────────────────────────────
export const marketBaseline = {
  date: "14 Mar 2026",
  nifty50: { value: 22_486, change: -0.38 },
  niftyMidcap100: { value: 48_920, change: +0.52 },
  brentCrude: { value: 74.6, change: -1.2 },
  inrUsd: { value: 83.42, change: +0.08 },
  gsec10y: { value: 6.74, change: -0.03 },
}

// ── Event Alert Cards (Part 1) ────────────────────────────────────────────────
export type AlertSeverity = "high" | "medium" | "low"

export interface AlertCard {
  id: string
  title: string
  source: string
  sourceUrl: string
  date: string
  what: string
  implication: string
  stocks: string[]
  timeframe: string
  risk: string
  severity: AlertSeverity
}

export const alertCards: AlertCard[] = [
  {
    id: "alert-1",
    title: "US Fed Holds Rates at 4.25–4.50%; Signals Two Cuts in 2026",
    source: "Federal Reserve Press Release",
    sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    date: "19 Mar 2026",
    what:
      "The FOMC voted unanimously to hold the federal funds rate at 4.25–4.50% at its March meeting. The dot plot signals two 25 bps cuts in 2026 H2, contingent on US CPI sustaining below 2.8%. Chair Powell cited resilient labour markets but flagged tariff-driven price pressures.",
    implication:
      "A 'higher for longer' US rate path keeps the DXY elevated near 104, limiting RBI's room for aggressive cuts. FII equity inflows into EMs may stay muted in Q1. However, two eventual cuts in H2 2026 are a medium-term tailwind for rate-sensitive Indian sectors — Banking, Housing Finance, and Infrastructure.",
    stocks: ["HDFC BANK", "LICHSGFIN", "BHARATFORG"],
    timeframe: "6–9 months",
    risk:
      "US inflation re-accelerates above 3.2% forcing the Fed to pause cuts, strengthening the DXY further and causing sustained FII outflows from Indian equities.",
    severity: "high",
  },
  {
    id: "alert-2",
    title: "Brent Crude Drops to $74/bbl on IEA Demand Downgrade",
    source: "IEA Oil Market Report, March 2026",
    sourceUrl: "https://www.iea.org/reports/oil-market-report-march-2026",
    date: "13 Mar 2026",
    what:
      "The IEA cut its 2026 global oil demand growth forecast by 200 kb/d to 0.9 mb/d on weaker China industrial activity and US growth uncertainty. Brent fell to $74.6/bbl, a four-month low. OPEC+ has signalled it will hold current production levels through June 2026.",
    implication:
      "Lower crude directly benefits India's import bill (~$9bn annual saving per $10/bbl decline) and compresses inflation. Positive for OMCs (better marketing margins), Aviation (lower ATF costs), and paint companies (lower feedstock). Negative for ONGC/Oil India on realisations.",
    stocks: ["BPCL", "INDIGO", "ASIANPAINT"],
    timeframe: "3–6 months",
    risk:
      "OPEC+ surprise production cut or Middle East escalation pushes Brent back above $85/bbl, reversing the thesis for OMCs and aviation.",
    severity: "medium",
  },
  {
    id: "alert-3",
    title: "MoD Clears ₹1.05 Lakh Crore Defence Capex for FY27",
    source: "PIB India — Ministry of Defence",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    date: "11 Mar 2026",
    what:
      "The Ministry of Defence approved a ₹1.05 lakh crore capital outlay for FY27, up 12.5% YoY. 75% is reserved for domestic procurement under the 'Atmanirbhar Bharat' policy. Key categories include fighter jet components, naval vessels, missile systems, and military electronics.",
    implication:
      "Sustained domestic defence orders underpin multi-year revenue visibility for Indian defence manufacturers. HAL, BEL, and Bharat Forge with artillery/armoured vehicle exposure are direct beneficiaries. The 75% domestic sourcing mandate reduces import dependence and expands the addressable order book for Indian defence PSUs and private players.",
    stocks: ["HAL", "BEL", "BHEL"],
    timeframe: "9–12 months",
    risk:
      "Order execution delays, bureaucratic procurement timelines, or a surprise budget cut to defence capex in the FY27 revised estimates.",
    severity: "high",
  },
]

// ── Macro Pulse ───────────────────────────────────────────────────────────────
export interface MacroBullet {
  icon: string
  text: string
  source: string
}

export const macroPulse: MacroBullet[] = [
  {
    icon: "rate",
    text: "RBI held repo rate at 6.25% in its February 2026 MPC meeting (minutes released 21 Feb). Governor Das signalled a potential 25 bps cut in April if CPI tracks below 4.5% through March.",
    source: "RBI MPC Minutes, Feb 2026 — rbi.org.in",
  },
  {
    icon: "fii",
    text: "FIIs sold ₹14,620 crore in Indian equities in the week of 10–14 Mar 2026 (NSE data). YTD FII outflows stand at ₹82,400 crore — a headwind for large-cap valuations but a potential reversal catalyst if the Fed pivots.",
    source: "NSE India Weekly FII/DII Data — nseindia.com",
  },
  {
    icon: "crude",
    text: "India's February 2026 CPI printed at 4.26% (MoM: down from 4.49% in Jan). Core CPI ex-food-and-fuel eased to 3.8%, the lowest in 18 months, supporting the case for RBI rate cuts.",
    source: "MoSPI CPI Release, 12 Mar 2026 — mospi.gov.in",
  },
  {
    icon: "gst",
    text: "February 2026 GST collections came in at ₹1.83 lakh crore, up 11.4% YoY — the third consecutive month above ₹1.8 lakh crore. Signals robust consumption and formalisation of the economy.",
    source: "Ministry of Finance GST Release, 01 Mar 2026 — pib.gov.in",
  },
  {
    icon: "capex",
    text: "Government capital expenditure for Apr–Jan FY26 stood at ₹7.8 lakh crore, representing 72% of the full-year budget estimate of ₹10.18 lakh crore — broadly on track for a record infrastructure spending year.",
    source: "Controller General of Accounts, Feb 2026 — cga.nic.in",
  },
]

// ── Sector Rankings ───────────────────────────────────────────────────────────
export interface SectorRanking {
  rank: number
  sector: string
  rating: "Overweight" | "Neutral" | "Underweight"
  rationale: string
}

export const sectorRankings: SectorRanking[] = [
  {
    rank: 1,
    sector: "Defence",
    rating: "Overweight",
    rationale:
      "Record ₹1.05L cr FY27 MoD capex + 75% domestic sourcing mandate drives multi-year revenue visibility for HAL, BEL, Bharat Forge.",
  },
  {
    rank: 2,
    sector: "Pharma",
    rating: "Overweight",
    rationale:
      "Three USFDA facility approvals for Indian cos in Feb–Mar 2026; US generics pricing stable; currency depreciation (weak INR) boosts export realisations.",
  },
  {
    rank: 3,
    sector: "Banking",
    rating: "Overweight",
    rationale:
      "Credit growth at 14.2% YoY (RBI, Mar 2026); GNPA ratios at decade lows; RBI rate cut cycle beginning — positive for NIMs reversal in H2 FY27.",
  },
  {
    rank: 4,
    sector: "Infrastructure",
    rating: "Overweight",
    rationale:
      "Govt capex at 72% of BE with ₹2.4L cr unspent — front-loading expected in Q4 FY26. Order books at record highs for L&T, IRB, KNR Constructions.",
  },
  {
    rank: 5,
    sector: "Energy",
    rating: "Neutral",
    rationale:
      "Lower Brent ($74) helps OMCs but pressures upstream (ONGC). Solar/wind tenders accelerating but H2 FY27 risk from renewable tariff revision.",
  },
  {
    rank: 6,
    sector: "Auto",
    rating: "Neutral",
    rationale:
      "2W volume recovery solid (Feb sales +8% YoY) but PV segment facing high-base effect. EV penetration uncertainty a structural wildcard.",
  },
  {
    rank: 7,
    sector: "FMCG",
    rating: "Neutral",
    rationale:
      "Rural demand recovering (rabi output +4% YoY) but urban slowdown persists. Input cost relief from lower crude offsets volume pressure.",
  },
  {
    rank: 8,
    sector: "IT",
    rating: "Underweight",
    rationale:
      "US tech discretionary spending cautious; TCS deal wins soft in Q3 FY26; INR depreciation partially offsets headcount cost. Re-rating needs US capex revival signal.",
  },
]

// ── Stock Picks ───────────────────────────────────────────────────────────────
export type PickStatus = "New" | "Hold" | "On Track" | "Exit" | "Revise Target"

export interface StockPick {
  id: string
  company: string
  ticker: string
  sector: string
  capCategory: "Large-cap" | "Mid-cap"
  cmp: number
  cmDate: string
  target: number
  targetMonths: number
  stopLoss: number
  thesis: string
  evidence: { headline: string; url: string }[]
  risks: string[]
  reviewTrigger: string
  valuationBasis: string
  flags: string[]
  status: PickStatus
}

export const stockPicks: StockPick[] = [
  {
    id: "pick-1",
    company: "HAL",
    ticker: "HAL",
    sector: "Defence",
    capCategory: "Large-cap",
    cmp: 3_860,
    cmDate: "14 Mar 2026",
    target: 4_800,
    targetMonths: 9,
    stopLoss: 3_350,
    thesis:
      "HAL is the primary beneficiary of the MoD's ₹1.05 lakh crore FY27 defence capex, with an existing order book of ~₹94,000 crore (4x revenue). The government's 75% domestic procurement mandate structurally expands HAL's addressable market across LCA Tejas Mk1A (83 aircraft order), helicopters (ALH), and aero-engine MRO. With EBITDA margins expanding to 24%+ as complex platforms mature, a P/E re-rating from 30x to 38x on FY27E EPS of ₹127 supports the target.",
    evidence: [
      {
        headline: "MoD approves ₹1.05 lakh crore defence capex for FY27",
        url: "https://pib.gov.in/PressReleasePage.aspx",
      },
      {
        headline: "HAL Q3 FY26 results: Revenue ₹6,960 crore, PAT ₹1,451 crore — beats estimates",
        url: "https://www.bseindia.com/corporates/annDetNew.aspx",
      },
      {
        headline: "Tejas Mk1A deliveries to begin from Q1 FY27 — HAL CMD interview",
        url: "https://www.businessstandard.com/defence",
      },
    ],
    risks: [
      "Tejas Mk1A delivery delays beyond Q2 FY27 due to GE engine supply constraints.",
      "Budget rationalisation in FY27 revised estimates cuts capital outlay.",
    ],
    reviewTrigger:
      "Reassess if MoD capex allocation is cut in Union Budget or HAL misses Q4 FY26 revenue guidance of ₹7,500 crore.",
    valuationBasis: "P/E re-rating from 30x to 38x on FY27E EPS ₹127 (consensus Bloomberg)",
    flags: [],
    status: "New",
  },
  {
    id: "pick-2",
    company: "BPCL",
    ticker: "BPCL",
    sector: "Energy (OMC)",
    capCategory: "Large-cap",
    cmp: 268,
    cmDate: "14 Mar 2026",
    target: 340,
    targetMonths: 6,
    stopLoss: 235,
    thesis:
      "BPCL's refining and marketing margins are positively leveraged to Brent at $74/bbl. At current crude, gross refining margins (GRM) are tracking $7–8/bbl vs the Q3 FY26 average of $5.2/bbl, a significant uplift. The IEA demand downgrade has created a buying opportunity: BPCL trades at 0.9x P/B vs a 5-year average of 1.3x. Additionally, the pending Mozambique LNG FID (expected Q2 FY27) could unlock a significant E&P valuation re-rating.",
    evidence: [
      {
        headline: "IEA cuts 2026 oil demand growth forecast — Brent falls to $74",
        url: "https://www.iea.org/reports/oil-market-report-march-2026",
      },
      {
        headline: "BPCL Q3 FY26 — GRM $5.2/bbl; management guides $7+ in Q4",
        url: "https://www.bseindia.com/corporates/annDetNew.aspx",
      },
      {
        headline: "Mozambique LNG FID expected H1 FY27 — BPCL MD statement",
        url: "https://economictimes.indiatimes.com/industry/energy/oil-gas",
      },
    ],
    risks: [
      "Brent rebounds above $85/bbl (OPEC+ surprise cut) compressing marketing margins.",
      "Government price intervention caps diesel/petrol prices, limiting margin flow-through.",
    ],
    reviewTrigger:
      "Reassess if Brent crosses $85/bbl for more than 2 consecutive weeks or government imposes fuel price freeze ahead of state elections.",
    valuationBasis:
      "P/B re-rating from 0.9x to 1.2x on FY27E BVPS ₹283; also corroborated by EV/EBITDA of 5x FY27E.",
    flags: [],
    status: "New",
  },
  {
    id: "pick-3",
    company: "Sun Pharmaceutical Industries",
    ticker: "SUNPHARMA",
    sector: "Pharma",
    capCategory: "Large-cap",
    cmp: 1_680,
    cmDate: "14 Mar 2026",
    target: 2_100,
    targetMonths: 9,
    stopLoss: 1_480,
    thesis:
      "Sun Pharma's specialty business (Ilumya, Cequa, Winlevi) now accounts for 38% of US revenues and commands premium margins. A clean USFDA record (zero 483 observations at Halol facility in 2025) removes a multi-year overhang. With INR at 83.42/USD, export realisations are structurally elevated. The India branded generic business is growing at 16% YoY (IQVIA Mar 2026), and the company's foray into GLP-1 analogue development adds a long-term optionality layer not yet in consensus estimates.",
    evidence: [
      {
        headline:
          "Sun Pharma Halol facility clears USFDA inspection with zero 483 observations — Feb 2026",
        url: "https://www.accessdata.fda.gov/scripts/inspsearch",
      },
      {
        headline:
          "IQVIA India Pharma Market — March 2026: Sun Pharma grows 16% YoY, leads branded generics",
        url: "https://www.iqvia.com/locations/india",
      },
      {
        headline:
          "Sun Pharma specialty revenue up 22% YoY in Q3 FY26 — Ilumya crosses $500M annualised",
        url: "https://www.bseindia.com/corporates/annDetNew.aspx",
      },
    ],
    risks: [
      "US specialty pricing headwinds from PBM negotiations or Medicare price negotiations on key molecules.",
      "Adverse USFDA inspection at any large facility (Dadra, Mohali) triggers sharp correction.",
    ],
    reviewTrigger:
      "Reassess if Sun Pharma misses Q4 FY26 specialty revenue guidance of $400M+ quarterly run-rate or if USFDA issues a Warning Letter to any top-5 facility.",
    valuationBasis:
      "P/E expansion from 28x to 35x on FY27E EPS ₹60 (consensus), justified by specialty mix shift to 40%+.",
    flags: [],
    status: "New",
  },
  {
    id: "pick-4",
    company: "Cholamandalam Investment & Finance",
    ticker: "CHOLAFIN",
    sector: "Banking / NBFC",
    capCategory: "Mid-cap",
    cmp: 1_240,
    cmDate: "14 Mar 2026",
    target: 1_620,
    targetMonths: 12,
    stopLoss: 1_060,
    thesis:
      "Chola Finance is a structural play on the rural-to-semi-urban credit formalisation theme. Its vehicle finance book (40% of AUM) is growing at 22% YoY, driven by 2W, used-CV, and tractor financing in Tier-3/4 markets. With Gross Stage-3 assets at 2.8% and PCR at 62%, the credit quality profile is among the best in the NBFC space. An anticipated 50 bps RBI rate cut cycle (April–October 2026) will compress borrowing costs faster than loan repricing, expanding NIMs by ~40 bps — a direct EPS driver.",
    evidence: [
      {
        headline:
          "Cholamandalam Q3 FY26: AUM ₹1.65L cr, disbursements +24% YoY; NIM expands to 7.4%",
        url: "https://www.bseindia.com/corporates/annDetNew.aspx",
      },
      {
        headline:
          "RBI signals April 2026 rate cut; repo at 6.25% — MPC minutes Feb 2026",
        url: "https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
      },
      {
        headline:
          "2-Wheeler sales Feb 2026 +8.2% YoY (SIAM); tractor sales +6% — rural demand recovery",
        url: "https://www.siam.in/statistics",
      },
    ],
    risks: [
      "Monsoon failure (below-normal rainfall forecast by IMD) weakens rural income and asset quality in agri-linked segments.",
      "RBI delays rate cuts beyond October 2026, limiting NIM expansion thesis.",
    ],
    reviewTrigger:
      "Reassess if Gross Stage-3 assets rise above 3.5% in Q4 FY26 results or if AUM growth decelerates below 15% YoY for two consecutive quarters.",
    valuationBasis:
      "P/B re-rating from 3.8x to 5x on FY27E BVPS ₹324; supported by RoE of 20%+ justifying premium multiple.",
    flags: [],
    status: "New",
  },
]

// ── Picks Under Review ────────────────────────────────────────────────────────
export interface ReviewPick {
  company: string
  ticker: string
  entryPrice: number
  targetPrice: number
  cmp: number
  weekAdded: string
  status: PickStatus
  statusNote: string
  statusSource: string
}

export const picksUnderReview: ReviewPick[] = [
  {
    company: "Larsen & Toubro",
    ticker: "LT",
    entryPrice: 3_280,
    targetPrice: 4_000,
    cmp: 3_491,
    weekAdded: "03 Feb 2026",
    status: "On Track",
    statusNote:
      "L&T order inflows of ₹1.05 lakh crore in Q3 FY26 beat guidance; management raised order inflow guidance to ₹4 lakh crore for FY26. Thesis intact — government capex front-loading and international orders (Middle East, GCC infra) remain strong.",
    statusSource: "L&T Q3 FY26 Earnings Call Transcript, NSEIndia.com",
  },
  {
    company: "Cipla",
    ticker: "CIPLA",
    entryPrice: 1_320,
    targetPrice: 1_650,
    cmp: 1_388,
    weekAdded: "27 Jan 2026",
    status: "On Track",
    statusNote:
      "Cipla's US business grew 15% YoY in Q3 FY26 driven by gRevlimid and complex injectables. USFDA cleared Goa facility in January. India branded generics growing 12% YoY. No change to thesis.",
    statusSource: "Cipla Q3 FY26 Results, BSE Filing 29 Jan 2026",
  },
  {
    company: "Tata Motors",
    ticker: "TATAMOTORS",
    entryPrice: 720,
    targetPrice: 900,
    cmp: 664,
    weekAdded: "06 Jan 2026",
    status: "Revise Target",
    statusNote:
      "JLR volumes in North America declined 8% YoY in Feb 2026 amid cautious consumer sentiment and EV transition costs. Target revised down to ₹800 (from ₹900). Entry at ₹720 still justifiable on a 12-month horizon but stop-loss tightened to ₹590.",
    statusSource:
      "JLR Monthly Sales Data, Feb 2026 — Jaguar Land Rover Media Centre; Economic Times Auto, 10 Mar 2026",
  },
]

// ── What to Watch Next Week ───────────────────────────────────────────────────
export interface WatchItem {
  date: string
  event: string
  relevance: string
  tickers: string[]
}

export const watchNextWeek: WatchItem[] = [
  {
    date: "18 Mar 2026",
    event: "RBI Governor Speech — BIS Quarterly Meeting, Basel",
    relevance:
      "Any forward guidance on April MPC rate cut decision. A dovish signal would trigger a re-rating of Banking and NBFC stocks. Watch for language around 'accommodative stance' vs 'withdrawal of accommodation'.",
    tickers: ["HDFCBANK", "CHOLAFIN", "LICHSGFIN"],
  },
  {
    date: "19–20 Mar 2026",
    event: "US FOMC March Meeting — Rate Decision + Press Conference",
    relevance:
      "While a hold is consensus, any change in the dot plot (fewer than 2 cuts signalled for 2026) would spike the DXY and trigger FII outflows from Indian equities. Also watch for commentary on tariffs and their inflationary implications.",
    tickers: ["NIFTY50", "USDINR", "HDFCBANK"],
  },
  {
    date: "21 Mar 2026",
    event: "India WPI Data for February 2026 (MoSPI Release)",
    relevance:
      "WPI is a leading indicator for manufacturing input cost trends. A WPI print below 2.5% would reinforce the CPI disinflation narrative, strengthening the case for an April RBI cut. Key for steel, cement, and chemicals sectors.",
    tickers: ["JSWSTEEL", "ULTRACEMCO", "PIDILITIND"],
  },
]
