/**
 * DevSutra Cultural Assets and Static Reference Data
 * Matches the Speedy Pandit authentic Indian design and functionality
 */

export const APP_IMAGES = {
  // Banners
  heroBanner: require('../../assets/images/banners/hero-banner-speedy.jpg'),
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
  date: string;
  likes: number;
  views: number;
  videoUrl?: string;
  thumbnailColor?: string;
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    title: 'Kundalini Awakening Aur Yoga: Omkar Manolkar Se Seekhen Safalta Ka Raaz| Ft. Mr. Yashraj Killawala',
    date: '2024-06-15',
    likes: 137,
    views: 227,
  },
  {
    id: 'post-2',
    title: 'What Happens When We Meditate? | Podcast with Brahmakumari Triveni Didi',
    date: '2024-06-01',
    likes: 98,
    views: 184,
  },
  {
    id: 'post-3',
    title: 'Are Tantra and Spirituality different? Tantra explained by Spiritual guide Satyashakti Ft Yashraj',
    date: '2024-05-18',
    likes: 210,
    views: 415,
  },
  {
    id: 'post-4',
    title: 'What is Astrology? Discover the facts of Astrology with award winning astrologer Mr. Rakkesh Chandra. Ft. Yashraj Killawala',
    date: '2024-04-30',
    likes: 342,
    views: 580,
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
    title: 'Welcome',
    date: '2026-11-17',
  },
  {
    id: 'notif-2',
    title: 'Kundalini Awakening Aur Yoga: Omkar Manolkar Se Seekhen Safalta Ka Raaz| Ft. Mr. Yashraj Killawala',
    date: '2024-06-18',
  },
  {
    id: 'notif-3',
    title: 'What Happens When We Meditate? | Podcast with Brahmakumari Triveni Didi',
    date: '2024-06-18',
  },
  {
    id: 'notif-4',
    title: 'Are Tantra and Spirituality different? Tantra explained by Spiritual guide Satyashakti Ft Yashraj',
    date: '2024-06-18',
  },
  {
    id: 'notif-5',
    title: 'What is Astrology? Discover the facts of Astrology with award winning astrologer Mr. Rakkesh Chandra. Ft. Yashraj Killawala',
    date: '2024-04-30',
  },
  {
    id: 'notif-6',
    title: 'Know Our #founders ! DevSutra journey to becoming a sacred spiritual platform !',
    date: '2024-04-17',
  },
  {
    id: 'notif-7',
    title: 'Know how our #founders find strength in each other\'s qualities!',
    date: '2024-04-17',
  },
];
