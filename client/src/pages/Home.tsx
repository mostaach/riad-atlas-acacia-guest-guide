import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BaggageClaim,
  Car,
  ChevronDown,
  Clock,
  Coffee,
  Compass,
  ConciergeBell,
  Footprints,
  Heart,
  Home as HomeIcon,
  KeyRound,
  Languages,
  Lightbulb,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Utensils,
  Wifi,
  X,
} from "lucide-react";
import catalogData from "../../../data/riads/riad-atlas-acacia/catalog.json";
import CatalogSection from "@/components/CatalogSection";
import BookingModal from "@/components/BookingModal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CatalogItem } from "@/lib/pricing";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import InteractiveMap from "@/components/InteractiveMap";
import CurrencyConverter from "@/components/CurrencyConverter";
import { track } from "@vercel/analytics";
import placesData from "../../../data/places.json";
import routesData from "../../../data/routes.json";
import categoriesData from "../../../data/categories.json";
import riadData from "../../../data/riad.json";
import {
  calculateDistance,
  estimateWalkingTime,
  estimateTaxiTime,
  filterByWalkingDistance,
  sortByDistance,
} from "@/lib/distance";

interface Place {
  id: number;
  name: string;
  category: string;
  area: string;
  coordinates: number[];
  description: string;
  best_time: string;
  budget: string;
  featured: boolean;
  local_favorite: boolean;
  google_maps: string;
  image: string;
  action_link?: string;
  action_text?: string;
  in_house?: boolean;
  is_order_system?: boolean;
}

interface Route {
  id: number;
  name: string;
  description: string;
  duration: string;
  stops: string[];
  recommendation: string;
  best_time: string;
  difficulty: string;
}

type Tab = "welcome" | "catalog" | "map" | "nearby" | "routes" | "essentials";
type Language = "en" | "fr";

const whatsappMessage = encodeURIComponent(
  "Hello, I need help with my stay at the riad.",
);

const riadGallery = riadData.gallery ?? [];
const whatsappNumber = riadData.whatsapp.replace(/\D/g, "");

const ui = {
  en: {
    languageName: "English",
    switchLabel: "FR",
    heroKicker: "Welcome to Marrakech",
    heroCopy:
      "Everything you need for arrival, your stay, and discovering the medina.",
    startGuide: "Start Guest Guide",
    openMap: "Open Map",
    contactRiad: "Contact Riad",
    viewOnMaps: "View on Maps",
    yourStay: "Your stay",
    welcomeTitle: "Welcome to your Marrakech home base.",
    welcomeCopy:
      "This guide brings together the practical details guests need first: arrival, contact, house notes, nearby places, routes, and help. Save it on your phone before heading into the medina.",
    developmentNoticeTitle: "Guide in development",
    developmentNotice:
      "We are still improving this guest guide. Please confirm WiFi, timings, bookings, and any urgent details with the riad team at arrival.",
    callRiad: "Call Riad",
    emailRiad: "Email Riad",
    whatsappConcierge: "WhatsApp Concierge",
    quick: {
      checkIn: "Check-in",
      checkOut: "Check-out",
      wifi: "WiFi",
      languages: "Languages",
      askAtArrival: "Ask at arrival",
      early: "Message the team if you arrive early.",
      bags: "Leave bags with the team if needed.",
      wifiDetail: "Keep the network details here once confirmed.",
      languageDetail: "The team can help with taxis and bookings.",
    },
    arrivalHouse: "Arrival & House Notes",
    arrival: [
      {
        title: "Find the riad",
        text: riadData.address,
        icon: MapPin,
      },
      {
        title: "Meet the team",
        text: "The concierge can help with keys, luggage, city orientation, and restaurant bookings.",
        icon: ConciergeBell,
      },
      {
        title: "Settle in",
        text: "Review the map, save the riad contact details, and ask for any custom recommendations.",
        icon: KeyRound,
      },
    ],
    houseNotes: [
      "Keep the riad door closed behind you when entering or leaving.",
      "Quiet hours are best observed after 10:30 PM in the courtyard and rooftop areas.",
      "Breakfast, hammam, dinner, and airport transfers are easiest to arrange one day ahead.",
      "For medina taxis, confirm the price before departure or ask the riad to arrange pickup.",
    ],
    goodToKnow: "Good to Know",
    essentials: [
      {
        title: "Emergency",
        text: "For urgent help, call local emergency services and contact the riad team immediately.",
        icon: ShieldCheck,
      },
      {
        title: "Getting Around",
        text: "Walk inside the medina when possible. Use arranged taxis for late nights or longer trips.",
        icon: Navigation,
      },
      {
        title: "Food & Water",
        text: "Drink bottled water, carry small cash, and ask the team for trusted dinner reservations.",
        icon: Utensils,
      },
    ],
    realPhotos: "Real photos",
    lookInside: `A look inside ${riadData.name}`,
    firstPicks: "First picks",
    nearbyFavorites: "Start with these nearby favorites",
    placeTrust:
      "Selected for strong recommendations, reputation, and practical value for guests.",
    viewAll: "View all",
    filter: "Filter by Category",
    all: "All",
    nearRiad: "Near Your Riad",
    fiveMinute: "5-Minute Walk",
    localFavorites: "Local Favorites",
    curated: "Curated Experiences",
    stops: "Stops",
    essentialInfo: "Essential Information",
    emergencyContacts: "Emergency Contacts",
    police: "Police",
    ambulance: "Ambulance",
    touristPolice: "Tourist Police",
    practicalTips: "Practical Tips",
    feedbackTitle: "How was this guide?",
    feedbackCopy:
      "Your feedback helps us improve the guest guide for future stays.",
    feedbackThanks: "Thanks for the feedback.",
    feedbackPlaceholder: "Optional note",
    feedbackButton: "Send note",
    tips: [
      "Dress modestly when visiting religious sites.",
      "Bargaining is expected in souks.",
      "The best time to visit is October to April.",
      "Learn a few Arabic or English phrases.",
      "Carry small cash for tips, taxis, and markets.",
    ],
    nav: {
      guide: "Guide",
      offers: "Offers",
      map: "Map",
      nearby: "Nearby",
      routes: "Routes",
      help: "Help",
    },
    riadOffersTitle: "Riad Experiences & Offers",
    riadOffersSubtitle: "Home dining, High Atlas day trips, desert camps, workshops & spa.",
    exploreAllOffers: "View All 5 Categories",
    bookService: "Book / Request",
    allOffersKicker: "Curated for Acacia Guests",
    needHelp: "Need Help?",
    policiesTitle: "House Policies & Privacy",
    privacyHeading: "Privacy & Data Protection",
    privacyText: "Your privacy is fully respected. We do not track you across the web, use advertising cookies, or store payment card details. Booking requests are transmitted directly and privately to the riad team via end-to-end encrypted WhatsApp or direct phone call.",
    houseRulesHeading: "House Rules & Stay Information",
    houseRules: [
      "Check-in from 14:00 • Check-out until 12:00 (Complimentary luggage storage available).",
      "Serenity & Quiet Hours: Between 22:00 and 08:00 to preserve the peace of the riad.",
      "Dining Orders: Prepared fresh from the market; please order at least 4 hours in advance (before 16:00 for same-day dinner).",
      "Smoking: All bedrooms and indoor salons are non-smoking. Smoking is permitted on the rooftop terrace and open patio.",
      "Payments: Cash in MAD or EUR and credit cards accepted at reception. 10% discount applies to cash payments for dining and spa treatments.",
      "Outside Visitors: Advance reservation required for dining, hammam, or rooftop access.",
    ],
    bestTime: "Best Time",
    budget: "Budget",
    openInMaps: "Open in Google Maps",
    scanToTest: "Scan with your phone to test live room link",
  },
  fr: {
    languageName: "Français",
    switchLabel: "EN",
    heroKicker: "Bienvenue à Marrakech",
    heroCopy:
      "Toutes les informations utiles pour l'arrivée, le séjour et la découverte de la médina.",
    startGuide: "Ouvrir le guide",
    openMap: "Ouvrir la carte",
    contactRiad: "Contacter le riad",
    viewOnMaps: "Voir sur Maps",
    yourStay: "Votre séjour",
    welcomeTitle: "Bienvenue dans votre havre à Marrakech.",
    welcomeCopy:
      "Ce guide rassemble les informations pratiques essentielles : arrivée, contact, notes de maison, lieux proches, itinéraires et aide. Gardez-le sur votre téléphone avant de partir dans la médina.",
    developmentNoticeTitle: "Guide en cours de developpement",
    developmentNotice:
      "Nous ameliorons encore ce guide. Merci de confirmer le WiFi, les horaires, les reservations et les informations urgentes avec l'equipe du riad a l'arrivee.",
    callRiad: "Appeler le riad",
    emailRiad: "Envoyer un email",
    whatsappConcierge: "Concierge WhatsApp",
    quick: {
      checkIn: "Arrivee",
      checkOut: "Depart",
      wifi: "WiFi",
      languages: "Langues",
      askAtArrival: "Demander a l'arrivee",
      early: "Contactez l'equipe si vous arrivez en avance.",
      bags: "Vous pouvez laisser vos bagages si besoin.",
      wifiDetail: "Les details du reseau seront ajoutes une fois confirmes.",
      languageDetail: "L'equipe peut aider pour les taxis et reservations.",
    },
    arrivalHouse: "Arrivee & notes de maison",
    arrival: [
      {
        title: "Trouver le riad",
        text: riadData.address,
        icon: MapPin,
      },
      {
        title: "Rencontrer l'equipe",
        text: "La conciergerie peut aider avec les cles, les bagages, l'orientation et les reservations.",
        icon: ConciergeBell,
      },
      {
        title: "S'installer",
        text: "Consultez la carte, gardez les coordonnees du riad et demandez des recommandations personnalisees.",
        icon: KeyRound,
      },
    ],
    houseNotes: [
      "Gardez la porte du riad fermee en entrant et en sortant.",
      "Merci de respecter le calme apres 22h30 dans la cour et sur la terrasse.",
      "Petit-dejeuner, hammam, diner et transferts aeroport sont plus faciles a organiser la veille.",
      "Pour les taxis dans la medina, confirmez le prix avant le depart ou demandez au riad d'organiser le trajet.",
    ],
    goodToKnow: "Bon a savoir",
    essentials: [
      {
        title: "Urgence",
        text: "En cas d'urgence, appelez les services locaux puis contactez immediatement l'equipe du riad.",
        icon: ShieldCheck,
      },
      {
        title: "Se deplacer",
        text: "Marchez dans la medina quand c'est possible. Utilisez un taxi organise pour le soir ou les longs trajets.",
        icon: Navigation,
      },
      {
        title: "Repas & eau",
        text: "Buvez de l'eau en bouteille, gardez de la petite monnaie et demandez les bonnes adresses a l'equipe.",
        icon: Utensils,
      },
    ],
    realPhotos: "Photos reelles",
    lookInside: `Un aperçu du ${riadData.name}`,
    firstPicks: "Premiers choix",
    nearbyFavorites: "Commencez par ces adresses proches",
    placeTrust:
      "Selection basee sur les recommandations, la reputation et l'utilite pour les voyageurs.",
    viewAll: "Tout voir",
    filter: "Filtrer par categorie",
    all: "Tout",
    nearRiad: "Pres du riad",
    fiveMinute: "A 5 minutes a pied",
    localFavorites: "Favoris locaux",
    curated: "Experiences conseillees",
    stops: "Etapes",
    essentialInfo: "Informations essentielles",
    emergencyContacts: "Contacts d'urgence",
    police: "Police",
    ambulance: "Ambulance",
    touristPolice: "Police touristique",
    practicalTips: "Conseils pratiques",
    feedbackTitle: "Comment trouvez-vous ce guide?",
    feedbackCopy:
      "Votre avis nous aide a ameliorer le guide pour les prochains sejours.",
    feedbackThanks: "Merci pour votre avis.",
    feedbackPlaceholder: "Note optionnelle",
    feedbackButton: "Envoyer la note",
    tips: [
      "Habillez-vous sobrement pour visiter les sites religieux.",
      "La negociation est habituelle dans les souks.",
      "La meilleure periode est d'octobre a avril.",
      "Quelques mots d'arabe ou d'anglais sont utiles.",
      "Gardez de la petite monnaie pour les pourboires, taxis et marches.",
    ],
    nav: {
      guide: "Guide",
      offers: "Offres",
      map: "Carte",
      nearby: "Proche",
      routes: "Circuits",
      help: "Aide",
    },
    riadOffersTitle: "Expériences & Soins du Riad",
    riadOffersSubtitle: "Restauration maison, excursions Atlas, désert d'Agafay, ateliers & spa hammam.",
    exploreAllOffers: "Voir les 5 catégories",
    bookService: "Demander / Réserver",
    allOffersKicker: "Sur mesure pour nos résidents",
    needHelp: "Besoin d'aide?",
    policiesTitle: "Règlement intérieur & Confidentialité",
    privacyHeading: "Protection des données & Confidentialité",
    privacyText: "Votre vie privée est strictement respectée. Nous n'utilisons aucun cookie publicitaire et ne stockons aucune coordonnée bancaire. Vos demandes de réservation sont transmises directement à l'équipe du riad via WhatsApp sécurisé ou appel direct.",
    houseRulesHeading: "Règles de la maison & Conditions de séjour",
    houseRules: [
      "Arrivée à partir de 14h00 • Départ jusqu'à 12h00 (Bagagerie gratuite disponible).",
      "Calme & Sérénité : Respect du repos des hôtes entre 22h00 et 08h00.",
      "Commandes de repas : Produits frais du marché ; commande requise au moins 4h à l'avance (avant 16h00 pour le dîner du soir).",
      "Tabac : Toutes les chambres et salons intérieurs sont non-fumeurs. Autorisé sur le toit-terrasse et les espaces ouverts du patio.",
      "Paiements : Espèces en MAD ou EUR et cartes bancaires acceptées à la réception. Remise de 10% accordée sur les paiements en espèces pour les repas et soins spa.",
      "Visiteurs extérieurs : Réservation préalable obligatoire pour les repas et l'accès au hammam.",
    ],
    bestTime: "Meilleur moment",
    budget: "Budget",
    openInMaps: "Ouvrir dans Google Maps",
    scanToTest: "Scannez avec votre téléphone pour tester l'accès direct",
  },
} satisfies Record<Language, Record<string, any>>;

export default function Home() {
  const [currentTab, setCurrentTab] = useState<Tab>("welcome");
  const [language, setLanguage] = useState<Language>("en");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [walkablePlaces, setWalkablePlaces] = useState<Place[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isRoomQrScanned, setIsRoomQrScanned] = useState(false);
  const [primaryCurrency, setPrimaryCurrency] = useState<"MAD" | "EUR">("MAD");
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const t = ui[language];
  const hasWhatsapp = whatsappNumber.length > 0;
  const quickInfo = [
    {
      icon: Clock,
      label: t.quick.checkIn,
      value: riadData.checkin_time,
      detail: t.quick.early,
    },
    {
      icon: BaggageClaim,
      label: t.quick.checkOut,
      value: riadData.checkout_time,
      detail: t.quick.bags,
    },
    {
      icon: Wifi,
      label: t.quick.wifi,
      value: t.quick.askAtArrival,
      detail: t.quick.wifiDetail,
    },
    {
      icon: Languages,
      label: t.quick.languages,
      value: riadData.languages.join(", "),
      detail: t.quick.languageDetail,
    },
  ];
  const houseNotes = t.houseNotes;
  const arrivalSteps = t.arrival;
  const essentials = t.essentials;

  useEffect(() => {
    // Handle QR code landing source & currency/language persistence
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const src = searchParams.get("src");
      if (src) {
        localStorage.setItem("riad_qr_source", src);
        track("qr_landing", { src, riadId: riadData.id });
      }

      const roomParam = searchParams.get("room");
      if (roomParam) {
        const normalized = roomParam.toLowerCase().replace(/[-_]/g, " ");
        const suitesList = [
          "Suite Atlas",
          "Suite Majorelle",
          "Suite Ourika",
          "Suite Koutoubia",
          "Suite Makhila",
          "Suite Mimosa",
        ];
        const matched = suitesList.find(
          (s) =>
            s.toLowerCase() === normalized ||
            s.toLowerCase().includes(normalized) ||
            normalized.includes(s.toLowerCase().replace("suite ", ""))
        );
        if (matched) {
          setSelectedRoom(matched);
          setIsRoomQrScanned(true);
          localStorage.setItem("riad_room", matched);
        } else {
          setIsRoomQrScanned(false);
          setSelectedRoom("");
        }
      } else {
        setIsRoomQrScanned(false);
        // Only set room if explicitly requested via QR code parameter
        setSelectedRoom("");
      }

      // If guest arrives via QR code (room or reception), bypass facing hero cover and land directly inside the guest guide!
      if (src || roomParam) {
        setShowHero(false);
        if (src === "qr-room" || roomParam) {
          setCurrentTab("catalog"); // directly into room service & experiences
        } else if (src === "qr-reception") {
          setCurrentTab("welcome"); // into practical arrival & reception guide
        }
      }

      const savedLang = localStorage.getItem("riad_lang") as Language;
      if (savedLang === "en" || savedLang === "fr") {
        setLanguage(savedLang);
      } else {
        const browserLang = navigator.language.startsWith("fr") ? "fr" : "en";
        setLanguage(browserLang);
      }

      const savedCurr = localStorage.getItem("riad_curr") as "MAD" | "EUR";
      if (savedCurr === "MAD" || savedCurr === "EUR") {
        setPrimaryCurrency(savedCurr);
      }
    } catch (e) {
      console.warn("Storage/Tracking init error:", e);
    }

    const riadCoordinates = riadData.coordinates as [number, number];
    const experiencePlaces = placesData.filter(
      (place) => place.category !== "Essentials",
    );
    const nearby = filterByWalkingDistance(
      experiencePlaces,
      riadCoordinates,
      2,
    );
    const walkable = filterByWalkingDistance(
      experiencePlaces,
      riadCoordinates,
      0.5,
    );

    setNearbyPlaces(sortByDistance(nearby, riadCoordinates));
    setWalkablePlaces(sortByDistance(walkable, riadCoordinates));
  }, []);

  const openTab = (tab: Tab) => {
    setShowHero(false);
    setCurrentTab(tab);
    setSelectedPlace(null);
  };

  const handleFeedbackRating = (rating: number) => {
    setFeedbackRating(rating);
    setFeedbackSent(true);
    track("guide_satisfaction", {
      rating: String(rating),
      language,
    });
  };

  const feedbackMailto = () => {
    const subject = encodeURIComponent(
      `${riadData.name} guest guide feedback`,
    );
    const body = encodeURIComponent(
      [
        `Rating: ${feedbackRating ?? "Not selected"}/5`,
        `Language: ${language.toUpperCase()}`,
        "",
        feedbackNote,
      ].join("\n"),
    );

    return `mailto:${riadData.email}?subject=${subject}&body=${body}`;
  };

  const PlaceCard = ({
    place,
    showDistance = true,
  }: {
    place: Place;
    showDistance?: boolean;
  }) => {
    const distance = calculateDistance(
      riadData.coordinates[0],
      riadData.coordinates[1],
      place.coordinates[0],
      place.coordinates[1],
    );
    const walkingTime = estimateWalkingTime(distance);
    const taxiTime = estimateTaxiTime(distance);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card
          className="overflow-hidden border-[#E0D5C7] bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          onClick={() => setSelectedPlace(place)}
        >
          <button className="block w-full text-left" type="button">
            <div className="relative h-40 overflow-hidden bg-[#E8D4B8]">
              <img
                src={place.image}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                {place.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B85C3C] px-2 py-1 text-xs font-semibold text-white shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </span>
                )}
                {place.local_favorite && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#8B9D83] px-2 py-1 text-xs font-semibold text-white shadow-md">
                    <Heart className="h-3 w-3 fill-current" />
                    Local
                  </span>
                )}
              </div>
            </div>

            <div className="p-3">
              <h3 className="mb-1 text-sm font-bold text-[#2C2C2C]">
                {place.name}
              </h3>
              <p className="mb-2 line-clamp-2 text-xs text-[#6B6B6B]">
                {place.description}
              </p>

              {showDistance && !place.in_house && (
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1">
                    <Footprints className="h-3.5 w-3.5" />
                    {walkingTime}m
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" />
                    {taxiTime}m
                  </span>
                  <span className="font-semibold text-[#B85C3C]">
                    {place.budget}
                  </span>
                </div>
              )}
              
              {showDistance && place.in_house && (
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F1E8] px-2 py-0.5 text-[#8B9D83] font-semibold">
                    <HomeIcon className="h-3 w-3" />
                    In-House
                  </span>
                  <span className="font-semibold text-[#B85C3C]">
                    {place.budget}
                  </span>
                </div>
              )}
            </div>
          </button>

          {place.is_order_system ? (
            <button
              className="mx-3 mb-3 inline-flex text-xs font-semibold text-[#B85C3C] transition-colors hover:text-[#A04A2F]"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedPlace(place);
              }}
            >
              {place.action_text || "Order Room Service"}
            </button>
          ) : place.action_link === "#" ? (
            <span
              className="mx-3 mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8B9D83] cursor-not-allowed"
              onClick={(event) => event.stopPropagation()}
            >
              <Clock className="h-3 w-3" />
              {place.action_text}
            </span>
          ) : (
            <a
              href={place.action_link || place.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mb-3 inline-flex text-xs font-semibold text-[#B85C3C] transition-colors hover:text-[#A04A2F]"
              onClick={(event) => event.stopPropagation()}
            >
              {place.action_text || t.viewOnMaps}
            </a>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#F5F1E8]${!showHero && currentTab === "map" ? " overflow-hidden h-dvh" : ""}`}>
      {showHero && (
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16"
          style={{
            backgroundImage: `url('${riadData.image}')`,
          }}
        >
          {/* Multi-layered luxury vignette & contrast overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

          {/* Top Bar Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:px-8">
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xs font-semibold tracking-[0.25em] uppercase text-amber-200/90 drop-shadow">
                Marrakech Médina
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-white/20 bg-black/40 p-0.5 backdrop-blur-md shadow-xs">
                <button
                  onClick={() => {
                    setPrimaryCurrency("MAD");
                    localStorage.setItem("riad_curr", "MAD");
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    primaryCurrency === "MAD"
                      ? "bg-amber-100/95 text-stone-900 shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  MAD
                </button>
                <button
                  onClick={() => {
                    setPrimaryCurrency("EUR");
                    localStorage.setItem("riad_curr", "EUR");
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    primaryCurrency === "EUR"
                      ? "bg-amber-100/95 text-stone-900 shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  EUR
                </button>
              </div>
              <button
                onClick={() => {
                  const next = language === "en" ? "fr" : "en";
                  setLanguage(next);
                  localStorage.setItem("riad_lang", next);
                }}
                className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-xs"
                type="button"
                aria-label={`Switch language to ${language === "en" ? "French" : "English"}`}
              >
                {t.switchLabel}
              </button>
            </div>
          </div>

          {/* Central Hero Card */}
          <div className="relative z-10 max-w-xl text-center px-4">
            {/* Medallion Crest */}
            <div className="mx-auto mb-5 inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/30 via-amber-300/20 to-transparent blur-md" />
                <img
                  src={riadData.logo || riadData.image}
                  alt={riadData.name}
                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border border-amber-300/80 object-cover p-1 bg-black/60 shadow-2xl backdrop-blur-md"
                />
              </div>
            </div>

            {/* Kicker */}
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-amber-200/90 drop-shadow-sm">
              {t.heroKicker}
            </p>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] leading-tight">
              {riadData.name}
            </h1>

            {/* Moroccan refined divider */}
            <div className="mx-auto my-3 flex items-center justify-center gap-3 text-amber-300/60">
              <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-amber-300/50" />
              <span className="text-[10px] text-amber-300/70">❖</span>
              <span className="text-xs text-amber-300">✦</span>
              <span className="text-[10px] text-amber-300/70">❖</span>
              <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-amber-300/50" />
            </div>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-md text-sm sm:text-base font-light leading-relaxed text-stone-200/95 drop-shadow">
              {t.heroCopy}
            </p>

            {/* Cohesive Luxury Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => openTab("welcome")}
                className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded-full bg-[#B85C3C] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#B85C3C]/30 border border-white/20 transition-all duration-300 hover:bg-[#A04A2F] active:scale-[0.98]"
                type="button"
              >
                <span>{t.startGuide}</span>
                <span className="text-base leading-none">→</span>
              </button>
              <button
                onClick={() => openTab("catalog")}
                className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded-full bg-black/40 hover:bg-black/60 px-7 py-3.5 text-sm font-semibold text-white border border-amber-300/40 backdrop-blur-md shadow-lg transition-all duration-300 active:scale-[0.98]"
                type="button"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{language === "fr" ? "Offres & Expériences" : "Offers & Spa"}</span>
              </button>
            </div>

            {/* Subtle Tertiary Action */}
            <div className="mt-4">
              <button
                onClick={() => openTab("map")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-100/80 hover:text-white transition-colors underline-offset-4 hover:underline py-1"
                type="button"
              >
                <Navigation className="h-3.5 w-3.5 text-amber-300" />
                <span>{language === "fr" ? "Consulter le plan de la médina" : "Explore Medina Map"}</span>
                <span>↗</span>
              </button>
            </div>

            {/* Bouncing scroll indicator */}
            <button
              onClick={() => openTab("welcome")}
              className="mx-auto mt-7 flex flex-col items-center gap-1 text-white/60 transition-colors hover:text-white"
              aria-label="Scroll down to explore"
            >
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-75">
                {language === "fr" ? "Découvrir" : "Explore"}
              </span>
              <ChevronDown className="h-4 w-4 animate-bounce text-amber-200/80" />
            </button>
          </div>
        </section>
      )}

            {!showHero && (
        <div className="sticky top-0 z-20 border-b border-[#E0D5C7] bg-[#F5F1E8]/95 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button
              onClick={() => setShowHero(true)}
              className="flex items-center gap-2 text-left"
            >
              <img
                src={riadData.logo || riadData.image}
                alt={riadData.name}
                className="h-7 w-auto object-contain rounded"
              />
              <span className="font-serif font-bold text-sm tracking-wide text-[#2C2C2C] hidden sm:inline">
                {riadData.name}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-[#E0D5C7] bg-white p-0.5 shadow-xs">
                <button
                  onClick={() => {
                    setPrimaryCurrency("MAD");
                    localStorage.setItem("riad_curr", "MAD");
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    primaryCurrency === "MAD"
                      ? "bg-[#B85C3C] text-white"
                      : "text-[#6B6B6B] hover:text-[#2C2C2C]"
                  }`}
                >
                  MAD
                </button>
                <button
                  onClick={() => {
                    setPrimaryCurrency("EUR");
                    localStorage.setItem("riad_curr", "EUR");
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    primaryCurrency === "EUR"
                      ? "bg-[#B85C3C] text-white"
                      : "text-[#6B6B6B] hover:text-[#2C2C2C]"
                  }`}
                >
                  EUR
                </button>
              </div>
              <button
                onClick={() => {
                  const next = language === "en" ? "fr" : "en";
                  setLanguage(next);
                  localStorage.setItem("riad_lang", next);
                }}
                className="rounded-full border border-[#E0D5C7] bg-white px-3 py-1 text-[11px] font-bold text-[#2C2C2C] hover:bg-[#EAE4D9]"
              >
                {t.switchLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showHero && (
        <div className={currentTab === "map" ? "" : "pb-28"}>
          {/* Connected Chamber Status Banner ONLY when arrived via Room QR */}
          {isRoomQrScanned && selectedRoom && selectedRoom.startsWith("Suite ") && (
            <div className="bg-[#B85C3C]/10 border-b border-[#B85C3C]/20 px-4 py-2 text-center flex items-center justify-between gap-2 text-xs font-semibold text-[#B85C3C]">
              <div className="flex-1 flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {language === "fr"
                    ? `Connecté en ${selectedRoom} • Guide Résident & Room Service activés`
                    : `Connected in ${selectedRoom} • Guest Guide & Room Service active`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomQrScanned(false)}
                className="p-1 hover:bg-[#B85C3C]/20 rounded-md transition-colors"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentTab === "welcome" && (
            <div className="space-y-6 p-4 md:p-6">
              <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-[#E0D5C7]">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                    {t.yourStay}
                  </p>
                  <h2 className="mb-3 text-3xl font-bold text-[#2C2C2C]">
                    {t.welcomeTitle}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-[#6B6B6B]">
                    {t.welcomeCopy}
                  </p>

                  <div className="mt-4 flex gap-3 rounded-lg border border-[#E0D5C7] bg-[#F5F1E8] p-3 text-left">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B85C3C]" />
                    <div>
                      <p className="text-sm font-semibold text-[#2C2C2C]">
                        {t.developmentNoticeTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                        {t.developmentNotice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <a
                      href={`tel:${riadData.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#A04A2F]"
                    >
                      <Phone className="h-4 w-4" />
                      {t.callRiad}
                    </a>
                    {hasWhatsapp ? (
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E0D5C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8]"
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                        {t.whatsappConcierge}
                      </a>
                    ) : (
                      <a
                        href={`mailto:${riadData.email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E0D5C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8]"
                      >
                        <MessageCircle className="h-4 w-4 text-[#B85C3C]" />
                        {t.emailRiad}
                      </a>
                    )}
                  </div>
                </div>

                <Card className="overflow-hidden border-[#E0D5C7] bg-white/95 shadow-sm">
                  <img
                    src={riadData.image}
                    alt={riadData.name}
                    className="h-48 w-full object-cover"
                  />
                  <div className="space-y-2 p-4 text-sm">
                    <h3 className="text-xl font-bold text-[#2C2C2C]">
                      {riadData.name}
                    </h3>
                    <p className="text-[#6B6B6B]">{riadData.description}</p>
                    <p className="flex items-start gap-2 text-[#6B6B6B]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B85C3C]" />
                      {riadData.address}
                    </p>
                  </div>
                </Card>
              </section>

              <section className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.label}
                      className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm"
                    >
                      <Icon className="mb-3 h-5 w-5 text-[#B85C3C]" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9D83]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#2C2C2C]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                        {item.detail}
                      </p>
                    </Card>
                  );
                })}
              </section>

              <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
                <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-[#B85C3C]" />
                    <h3 className="text-xl font-bold text-[#2C2C2C]">
                      {t.arrivalHouse}
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {arrivalSteps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.title}
                          className="rounded-lg bg-[#F5F1E8] p-3"
                        >
                          <Icon className="mb-2 h-4 w-4 text-[#B85C3C]" />
                          <p className="text-sm font-semibold text-[#2C2C2C]">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                            {step.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B6B6B]">
                    {houseNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </Card>

                <div className="flex flex-col gap-4">
                  <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-[#B85C3C]" />
                      <h3 className="text-xl font-bold text-[#2C2C2C]">
                        {t.goodToKnow}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {essentials.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="flex gap-3">
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B9D83]" />
                            <div>
                              <p className="text-sm font-semibold text-[#2C2C2C]">
                                {item.title}
                              </p>
                              <p className="text-xs leading-5 text-[#6B6B6B]">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  
                  <CurrencyConverter />
                </div>
              </section>

              {riadGallery.length > 0 && (
                <section className="mx-auto max-w-6xl">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                      {t.realPhotos}
                    </p>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">
                      {t.lookInside}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {riadGallery.slice(0, 8).map((photo, index) => (
                      <img
                        key={photo}
                        src={photo}
                        alt={`${riadData.name} photo ${index + 1}`}
                        className={`h-36 w-full rounded-lg object-cover shadow-sm ring-1 ring-[#E0D5C7] md:h-44 ${
                          index === 0 ? "col-span-2 row-span-2 h-72 md:h-full" : ""
                        }`}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="mx-auto max-w-6xl">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                      {t.allOffersKicker}
                    </p>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">
                      {t.riadOffersTitle}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-[#6B6B6B]">
                      {t.riadOffersSubtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab("catalog")}
                    className="hidden rounded-lg bg-[#B85C3C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A04A2F] sm:inline-flex items-center gap-1.5 shadow-sm"
                    type="button"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.exploreAllOffers}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {catalogData.categories.map((cat: any) => (
                    <Card
                      key={cat.id}
                      onClick={() => setCurrentTab("catalog")}
                      className="group overflow-hidden rounded-xl border border-[#E0D5C7] bg-white hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-muted">
                        <img
                          src={cat.image}
                          alt={cat.title.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs font-bold text-white drop-shadow-sm">
                          {language === "fr" ? cat.title.fr : cat.title.en}
                        </span>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] text-[#6B6B6B] line-clamp-2">
                          {language === "fr" ? cat.subtitle.fr : cat.subtitle.en}
                        </p>
                        <span className="text-[11px] font-bold text-[#B85C3C] mt-2 inline-flex items-center gap-0.5">
                          {t.bookService} →
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="mx-auto max-w-6xl">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                      {t.firstPicks}
                    </p>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">
                      {t.nearbyFavorites}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-[#6B6B6B]">
                      {t.placeTrust}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab("nearby")}
                    className="hidden rounded-lg border border-[#E0D5C7] bg-white px-4 py-2 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8] sm:inline-flex"
                    type="button"
                  >
                    {t.viewAll}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {nearbyPlaces.slice(0, 3).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>
            </div>
          )}

                    {currentTab === "catalog" && (
            <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
              <div className="text-center max-w-xl mx-auto pt-2 pb-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C] mb-1">
                  {t.allOffersKicker}
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C2C]">
                  {t.riadOffersTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
                  {t.riadOffersSubtitle}
                </p>
              </div>

              <CatalogSection
                categories={catalogData.categories}
                items={catalogData.items as any}
                language={language}
                primaryCurrency={primaryCurrency}
                onSelectItem={(item) => {
                  setSelectedCatalogItem(item);
                  setIsBookingOpen(true);
                }}
              />
            </div>
          )}

          {currentTab === "map" && (
            /* Fixed-height column: fills exactly the viewport between sticky header (46px) and bottom nav (72px).
               Must NOT be inside the pb-28 scroll wrapper — it escapes it via the outer render. */
            <div
              className="flex flex-col overflow-hidden"
              style={{
                height: isRoomQrScanned ? "calc(100dvh - 156px)" : "calc(100dvh - 118px)",
              }}
            >
              {/* Compact filter strip — shrinks to its content, never pushed by map */}
              <div className="shrink-0 bg-white/90 px-4 pt-3 pb-2 shadow-md backdrop-blur-sm border-b border-[#E0D5C7]">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                      selectedCategory === null
                        ? "bg-[#B85C3C] text-white shadow-sm"
                        : "border border-[#E0D5C7] bg-white text-[#2C2C2C] hover:border-[#B85C3C]"
                    }`}
                    type="button"
                  >
                    {t.all}
                  </button>
                  {categoriesData.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                        selectedCategory === category.id
                          ? "text-white shadow-sm"
                          : "border border-[#E0D5C7] bg-white text-[#2C2C2C] hover:border-[#B85C3C]"
                      }`}
                      style={{
                        backgroundColor:
                          selectedCategory === category.id
                            ? category.color
                            : "white",
                        borderColor:
                          selectedCategory === category.id
                            ? category.color
                            : "#E0D5C7",
                      }}
                      type="button"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map fills ALL remaining vertical space — flex-1 + min-h-0 is the key */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <InteractiveMap
                  places={placesData}
                  selectedCategory={selectedCategory}
                  onPlaceSelect={setSelectedPlace}
                />
              </div>
            </div>
          )}

          {currentTab === "nearby" && (
            <div className="space-y-8 p-4">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.nearRiad}
                </h2>
                <p className="-mt-2 mb-4 max-w-2xl text-sm text-[#6B6B6B]">
                  {t.placeTrust}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {nearbyPlaces.slice(0, 6).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.fiveMinute}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {walkablePlaces.slice(0, 6).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.localFavorites}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {placesData
                    .filter((place) => place.local_favorite)
                    .slice(0, 6)
                    .map((place) => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
              </section>
            </div>
          )}

          {currentTab === "routes" && (
            <div className="space-y-4 p-4">
              <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                {t.curated}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {routesData.map((route: Route) => (
                  <Card
                    key={route.id}
                    className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#2C2C2C]">
                          {route.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#8B9D83]">
                          {route.duration} / {route.difficulty}
                        </p>
                      </div>
                      <Compass className="h-5 w-5 shrink-0 text-[#B85C3C]" />
                    </div>

                    <p className="mb-3 text-sm text-[#6B6B6B]">
                      {route.description}
                    </p>

                    <div className="mb-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.stops}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {route.stops.map((stop) => (
                          <span
                            key={stop}
                            className="rounded-full bg-[#F5F1E8] px-2 py-1 text-xs text-[#2C2C2C]"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="flex gap-2 rounded bg-[#F5F1E8] p-2 text-xs text-[#6B6B6B]">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B85C3C]" />
                      <span>{route.recommendation}</span>
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentTab === "essentials" && (
            <div className="space-y-4 p-4">
              <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                {t.essentialInfo}
              </h2>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#2C2C2C]">
                  <AlertCircle className="h-5 w-5 text-[#B85C3C]" />
                  {t.emergencyContacts}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">{t.police}</p>
                    <p className="text-[#6B6B6B]">+212 5 24 43 86 01</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">{t.ambulance}</p>
                    <p className="text-[#6B6B6B]">+212 5 24 44 79 99</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">
                      {t.touristPolice}
                    </p>
                    <p className="text-[#6B6B6B]">+212 5 24 38 46 01</p>
                  </div>
                </div>
              </Card>


              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-bold text-[#2C2C2C]">
                  {t.practicalTips}
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-[#6B6B6B]">
                  {t.tips.map((tip: string) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </Card>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#2C2C2C]">
                  <ShieldCheck className="h-5 w-5 text-[#B85C3C]" />
                  {t.policiesTitle}
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] mb-1">
                      {t.privacyHeading}
                    </h4>
                    <p className="text-xs leading-relaxed text-[#6B6B6B]">
                      {t.privacyText}
                    </p>
                  </div>
                  <div className="border-t border-[#E0D5C7]/60 pt-3">
                    <h4 className="font-semibold text-[#2C2C2C] mb-2">
                      {t.houseRulesHeading}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#6B6B6B]">
                      {t.houseRules.map((rule: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#B85C3C] font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#2C2C2C]">
                  <MessageCircle className="h-5 w-5 text-[#B85C3C]" />
                  {t.feedbackTitle}
                </h3>
                <p className="mb-4 text-sm leading-6 text-[#6B6B6B]">
                  {t.feedbackCopy}
                </p>

                <div className="mb-4 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFeedbackRating(rating)}
                      className={`rounded-lg border px-0 py-3 text-sm font-bold transition-all ${
                        feedbackRating === rating
                          ? "border-[#B85C3C] bg-[#B85C3C] text-white"
                          : "border-[#E0D5C7] bg-[#F5F1E8] text-[#2C2C2C] hover:border-[#B85C3C]"
                      }`}
                      type="button"
                      aria-label={`Rate this guide ${rating} out of 5`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                {feedbackSent && (
                  <p className="mb-3 rounded-lg bg-[#F5F1E8] px-3 py-2 text-sm font-semibold text-[#8B9D83]">
                    {t.feedbackThanks}
                  </p>
                )}

                <textarea
                  value={feedbackNote}
                  onChange={(event) => setFeedbackNote(event.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  className="mb-3 min-h-24 w-full rounded-lg border border-[#E0D5C7] bg-white px-3 py-2 text-sm text-[#2C2C2C] outline-none transition-colors placeholder:text-[#9C9184] focus:border-[#B85C3C]"
                />

                <a
                  href={feedbackMailto()}
                  onClick={() => {
                    track("guide_feedback_email", {
                      rating: String(feedbackRating ?? "none"),
                      language,
                    });
                    setFeedbackSent(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#A04A2F]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.feedbackButton}
                </a>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )}

  {/* Language toggle lives only in the sticky header — no duplicate fixed button */}

      {!showHero && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E0D5C7] bg-white/85 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-around">
            {[
              { id: "welcome", label: t.nav.guide, icon: HomeIcon },
              { id: "catalog", label: t.nav.offers, icon: Sparkles },
              { id: "map", label: t.nav.map, icon: MapPin },
              { id: "nearby", label: t.nav.nearby, icon: Navigation },
              { id: "routes", label: t.nav.routes, icon: Compass },
              { id: "essentials", label: t.nav.help, icon: AlertCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id as Tab);
                    setSelectedPlace(null);
                  }}
                  className={`flex flex-1 flex-col items-center gap-1 border-t-2 py-4 transition-all ${
                    isActive
                      ? "border-[#B85C3C] text-[#B85C3C]"
                      : "border-transparent text-[#6B6B6B] hover:text-[#2C2C2C]"
                  }`}
                  type="button"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {hasWhatsapp && currentTab !== "map" && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.needHelp}
          className="fixed bottom-20 right-4 z-40 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl md:bottom-8 md:right-8"
        >
          <img
            src="/whatsapp.png"
            alt="WhatsApp"
            className="h-13 w-13 sm:h-14 sm:w-14 rounded-full drop-shadow-md"
          />
        </a>
      )}

      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Card className="max-h-[90vh] w-full overflow-y-auto border-[#E0D5C7] shadow-2xl">
                <div className="relative h-64 overflow-hidden md:h-80">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
                    type="button"
                    aria-label="Close place details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="mb-2 text-3xl font-bold text-[#2C2C2C]">
                      {selectedPlace.name}
                    </h2>
                    <p className="text-sm font-semibold text-[#8B9D83]">
                      {selectedPlace.area} / {selectedPlace.category}
                    </p>
                  </div>

                  <p className="mb-6 leading-relaxed text-[#6B6B6B]">
                    {selectedPlace.description}
                  </p>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-[#F5F1E8] p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.bestTime}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        {selectedPlace.best_time}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F5F1E8] p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.budget}
                      </p>
                      <p className="text-sm font-semibold text-[#B85C3C]">
                        {selectedPlace.budget}
                      </p>
                    </div>
                  </div>

                  {selectedPlace.is_order_system ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-[#E0D5C7] bg-[#F5F1E8] p-4">
                      <p className="text-sm font-bold text-[#2C2C2C]">
                        {language === "fr" ? "D'où commandez-vous ?" : "Where are you ordering from?"}
                      </p>
                      <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full rounded-lg border border-[#E0D5C7] bg-white p-2.5 text-sm font-semibold text-[#2C2C2C] focus:border-[#B85C3C] focus:outline-none focus:ring-1 focus:ring-[#B85C3C]"
                      >
                        <option value="">
                          {language === "fr" ? "-- Choisir votre suite ou lieu --" : "-- Select your suite or location --"}
                        </option>
                        <optgroup label={language === "fr" ? "Suites du 1er étage" : "1st Floor Suites"}>
                          <option value="Suite Atlas">Suite Atlas</option>
                          <option value="Suite Majorelle">Suite Majorelle</option>
                          <option value="Suite Ourika">Suite Ourika</option>
                          <option value="Suite Koutoubia">Suite Koutoubia</option>
                        </optgroup>
                        <optgroup label={language === "fr" ? "Suites sur la terrasse" : "Rooftop Terrace Suites"}>
                          <option value="Suite Makhila">Suite Makhila</option>
                          <option value="Suite Mimosa">Suite Mimosa</option>
                        </optgroup>
                        <optgroup label={language === "fr" ? "Espaces de vie du Riad" : "Riad Common Spaces"}>
                          <option value="Patio & Pool">
                            {language === "fr" ? "Patio central & Bassin (RDC)" : "Central Patio & Plunge Pool (Ground Floor)"}
                          </option>
                          <option value="Panoramic Rooftop">
                            {language === "fr" ? "Toit terrasse panoramique & Solarium" : "Panoramic Rooftop & Solarium"}
                          </option>
                          <option value="Fireplace Salon">
                            {language === "fr" ? "Salon marocain avec cheminée (RDC)" : "Moroccan Fireplace Salon (Ground Floor)"}
                          </option>
                        </optgroup>
                        <optgroup label={language === "fr" ? "Statut de séjour & Visiteur" : "Stay Status & Visitors"}>
                          <option value="Pre-Arrival">
                            {language === "fr" ? "Avant arrivée (Transfert / Arrivée)" : "Pre-Arrival (Transfer / Arrival Night)"}
                          </option>
                          <option value="Outside Visitor">
                            {language === "fr" ? "Client extérieur (Non résident)" : "Outside Visitor (Non-Resident)"}
                          </option>
                        </optgroup>
                      </select>

                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlace(null);
                            setCurrentTab("catalog");
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#A04A2F]"
                        >
                          <Sparkles className="h-4 w-4" />
                          {language === "fr" ? "Voir les Offres & Menus" : "Browse Offers & Menu"}
                        </button>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            !selectedRoom
                              ? (language === "fr"
                                  ? "Bonjour Riad Atlas Acacia, je souhaite commander un repas ou réserver un soin spa."
                                  : "Hello Riad Atlas Acacia, I would like to order a meal or book a spa treatment.")
                              : selectedRoom === "Pre-Arrival"
                              ? (language === "fr"
                                  ? "Bonjour Riad Atlas Acacia, je prépare mon arrivée et je souhaite réserver un transfert / un repas ou un soin."
                                  : "Hello Riad Atlas Acacia, I am preparing my arrival and would like to arrange a transfer / a meal or spa treatment.")
                              : selectedRoom === "Outside Visitor"
                              ? (language === "fr"
                                  ? "Bonjour Riad Atlas Acacia, en tant que client extérieur, je souhaite réserver une table pour dîner / un soin spa."
                                  : "Hello Riad Atlas Acacia, as an outside guest, I would like to reserve a dining table / spa treatment.")
                              : (language === "fr"
                                  ? `Bonjour, je suis actuellement à la ${selectedRoom} au Riad Atlas Acacia et je souhaite commander le service en chambre / un soin spa.`
                                  : `Hello, I am currently at ${selectedRoom} at Riad Atlas Acacia and would like to order room service / a spa treatment.`)
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#25D366] bg-white px-4 py-3 font-semibold text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          {language === "fr" ? "Demander sur WhatsApp" : "Order on WhatsApp"}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={selectedPlace.action_link === "#" ? undefined : (selectedPlace.action_link || selectedPlace.google_maps)}
                      target={selectedPlace.action_link === "#" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-300 ${
                        selectedPlace.action_link === "#" 
                          ? "bg-[#E0D5C7] cursor-not-allowed text-[#6B6B6B]" 
                          : "bg-[#B85C3C] hover:bg-[#A04A2F]"
                      }`}
                      onClick={(e) => {
                        if (selectedPlace.action_link === "#") e.preventDefault();
                      }}
                    >
                      {selectedPlace.action_link === "#" ? (
                        <Clock className="h-5 w-5" />
                      ) : selectedPlace.action_link ? (
                        <ConciergeBell className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                      {selectedPlace.action_text || t.openInMaps}
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingModal
        item={selectedCatalogItem}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        language={language}
        primaryCurrency={primaryCurrency}
        whatsappNumber={riadData.whatsapp || "+212663715754"}
        defaultRoom={selectedRoom}
      />
    </div>
  );
}
