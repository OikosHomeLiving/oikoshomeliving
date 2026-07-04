    // Dynamic Supabase Keys configuration with local storage fallback
    let SUPABASE_URL = 'https://fodwvmbozddclqsibojc.supabase.co';
    let SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZHd2bWJvemRkY2xxc2lib2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODUxNDgsImV4cCI6MjA5Nzg2MTE0OH0.0VTKYPDmJ0kvOFh4H291RlgEUCbyNHVi7VMg996y9C8';
    let isDemoMode = true;

    // Attempt local storage resolution first
    const storedUrl = localStorage.getItem('supabase_url');
    const storedKey = localStorage.getItem('supabase_anon_key');

    if (storedUrl) SUPABASE_URL = storedUrl;
    if (storedKey) SUPABASE_ANON = storedKey;

    let sb = null;
    // Initialize Supabase only if it has been configured with real keys
    if (!SUPABASE_URL.includes('YOUR_PROJECT') && !SUPABASE_ANON.includes('YOUR_ANON_KEY')) {
      try {
        sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        isDemoMode = false;
        console.log("Supabase successfully initialized.");
      } catch (e) {
        console.error("Failed to initialize Supabase:", e);
      }
    }

    // Pre-filled mock data for local fallback preview
    let demoSettings = {
      price_per_night: 75,
      cleaning_fee: 25,
      service_fee_pct: 12
    };

    let demoBookings = JSON.parse(localStorage.getItem('oikos_demo_bookings')) || [
      { check_in: '2026-07-10', check_out: '2026-07-14' },
      { check_in: '2026-07-20', check_out: '2026-07-23' },
      { check_in: '2026-08-01', check_out: '2026-08-06' }
    ];

    let demoBlocked = JSON.parse(localStorage.getItem('oikos_demo_blocked')) || [
      { date_from: '2026-09-01', date_to: '2026-09-05' }
    ];

    let RATE = 75, CLEANING = 25, SVC_PCT = 12;
    let CHECK_IN_TIME = '14:00', CHECK_OUT_TIME = '11:00';
    let EXTRA_GUEST_CHARGE = 15;
    let AMA_NUMBER = '';
    let QUIET_HOURS = '22:00 - 09:00';
    let bookedDates = new Set(), blockedDates = new Set();
    let viewYear = new Date().getFullYear(), viewMonth = new Date().getMonth();

    // Seasonal pricing and promo codes global state variables
    let seasonalRates = [];
    let promoCodesList = [];
    let appliedPromo = null;

    const GR_MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
    const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const GR_DAYS = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];
    const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Media Database for Photo Carousel & Lightbox
    const galleryImages = [
      { src: "images/room.png", title_el: "Ο Χώρος", title_en: "The Space", sub_el: "Ενιαίος, μοντέρνος σχεδιασμός & ζεστή ατμόσφαιρα", sub_en: "Open-plan, modern design & warm ambiance" },
      { src: "images/couch.png", title_el: "Καθιστικό", title_en: "Living Area", sub_el: "Άνετος modular καναπές με κομψές λεπτομέρειες", sub_en: "Comfortable modular sofa with elegant details" },
      { src: "images/picture1.png", title_el: "Υπνοδωμάτιο (Λεπτομέρεια)", title_en: "Bedroom (Detail)", sub_el: "Premium bouclé κρεβάτι & minimal κομοδίνο", sub_en: "Premium bouclé bed & minimal nightstand" },
      { src: "images/bath1.png", title_el: "Μπάνιο", title_en: "Bathroom", sub_el: "Μοντέρνα αισθητική, διπλός νιπτήρας & LED καθρέφτης", sub_en: "Modern aesthetics, double vessel sinks & LED mirror" },
      { src: "images/double.png", title_el: "Γωνιές του Σπιτιού", title_en: "House Highlights", sub_el: "Προσεκτικά επιλεγμένα έπιπλα & διακοσμητικά στοιχεία", sub_en: "Carefully curated furniture & decorative elements" },
      { src: "images/mastichari-beach-kos.webp", title_el: "Παραλία Μαστιχαρίου", title_en: "Mastichari Beach nearby", sub_el: "Χρυσή άμμος & καταγάλανα νερά (30μ. από το σπίτι)", sub_en: "Golden sand & crystal clear waters (30m from the house)" }
    ];
    let activeLightboxIndex = 0;
    let activeGalleryIndex = 0;

    // Testimonials database
    const reviewsData = [
      { av: "Μ", name: "Maria K.", date_el: "Ιούνιος 2025", date_en: "June 2025", text_el: "Εκπληκτικό μέρος! Ο χώρος απόλυτα καθαρός, ο οικοδεσπότης πολύ ανταποκρίσιμος. Σίγουρα θα ξαναέρθουμε.", text_en: "Amazing place! The space was absolutely clean, and the host was very responsive. We will definitely come back." },
      { av: "J", bg: "#4A5568", name: "James & Laura", date_el: "Αύγουστος 2025", date_en: "August 2025", text_el: "Τέλειο μικρό στούντιο για ρομαντική απόδραση. Πολύ ήσυχο και γαλήνιο, η κουζίνα είχε όλα όσα χρειαζόμασταν.", text_en: "Perfect little studio for a romantic getaway. Very quiet and peaceful, the kitchen had everything we needed." },
      { av: "Σ", bg: "#5A7A6A", name: "Σοφία Π.", date_el: "Σεπτέμβριος 2025", date_en: "September 2025", text_el: "Τέλεια εμπειρία! Ο χώρος ακριβώς όπως στις φωτογραφίες, ίσως και καλύτερος. Self check-in πολύ βολικό.", text_en: "Wonderful experience! The space is exactly like the photos, maybe even better. Self check-in was very convenient." },
      { av: "T", bg: "#6B5B45", name: "Thomas B.", date_el: "Ιούλιος 2025", date_en: "July 2025", text_el: "Υπέροχη διαμονή! Γρήγορο WiFi, εξαιρετικό A/C, και η παραλία ήταν πολύ κοντά. Το συνιστώ ανεπιφύλακτα για ζευγάρια.", text_en: "Wonderful stay! Fast WiFi, great A/C, and the beach was a short walk. Highly recommend for couples." }
    ];
    let activeReviewIndex = 0;

    let leafletMap = null;

    // Translations dictionary
    const translations = {
      el: {
        nav_space: "Χώρος", nav_amenities: "Παροχές", nav_reviews: "Κριτικές", nav_location: "Τοποθεσία", nav_book: "Κράτηση",
        hero_desc: "Ένα μοντέρνο studio σχεδιασμένο με προσοχή στη λεπτομέρεια. 30 μέτρα από τη θάλασσα, στη γαλήνη του Μαστιχαρίου.",
        hero_btn_book: "Κράτηση", hero_btn_explore: "Δες τον χώρο",
        stat_guests: "Επισκέπτες", stat_center: "Στο Κέντρο", stat_beach: "από τη θάλασσα", stat_reno: "Ανακαινισμένο",
        gallery_eyebrow: "Ο Χώρος", gallery_title: "Μίνιμαλ. Μοντέρνο. <em>Σπίτι.</em>",
        amenities_eyebrow: "Τι Περιλαμβάνεται", amenities_title: "Όλα όσα χρειάζεσαι.",
        amenity_ac: "A/C & Θέρμανση", amenity_ac_desc: "Κλιματισμός σε όλους τους χώρους",
        amenity_wifi: "Γρήγορο WiFi", amenity_wifi_desc: "Σταθερή σύνδεση 50Mbps",
        amenity_kitchen: "Πλήρης κουζίνα", amenity_kitchen_desc: "Εστία, φούρνος, καφετιέρα, σκεύη",
        amenity_parking: "Πάρκινγκ κοντά", amenity_parking_desc: "Ελεύθερο πάρκινγκ κοντά στο σπίτι",
        amenity_laundry: "Πλυντήριο", amenity_laundry_desc: "Πλυντήριο & στεγνωτήριο",
        amenity_checkin: "Self check-in", amenity_checkin_desc: "Smart lock — έλα όποτε θέλεις",
        amenity_sheets: "Premium λευκά είδη", amenity_sheets_desc: "Πετσέτες & σεντόνια παρέχονται",
        amenity_location: "Κεντρική Τοποθεσία", amenity_location_desc: "Στην καρδιά του Μαστιχαρίου, δίπλα σε όλα",
        amenity_sea: "30m από τη θάλασσα", amenity_sea_desc: "Λιγότερο από 1 λεπτό με τα πόδια",
        book_eyebrow: "Availability", book_title: "Κάνε κράτηση.", book_calendar_note: "Επίλεξε ημερομηνία άφιξης και αναχώρησης.",
        book_night_sub: "/ διανυκτέρευση", book_reviews_total: "48 κριτικές",
        book_checkin: "Άφιξη", book_checkout: "Αναχώρηση", book_guests: "Επισκέπτες",
        guest_1: "1 επισκέπτης", guest_2: "2 επισκέπτες", guest_3: "3 επισκέπτες",
        book_name: "Όνομα", book_email: "Email", book_phone: "Τηλέφωνο", book_msg: "Μήνυμα",
        price_clean: "Τέλος καθαρισμού", price_extra_guest: "Επιπλέον επισκέπτης", price_total: "Σύνολο",
        book_submit_btn: "Αίτηση Κράτησης", book_submit_note: "Δεν χρεώνεσαι τώρα — μόνο αίτηση",
        rules_eyebrow: "Κανόνες Σπιτιού", rules_title: "Μικρές λεπτομέρειες.",
        rules_lead: "Για να εξασφαλίσουμε μια ευχάριστη διαμονή για εσάς και τους επόμενους επισκέπτες, παρακαλούμε να τηρείτε τους παρακάτω απλούς κανόνες του σπιτιού.",
        rule_time: "Check-in / Check-out", rule_time_desc: "Check-in από 14:00 · Check-out έως 11:00",
        rule_smoke: "Απαγορεύεται το κάπνισμα", rule_smoke_desc: "Μόνο στον εξωτερικό χώρο",
        rule_pets: "Όχι Κατοικίδια", rule_pets_desc: "Δεν επιτρέπονται τα κατοικίδια",
        rule_quiet: "Ησυχία", rule_quiet_desc: "22:00 – 09:00 ήσυχες ώρες",
        rule_guests: "Max 3 επισκέπτες", rule_guests_desc: "Ιδανικό για οικογένειες ή μικρές παρέες",
        reviews_eyebrow: "Τι Λένε οι Επισκέπτες", reviews_title: "Κριτικές.", reviews_score_meta: "από 5.00<br>48 κριτικές",
        faq_eyebrow: "Συχνές Ερωτήσεις", faq_title: "Συχνές Ερωτήσεις.",
        faq_q1: "Πώς γίνεται η παραλαβή των κλειδιών;", faq_a1: "Παρέχουμε σύστημα self check-in μέσω έξυπνης κλειδαιάς (smart lock). Θα λάβετε τον προσωπικό σας κωδικό πρόσβασης 24 ώρες πριν την άφιξή σας.",
        faq_q2: "Υπάρχει διαθέσιμο πάρκινγκ;", faq_a2: "Ναι, υπάρχει ελεύθερο πάρκινγκ κοντά στο σπίτι (χωρίς χρέωση).",
        faq_q3: "Ποια είναι η πολιτική ακύρωσης;", faq_a3: "Προσφέρουμε δωρεάν ακύρωση έως και 14 ημέρες πριν από την προγραμματισμένη ημερομηνία check-in.",
        faq_q4: "Πόσο κοντά είναι η παραλία και η αγορά;", faq_a4: "Η παραλία Μαστιχαρίου, super market, φούρνος, ταβέρνες και όλα τα καταστήματα βρίσκονται ακριβώς δίπλα σας (λιγότερο από 1 λεπτό με τα πόδια).",
        location_eyebrow: "Πού Θα Μας Βρείτε", location_title: "Μαστιχάρι, Κως.",
        map_all: "Όλα", map_beaches: "Παραλίες", map_food: "Φαγητό", map_spots: "Αξιοθέατα", map_transport: "Μετακίνηση",
        loc_beach: "Παραλία Μαστιχαρίου", loc_beach_dist: "30μ · Λιγότερο από 1 λεπτό με τα πόδια",
        loc_port: "Λιμάνι (φέρι Καλύμνου)", loc_port_dist: "200μ · 3 λεπτά με τα πόδια",
        loc_airport: "Αεροδρόμιο Κω (KGS)", loc_airport_dist: "7.5km · 10 λεπτά με αυτοκίνητο / ταξί",
        loc_bus: "Στάση Λεωφορείων (ΚΤΕΛ)", loc_bus_dist: "100μ · 1 λεπτό με τα πόδια",
        loc_food: "Εστιατόρια, ταβέρνες & καφέ", loc_food_dist: "30μ–300μ · 1–4 λεπτά με τα πόδια",
        loc_market: "Super market & Φούρνος", loc_market_dist: "100μ · 1 λεπτό με τα πόδια",
        loc_kos: "Πόλη της Κω (Κέντρο / Λιμάνι)", loc_kos_dist: "22km · 25 λεπτά με αυτοκίνητο",
        footer_rules: "Κανόνες",
        modal_success_title: "Η αίτησή σου στάλθηκε.", modal_success_desc: "Θα επικοινωνήσουμε μαζί σου εντός 24 ωρών για επιβεβαίωση. Σ' ευχαριστούμε!", modal_success_btn: "Κλείσιμο",
        modal_close_btn: "Κλείσιμο",
        book_promo_label: "Κωδικός Προσφοράς",
        price_discount: "Έκπτωση",
        seo_lead: "Ψάχνετε για το ιδανικό μέρος διαμονής στο Μαστιχάρι της Κω; Το OIKΩS Home Living προσφέρει μια απαράμιλλη εμπειρία μίνιμαλ πολυτέλειας. Βρισκόμαστε μόλις 30 μέτρα από τη χρυσή άμμο της παραλίας του Μαστιχαρίου, συνδυάζοντας κορυφαίες σύγχρονες παροχές με τη γαλήνια ατμόσφαιρα ενός από τα πιο όμορφα παραθαλάσσια χωριά της Κω.",
        seo_text_1: "Είτε επισκέπτεστε την Κω για windsurfing, είτε για να εξερευνήσετε τα τοπικά αξιοθέατα, είτε απλά για να χαλαρώσετε δίπλα στα καταγάλανα νερά του Αιγαίου, η επιλογή διαμονής στο Μαστιχάρι είναι το κλειδί για τις διακοπές σας. Το OIKΩS βρίσκεται στο απόλυτο κέντρο, πράγμα που σημαίνει ότι απέχετε λιγότερο από 1 λεπτό με τα πόδια από παραδοσιακές ταβέρνες, φούρνους, σούπερ μάρκετ και το λιμάνι με καθημερινά δρομολόγια για Κάλυμνο.",
        seo_text_2: "Απολαύστε premium άνεση με γρήγορο WiFi (50Mbps), ανατομικά στρώματα, κλιματισμό και ελεύθερο πάρκινγκ κοντά. Κάντε την κράτησή σας απευθείας μαζί μας για εγγύηση καλύτερης τιμής.",
        gdpr_consent_text: "Συμφωνώ με την επεξεργασία των προσωπικών μου δεδομένων για τη διαχείριση της αίτησης κράτησης."
      },
      en: {
        nav_space: "Space", nav_amenities: "Amenities", nav_reviews: "Reviews", nav_location: "Location", nav_book: "Book",
        hero_desc: "A modern studio designed with careful attention to detail. 30 meters from the sea, nestled in the serenity of Mastichari.",
        hero_btn_book: "Book Now", hero_btn_explore: "View Space",
        stat_guests: "Guests", stat_center: "In the Heart", stat_beach: "to the sea", stat_reno: "Renovated",
        gallery_eyebrow: "The Space", gallery_title: "Minimal. Modern. <em>Home.</em>",
        amenities_eyebrow: "What's Included", amenities_title: "Everything you need.",
        amenity_ac: "A/C & Heating", amenity_ac_desc: "Climate control in all spaces",
        amenity_wifi: "Fast WiFi", amenity_wifi_desc: "Stable 50Mbps connection",
        amenity_kitchen: "Full Kitchen", amenity_kitchen_desc: "Stove, oven, coffee machine, utensils",
        amenity_parking: "Free Parking Nearby", amenity_parking_desc: "Free of charge parking near the house",
        amenity_laundry: "Washing Machine", amenity_laundry_desc: "Washer & dryer utility provided",
        amenity_checkin: "Self check-in", amenity_checkin_desc: "Smart lock — arrive whenever you want",
        amenity_sheets: "Premium Linen", amenity_sheets_desc: "Fresh towels & bed sheets provided",
        amenity_location: "Central Location", amenity_location_desc: "In the heart of Mastichari, next to everything",
        amenity_sea: "30 meters from the sea", amenity_sea_desc: "Less than 1 minute walk away",
        book_eyebrow: "Availability", book_title: "Request booking.", book_calendar_note: "Select arrival and departure dates.",
        book_night_sub: "/ night", book_reviews_total: "48 reviews",
        book_checkin: "Check-in", book_checkout: "Check-out", book_guests: "Guests",
        guest_1: "1 guest", guest_2: "2 guests", guest_3: "3 guests",
        book_name: "Name", book_email: "Email", book_phone: "Phone", book_msg: "Message",
        price_clean: "Cleaning fee", price_extra_guest: "Extra guest fee", price_total: "Total",
        book_submit_btn: "Request Booking", book_submit_note: "No charge yet — booking request only",
        rules_eyebrow: "House Rules", rules_title: "Little details.",
        rules_lead: "To ensure a comfortable stay for you and future guests, please respect the following house rules.",
        rule_time: "Check-in / Check-out", rule_time_desc: "Check-in from 14:00 · Check-out until 11:00",
        rule_smoke: "No smoking", rule_smoke_desc: "Allowed in outdoor spaces only",
        rule_pets: "No Pets", rule_pets_desc: "Pets are not allowed in the property",
        rule_quiet: "Quiet Hours", rule_quiet_desc: "22:00 – 09:00 quiet hours observed",
        rule_guests: "Max 3 Guests", rule_guests_desc: "Ideal for small families or friends",
        reviews_eyebrow: "What Guests Say", reviews_title: "Reviews.", reviews_score_meta: "out of 5.00<br>48 reviews",
        faq_eyebrow: "Frequently Asked", faq_title: "FAQs.",
        faq_q1: "How do I collect the keys?", faq_a1: "We provide self check-in via a smart lock. You will receive your personal access code 24 hours prior to your scheduled check-in.",
        faq_q2: "Is parking available?", faq_a2: "Yes, there is free of charge public parking near the house.",
        faq_q3: "What is the cancellation policy?", faq_a3: "We offer free cancellation up to 14 days before your scheduled check-in date.",
        faq_q4: "How close is the beach and market?", faq_a4: "Mastichari Beach, supermarkets, bakeries, tavernas, and all local shops are next door to the property (less than 1 minute walk away).",
        location_eyebrow: "Find Us", location_title: "Mastichari, Kos.",
        map_all: "All", map_beaches: "Beaches", map_food: "Food", map_spots: "Sightseeing", map_transport: "Transport",
        loc_beach: "Mastichari Beach", loc_beach_dist: "30m · Less than 1 minute walk",
        loc_port: "Harbor (Ferry to Kalymnos)", loc_port_dist: "200m · 3 minutes walk",
        loc_airport: "Kos Airport (KGS)", loc_airport_dist: "7.5km · 10 minutes drive / taxi",
        loc_bus: "KTEL Bus Station", loc_bus_dist: "100m · 1 minute walk",
        loc_food: "Restaurants, tavernas & cafes", loc_food_dist: "30m–300m · 1–4 minutes walk",
        loc_market: "Supermarket & Bakery", loc_market_dist: "100m · 1 minute walk",
        loc_kos: "Kos Town (Center / Port)", loc_kos_dist: "22km · 25 minutes drive",
        footer_rules: "Rules",
        modal_success_title: "Request submitted.", modal_success_desc: "We will contact you within 24 hours to confirm your reservation. Thank you!", modal_success_btn: "Close",
        modal_close_btn: "Close",
        book_promo_label: "Promo Code",
        price_discount: "Discount",
        seo_lead: "Looking for the best place to stay in Mastichari, Kos? OIKΩS Home Living offers an unparalleled minimalist luxury experience. Located just 30 meters from the golden sands of Mastichari beach, our boutique studio combines top-tier modern amenities with the serene, laid-back atmosphere of one of Kos's most beautiful coastal villages.",
        seo_text_1: "Whether you are visiting Kos for windsurfing, exploring local attractions, or simply wanting to relax by the crystal-clear Aegean Sea, choosing where to stay in Mastichari is key to your vacation. OIKΩS is situated in the absolute center, meaning you are less than a 1-minute walk from local family-run tavernas, bakeries, supermarkets, and the port with daily ferries to Kalymnos.",
        seo_text_2: "Experience premium comfort with fast WiFi (50Mbps), custom linens, air conditioning, and free parking nearby. Book your stay directly with us for best-rate guarantees.",
        gdpr_consent_text: "I consent to the processing of my personal data for the purpose of coordinating this booking."
      }
    };
    let currentLang = 'el';

    function saveDatabaseCache() {
      try {
        const cache = {
          rate: RATE,
          cleaning: CLEANING,
          svc_pct: SVC_PCT,
          extra_guest_charge: EXTRA_GUEST_CHARGE,
          booked: Array.from(bookedDates),
          blocked: Array.from(blockedDates),
          seasonal_rates: seasonalRates,
          promo_codes: promoCodesList,
          timestamp: Date.now()
        };
        localStorage.setItem('oikos_cached_db', JSON.stringify(cache));
      } catch (e) {
        console.error("Failed to save database cache:", e);
      }
    }

    function loadDatabaseCache() {
      try {
        const cacheStr = localStorage.getItem('oikos_cached_db');
        if (cacheStr) {
          const cache = JSON.parse(cacheStr);
          RATE = cache.rate !== undefined ? +cache.rate : 75;
          CLEANING = cache.cleaning !== undefined ? +cache.cleaning : 25;
          SVC_PCT = cache.svc_pct !== undefined ? +cache.svc_pct : 12;
          EXTRA_GUEST_CHARGE = cache.extra_guest_charge !== undefined ? +cache.extra_guest_charge : 15;
          bookedDates = new Set(cache.booked || []);
          blockedDates = new Set(cache.blocked || []);
          seasonalRates = cache.seasonal_rates || [];
          promoCodesList = cache.promo_codes || [];
          return true;
        }
      } catch (e) {
        console.error("Failed to load database cache:", e);
      }
      return false;
    }

    function updateAMAFooter() {
      const amaWrap = document.getElementById('amaFooterWrap');
      const amaVal = document.getElementById('amaFooterVal');
      if (amaWrap && amaVal) {
        if (AMA_NUMBER && AMA_NUMBER.trim() !== '' && AMA_NUMBER !== '0' && AMA_NUMBER !== '00001234567') {
          amaVal.textContent = AMA_NUMBER;
          amaWrap.style.display = 'inline';
        } else {
          amaWrap.style.display = 'none';
        }
      }
    }

    async function syncSupabaseDatabase() {
      try {
        const [{ data: s }, { data: b }, { data: bl }, { data: sr }, { data: pc }] = await Promise.all([
          sb.from('settings').select('*'),
          sb.from('public_bookings').select('check_in,check_out'),
          sb.from('blocked_dates').select('date_from,date_to'),
          sb.from('seasonal_rates').select('*'),
          sb.from('promo_codes').select('*')
        ]);

        bookedDates.clear();
        blockedDates.clear();
        seasonalRates = sr || [];
        promoCodesList = pc || [];

        if (s) s.forEach(r => {
          if (r.key === 'price_per_night') RATE = +r.value;
          if (r.key === 'cleaning_fee') CLEANING = +r.value;
          if (r.key === 'service_fee_pct') SVC_PCT = +r.value;
          if (r.key === 'extra_guest_charge') EXTRA_GUEST_CHARGE = +r.value;
        });
        if (b) b.forEach(r => {
          let d = new Date(r.check_in), e = new Date(r.check_out);
          while (d < e) { bookedDates.add(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1); }
        });
        if (bl) bl.forEach(r => {
          let d = new Date(r.date_from), e = new Date(r.date_to);
          while (d <= e) { blockedDates.add(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1); }
        });

        saveDatabaseCache();

        const pDisp = document.getElementById('priceDisplay');
        if (pDisp) pDisp.textContent = RATE;
        document.getElementById('cleaningFee').textContent = '€' + CLEANING;
        updateHouseRulesTime();
        updateAMAFooter();
        buildCalendar();
        updatePrice();
        console.log("Supabase database sync complete.");
      } catch (e) {
        console.warn("Supabase database sync failed, kept current cache/mock data:", e);
      }
    }

    async function init() {
      // Prevent scrolling while loading
      document.body.classList.add('loading-active');

      // Check saved theme preference on page load
      const savedTheme = localStorage.getItem('oikos_theme') || 'light';
      const themeIcon = document.getElementById('themeIcon');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
      } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
      }

      const minTimePromise = new Promise(resolve => setTimeout(resolve, 1500));
      let syncPromise = Promise.resolve();

      // Check saved language
      const savedLang = localStorage.getItem('oikos_lang');
      if (savedLang) currentLang = savedLang;
      document.getElementById('langLabel').textContent = currentLang === 'el' ? 'EN' : 'GR';



      // Load from cache or mock database first for instantaneous (0ms) render
      const hasCache = loadDatabaseCache();
      if (!hasCache) {
        loadMockDatabase();
      }

      const pDisp = document.getElementById('priceDisplay');
      if (pDisp) pDisp.textContent = RATE;
      document.getElementById('cleaningFee').textContent = '€' + CLEANING;
      updateAMAFooter();

      // Default check-in/out dates
      const t = new Date(); t.setDate(t.getDate() + 1);
      const t2 = new Date(); t2.setDate(t2.getDate() + 4);
      document.getElementById('checkin').value = t.toISOString().split('T')[0];
      document.getElementById('checkout').value = t2.toISOString().split('T')[0];

      // Build photo carousel
      buildGalleryCarousel();

      // Build reviews carousel
      buildReviewsCarousel();

      // Query weather metrics
      fetchLiveWeather();

      // Scroll reveal and shrink nav
      initScrollReveal();

      // Apply translations
      setLanguage(currentLang);

      // Render calendar & initial price breakdown from cache/mock
      buildCalendar();
      updatePrice();

      // Initialize Lucide icons
      if (window.lucide) {
        lucide.createIcons();
      }

      // Start Hero background slideshow loop
      startHeroSlideshow();

      // Sync with Supabase asynchronously
      if (!isDemoMode && sb) {
        syncPromise = syncSupabaseDatabase();
      }

      // Wait for both loading animation min time and database sync to complete
      try {
        await Promise.all([minTimePromise, syncPromise]);
      } catch (e) {
        console.error("Failed to sync database during initialization:", e);
      } finally {
        // Fade out and remove loading screen, restore scrolling
        const loader = document.getElementById('loading-screen');
        if (loader) {
          loader.classList.add('fade-out');
        }
        document.body.classList.remove('loading-active');
        if (window.lucide) {
          lucide.createIcons();
        }
      }
    }

    let heroSlideInterval = null;
    let currentHeroSlide = 0;

    function startHeroSlideshow() {
      const slides = document.querySelectorAll('.hero-bg-slide');
      if (slides.length === 0) return;

      if (heroSlideInterval) clearInterval(heroSlideInterval);

      heroSlideInterval = setInterval(() => {
        jumpToHeroSlide((currentHeroSlide + 1) % slides.length);
      }, 6000);
    }

    function jumpToHeroSlide(index) {
      const slides = document.querySelectorAll('.hero-bg-slide');
      const dots = document.querySelectorAll('.hero-indicator');
      if (slides.length === 0) return;

      slides[currentHeroSlide].classList.remove('active');
      if (dots[currentHeroSlide]) dots[currentHeroSlide].classList.remove('active');

      currentHeroSlide = index;
      slides[currentHeroSlide].classList.add('active');
      if (dots[currentHeroSlide]) dots[currentHeroSlide].classList.add('active');

      startHeroSlideshow();
    }

    function loadMockDatabase() {
      RATE = demoSettings.price_per_night;
      CLEANING = demoSettings.cleaning_fee;
      SVC_PCT = demoSettings.service_fee_pct;

      seasonalRates = JSON.parse(localStorage.getItem('oikos_demo_seasonal_rates')) || [
        { id: 'sr1', name: 'High Season (July)', date_from: '2026-07-01', date_to: '2026-07-31', price_per_night: 110 },
        { id: 'sr2', name: 'Peak Season (August)', date_from: '2026-08-01', date_to: '2026-08-31', price_per_night: 130 },
        { id: 'sr3', name: 'September Promo', date_from: '2026-09-01', date_to: '2026-09-15', price_per_night: 95 }
      ];

      promoCodesList = JSON.parse(localStorage.getItem('oikos_demo_promo_codes')) || [
        { code: 'WELCOME10', type: 'percentage', value: 10, is_active: true },
        { code: 'DIRECT20', type: 'fixed', value: 20, is_active: true }
      ];

      demoBookings.forEach(r => {
        let d = new Date(r.check_in), e = new Date(r.check_out);
        while (d < e) { bookedDates.add(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1); }
      });
      demoBlocked.forEach(r => {
        let d = new Date(r.date_from), e = new Date(r.date_to);
        while (d <= e) { blockedDates.add(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1); }
      });
    }

    function pad(n) { return String(n).padStart(2, '0'); }
    function ds(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
    function unavail(d) { return bookedDates.has(d) || blockedDates.has(d); }

    function buildCalendar() {
      const wrap = document.getElementById('calendarWrap');
      const first = new Date(viewYear, viewMonth, 1).getDay();
      const days = new Date(viewYear, viewMonth + 1, 0).getDate();
      const today = new Date().toISOString().split('T')[0];
      const ci = document.getElementById('checkin').value;
      const co = document.getElementById('checkout').value;

      const monthsArr = currentLang === 'el' ? GR_MONTHS : EN_MONTHS;
      const daysArr = currentLang === 'el' ? GR_DAYS : EN_DAYS;

      let h = `<div class="cal-head"><button class="cal-nav" onclick="changeMonth(-1)">‹</button><span class="cal-month-lbl">${monthsArr[viewMonth]} ${viewYear}</span><button class="cal-nav" onclick="changeMonth(1)">›</button></div><div class="cal-body"><div class="cal-days">`;
      daysArr.forEach(d => h += `<div class="cal-day-name">${d}</div>`);
      for (let i = 0; i < first; i++) h += `<div class="cal-day empty"></div>`;

      for (let d = 1; d <= days; d++) {
        const date = ds(viewYear, viewMonth, d);
        let cls = 'cal-day';
        if (date < today) cls += ' past';
        else if (unavail(date)) cls += ' booked';
        else if (date === ci || date === co) cls += ' selected';
        else if (ci && co && date > ci && date < co) cls += ' in-range';
        if (date === today) cls += ' today';

        const click = (!unavail(date) && date >= today) ? `onclick="pickDate('${date}')"` : '';
        
        let cellContent = `<span class="cal-day-num">${d}</span>`;
        if (date >= today && !unavail(date)) {
          const price = getPriceForDate(date);
          cellContent += `<span class="cal-day-price">€${price}</span>`;
          cls += ' has-price';
        }
        h += `<div class="${cls}" ${click}>${cellContent}</div>`;
      }

      const labelSelected = currentLang === 'el' ? 'Επιλεγμένο' : 'Selected';
      const labelUnavail = currentLang === 'el' ? 'Μη διαθέσιμο' : 'Unavailable';
      h += `</div></div><div class="cal-legend"><div class="cal-leg"><div class="cal-leg-dot" style="background:var(--ink)"></div>${labelSelected}</div><div class="cal-leg"><div class="cal-leg-dot" style="background:var(--linen);border:1px solid #ddd"></div>${labelUnavail}</div></div>`;
      wrap.innerHTML = h;
    }

    function changeMonth(dir) { viewMonth += dir; if (viewMonth > 11) { viewMonth = 0; viewYear++; } if (viewMonth < 0) { viewMonth = 11; viewYear--; } buildCalendar(); }

    function pickDate(date) {
      const ci = document.getElementById('checkin'), co = document.getElementById('checkout');
      if (!ci.value || (ci.value && co.value)) { ci.value = date; co.value = ''; }
      else if (date > ci.value) {
        let d = new Date(ci.value); d.setDate(d.getDate() + 1); let bl = false;
        while (d < new Date(date)) { if (unavail(d.toISOString().split('T')[0])) { bl = true; break; } d.setDate(d.getDate() + 1); }
        if (bl) { ci.value = date; co.value = ''; } else co.value = date;
      } else { ci.value = date; co.value = ''; }
      updatePrice(); buildCalendar();
    }

    function onDateInputChange() {
      updatePrice();
      buildCalendar();
    }

    function getPriceForDate(dateStr) {
      const rate = seasonalRates.find(r => dateStr >= r.date_from && dateStr <= r.date_to);
      return rate ? +rate.price_per_night : RATE;
    }

    function calculateBasePrice(checkIn, checkOut) {
      let totalBase = 0;
      let d = new Date(checkIn);
      const e = new Date(checkOut);
      while (d < e) {
        const dateStr = d.toISOString().split('T')[0];
        totalBase += getPriceForDate(dateStr);
        d.setDate(d.getDate() + 1);
      }
      return totalBase;
    }

    async function applyPromoCode() {
      const input = document.getElementById('promoCodeInput').value.trim().toUpperCase();
      const msgEl = document.getElementById('promoMsg');

      if (!input) {
        appliedPromo = null;
        msgEl.style.display = 'none';
        updatePrice();
        return;
      }

      let found = promoCodesList.find(pc => pc.code === input && pc.is_active);

      if (!found && !isDemoMode && sb) {
        try {
          const { data, error } = await sb.from('promo_codes').select('*').eq('code', input).eq('is_active', true).maybeSingle();
          if (data) found = data;
        } catch (e) {
          console.error("Error querying promo code:", e);
        }
      }

      if (found) {
        appliedPromo = { code: found.code, type: found.type, value: +found.value };
        msgEl.style.color = 'var(--gold)';
        if (currentLang === 'el') {
          msgEl.textContent = `Ο κωδικός ${found.code} εφαρμόστηκε! (${found.type === 'percentage' ? found.value + '%' : '€' + found.value} έκπτωση)`;
        } else {
          msgEl.textContent = `Promo code ${found.code} applied! (${found.type === 'percentage' ? found.value + '%' : '€' + found.value} discount)`;
        }
        msgEl.style.display = 'block';
      } else {
        appliedPromo = null;
        msgEl.style.color = '#A94442';
        if (currentLang === 'el') {
          msgEl.textContent = 'Μη έγκυρος ή ληγμένος κωδικός προσφοράς.';
        } else {
          msgEl.textContent = 'Invalid or expired promo code.';
        }
        msgEl.style.display = 'block';
      }

      updatePrice();
    }

    function updatePrice() {
      const ci = document.getElementById('checkin').value, co = document.getElementById('checkout').value;
      const bd = document.getElementById('priceBreakdown');
      if (!ci || !co) { bd.style.display = 'none'; return; }
      const n = Math.round((new Date(co) - new Date(ci)) / 86400000);
      if (n <= 0) { bd.style.display = 'none'; return; }

      const guestsCount = +document.getElementById('guests').value;
      const extraGuestCost = (guestsCount === 3 && EXTRA_GUEST_CHARGE > 0) ? EXTRA_GUEST_CHARGE * n : 0;
      const base = calculateBasePrice(ci, co);
      const svc = Math.round(base * SVC_PCT / 100);

      // Calculate discount
      let discount = 0;
      if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
          discount = Math.round(base * appliedPromo.value / 100);
        } else if (appliedPromo.type === 'fixed') {
          discount = appliedPromo.value;
        }
      }

      const total = base + CLEANING + svc + extraGuestCost - discount;

      // Calculate individual pricing breakdown for distinct nightly rates
      const ratesBreakdown = {};
      let tempDate = new Date(ci);
      const endDate = new Date(co);
      while (tempDate < endDate) {
        const dateStr = tempDate.toISOString().split('T')[0];
        const price = getPriceForDate(dateStr);
        ratesBreakdown[price] = (ratesBreakdown[price] || 0) + 1;
        tempDate.setDate(tempDate.getDate() + 1);
      }

      const breakdownParts = [];
      const sortedRates = Object.keys(ratesBreakdown).map(Number).sort((a, b) => a - b);
      sortedRates.forEach(price => {
        const count = ratesBreakdown[price];
        const nightWord = currentLang === 'el' ? (count === 1 ? 'νύχτα' : 'νύχτες') : (count === 1 ? 'night' : 'nights');
        breakdownParts.push(`${count} ${nightWord} × €${price}`);
      });
      
      document.getElementById('nightsLabel').textContent = breakdownParts.join(', ');
      document.getElementById('nightsCost').textContent = '€' + base;

      const extraLine = document.getElementById('extraGuestLine');
      if (extraGuestCost > 0) {
        document.getElementById('extraGuestCost').textContent = '€' + extraGuestCost;
        extraLine.style.display = 'flex';
      } else {
        extraLine.style.display = 'none';
      }

      const cleanLine = document.getElementById('cleaningLine');
      if (CLEANING > 0) {
        document.getElementById('cleaningFee').textContent = '€' + CLEANING;
        cleanLine.style.display = 'flex';
      } else {
        cleanLine.style.display = 'none';
      }

      const svcLine = document.getElementById('serviceLine');
      if (svc > 0) {
        document.getElementById('serviceFee').textContent = '€' + svc;
        svcLine.style.display = 'flex';
      } else {
        svcLine.style.display = 'none';
      }

      // Render Discount Line
      const discountLine = document.getElementById('discountLine');
      if (discount > 0) {
        document.getElementById('discountFee').textContent = '-€' + discount;
        discountLine.style.display = 'flex';
      } else {
        discountLine.style.display = 'none';
      }

      document.getElementById('totalCost').textContent = '€' + Math.max(total, 0);
      bd.style.display = 'block';
    }

    async function submitBooking() {
      // Check GDPR Consent Checkbox
      const gdprEl = document.getElementById('gdprConsent');
      if (gdprEl && !gdprEl.checked) {
        const title = currentLang === 'el' ? 'Συναίνεση Δεδομένων' : 'Data Consent';
        const msg = currentLang === 'el'
          ? 'Παρακαλώ αποδεχτείτε την επεξεργασία των προσωπικών σας δεδομένων για να προχωρήσει η κράτηση.'
          : 'Please accept the processing of your personal data to proceed with your booking.';
        showCustomAlert(title, msg);
        return;
      }

      const nameEl = document.getElementById('guestName');
      const emailEl = document.getElementById('guestEmail');
      const ciEl = document.getElementById('checkin');
      const coEl = document.getElementById('checkout');

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const ci = ciEl.value;
      const co = coEl.value;

      let hasErrors = false;

      // Reset any existing invalid highlight state
      [nameEl, emailEl, ciEl, coEl].forEach(el => el.classList.remove('invalid'));

      // Validate each field and add .invalid class if empty
      if (!name) { nameEl.classList.add('invalid'); hasErrors = true; }
      if (!email) { emailEl.classList.add('invalid'); hasErrors = true; }
      if (!ci) { ciEl.classList.add('invalid'); hasErrors = true; }
      if (!co) { coEl.classList.add('invalid'); hasErrors = true; }

      if (hasErrors) {
        const title = currentLang === 'el' ? 'Ελλιπή Στοιχεία' : 'Missing Fields';
        const alertMsg = currentLang === 'el' ? 'Παρακαλώ συμπλήρωσε όλα τα υποχρεωτικά πεδία (Όνομα, Email, Ημερομηνίες).' : 'Please fill in all mandatory fields (Name, Email, Dates).';
        showCustomAlert(title, alertMsg);

        // Attach listeners to remove the invalid style immediately when typing/changing
        const removeInvalid = (e) => e.target.classList.remove('invalid');
        [nameEl, emailEl, ciEl, coEl].forEach(el => {
          el.addEventListener('input', removeInvalid, { once: true });
          el.addEventListener('change', removeInvalid, { once: true });
        });
        return;
      }

      const n = Math.round((new Date(co) - new Date(ci)) / 86400000);
      const guestsCount = +document.getElementById('guests').value;
      const extraGuestCost = (guestsCount === 3 && EXTRA_GUEST_CHARGE > 0) ? EXTRA_GUEST_CHARGE * n : 0;
      const base = calculateBasePrice(ci, co);
      const svc = Math.round(base * SVC_PCT / 100);

      let discount = 0;
      if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
          discount = Math.round(base * appliedPromo.value / 100);
        } else if (appliedPromo.type === 'fixed') {
          discount = appliedPromo.value;
        }
      }

      const total = base + CLEANING + svc + extraGuestCost - discount;
      const btn = document.getElementById('submitBtn');

      btn.textContent = currentLang === 'el' ? 'Αποστολή...' : 'Submitting...';
      btn.disabled = true;

      if (!isDemoMode && sb) {
        try {
          const { error } = await sb.from('bookings').insert({
            guest_name: name, guest_email: email,
            guest_phone: document.getElementById('guestPhone').value || null,
            check_in: ci, check_out: co,
            guests: guestsCount,
            total_price: total, notes: document.getElementById('guestMsg').value || null,
            status: 'pending', source: 'website',
            promo_code: appliedPromo ? appliedPromo.code : null,
            discount_amount: discount
          });
          btn.textContent = currentLang === 'el' ? 'Αίτηση Κράτησης' : 'Request Booking';
          btn.disabled = false;
          if (error) {
            const title = currentLang === 'el' ? 'Σφάλμα Κράτησης' : 'Booking Error';
            const errAlert = currentLang === 'el' ? 'Κάτι πήγε στραβά με την καταχώρηση. Δοκίμασε ξανά.' : 'Something went wrong with the reservation. Please try again.';
            showCustomAlert(title, errAlert);
            return;
          }

          // Trigger email notification in the background (does not block showing success modal)
          sendEmailNotification({
            name, email, phone: document.getElementById('guestPhone').value || '',
            ci, co, guestsCount, total, msg: document.getElementById('guestMsg').value || ''
          }).catch(err => console.error("Email notification failed:", err));

          document.getElementById('successModal').classList.add('open');
        } catch (e) {
          console.error("Supabase booking insert error:", e);
          saveDemoBookingLocally(name, email, ci, co, total);

          sendEmailNotification({
            name, email, phone: document.getElementById('guestPhone').value || '',
            ci, co, guestsCount, total, msg: document.getElementById('guestMsg').value || ''
          }).catch(err => console.error("Email notification failed:", err));

          document.getElementById('successModal').classList.add('open');
        }
      } else {
        setTimeout(() => {
          saveDemoBookingLocally(name, email, ci, co, total);
          btn.textContent = currentLang === 'el' ? 'Αίτηση Κράτησης' : 'Request Booking';
          btn.disabled = false;

          // Trigger email notification in the background
          sendEmailNotification({
            name, email, phone: document.getElementById('guestPhone').value || '',
            ci, co, guestsCount, total, msg: document.getElementById('guestMsg').value || ''
          }).catch(err => console.error("Email notification failed:", err));

          document.getElementById('successModal').classList.add('open');
        }, 800);
      }
    }

    async function sendEmailNotification(data) {
      try {
        const formData = new FormData();

        if (currentLang === 'el') {
          formData.append("Όνομα", data.name);
          formData.append("Email", data.email);
          formData.append("Τηλέφωνο", data.phone || '—');
          formData.append("Check-in (Άφιξη)", data.ci);
          formData.append("Check-out (Αναχώρηση)", data.co);
          formData.append("Επισκέπτες", data.guestsCount);
          formData.append("Συνολικό Κόστος", `€${data.total}`);
          formData.append("Σημειώσεις / Μήνυμα", data.msg || 'Καμία');
          formData.append("Σύνδεσμος Διαχείρισης (Admin Panel)", "https://www.oikoshomeliving.com/admin");
          formData.append("_subject", `Νέα Αίτηση Κράτησης από ${data.name} (${data.ci} έως ${data.co})`);
        } else {
          formData.append("Guest Name", data.name);
          formData.append("Email", data.email);
          formData.append("Phone", data.phone || 'N/A');
          formData.append("Check-in Date", data.ci);
          formData.append("Check-out Date", data.co);
          formData.append("Guests Count", data.guestsCount);
          formData.append("Total Price", `€${data.total}`);
          formData.append("Notes / Message", data.msg || 'None');
          formData.append("Admin Dashboard Link", "https://www.oikoshomeliving.com/admin");
          formData.append("_subject", `New Booking Request from ${data.name} (${data.ci} to ${data.co})`);
        }

        formData.append("_template", "table");

        const response = await fetch("https://formsubmit.co/ajax/oikoshomeliving@outlook.com", {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        console.log("Email notification status:", result);
      } catch (err) {
        console.error("Failed to send email notification:", err);
      }
    }

    function saveDemoBookingLocally(name, email, ci, co, total) {
      let localBookings = JSON.parse(localStorage.getItem('oikos_demo_bookings')) || demoBookings;

      const n = Math.round((new Date(co) - new Date(ci)) / 86400000);
      const base = calculateBasePrice(ci, co);
      let discount = 0;
      if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
          discount = Math.round(base * appliedPromo.value / 100);
        } else if (appliedPromo.type === 'fixed') {
          discount = appliedPromo.value;
        }
      }

      localBookings.push({
        id: 'mock_' + Date.now(),
        guest_name: name,
        guest_email: email,
        guest_phone: document.getElementById('guestPhone').value || null,
        check_in: ci,
        check_out: co,
        guests: +document.getElementById('guests').value.charAt(0),
        total_price: total,
        status: 'confirmed',
        source: 'website',
        promo_code: appliedPromo ? appliedPromo.code : null,
        discount_amount: discount
      });
      localStorage.setItem('oikos_demo_bookings', JSON.stringify(localBookings));

      let d = new Date(ci), e = new Date(co);
      while (d < e) {
        bookedDates.add(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
      buildCalendar();
    }

    function closeModal() { document.getElementById('successModal').classList.remove('open'); }
    function showCustomAlert(title, desc) {
      document.getElementById('alertModalTitle').innerHTML = title;
      document.getElementById('alertModalDesc').innerHTML = desc;
      document.getElementById('alertModal').classList.add('open');
    }
    function closeAlertModal() { document.getElementById('alertModal').classList.remove('open'); }

    // LEAFLET MAP & TRAVEL GUIDE
    function initLeafletMap() {
      try {
        const villaCoords = [36.8497694, 27.0757225];
        leafletMap = L.map('map', { scrollWheelZoom: false }).setView(villaCoords, 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(leafletMap);

        const goldIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const villaMarker = L.marker(villaCoords, { icon: goldIcon }).addTo(leafletMap);
        const villaPopup = currentLang === 'el'
          ? '<div style="font-family:var(--f-serif);font-size:0.85rem;font-weight:600;text-align:center;">OIKΩS Home Living<br><a href="https://maps.app.goo.gl/GEmWMuk68kwvUDYg9" target="_blank" style="color:var(--gold);font-size:0.7rem;text-decoration:none;">Οδηγίες Google Maps</a></div>'
          : '<div style="font-family:var(--f-serif);font-size:0.85rem;font-weight:600;text-align:center;">OIKΩS Home Living<br><a href="https://maps.app.goo.gl/GEmWMuk68kwvUDYg9" target="_blank" style="color:var(--gold);font-size:0.7rem;text-decoration:none;">Google Maps Directions</a></div>';
        villaMarker.bindPopup(villaPopup).openPopup();
      } catch (e) {
        console.error("Leaflet map initialization failed:", e);
        document.getElementById('map').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--mid);font-family:var(--f-mono);font-size:.75rem">📍 Map coordinates loaded. Connect internet to load map tiles.</div>`;
      }
    }

    // PHOTO CAROUSEL BUILDER
    function buildGalleryCarousel() {
      const track = document.getElementById('galleryTrack');
      const indContainer = document.getElementById('galleryIndicators');
      track.innerHTML = '';
      indContainer.innerHTML = '';

      galleryImages.forEach((img, index) => {
        const title = currentLang === 'el' ? img.title_el : img.title_en;
        const sub = currentLang === 'el' ? img.sub_el : img.sub_en;

        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('onclick', `openLightbox(${index})`);
        card.innerHTML = `
        <img src="${img.src}" alt="${title}" loading="lazy"/>
        <div class="gallery-card-info">
          <h4 class="gallery-card-title">${title}</h4>
          <p class="gallery-card-sub">${sub}</p>
        </div>
      `;
        track.appendChild(card);

        // Indicator dots (only show 4 indicators since it scrolls by card step)
        if (index <= galleryImages.length - 3) {
          const dot = document.createElement('div');
          dot.className = `indicator-dot ${index === 0 ? 'active' : ''}`;
          dot.setAttribute('onclick', `jumpToGallery(${index})`);
          indContainer.appendChild(dot);
        }
      });
    }

    function moveGallery(dir) {
      const maxIndex = galleryImages.length - 3; // 3 items visible at once
      let target = activeGalleryIndex + dir;

      // Loop boundary check
      if (target < 0) target = maxIndex;
      if (target > maxIndex) target = 0;

      jumpToGallery(target);
    }

    function jumpToGallery(index) {
      activeGalleryIndex = index;
      const track = document.getElementById('galleryTrack');

      // Calculate translate percentage based on screen size
      let cardWidthPct = 33.333; // 3 cards visible
      if (window.innerWidth <= 980) cardWidthPct = 50; // 2 cards visible
      if (window.innerWidth <= 640) cardWidthPct = 100; // 1 card visible

      const gap = 20;
      track.style.transform = `translateX(calc(-${index * cardWidthPct}% - ${index * (gap / 3)}px))`;

      // Update active dot indicators
      document.querySelectorAll('.indicator-dot').forEach((dot, idx) => {
        if (idx === index) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    // REVIEWS CAROUSEL BUILDER
    function buildReviewsCarousel() {
      const track = document.getElementById('reviewsTrack');
      const indContainer = document.getElementById('reviewsIndicators');
      track.innerHTML = '';
      indContainer.innerHTML = '';

      reviewsData.forEach((rev, index) => {
        const date = currentLang === 'el' ? rev.date_el : rev.date_en;
        const text = currentLang === 'el' ? rev.text_el : rev.text_en;
        const bgStyle = rev.bg ? `style="background:${rev.bg}"` : '';

        const slide = document.createElement('div');
        slide.className = `review-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
        <div class="review-card">
          <div class="reviewer-row">
            <div class="reviewer-av" ${bgStyle}>${rev.av}</div>
            <div>
              <div class="reviewer-name">${rev.name}</div>
              <div class="reviewer-date">${date}</div>
            </div>
          </div>
          <div class="review-stars">★★★★★</div>
          <p class="review-text">${text}</p>
        </div>
      `;
        track.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `rev-indicator ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('onclick', `jumpToReview(${index})`);
        indContainer.appendChild(dot);
      });
    }

    function moveReviews(dir) {
      let target = activeReviewIndex + dir;
      if (target < 0) target = reviewsData.length - 1;
      if (target >= reviewsData.length) target = 0;
      jumpToReview(target);
    }

    function jumpToReview(index) {
      activeReviewIndex = index;
      document.querySelectorAll('.review-slide').forEach((slide, idx) => {
        if (idx === index) slide.classList.add('active');
        else slide.classList.remove('active');
      });

      document.querySelectorAll('.rev-indicator').forEach((dot, idx) => {
        if (idx === index) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    // FAQ COLLAPSIBLE TOGGLE
    function toggleFaq(buttonElement) {
      const faqItem = buttonElement.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close other panels
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    }

    let lastTemp = localStorage.getItem('oikos_weather_temp') ? parseInt(localStorage.getItem('oikos_weather_temp')) : null;
    let lastWeatherCode = localStorage.getItem('oikos_weather_code') ? parseInt(localStorage.getItem('oikos_weather_code')) : null;

    // LIVE WEATHER FETCH (OPEN-METEO)
    async function fetchLiveWeather() {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=36.8498&longitude=27.0757&current=temperature_2m,weather_code");
        const data = await res.json();
        if (data && data.current) {
          lastTemp = Math.round(data.current.temperature_2m);
          lastWeatherCode = data.current.weather_code;
          localStorage.setItem('oikos_weather_temp', lastTemp);
          localStorage.setItem('oikos_weather_code', lastWeatherCode);
          renderWeather();
        }
      } catch (e) {
        console.warn("Could not retrieve current weather metrics:", e);
        if (lastTemp === null) {
          document.getElementById('heroWeather').style.display = 'none';
        }
      }
    }

    function renderWeather() {
      const el = document.getElementById('weatherText');
      if (!el) return;

      if (lastTemp === null || lastWeatherCode === null) {
        el.textContent = currentLang === 'el' ? 'Μαστιχάρι · Φόρτωση...' : 'Mastichari · Loading...';
        return;
      }

      let desc = '';
      const code = lastWeatherCode;
      if (code === 0) desc = currentLang === 'el' ? 'Καθαρός Ουρανός' : 'Sunny & Clear';
      else if (code <= 3) desc = currentLang === 'el' ? 'Ελαφρά Συννεφιά' : 'Partly Cloudy';
      else if (code <= 48) desc = currentLang === 'el' ? 'Ομίχλη' : 'Foggy';
      else if (code <= 65) desc = currentLang === 'el' ? 'Βροχερός' : 'Rainy';
      else if (code <= 82) desc = currentLang === 'el' ? 'Τοπικές Μπόρες' : 'Showers';
      else desc = currentLang === 'el' ? 'Ήπιος Καιρός' : 'Mild Weather';

      const loc = currentLang === 'el' ? 'Μαστιχάρι' : 'Mastichari';
      el.textContent = `${loc} · ${lastTemp}°C · ${desc}`;
    }

    // TRANSLATION ENGINE TRIGGER
    function toggleLanguage() {
      currentLang = currentLang === 'el' ? 'en' : 'el';
      localStorage.setItem('oikos_lang', currentLang);
      document.getElementById('langLabel').textContent = currentLang === 'el' ? 'EN' : 'GR';

      setLanguage(currentLang);
      buildCalendar();
      updatePrice();
      buildGalleryCarousel();
      buildReviewsCarousel();
    }

    // THEME ENGINE TRIGGER
    function toggleTheme() {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('oikos_theme', isDark ? 'dark' : 'light');

      const icon = document.getElementById('themeIcon');
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
        if (window.lucide) {
          lucide.createIcons();
        }
      }
    }

    function setLanguage(lang) {
      document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
          el.innerHTML = translations[lang][key];
        }
      });

      // Inputs placeholders translation
      const placeholders = {
        guestName: lang === 'el' ? 'Γιάννης Παπαδόπουλος' : 'John Doe',
        guestEmail: lang === 'el' ? 'email@example.com' : 'john.doe@example.com',
        guestPhone: lang === 'el' ? '+30 693 000 0000' : '+1 555 123 4567',
        guestMsg: lang === 'el' ? 'Ώρα άφιξης, ερωτήσεις...' : 'Expected arrival time, questions, requests...'
      };

      Object.keys(placeholders).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.placeholder = placeholders[id];
      });

      renderWeather();
      updateHouseRulesTime();
    }

    function updateHouseRulesTime() {
      const el = document.getElementById('ruleTimeDesc');
      if (el) {
        el.textContent = currentLang === 'el'
          ? `Check-in από ${CHECK_IN_TIME} · Check-out έως ${CHECK_OUT_TIME}`
          : `Check-in from ${CHECK_IN_TIME} · Check-out until ${CHECK_OUT_TIME}`;
      }
      const quietEl = document.getElementById('ruleQuietDesc');
      if (quietEl) {
        quietEl.textContent = currentLang === 'el'
          ? `${QUIET_HOURS} ώρες κοινής ησυχίας`
          : `${QUIET_HOURS} quiet hours observed`;
      }
    }

    // SCROLL REVEAL UTIL
    function initScrollReveal() {
      const reveals = document.querySelectorAll('.reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');

            // Lazy load Leaflet map when location-layout enters viewport
            if (entry.target.classList.contains('location-layout') && !leafletMap) {
              initLeafletMap();
            }

            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      reveals.forEach(r => observer.observe(r));

      let scrollTimeout = false;
      let isScrolled = false;
      window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
          window.requestAnimationFrame(() => {
            const nav = document.querySelector('nav');
            if (nav) {
              const scrolled = window.scrollY > 50;
              if (scrolled !== isScrolled) {
                isScrolled = scrolled;
                if (scrolled) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
              }
            }
            scrollTimeout = false;
          });
          scrollTimeout = true;
        }
      }, { passive: true });
    }



    // LIGHTBOX PHOTO GALLERY LOGIC
    function openLightbox(index) {
      activeLightboxIndex = index;
      updateLightboxContent();
      document.getElementById('galleryLightbox').classList.add('open');
    }

    function closeLightbox() {
      document.getElementById('galleryLightbox').classList.remove('open');
    }

    function updateLightboxContent() {
      const imgObj = galleryImages[activeLightboxIndex];
      document.getElementById('lightboxImg').src = imgObj.src;

      const title = currentLang === 'el' ? imgObj.title_el : imgObj.title_en;
      const sub = currentLang === 'el' ? imgObj.sub_el : imgObj.sub_en;
      document.getElementById('lightboxCaption').innerHTML = `<strong style="color:#fff;">${title}</strong> — <span style="font-family:var(--f-sans); font-size:0.85rem;">${sub}</span>`;
    }

    function prevLightboxImage() {
      activeLightboxIndex = (activeLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
      updateLightboxContent();
    }

    function nextLightboxImage() {
      activeLightboxIndex = (activeLightboxIndex + 1) % galleryImages.length;
      updateLightboxContent();
    }

    // Bind keyboard navigation to lightbox
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('galleryLightbox');
      if (lightbox.classList.contains('open')) {
        if (e.key === 'ArrowLeft') prevLightboxImage();
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'Escape') closeLightbox();
      }
    });

    function toggleMobileMenu() {
      const menu = document.getElementById('mobileMenu');
      menu.classList.toggle('open');
    }

    // Touch Swipe Gesture Support for Space Gallery Carousel on mobile
    let touchStartX = 0;
    let touchEndX = 0;

    function initMobileSwipeSupport() {
      const trackContainer = document.querySelector('.gallery-carousel-track-container');
      if (trackContainer) {
        trackContainer.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        trackContainer.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipeGesture();
        }, { passive: true });
      }
    }

    function handleSwipeGesture() {
      const threshold = 50; // minimum pixels for swipe
      if (touchStartX - touchEndX > threshold) {
        moveGallery(1); // Swiped Left
      } else if (touchEndX - touchStartX > threshold) {
        moveGallery(-1); // Swiped Right
      }
    }

    // Re-adjust carousel layout on window resize
    window.addEventListener('resize', () => {
      jumpToGallery(activeGalleryIndex);
    });

    // Initialize all components
    init();
    initMobileSwipeSupport();
