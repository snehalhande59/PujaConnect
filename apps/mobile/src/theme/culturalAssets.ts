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
    title: 'पुजाकनेक्ट परिवारात आपले सहर्ष स्वागत! आपल्या पहिल्या पूजेवर ₹३०० पूजा मुद्रा जमा करण्यात आल्या आहेत.',
    date: '2026-11-18',
  },
  {
    id: 'notif-2',
    title: 'शुभ मार्गशीर्ष मास: घरात सुख-शांतीसाठी महालक्ष्मी व सत्यनारायण पूजेचे शुभ मुहूर्त उपलब्ध आहेत.',
    date: '2026-11-17',
  },
  {
    id: 'notif-3',
    title: 'मोफत जन्म पत्रिका: आपली जन्म कुंडली तपासा, रास, नक्षत्र व मांगलिक दोषाचे विश्लेषण पहा.',
    date: '2026-11-16',
  },
  {
    id: 'notif-4',
    title: 'गुरुकुल प्रमाणित पुरोहित: आपल्या शहरात अनुभवी व वैदिक पंडितांची सेवा उपलब्ध आहे.',
    date: '2026-11-14',
  },
  {
    id: 'notif-5',
    title: '१००% शुद्ध पूजा सामग्री: होम-हवन आणि पूजेसाठी आवश्यक सर्व पवित्र वस्तू घरपोच उपलब्ध.',
    date: '2026-11-10',
  },
];
