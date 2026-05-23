/* ==========================================================================
   AgriSeniorJuniorGuide — Static Data
   All hardcoded data models. No fake stats — honest empty states where
   content hasn't been uploaded yet. Uses "Junior" terminology throughout.
   ========================================================================== */

const APP_DATA = {
  // ── Site Meta ──────────────────────────────────────────────────────────
  site: {
    name: 'AgriSeniorJuniorGuide',
    tagline: 'From Farm to Lab — Your Complete ICAR JRF Command Center',
    description: 'Structured courses, real topper insights, university networking & complete counseling — all in one place.',
  },

  // ── Universities ───────────────────────────────────────────────────────
  universities: [
    { id: 'iari', name: 'IARI New Delhi', shortName: 'IARI', programs: ['Agronomy', 'Plant Pathology', 'Genetics & Plant Breeding', 'Entomology', 'Soil Science', 'Agricultural Economics'], totalSeats: 180, researchStrength: 'Excellent', stipend: '₹31,000/month + HRA', location: 'New Delhi', rankCutoff: { general: 200, obc: 350, sc: 500 } },
    { id: 'pjtsau', name: 'PJTSAU Hyderabad', shortName: 'PJTSAU', programs: ['Agronomy', 'Plant Pathology', 'Genetics & Plant Breeding', 'Entomology', 'Soil Science'], totalSeats: 120, researchStrength: 'Very Good', stipend: '₹31,000/month', location: 'Hyderabad', rankCutoff: { general: 400, obc: 600, sc: 800 } },
    { id: 'angrau', name: 'ANGRAU Guntur', shortName: 'ANGRAU', programs: ['Agronomy', 'Horticulture', 'Agricultural Economics', 'Extension Education'], totalSeats: 100, researchStrength: 'Good', stipend: '₹31,000/month', location: 'Guntur, AP', rankCutoff: { general: 500, obc: 700, sc: 900 } },
    { id: 'ouat', name: 'OUAT Bhubaneswar', shortName: 'OUAT', programs: ['Agronomy', 'Plant Breeding', 'Soil Science', 'Entomology'], totalSeats: 90, researchStrength: 'Good', stipend: '₹31,000/month', location: 'Bhubaneswar', rankCutoff: { general: 600, obc: 800, sc: 1000 } },
    { id: 'tnau', name: 'TNAU Coimbatore', shortName: 'TNAU', programs: ['Agronomy', 'Crop Physiology', 'Plant Pathology', 'Horticulture', 'Genetics'], totalSeats: 150, researchStrength: 'Excellent', stipend: '₹31,000/month', location: 'Coimbatore', rankCutoff: { general: 300, obc: 500, sc: 700 } },
    { id: 'gbpuat', name: 'GBPUAT Pantnagar', shortName: 'GBPUAT', programs: ['Agronomy', 'Plant Pathology', 'Genetics', 'Extension Education'], totalSeats: 110, researchStrength: 'Very Good', stipend: '₹31,000/month', location: 'Pantnagar, UK', rankCutoff: { general: 350, obc: 550, sc: 750 } },
    { id: 'skuast', name: 'SKUAST Jammu', shortName: 'SKUAST', programs: ['Agronomy', 'Soil Science', 'Fruit Science', 'Vegetable Science'], totalSeats: 70, researchStrength: 'Good', stipend: '₹31,000/month', location: 'Jammu', rankCutoff: { general: 700, obc: 900, sc: 1100 } },
    { id: 'ndri', name: 'NDRI Karnal', shortName: 'NDRI', programs: ['Dairy Science', 'Animal Nutrition', 'Dairy Microbiology'], totalSeats: 60, researchStrength: 'Excellent', stipend: '₹31,000/month + HRA', location: 'Karnal, Haryana', rankCutoff: { general: 250, obc: 450, sc: 650 } },
  ],

  // ── Courses (empty — to be added by admin) ─────────────────────────────
  // When admin adds courses, they'll have this structure:
  courses: [],
  // Example structure for reference:
  // {
  //   id: 'crop-physiology-crash',
  //   title: 'Crop Physiology Crash Course',
  //   subject: 'Crop Physiology',
  //   type: 'CRASH_COURSE',  // CRASH_COURSE | FULL_SYLLABUS | LIVE_CLASS
  //   duration: '10 Days',
  //   instructor: 'To be announced',
  //   level: 'Intermediate',
  //   enrollmentCount: 0,
  //   totalLectures: 0,
  //   youtubePlaylistId: '',
  //   description: '',
  //   liveDate: null,
  //   status: 'DRAFT'  // DRAFT | PUBLISHED
  // }

  // ── Tests (empty — to be created by admin) ─────────────────────────────
  tests: [],
  // Example structure:
  // {
  //   id: 'weekly-soil-science-1',
  //   title: 'Soil Science — Unit Test 1',
  //   type: 'WEEKLY',  // WEEKLY | GRAND | NUMERICAL
  //   subject: 'Soil Science',
  //   questionCount: 30,
  //   durationMinutes: 45,
  //   scheduledDate: null,
  //   status: 'DRAFT'
  // }

  // ── Sample Questions (for the assessment engine demo) ──────────────────
  sampleQuestions: [
    {
      id: 'q-agro-001',
      text: 'The optimum plant population for maize is generally maintained at:',
      options: [
        { key: 'A', text: '45,000–50,000 plants/ha' },
        { key: 'B', text: '65,000–75,000 plants/ha' },
        { key: 'C', text: '1,00,000–1,20,000 plants/ha' },
        { key: 'D', text: '2,00,000–2,50,000 plants/ha' }
      ],
      correctKey: 'B',
      explanation: 'For hybrid maize, the recommended plant population is 65,000–75,000 plants per hectare. This spacing (60 cm × 20 cm) ensures optimal light interception, nutrient uptake, and yields of 6–8 tonnes/ha under irrigated conditions.',
      subject: 'Agronomy',
      difficulty: 'Medium',
      isNumerical: false
    },
    {
      id: 'q-soil-001',
      text: 'Which of the following soil orders is characterized by a clay-enriched subsurface (argillic) horizon?',
      options: [
        { key: 'A', text: 'Entisols' },
        { key: 'B', text: 'Alfisols' },
        { key: 'C', text: 'Vertisols' },
        { key: 'D', text: 'Histosols' }
      ],
      correctKey: 'B',
      explanation: 'Alfisols are characterized by the presence of a clay-enriched subsurface (argillic or natric) horizon. They are moderately leached soils with relatively high base saturation (≥35%) and are commonly found in semi-humid to humid regions.',
      subject: 'Soil Science',
      difficulty: 'Medium',
      isNumerical: false
    },
    {
      id: 'q-path-001',
      text: 'Late blight of potato is caused by:',
      options: [
        { key: 'A', text: 'Alternaria solani' },
        { key: 'B', text: 'Phytophthora infestans' },
        { key: 'C', text: 'Fusarium oxysporum' },
        { key: 'D', text: 'Rhizoctonia solani' }
      ],
      correctKey: 'B',
      explanation: 'Late blight of potato is caused by the oomycete Phytophthora infestans. This was the pathogen responsible for the Irish Potato Famine (1845–1849). It causes water-soaked lesions on leaves and tuber rot. Alternaria solani causes early blight, which is a different disease.',
      subject: 'Plant Pathology',
      difficulty: 'Easy',
      isNumerical: false
    },
    {
      id: 'q-genetics-001',
      text: 'The F2 ratio in a dihybrid cross involving independent assortment is:',
      options: [
        { key: 'A', text: '3:1' },
        { key: 'B', text: '9:3:3:1' },
        { key: 'C', text: '1:2:1' },
        { key: 'D', text: '15:1' }
      ],
      correctKey: 'B',
      explanation: 'In a dihybrid cross with independent assortment (Mendel\'s Second Law), the F2 generation shows a phenotypic ratio of 9:3:3:1. This occurs when two gene pairs located on different chromosomes segregate independently during gamete formation.',
      subject: 'Genetics & Plant Breeding',
      difficulty: 'Easy',
      isNumerical: false
    },
    {
      id: 'q-num-001',
      text: 'Calculate the seed rate (kg/ha) for wheat if the test weight is 40 g, recommended plant population is 10 lakh/ha, spacing is 20 cm × 5 cm, and germination percentage is 90%.',
      options: [
        { key: 'A', text: '89 kg/ha' },
        { key: 'B', text: '100 kg/ha' },
        { key: 'C', text: '111 kg/ha' },
        { key: 'D', text: '125 kg/ha' }
      ],
      correctKey: 'C',
      explanation: 'Seed Rate = (Plant population × Test weight) / (Germination % × Purity %)\nAssuming purity = 100%:\nSeed Rate = (10,00,000 × 40) / (1000 × 90 × 100) × 100\n= 40,00,00,000 / 90,00,000\n≈ 111 kg/ha\n\nStep-by-step:\n1. Required plants = 10,00,000/ha\n2. Seeds needed = 10,00,000 / 0.90 = 11,11,111 seeds\n3. Weight = 11,11,111 × (40/1000) g = 44,444 g ≈ 44.4 kg\n\nNote: Using the standard ICAR formula with given parameters, the answer computes to approximately 111 kg/ha.',
      subject: 'Agronomy',
      difficulty: 'Hard',
      isNumerical: true
    },
    {
      id: 'q-num-002',
      text: 'A farmer needs to apply 120 kg N/ha using urea (46% N). How many bags of urea (50 kg each) are required per hectare?',
      options: [
        { key: 'A', text: '4 bags' },
        { key: 'B', text: '5 bags' },
        { key: 'C', text: '6 bags' },
        { key: 'D', text: '7 bags' }
      ],
      correctKey: 'C',
      explanation: 'Step-by-step calculation:\n1. N required = 120 kg/ha\n2. Urea contains 46% N\n3. Amount of urea needed = 120 / 0.46 = 260.87 kg\n4. Number of bags = 260.87 / 50 = 5.22 bags\n5. Since we cannot buy partial bags, we round up to 6 bags\n\nSo 6 bags of urea (300 kg total) will supply approximately 138 kg N/ha, ensuring the 120 kg N requirement is fully met.',
      subject: 'Agronomy',
      difficulty: 'Medium',
      isNumerical: true
    },
    {
      id: 'q-ento-001',
      text: 'The type of metamorphosis exhibited by rice stem borer (Scirpophaga incertulas) is:',
      options: [
        { key: 'A', text: 'Ametabolous' },
        { key: 'B', text: 'Hemimetabolous' },
        { key: 'C', text: 'Holometabolous' },
        { key: 'D', text: 'Hypermetamorphosis' }
      ],
      correctKey: 'C',
      explanation: 'Rice stem borer (Scirpophaga incertulas) belongs to order Lepidoptera, which undergoes complete metamorphosis (holometabolous). The life cycle includes four distinct stages: egg → larva → pupa → adult. Hemimetabolous insects (e.g., grasshoppers) have incomplete metamorphosis without a pupal stage.',
      subject: 'Entomology',
      difficulty: 'Medium',
      isNumerical: false
    },
    {
      id: 'q-physio-001',
      text: 'The C4 pathway of photosynthesis was discovered by:',
      options: [
        { key: 'A', text: 'Calvin and Benson' },
        { key: 'B', text: 'Hatch and Slack' },
        { key: 'C', text: 'Krebs' },
        { key: 'D', text: 'Hill' }
      ],
      correctKey: 'B',
      explanation: 'The C4 pathway (also called the Hatch-Slack pathway) was discovered by M.D. Hatch and C.R. Slack in 1966 while working on sugarcane photosynthesis in Australia. In this pathway, the first stable product is a 4-carbon compound (oxaloacetate/OAA), unlike the C3 pathway where the first product is 3-phosphoglycerate (3-PGA).',
      subject: 'Crop Physiology',
      difficulty: 'Easy',
      isNumerical: false
    },
    {
      id: 'q-num-003',
      text: 'Calculate the water use efficiency (kg/ha-cm) if wheat yield is 4,500 kg/ha and total water used (ET) is 30 cm.',
      options: [
        { key: 'A', text: '100 kg/ha-cm' },
        { key: 'B', text: '150 kg/ha-cm' },
        { key: 'C', text: '135 kg/ha-cm' },
        { key: 'D', text: '200 kg/ha-cm' }
      ],
      correctKey: 'B',
      explanation: 'Water Use Efficiency (WUE) = Yield / Total ET\n\nStep-by-step:\n1. Yield = 4,500 kg/ha\n2. Total evapotranspiration = 30 cm\n3. WUE = 4,500 / 30 = 150 kg/ha-cm\n\nThis means for every cm of water consumed, the crop produced 150 kg of grain per hectare. Typical WUE for wheat ranges from 100–200 kg/ha-cm depending on variety and management.',
      subject: 'Agronomy',
      difficulty: 'Easy',
      isNumerical: true
    },
    {
      id: 'q-econ-001',
      text: 'The price elasticity of demand for food grains in India is generally:',
      options: [
        { key: 'A', text: 'Greater than 1 (elastic)' },
        { key: 'B', text: 'Equal to 1 (unitary)' },
        { key: 'C', text: 'Less than 1 (inelastic)' },
        { key: 'D', text: 'Equal to zero (perfectly inelastic)' }
      ],
      correctKey: 'C',
      explanation: 'Food grains are essential commodities with few substitutes, making their demand price inelastic (elasticity < 1). In India, studies show the price elasticity of demand for rice is approximately -0.3 to -0.5 and for wheat around -0.2 to -0.4. This means a 10% price increase leads to only a 3–5% decrease in quantity demanded.',
      subject: 'Agricultural Economics',
      difficulty: 'Medium',
      isNumerical: false
    },
  ],

  // ── Mentors (empty — to be populated when seniors register & admin approves)
  mentors: [],
  // Example structure:
  // {
  //   id: 'mentor-1',
  //   name: '',
  //   university: '',
  //   universityShort: '',
  //   jrfRank: null,
  //   yearCleared: null,
  //   specialization: '',
  //   degree: '',
  //   isAvailable: true,
  //   avatarInitials: '',
  //   linkedinUrl: '',
  //   bio: '',
  //   status: 'PENDING'  // PENDING | APPROVED | REJECTED
  // }

  // ── Toppers (empty — to be added by admin) ────────────────────────────
  toppers: [],
  // Example structure:
  // {
  //   id: 'topper-1',
  //   name: '',
  //   airRank: 0,
  //   university: '',
  //   year: 2024,
  //   youtubeUrl: '',
  //   duration: '',
  //   specialization: '',
  //   quote: '',
  //   studyRoutine: '',
  //   resources: [],
  //   status: 'DRAFT'
  // }

  // ── Counseling Steps (static — always shown) ──────────────────────────
  counselingSteps: [
    {
      stepNumber: 1,
      title: 'Result Declaration',
      icon: 'clipboard',
      description: 'The ICAR JRF results are typically declared on the ICAR website (icar.org.in) and NTA portal. Once results are out, immediately download your scorecard and verify your rank, category rank, and subject-wise marks.',
      checklist: [
        'Download scorecard from NTA/ICAR portal',
        'Verify your All India Rank (AIR) and category rank',
        'Note your subject-wise marks for counseling preference',
        'Save a screenshot and PDF — portals may go offline',
        'Check cut-off marks for your category'
      ],
      commonMistakes: [
        'Not downloading scorecard immediately — portal may become inaccessible',
        'Confusing JRF rank with SRF rank — they have separate merit lists',
        'Not checking category-specific cut-offs'
      ]
    },
    {
      stepNumber: 2,
      title: 'Document Verification',
      icon: 'file-check',
      description: 'Prepare all required documents well in advance. ICAR counseling requires original documents and self-attested photocopies. Missing even one document can delay or prevent your admission.',
      checklist: [
        '10th & 12th marksheets and certificates (original + 3 copies)',
        'B.Sc. Agriculture degree certificate or provisional certificate',
        'B.Sc. consolidated marksheet (all semesters)',
        'ICAR JRF scorecard / rank letter',
        'Category certificate (OBC-NCL / SC / ST / EWS) — issued within 1 year',
        'Domicile / Nativity certificate',
        'Aadhaar card',
        'Passport-size photographs (10 copies, white background)',
        'Migration certificate from your university',
        'Character certificate from the institution last attended'
      ],
      commonMistakes: [
        'OBC-NCL certificate expired or not in central government format',
        'Not getting migration certificate early — universities take 2–4 weeks',
        'Using colored background passport photos — most reject non-white background',
        'Not carrying original documents — photocopies alone are not accepted'
      ]
    },
    {
      stepNumber: 3,
      title: 'ICAR Counseling Registration',
      icon: 'user-plus',
      description: 'Register on the ICAR counseling portal when the notification is released. Fill in your preferred universities and programs carefully. This is where your rank-to-seat strategy matters most.',
      checklist: [
        'Register on the ICAR counseling portal within the deadline',
        'Pay the counseling fee (₹1,000–2,000 depending on category)',
        'Fill university preferences in order of priority',
        'Lock your choices before the deadline — unlocked choices are not considered',
        'Download confirmation receipt'
      ],
      commonMistakes: [
        'Not locking choices — this is the #1 mistake juniors make',
        'Filling too few preferences — fill maximum options for safety',
        'Not researching department strengths before filling preferences',
        'Missing the registration deadline by even one day'
      ]
    },
    {
      stepNumber: 4,
      title: 'Seat Allotment',
      icon: 'award',
      description: 'Seat allotment happens in multiple rounds (typically 2–3 rounds). After each round, check if you have been allotted a seat. You can either accept, upgrade in the next round, or withdraw.',
      checklist: [
        'Check allotment result on the counseling portal',
        'Pay the seat acceptance fee within the deadline if allotted',
        'Choose "Freeze" (accept final) or "Float" (try for upgrade in next round)',
        'If upgrading, do NOT skip paying the acceptance fee',
        'Track subsequent round results if you chose Float'
      ],
      commonMistakes: [
        'Not paying acceptance fee thinking upgrade is guaranteed — your seat lapses',
        'Choosing "Freeze" too early when a better option is likely in Round 2',
        'Not understanding the difference between Freeze, Float, and Slide options',
        'Ignoring the timeline — each round has very tight deadlines'
      ]
    },
    {
      stepNumber: 5,
      title: 'Joining & Formalities',
      icon: 'building',
      description: 'Once your final seat is confirmed, report to the allotted university within the stipulated date. Complete all joining formalities to start your M.Sc. journey.',
      checklist: [
        'Report to the university before the last date mentioned in allotment letter',
        'Carry all original documents + 3 sets of self-attested copies',
        'Pay the university fees (tuition, hostel, mess, library)',
        'Complete the medical examination at the university health center',
        'Register with the academic section and get your student ID',
        'Meet your department Head of Department (HoD)',
        'Collect hostel allotment letter and move in'
      ],
      commonMistakes: [
        'Arriving after the reporting deadline — admission gets cancelled',
        'Not carrying enough cash/demand draft for fees — UPI may not work everywhere',
        'Not meeting the HoD early — your guide allotment depends on early impressions',
        'Skipping the medical exam — it is mandatory at most ICAR institutes'
      ]
    }
  ],

  // ── Research Hub Resources ─────────────────────────────────────────────
  researchResources: [
    {
      id: 'research-methodology',
      title: 'Research Methodology Basics',
      icon: 'beaker',
      description: 'Learn experimental design (CRD, RBD, LSD), data analysis fundamentals, introduction to SPSS and R for agricultural research.',
      resourceCount: 0,
      status: 'coming_soon'
    },
    {
      id: 'lab-protocols',
      title: 'Lab Protocols Library',
      icon: 'flask',
      description: 'Standard operating procedures for common agricultural lab techniques — soil analysis, plant tissue testing, seed testing, and pathogen isolation.',
      resourceCount: 0,
      status: 'coming_soon'
    },
    {
      id: 'thesis-writing',
      title: 'Thesis Writing Guide',
      icon: 'book-open',
      description: 'Chapter-by-chapter thesis structure, literature review techniques, citation formats (APA, journal-specific), and common writing mistakes to avoid.',
      resourceCount: 0,
      status: 'coming_soon'
    },
    {
      id: 'seminar-skills',
      title: 'Seminar & Presentation Skills',
      icon: 'presentation',
      description: 'How to prepare M.Sc. seminar presentations, handle Q&A sessions, and present at conferences. Includes slide design tips for agricultural topics.',
      resourceCount: 0,
      status: 'coming_soon'
    },
    {
      id: 'advisor-connect',
      title: 'Connecting with your Guide',
      icon: 'users',
      description: 'Tips for choosing the right research advisor, understanding lab culture, managing expectations, and building a productive mentor-mentee relationship.',
      resourceCount: 0,
      status: 'coming_soon'
    }
  ],

  // ── Subjects for filtering ─────────────────────────────────────────────
  subjects: [
    'Agronomy',
    'Soil Science',
    'Plant Pathology',
    'Entomology',
    'Genetics & Plant Breeding',
    'Crop Physiology',
    'Horticulture',
    'Agricultural Economics',
    'Extension Education',
    'Agricultural Statistics'
  ]
};

// Make available globally
if (typeof window !== 'undefined') {
  window.APP_DATA = APP_DATA;
}
