/**
 * DevSutra Cultural Assets and Static Reference Data
 * Matches the Speedy Pandit authentic Indian design and functionality
 */

export const APP_IMAGES = {
  // Banners - Authentic Indian Vedic Ritual Imagery
  heroBanner: require('../../assets/images/banners/family-puja-banner.jpg'),
  mainHero: require('../../assets/images/banners/main-hero.jpg'),
  familyBanner: require('../../assets/images/banners/family-puja-banner.jpg'),

  // Icons
  devsutraMudra: require('../../assets/images/icons/devsutra-mudra.jpg'),
  panditAvatar: require('../../assets/images/icons/pandit-avatar.jpg'),

  // Authentic Puja Ceremonies
  vaastuShanti: require('../../assets/images/pujas/vaastu-shanti.jpg'),
  grihaPravesh: require('../../assets/images/pujas/griha-pravesh.jpg'),
  ganpatiHawan: require('../../assets/images/pujas/ganpati-hawan.jpg'),
  dhanvantariHawan: require('../../assets/images/pujas/dhanvantari-hawan.jpg'),
  lakshmiPuja: require('../../assets/images/pujas/lakshmi-puja.jpg'),
  vastuSthapana: require('../../assets/images/pujas/vastu-sthapana.jpg'),
  satyanarayan: require('../../assets/images/pujas/satyanarayan.jpg'),
  mahamrityunjaya: require('../../assets/images/pujas/mahamrityunjaya.jpg'),
  rudrabhishek: require('../../assets/images/pujas/rudrabhishek.jpg'),
  navgrahShanti: require('../../assets/images/pujas/navgrah-shanti.jpg'),
  marriagePuja: require('../../assets/images/pujas/marriage-puja.jpg'),
  shivaParivar: require('../../assets/images/pujas/shiva-parivar.jpg'),

  // Pandits
  panditRameshwar: require('../../assets/images/pandits/pandit-rameshwar.jpg'),
  panditVidyadhar: require('../../assets/images/pandits/pandit-vidyadhar.jpg'),
  panditAnant: require('../../assets/images/pandits/pandit-anant.jpg'),
  panditGirish: require('../../assets/images/pandits/pandit-girish.jpg'),
  panditAcharya: require('../../assets/images/pandits/pandit-acharya.jpg'),

  // Temples
  templeVaranasi: require('../../assets/images/temples/temple-varanasi.jpg'),
  templeDiya: require('../../assets/images/temples/temple-diya-decor.jpg'),
  templeInterior: require('../../assets/images/temples/temple-interior.jpg'),

  // Puja Samagri
  brassThali: require('../../assets/images/puja-samagri/brass-puja-thali.jpg'),
  brassKalash: require('../../assets/images/puja-samagri/brass-kalash.jpg'),
  pureGhee: require('../../assets/images/puja-samagri/pure-cow-ghee.jpg'),
  havanKit: require('../../assets/images/puja-samagri/havan-samagri-kit.jpg'),
  camphorIncense: require('../../assets/images/puja-samagri/camphor-incense.jpg'),
  rudrakshaMala: require('../../assets/images/puja-samagri/rudraksha-mala.jpg'),
  kumkumHaldi: require('../../assets/images/puja-samagri/kumkum-haldi.jpg'),
};

export interface CatalogPujaItem {
  id: string;
  name: string;
  devanagariName: string;
  category: 'Regular Puja' | 'Festive Puja' | 'All Hawan' | 'Sanskar';
  discount: string;
  price: number;
  originalPrice: number;
  image: any;
  duration: string;
  samagriIncluded: boolean;
  description: string;
}

export const SPEEDY_PUJA_CATALOG: CatalogPujaItem[] = [
  {
    id: 'vaastu-shanti',
    name: 'Vaastu Shanti',
    devanagariName: 'वास्तु शांति पूजा',
    category: 'Regular Puja',
    discount: '26%',
    price: 12701,
    originalPrice: 17251,
    image: APP_IMAGES.vaastuShanti,
    duration: '180 min',
    samagriIncluded: true,
    description: 'Purifies home directions, eliminates Vastu doshas, and brings prosperity with authentic Navagraha sthapana.',
  },
  {
    id: 'griha-pravesh',
    name: 'Griha Pravesh',
    devanagariName: 'गृह प्रवेश पूजा',
    category: 'Festive Puja',
    discount: '19%',
    price: 4601,
    originalPrice: 5701,
    image: APP_IMAGES.grihaPravesh,
    duration: '150 min',
    samagriIncluded: true,
    description: 'Sacred new home entry rituals including Kalash Yatra, Gauri-Ganesh sthapana, and threshold purification.',
  },
  {
    id: 'ganpati-hawan',
    name: 'Ganpati Hawan',
    devanagariName: 'गणपति हवन',
    category: 'All Hawan',
    discount: '23%',
    price: 4401,
    originalPrice: 5751,
    image: APP_IMAGES.ganpatiHawan,
    duration: '120 min',
    samagriIncluded: true,
    description: 'Vighnaharta Lord Ganesha fire oblation invoking auspicious beginnings, obstacle removal, and divine wisdom.',
  },
  {
    id: 'dhanvantari-hawan',
    name: 'Dhanvantari Hawan',
    devanagariName: 'धन्वन्तरि हवन',
    category: 'All Hawan',
    discount: '23%',
    price: 4401,
    originalPrice: 5751,
    image: APP_IMAGES.dhanvantariHawan,
    duration: '120 min',
    samagriIncluded: true,
    description: 'Sacred Ayurvedic healing hawan invoking Lord Dhanvantari with 108 sacred medicinal herbs for health and longevity.',
  },
  {
    id: 'lakshmi-puja',
    name: 'Lakshmi Puja',
    devanagariName: 'महालक्ष्मी पूजन',
    category: 'Festive Puja',
    discount: '23%',
    price: 3501,
    originalPrice: 4550,
    image: APP_IMAGES.lakshmiPuja,
    duration: '90 min',
    samagriIncluded: true,
    description: 'Invokes Goddess Mahalakshmi with authentic Ashta Lakshmi Stotram, Kanakadhara Vidhi, and lotus offerings.',
  },
  {
    id: 'vastu-sthapana',
    name: 'Vastu Sthapana',
    devanagariName: 'वास्तु स्थापना',
    category: 'Regular Puja',
    discount: '4%',
    price: 5101,
    originalPrice: 5300,
    image: APP_IMAGES.vastuSthapana,
    duration: '120 min',
    samagriIncluded: true,
    description: 'Installation of sacred Vastu Purusha Yantra with brick altar and consecrated earth energy balance.',
  },
  {
    id: 'satyanarayan',
    name: 'Satya Narayan',
    devanagariName: 'सत्यनारायण महापूजा',
    category: 'Regular Puja',
    discount: '57%',
    price: 3451,
    originalPrice: 8051,
    image: APP_IMAGES.satyanarayan,
    duration: '120 min',
    samagriIncluded: true,
    description: 'Complete 5-chapter Sri Satyanarayan Katha with Panchamrit abhishek, banana leaf mandap, and Sheera Mahaprasad.',
  },
  {
    id: 'mahamrityunjaya',
    name: 'Mahamrityunjaya Hawan',
    devanagariName: 'महामृत्युंजय हवन',
    category: 'All Hawan',
    discount: '20%',
    price: 5501,
    originalPrice: 6900,
    image: APP_IMAGES.mahamrityunjaya,
    duration: '180 min',
    samagriIncluded: true,
    description: 'Potent Vedic fire yajna chanting 1008 Mahamrityunjaya Mantras for health, vitality, and overcoming adversity.',
  },
  {
    id: 'rudrabhishek',
    name: 'Rudra Abhishek',
    devanagariName: 'रुद्राभिषेक पूजन',
    category: 'Regular Puja',
    discount: '15%',
    price: 3101,
    originalPrice: 3650,
    image: APP_IMAGES.rudrabhishek,
    duration: '90 min',
    samagriIncluded: true,
    description: 'Consecration of Shiva Lingam with 11 sacred Dravyas, Bilva leaves, and Namakam Chamakam recitations.',
  },
  {
    id: 'navgrah-shanti',
    name: 'Navgrah Shanti Hawan',
    devanagariName: 'नवग्रह शांति हवन',
    category: 'All Hawan',
    discount: '25%',
    price: 4201,
    originalPrice: 5600,
    image: APP_IMAGES.navgrahShanti,
    duration: '150 min',
    samagriIncluded: true,
    description: 'Pacification of planetary doshas through nine specific samidha woods, grains, and Vedic graha suktas.',
  },
];

export interface FeedPost {
  id: string;
  title: string;
  category: string;
  duration: string;
  date: string;
  likes: number;
  views: number;
  videoUrl?: string;
  thumbnail: any;
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    title: 'कुंडलिनी जागरण व ध्यान साधना: मनाची एकाग्रता आणि आत्मिक शांतीचा मार्ग',
    category: 'वैदिक ध्यान',
    duration: '18:45',
    date: '2026-11-15',
    likes: 342,
    views: 1250,
    thumbnail: APP_IMAGES.templeDiya,
  },
  {
    id: 'post-2',
    title: 'सत्यनारायण पूजेचे महत्त्व आणि शास्त्रोक्त विधी: घरात सुख-समृद्धीचा वास कसा करावा?',
    category: 'पूजा विधी',
    duration: '14:20',
    date: '2026-11-10',
    likes: 520,
    views: 2180,
    thumbnail: APP_IMAGES.satyanarayan,
  },
  {
    id: 'post-3',
    title: 'रुद्राभिषेक आणि महामृत्युंजय मंत्र: भगवान शंकराच्या पूजेने मिळणारे आरोग्य व शांती',
    category: 'शिव उपासना',
    duration: '22:10',
    date: '2026-11-04',
    likes: 890,
    views: 3420,
    thumbnail: APP_IMAGES.rudrabhishek,
  },
  {
    id: 'post-4',
    title: 'वास्तुशास्त्र आणि गृहप्रवेश: नवीन घरात सुख, आरोग्य व ऐश्वर्यासाठी आवश्यक वास्तु नियम',
    category: 'वास्तुशास्त्र',
    duration: '16:30',
    date: '2026-10-28',
    likes: 674,
    views: 1980,
    thumbnail: APP_IMAGES.vaastuShanti,
  },
  {
    id: 'post-5',
    title: 'नवग्रह शांती आणि शुभ मुहूर्त: ग्रहांच्या अनुकूलतेसाठी सोपे व परिणामकारक उपाय',
    category: 'ज्योतिष शास्त्र',
    duration: '12:15',
    date: '2026-10-20',
    likes: 415,
    views: 1540,
    thumbnail: APP_IMAGES.navgrahShanti,
  },
];

export interface NotificationItem {
  id: string;
  title: string;
  date: string;
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'श्री सत्यनारायण पूजेचे बुकिंग यशस्वीरीत्या स्वीकारले गेले आहे. अधिकृत पुरोहित आपल्याशी लवकरच संपर्क करतील.',
    date: '18 Nov 2026',
  },
  {
    id: 'notif-2',
    title: 'आगामी कार्तिक एकादशी व तुलसी विवाह मुहूर्तासाठी पंडितजींचे पूर्व-बुकिंग सुरू झाले आहे.',
    date: '17 Nov 2026',
  },
  {
    id: 'notif-3',
    title: 'नवीन वास्तु शांति व गृहप्रवेश विधी पॅकेज उपलब्ध — १००% शुद्ध हवन साहित्य आणि होम डिलिव्हरीसह.',
    date: '15 Nov 2026',
  },
  {
    id: 'notif-4',
    title: 'आपल्या खात्यात ३०० स्पीड मुद्रा (₹३०० डिस्काउंट) जमा झाले आहेत.',
    date: '14 Nov 2026',
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
  pujaId: string;
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
    pujaId: 'satyanarayan',
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
    pujaId: 'rudrabhishek',
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
    pujaId: 'satyanarayan',
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
    pujaId: 'lakshmi-puja',
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
    pujaId: 'satyanarayan',
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
    pujaId: 'rudrabhishek',
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
    pujaId: 'rudrabhishek',
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
    pujaId: 'satyanarayan',
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
    pujaId: 'lakshmi-puja',
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
    pujaId: 'ganpati-hawan',
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
    pujaId: 'rudrabhishek',
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
    pujaId: 'satyanarayan',
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
    pujaId: 'satyanarayan',
  },
];

export interface PopularServiceItem {
  id: string;
  name: string;
  devanagariName: string;
  iconName: string;
  category: string;
}

export const POPULAR_SERVICES: PopularServiceItem[] = [
  { id: 'griha-pravesh', name: 'Griha Pravesh', devanagariName: 'गृहप्रवेश पूजन', iconName: 'home-outline', category: 'Regular Puja' },
  { id: 'marriage-puja', name: 'Wedding Ceremony', devanagariName: 'विवाह संस्कार', iconName: 'heart-outline', category: 'Sanskar' },
  { id: 'satyanarayan', name: 'Satyanarayan Puja', devanagariName: 'सत्यनारायण पूजा', iconName: 'flame-outline', category: 'Regular Puja' },
  { id: 'rudrabhishek', name: 'Rudrabhishek', devanagariName: 'रुद्राभिषेक', iconName: 'water-outline', category: 'Regular Puja' },
  { id: 'ganpati-hawan', name: 'Ganesh Puja', devanagariName: 'गणेश हवन', iconName: 'sparkles-outline', category: 'All Hawan' },
  { id: 'lakshmi-puja', name: 'Lakshmi Pooja', devanagariName: 'महालक्ष्मी पूजन', iconName: 'flower-outline', category: 'Festive Puja' },
];

export const PILGRIMAGE_CITIES = [
  'Pune', 'Mumbai', 'Nashik', 'Varanasi', 'Ujjain', 'Mathura',
  'Ayodhya', 'Haridwar', 'Puri', 'Rameswaram', 'Gangotri', 'Deoghar', 'Bengaluru'
];

