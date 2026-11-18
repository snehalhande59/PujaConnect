export interface CulturalImage {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  fallbackColor?: string;
}

export const CULTURAL_HERO_IMAGES = {
  mainHero: {
    url: '/images/banners/main-hero.jpg',
    alt: 'Traditional Indian Hindu family performing sacred puja and havan with Pandit at home with natural warm golden lighting',
    caption: 'Vedic rituals conducted by verified Gurukul Pandits in homes across India',
  },
  speedyPromoBanner: {
    url: '/images/banners/hero-banner-speedy.jpg',
    alt: 'पूजा के लिये PANDITJI और सामग्री Book करनी है? DevSutra hai - Sacred Hindu Family with Certified Pandit blowing shankha',
    caption: 'Book trusted Pandits and 100% pure puja samagri delivered right to your home',
  },
  aartiDiya: {
    url: '/images/banners/family-puja-banner.jpg',
    alt: 'Sacred brass puja thali with glowing oil lamps, kumkum and marigold flower offerings',
    caption: 'Shastric Vidhi with traditional consecrated puja samagri',
  },
  kalashCeremony: {
    url: '/images/puja-samagri/brass-kalash.jpg',
    alt: 'Decorated brass Kalash with sacred coconut, mango leaves and mauli thread for Griha Pravesh',
    caption: 'Auspicious Kalash sthapana invoking cosmic peace and prosperity',
  },
};

export interface PujaCategoryVisual {
  name: string;
  slug: string;
  devanagari: string;
  desc: string;
  image: string;
  significance: string;
  duration: string;
  startingPriceNotice: string;
  originalPriceNotice?: string;
  discountBadge?: string;
  requiredPandits: number;
}

export const POPULAR_PUJA_CATEGORIES_DATA: PujaCategoryVisual[] = [
  {
    name: 'Vaastu Shanti Puja',
    slug: 'vastu-shanti',
    devanagari: 'वास्तु शांति पूजा',
    desc: 'Harmonize the 5 cosmic elements (Pancha Bhoota) and rectify directional doshas in residential or office properties.',
    image: '/images/pujas/vaastu-shanti.jpg',
    significance: 'Vastu Mandala aradhana, 5-color chowki sthapana, and purifying Shanti Havan.',
    duration: '3 - 3.5 Hours',
    startingPriceNotice: '₹12,701/-',
    originalPriceNotice: '₹17,251/-',
    discountBadge: '26% OFF',
    requiredPandits: 2,
  },
  {
    name: 'Griha Pravesh Puja',
    slug: 'griha-pravesh-puja',
    devanagari: 'गृह प्रवेश पूजा',
    desc: 'Sacred house warming ceremony invoking Vastu Purusha, Navgraha, and Kuldevi blessings for harmonious living.',
    image: '/images/pujas/griha-pravesh.jpg',
    significance: 'Vastu Shanti, Navgraha Havan, and consecrated milk-boiling ceremony for positive energy in your new residence.',
    duration: '3 - 4 Hours',
    startingPriceNotice: '₹4,601/-',
    originalPriceNotice: '₹5,701/-',
    discountBadge: '19% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Satyanarayan Puja',
    slug: 'satyanarayan-puja',
    devanagari: 'सत्यनारायण पूजा',
    desc: 'Vedic Katha and divine blessings of Lord Vishnu for family harmony, wealth, health, and spiritual peace.',
    image: '/images/pujas/satyanarayan.jpg',
    significance: 'Traditional 5-chapter Katha recitation with Panchamrit and authentic prasad preparation.',
    duration: '2 - 2.5 Hours',
    startingPriceNotice: '₹3,451/-',
    originalPriceNotice: '₹8,051/-',
    discountBadge: '57% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Ganpati Hawan',
    slug: 'ganesh-puja',
    devanagari: 'श्री गणेश हवन',
    desc: 'Invoking Vighnaharta Lord Ganesha before new business ventures, home purchases, or major life milestones.',
    image: '/images/pujas/ganpati-hawan.jpg',
    significance: '108 Ganesha namavali, Atharvashirsha path, and sacred agni oblations with modak.',
    duration: '1.5 - 2 Hours',
    startingPriceNotice: '₹4,401/-',
    originalPriceNotice: '₹5,751/-',
    discountBadge: '23% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Dhanvantari Hawan',
    slug: 'dhanvantari-hawan',
    devanagari: 'भगवान धन्वन्तरि महाहवन',
    desc: 'Sacred Ayurvedic healing hawan dedicated to Bhagwan Dhanvantari for good health, disease relief, and vitality.',
    image: '/images/pujas/dhanvantari-hawan.jpg',
    significance: 'Special ahuti of healing herbs, cow ghee, and sacred mantras for physical and mental wellbeing.',
    duration: '2 Hours',
    startingPriceNotice: '₹4,401/-',
    originalPriceNotice: '₹5,751/-',
    discountBadge: '23% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Maha Lakshmi Kuber Puja',
    slug: 'lakshmi-puja',
    devanagari: 'महालक्ष्मी कुबेर पूजा',
    desc: 'Sacred worship of Goddess Mahalakshmi and Lord Kuber invoking enduring financial prosperity, abundance, and auspiciousness.',
    image: '/images/pujas/lakshmi-puja.jpg',
    significance: 'Sri Suktam recitation, lotus flower offerings, and traditional Deepak sthapana.',
    duration: '2 Hours',
    startingPriceNotice: '₹4,401/-',
    originalPriceNotice: '₹5,751/-',
    discountBadge: '23% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Maha Rudrabhishek',
    slug: 'rudrabhishek',
    devanagari: 'महारुद्राभिषेक',
    desc: 'Sacred Shiva Abhishek with Panchamrit, Bel Patra, and recitation of Sri Rudram for health, protection, and Moksha.',
    image: '/images/pujas/rudrabhishek.jpg',
    significance: 'Continuous stream Abhishek reciting Namakam and Chamakam for supreme peace and purification.',
    duration: '2 - 2.5 Hours',
    startingPriceNotice: '₹5,100/-',
    originalPriceNotice: '₹7,500/-',
    discountBadge: '32% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Maha Mrityunjaya Jaap & Hawan',
    slug: 'mahamrityunjaya',
    devanagari: 'महामृत्युंजय जाप एवं हवन',
    desc: 'Potent Vedic mantra recitation and sacred fire ritual for healing from chronic ailments, planetary protection, and longevity.',
    image: '/images/pujas/mahamrityunjaya.jpg',
    significance: 'Recitation of 1,100 or 11,000 Mahamrityunjaya mantras followed by sacred ghee ahuti.',
    duration: '3 Hours',
    startingPriceNotice: '₹6,500/-',
    originalPriceNotice: '₹8,900/-',
    discountBadge: '27% OFF',
    requiredPandits: 2,
  },
  {
    name: 'Navgraha Shanti Hawan',
    slug: 'navgraha-shanti',
    devanagari: 'नवग्रह शांति पूजा',
    desc: 'Appease the nine planetary deities to alleviate astrological doshas, Sade Sati afflictions, and karmic imbalances.',
    image: '/images/pujas/navgrah-shanti.jpg',
    significance: 'Nine consecrated cloths, sacred Navadhanya grains, and 9 specific planetary samidha offerings in havan.',
    duration: '2.5 - 3 Hours',
    startingPriceNotice: '₹4,800/-',
    originalPriceNotice: '₹6,500/-',
    discountBadge: '26% OFF',
    requiredPandits: 1,
  },
  {
    name: 'Vedic Vivah Sanskar',
    slug: 'marriage-puja',
    devanagari: 'वैदिक विवाह संस्कार',
    desc: 'Traditional Vedic Vivah ceremony including Kanyadaan, Saptapadi, and Agni vows officiated by certified Acharyas.',
    image: '/images/pujas/marriage-puja.jpg',
    significance: 'Sacred solemnization adhering strictly to your ancestral community traditions and Shastras.',
    duration: '4 - 6 Hours',
    startingPriceNotice: '₹15,000/-',
    originalPriceNotice: '₹21,000/-',
    discountBadge: '28% OFF',
    requiredPandits: 2,
  },
];

export interface VerifiedPanditVisual {
  id: string;
  name: string;
  devanagariName: string;
  title: string;
  city: string;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  avatarUrl: string;
  hasReviews: boolean;
  rating?: number;
  reviewCount?: number;
  gurukulLineage: string;
  isAvailableToday: boolean;
  baseDakshina: number;
}

export const FEATURED_PANDITS_DATA: VerifiedPanditVisual[] = [
  {
    id: 'pandit-1',
    name: 'Pt. Rameshwar Shastri',
    devanagariName: 'पं. रामेश्वर शास्त्री',
    title: 'Veda Murti & Vastu Acharya',
    city: 'Pune & Mumbai',
    experienceYears: 18,
    languages: ['Hindi', 'Sanskrit', 'Marathi'],
    specialties: ['Griha Pravesh', 'Rudrabhishek', 'Vastu Shanti'],
    avatarUrl: '/images/pandits/pandit-rameshwar.jpg',
    hasReviews: true,
    rating: 4.9,
    reviewCount: 320,
    gurukulLineage: 'Ved Pathshala, Pune & Varanasi',
    isAvailableToday: true,
    baseDakshina: 2500,
  },
  {
    id: 'pandit-2',
    name: 'Acharya Vidyadhar Joshi',
    devanagariName: 'आचार्य विद्याधर जोशी',
    title: 'Vedic Vivah & Karmakand Specialist',
    city: 'Pune & Nashik',
    experienceYears: 22,
    languages: ['Marathi', 'Hindi', 'Sanskrit'],
    specialties: ['Marriage Puja', 'Satyanarayan', 'Navgraha Shanti'],
    avatarUrl: '/images/pandits/pandit-vidyadhar.jpg',
    hasReviews: true,
    rating: 4.95,
    reviewCount: 410,
    gurukulLineage: 'Trimbakeshwar Ved Sansthan',
    isAvailableToday: true,
    baseDakshina: 2100,
  },
  {
    id: 'pandit-3',
    name: 'Pt. Anant Narayan Dixit',
    devanagariName: 'पं. अनंत नारायण दीक्षित',
    title: 'Rigveda Parayan & Havan Expert',
    city: 'Bengaluru & Pune',
    experienceYears: 14,
    languages: ['Kannada', 'Hindi', 'Sanskrit', 'English'],
    specialties: ['Ganpati Hawan', 'Ganesh Puja', 'Maha Rudrabhishek'],
    avatarUrl: '/images/pandits/pandit-anant.jpg',
    hasReviews: true,
    rating: 4.88,
    reviewCount: 195,
    gurukulLineage: 'Sringeri Sharada Peetham Tradition',
    isAvailableToday: true,
    baseDakshina: 2300,
  },
  {
    id: 'pandit-4',
    name: 'Shastri Girish Upadhyay',
    devanagariName: 'शास्त्री गिरीश उपाध्याय',
    title: 'Jyotish & Mangal Dosh Nivaran',
    city: 'Mumbai & Ahmedabad',
    experienceYears: 16,
    languages: ['Gujarati', 'Hindi', 'Sanskrit'],
    specialties: ['Dhanvantari Hawan', 'Lakshmi Puja', 'Navgraha Shanti'],
    avatarUrl: '/images/pandits/pandit-girish.jpg',
    hasReviews: true,
    rating: 4.92,
    reviewCount: 260,
    gurukulLineage: 'Somnath Sanskrit University, Veraval',
    isAvailableToday: true,
    baseDakshina: 2200,
  },
];

export interface PujaSamagriProductVisual {
  id: string;
  name: string;
  devanagariName: string;
  category: string;
  desc: string;
  price: number;
  image: string;
  stockAvailability: 'In Stock' | 'Limited Sacred Harvest' | 'Pre-order';
  materialGrade: string;
  tags: string[];
}

export const PUJA_SAMAGRI_STORE_DATA: PujaSamagriProductVisual[] = [
  {
    id: 'prod-1',
    name: 'Pure Brass Engraved Puja Thali Set',
    devanagariName: 'शुद्ध पीतल नक्काशीदार पूजा थाली',
    category: 'Puja Thali',
    desc: 'Heavy brass engraved plate with traditional Gayatri Mantra embossing, complete with chandan vati, diya, bell, and agarbatti stand.',
    price: 1850,
    image: '/images/puja-samagri/brass-puja-thali.jpg',
    stockAvailability: 'In Stock',
    materialGrade: '100% Solid Brass • Artisanal Moradabad Craft',
    tags: ['Temple Grade', 'Daily Puja'],
  },
  {
    id: 'prod-2',
    name: 'Sacred Brass Kalash with Nariyal Stand',
    devanagariName: 'पवित्र पीतल कलश एवं नारियल पात्र',
    category: 'Kalash',
    desc: 'Auspicious Kalash engraved with Swastika and Om symbols, designed with a secure mango leaves and coconut resting tier.',
    price: 950,
    image: '/images/puja-samagri/brass-kalash.jpg',
    stockAvailability: 'In Stock',
    materialGrade: 'Pure Brass • Traditional Hand Etching',
    tags: ['Griha Pravesh', 'Sthapana'],
  },
  {
    id: 'prod-3',
    name: 'Akhand Jyot Carved Brass Diya',
    devanagariName: 'अखंड ज्योति पीतल दीपक',
    category: 'Diya',
    desc: 'Pure heavy brass oil lamp with traditional carvings for deepotsav, daily sandhya aarti, and auspicious ceremonies.',
    price: 680,
    image: '/images/temples/temple-diya-decor.jpg',
    stockAvailability: 'In Stock',
    materialGrade: 'Solid Cast Brass • Long-Burning Wick Chamber',
    tags: ['Navratri', 'Deepotsav'],
  },
  {
    id: 'prod-4',
    name: 'Pure A2 Desi Cow Ghee for Havan',
    devanagariName: 'शुद्ध देशी गौ घृत (वैदिक हवनीय)',
    category: 'Ghee',
    desc: 'Traditional Vedic Bilona method A2 Gir Cow ghee prepared exclusively for sacred fire ahutis and daily lamps.',
    price: 1250,
    image: '/images/puja-samagri/pure-cow-ghee.jpg',
    stockAvailability: 'In Stock',
    materialGrade: '100% Pure A2 Cow Ghee • Lab Tested',
    tags: ['Ahuti Grade', 'Organic'],
  },
  {
    id: 'prod-5',
    name: 'Natural Camphor & Mysore Sandal Dhoop',
    devanagariName: 'भीमसेनी देशी कपूर एवं चंदन धूप',
    category: 'Camphor',
    desc: 'Pure Bhimseni crystalline camphor and natural chemical-free Mysore sandalwood dhoop sticks for pure prasad fragrance.',
    price: 450,
    image: '/images/puja-samagri/camphor-incense.jpg',
    stockAvailability: 'In Stock',
    materialGrade: 'Natural Edible-Grade Camphor • Smokeless',
    tags: ['Daily Aarti', 'Havan Ahuti'],
  },
  {
    id: 'prod-6',
    name: 'Certified Panchmukhi Nepali Rudraksha Mala',
    devanagariName: 'प्रमाणित पंचमुखी नेपाली रुद्राक्ष माला',
    category: 'Rudraksha',
    desc: 'Lab-certified 108+1 natural 5-faced Rudraksha beads strung in red silk thread with silver tassel for japa and spiritual shielding.',
    price: 1450,
    image: '/images/puja-samagri/rudraksha-mala.jpg',
    stockAvailability: 'Limited Sacred Harvest',
    materialGrade: 'Authentic Himalayan Nepali Beads (7-8mm)',
    tags: ['Japa Meditation', 'Certified Original'],
  },
  {
    id: 'prod-7',
    name: 'Complete Griha Pravesh & Havan Samagri Kit',
    devanagariName: 'सम्पूर्ण गृह प्रवेश व हवन सामग्री पेटी',
    category: 'Puja Kits',
    desc: 'Curated 64-item kit packed with sacred gangajal, gomutra, dhoop, navadhanya, haldi gath, mauli, supari, and detailed ritual guide.',
    price: 2450,
    image: '/images/puja-samagri/havan-samagri-kit.jpg',
    stockAvailability: 'In Stock',
    materialGrade: 'Temple-Grade Authentic Natural Ingredients',
    tags: ['All-In-One Kit', 'Pandit Verified'],
  },
  {
    id: 'prod-8',
    name: 'Organic Kashi Kumkum & Haldi Set',
    devanagariName: 'काशी विश्वनाथ शुद्ध कुमकुम व हल्दी',
    category: 'Tilak Items',
    desc: 'Hand-blended natural turmeric and consecrated vermilion from Varanasi for auspicious tilak and dev pujan.',
    price: 320,
    image: '/images/puja-samagri/kumkum-haldi.jpg',
    stockAvailability: 'In Stock',
    materialGrade: '100% Skin Safe • Plant Derived',
    tags: ['Shastric Tilak', 'Temple Blend'],
  },
];

export interface FestivalSpecialVisual {
  name: string;
  devanagariName: string;
  seasonDate: string;
  desc: string;
  image: string;
  accentPuja: string;
  accentPujaSlug: string;
}

export const FESTIVAL_SPECIALS_DATA: FestivalSpecialVisual[] = [
  {
    name: 'Diwali (Deepotsav)',
    devanagariName: 'दीपावली महापर्व',
    seasonDate: 'Kartik Amavasya',
    desc: 'Welcome Goddess Mahalakshmi and Lord Ganesha into your home with sacred Lakshmi-Kuber Vidhi, authentic diyas, and silver coin pujas.',
    image: '/images/pujas/lakshmi-puja.jpg',
    accentPuja: 'Maha Lakshmi Kuber Puja',
    accentPujaSlug: 'lakshmi-puja',
  },
  {
    name: 'Ganesh Chaturthi',
    devanagariName: 'गणेश चतुर्थी महोत्सव',
    seasonDate: 'Bhadrapada Shukla Chaturthi',
    desc: 'Perform authentic Pran Pratishtha and Uttar Puja of Lord Ganesha with 21 modak bhog, Durva arpan, and Atharvashirsha path.',
    image: '/images/pujas/ganpati-hawan.jpg',
    accentPuja: 'Ganesh Sthapana & Havan',
    accentPujaSlug: 'ganesh-puja',
  },
  {
    name: 'Griha Pravesh & Vastu Muhurat',
    devanagariName: 'गृह प्रवेश व वास्तु मुहूर्त',
    seasonDate: 'Shubh Muhurat Calendar',
    desc: 'Purify your new home with classical Vastu Purusha pujan, Navgraha Hawan, and milk-boiling ceremony for prosperity.',
    image: '/images/pujas/griha-pravesh.jpg',
    accentPuja: 'Griha Pravesh Puja',
    accentPujaSlug: 'griha-pravesh-puja',
  },
  {
    name: 'Maha Shivratri',
    devanagariName: 'महाशिवरात्रि व्रत',
    seasonDate: 'Phalguna Krishna Chaturdashi',
    desc: 'Four-pahar sacred night vigil with continuous Rudrabhishek, offering of Bel Patra, Dhatura, and sacred ashes on Shiva Lingam.',
    image: '/images/pujas/rudrabhishek.jpg',
    accentPuja: 'Char Pahar Maha Rudrabhishek',
    accentPujaSlug: 'rudrabhishek',
  },
];

export interface PanchangMuhuratItem {
  id: string;
  name: string;
  devanagariName: string;
  dateStr: string;
  badge: string;
  badgeType: 'recommended' | 'today' | 'tomorrow' | 'date';
  icon: 'kalash' | 'diya' | 'calendar' | 'om' | 'lotus' | 'ganesh';
  description: string;
  pujaSlug: string;
}

export const NEXT_30_DAYS_PANCHANG: PanchangMuhuratItem[] = [
  {
    id: 'panchang-1',
    name: 'Satyanarayana Puja',
    devanagariName: 'सत्यनारायण महापूजा',
    dateStr: 'शुभ मुहूर्त',
    badge: '★ Recommended',
    badgeType: 'recommended',
    icon: 'kalash',
    description: 'Popular family pooja for prosperity, peace & family harmony.',
    pujaSlug: 'satyanarayan-puja',
  },
  {
    id: 'panchang-2',
    name: 'Shukla Ashtami',
    devanagariName: 'शुक्ल अष्टमी (दुर्गाष्टमी)',
    dateStr: '18 Nov',
    badge: 'Today • 18 Nov',
    badgeType: 'today',
    icon: 'diya',
    description: 'Ashtami — monthly auspicious day; often dedicated to Maa Durga & Shiva.',
    pujaSlug: 'rudrabhishek',
  },
  {
    id: 'panchang-3',
    name: 'Shukla Navami',
    devanagariName: 'अक्षय आवळा नवमी',
    dateStr: '19 Nov',
    badge: 'Tomorrow • 19 Nov',
    badgeType: 'tomorrow',
    icon: 'calendar',
    description: 'Navami — sacred ninth lunar day; many honor Lord Vishnu and nature.',
    pujaSlug: 'satyanarayan-puja',
  },
  {
    id: 'panchang-4',
    name: 'Karthika Ekadashi',
    devanagariName: 'कार्तिक प्रबोधिनी एकादशी',
    dateStr: '20 Nov',
    badge: '20 Nov',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Prabodhini Ekadashi — awakening of Lord Vishnu, ending of Chaturmas.',
    pujaSlug: 'lakshmi-puja',
  },
  {
    id: 'panchang-5',
    name: 'Shukla Ekadashi / Tulsi Vivah',
    devanagariName: 'तुलसी विवाह प्रारंभ',
    dateStr: '21 Nov',
    badge: '21 Nov',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Ekadashi / Dwadashi — auspicious wedding of Tulsi Mata & Shaligram.',
    pujaSlug: 'satyanarayan-puja',
  },
  {
    id: 'panchang-6',
    name: 'Karthika Pradosham',
    devanagariName: 'कार्तिक सोम/शनि प्रदोष',
    dateStr: '22 Nov',
    badge: '22 Nov',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Pradosh Vrat — dusk worship of Lord Shiva for peace and liberation.',
    pujaSlug: 'rudrabhishek',
  },
  {
    id: 'panchang-7',
    name: 'Vaikuntha Chaturdashi',
    devanagariName: 'वैकुंठ चतुर्दशी (हरि-हर)',
    dateStr: '23 Nov',
    badge: '23 Nov',
    badgeType: 'date',
    icon: 'diya',
    description: 'Sacred midnight worship uniting Lord Shiva and Lord Vishnu.',
    pujaSlug: 'rudrabhishek',
  },
  {
    id: 'panchang-8',
    name: 'Tripurari Purnima',
    devanagariName: 'त्रिपुरारी पौर्णिमा (देव दिवाळी)',
    dateStr: '24 Nov',
    badge: '24 Nov',
    badgeType: 'date',
    icon: 'diya',
    description: 'Dev Diwali — lighting 365 wicks & sacred deepotsav at temples.',
    pujaSlug: 'satyanarayan-puja',
  },
  {
    id: 'panchang-9',
    name: 'Margashirsha Guruvar',
    devanagariName: 'मार्गशीर्ष महालक्ष्मी गुरुवार',
    dateStr: '26 Nov',
    badge: '26 Nov',
    badgeType: 'date',
    icon: 'lotus',
    description: 'Mahalakshmi Vrat first Thursday for boundless wealth & harmony.',
    pujaSlug: 'lakshmi-puja',
  },
  {
    id: 'panchang-10',
    name: 'Sankashti Chaturthi',
    devanagariName: 'संकष्ट हर चतुर्थी व्रत',
    dateStr: '28 Nov',
    badge: '28 Nov',
    badgeType: 'date',
    icon: 'ganesh',
    description: 'Monthly sacred Ganesh fast with evening moonrise arghya.',
    pujaSlug: 'ganesh-puja',
  },
  {
    id: 'panchang-11',
    name: 'Kalbhairav Jayanti',
    devanagariName: 'कालभैरव अष्टमी जयंती',
    dateStr: '02 Dec',
    badge: '02 Dec',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Fierce avatar of Lord Shiva for complete protection from obstacles.',
    pujaSlug: 'rudrabhishek',
  },
  {
    id: 'panchang-12',
    name: 'Utpanna Ekadashi',
    devanagariName: 'उत्पन्ना एकादशी व्रत',
    dateStr: '05 Dec',
    badge: '05 Dec',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Birth of Goddess Ekadashi; divine protection of Lord Vishnu.',
    pujaSlug: 'satyanarayan-puja',
  },
  {
    id: 'panchang-13',
    name: 'Mokshada Ekadashi / Gita Jayanti',
    devanagariName: 'मोक्षदा एकादशी • गीता जयंती',
    dateStr: '19 Dec',
    badge: '19 Dec',
    badgeType: 'date',
    icon: 'calendar',
    description: 'Anniversary of Srimad Bhagavad Gita sermon by Lord Krishna.',
    pujaSlug: 'satyanarayan-puja',
  },
];

export interface PopularServiceVisual {
  id: string;
  name: string;
  devanagariName: string;
  slug: string;
  category: string;
  iconType: 'home' | 'rings' | 'kalash' | 'om' | 'ganesh' | 'lotus';
}

export const POPULAR_SERVICES_WEB: PopularServiceVisual[] = [
  { id: 'griha-pravesh', name: 'Griha Pravesh', devanagariName: 'गृह प्रवेश पूजन', slug: 'griha-pravesh-puja', category: 'Regular Puja', iconType: 'home' },
  { id: 'wedding-ceremony', name: 'Wedding Ceremony', devanagariName: 'विवाह संस्कार', slug: 'wedding-ceremony', category: 'Sanskar', iconType: 'rings' },
  { id: 'satyanarayan', name: 'Satyanarayan Puja', devanagariName: 'सत्यनारायण पूजा', slug: 'satyanarayan-puja', category: 'Regular Puja', iconType: 'kalash' },
  { id: 'rudrabhishek', name: 'Rudrabhishek', devanagariName: 'रुद्राभिषेक', slug: 'rudrabhishek', category: 'Regular Puja', iconType: 'om' },
  { id: 'ganesh-puja', name: 'Ganesh Puja', devanagariName: 'गणेश पूजन', slug: 'ganesh-puja', category: 'All Hawan', iconType: 'ganesh' },
  { id: 'lakshmi-pooja', name: 'Lakshmi Pooja', devanagariName: 'महालक्ष्मी पूजन', slug: 'lakshmi-puja', category: 'Festive Puja', iconType: 'lotus' },
];

export const PILGRIMAGE_CITIES_WEB = [
  'Pune', 'Mumbai', 'Nashik', 'Varanasi', 'Mathura', 'Gangotri',
  'Thiruvananthapuram', 'Rameswaram', 'Bishnupur', 'Agra', 'Vindhyachal',
  'Puri', 'Ujjain', 'Deoghar', 'Ludhiana', 'Konark', 'Ayodhya', 'Haridwar'
];
