import {
  Activity,
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  Eye,
  Facebook,
  FileText,
  Globe2,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PanelRight,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { commonBusinessTypes } from "@/data/globalLocations";
import { availabilityFilterOptions, filterLeads, type AvailabilityFilter } from "@/lib/leadSearchFilters";
import { buildSavedFilterPayload, type SavedFilterPayload, type SavedFilterView } from "@/lib/savedSearchFilters";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Lead = {
  id: number;
  company: string;
  location: string;
  category: string;
  opportunity: string;
  score: number;
  email: string;
  ownerEmail?: string;
  founderEmail?: string;
  phone: string;
  whatsapp?: string;
  facebookPage?: string;
  instagram?: string;
  linkedinProfile?: string;
  googleProfile?: string;
  website: string;
  reason: string;
  service: string;
  reviews: string;
  accent: string;
};

type User = { id: number; name: string | null; email: string; plan: string };
type LocationCountry = { code: string; name: string; iso3: string; emoji: string };
type LocationState = { code: string; name: string; type: string | null };
type LocationCity = { id: number; name: string };
type SearchMode = "individual" | "company";

const worldLocations: Record<string, Record<string, string[]>> = {
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue", "Olympia"],
  },
  "France": {
    "Île-de-France (Paris Region)": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Argenteuil"],
    "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes"],
    "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Annecy"],
    "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"],
    "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Pau", "La Rochelle", "Bayonne"],
  },
  "United Kingdom": {
    "England (Greater London)": ["London", "Westminster", "Camden", "Greenwich", "Croydon"],
    "England (North West)": ["Manchester", "Liverpool", "Blackpool", "Bolton", "Salford"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Craigavon", "Newry"],
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Banff"],
  },
  "Germany": {
    "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg"],
    "Berlin": ["Berlin"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg"],
    "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg"],
  },
  "Japan": {
    "Tokyo Metropolis": ["Tokyo", "Shinjuku", "Shibuya", "Ginza", "Roppongi"],
    "Osaka Prefecture": ["Osaka", "Sakai", "Higashiosaka", "Hirakata", "Toyonaka"],
    "Kanagawa Prefecture": ["Yokohama", "Kawasaki", "Sagamihara", "Yokosuka", "Fujisawa"],
    "Hokkaido Prefecture": ["Sapporo", "Asahikawa", "Hakodate", "Kushiro", "Obihiro"],
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Parramatta", "Byron Bay"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"],
    "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville", "Sunshine Coast"],
    "Western Australia": ["Perth", "Fremantle", "Bunbury", "Broome", "Albany"],
  },
  "Italy": {
    "Lombardy": ["Milan", "Brescia", "Monza", "Bergamo", "Como"],
    "Lazio": ["Rome", "Latina", "Frosinone", "Viterbo", "Rieti"],
    "Campania": ["Naples", "Salerno", "Giugliano in Campania", "Torre del Greco", "Pozzuoli"],
    "Veneto": ["Venice", "Verona", "Padua", "Vicenza", "Treviso"],
  },
  "Spain": {
    "Community of Madrid": ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés"],
    "Catalonia": ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell"],
    "Andalusia": ["Seville", "Málaga", "Cordoba", "Granada", "Jerez de la Frontera"],
    "Valencia": ["Valencia", "Alicante", "Elche", "Castellón de la Plana", "Torrevieja"],
  },
  "Brazil": {
    "São Paulo": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santos"],
    "Rio de Janeiro": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói"],
    "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Belo Horizonte"],
  },
  "Mexico": {
    "Mexico City": ["Mexico City", "Iztapalapa", "Gustavo A. Madero", "Coyoacán", "Tlalpan"],
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta"],
    "Nuevo León": ["Monterrey", "San Pedro Garza García", "Apodaca", "Guadalupe", "San Nicolás de los Garza"],
  },
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai", "Jebel Ali", "Hatta"],
    "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Madinat Zayed"],
    "Sharjah": ["Sharjah", "Khor Fakkan", "Kalba"],
  },
  "Saudi Arabia": {
    "Riyadh Province": ["Riyadh", "Al Diriyah", "Al Kharj", "Wadi ad-Dawasir"],
    "Makkah Province": ["Mecca", "Jeddah", "Taif", "Al Qunfudhah"],
    "Eastern Province": ["Dammam", "Khobar", "Dhahran", "Jubail", "Al Ahsa"],
  },
  "Singapore": {
    "Central Region": ["Singapore", "Marina Bay", "Orchard", "Chinatown", "Sentosa"],
    "East Region": ["Tampines", "Pasir Ris", "Changi", "Bedok"],
    "West Region": ["Jurong East", "Jurong West", "Clementi", "Boon Lay"],
  },
};

const allCountries = Object.keys(worldLocations).sort();

const leads: Lead[] = [
  {
    id: 1,
    company: "Napoli Pizza House",
    location: "Los Angeles, CA",
    category: "Restaurant",
    opportunity: "Weak Website",
    score: 92,
    email: "napolipizzahouse@gmail.com",
    ownerEmail: "marco.rossi@napolipizzahouse.com",
    founderEmail: "marco.rossi@napolipizzahouse.com",
    phone: "(323) 555-0198",
    whatsapp: "+1 323 555 0198",
    facebookPage: "facebook.com/napolipizzahouse",
    instagram: "instagram.com/napolipizzahouse",
    linkedinProfile: "linkedin.com/company/napoli-pizza-house",
    googleProfile: "https://maps.google.com/?q=Napoli+Pizza+House",
    website: "napolipizzahouse.com",
    reason: "Website needs improvement",
    service: "Website Creation",
    reviews: "127 Google reviews (4.6 ★)",
    accent: "from-orange-500 to-amber-300",
  },
  {
    id: 2,
    company: "Sushi World LA",
    location: "Los Angeles, CA",
    category: "Restaurant",
    opportunity: "Weak Website",
    score: 88,
    email: "sushiworld.la@gmail.com",
    ownerEmail: "owner@sushiworldla.com",
    phone: "(323) 555-0123",
    whatsapp: "+1 323 555 0123",
    facebookPage: "facebook.com/sushiworldla",
    instagram: "instagram.com/sushiworldla",
    linkedinProfile: "linkedin.com/company/sushi-world-la",
    googleProfile: "https://maps.google.com/?q=Sushi+World+LA",
    website: "sushiworldla.com",
    reason: "Slow mobile experience",
    service: "Website Optimization",
    reviews: "86 Google reviews (4.4 ★)",
    accent: "from-cyan-500 to-blue-400",
  },
  {
    id: 3,
    company: "The Burger Spot",
    location: "Los Angeles, CA",
    category: "Restaurant",
    opportunity: "Weak SEO",
    score: 85,
    email: "theburgerspot.la@gmail.com",
    founderEmail: "founder@theburgerspotla.com",
    phone: "(323) 555-0145",
    facebookPage: "facebook.com/theburgerspotla",
    linkedinProfile: "linkedin.com/company/the-burger-spot-la",
    googleProfile: "https://maps.google.com/?q=The+Burger+Spot+LA",
    website: "theburgerspotla.com",
    reason: "Low local search visibility",
    service: "Local SEO",
    reviews: "64 Google reviews (4.5 ★)",
    accent: "from-violet-500 to-fuchsia-400",
  },
  {
    id: 4,
    company: "Taco Fiesta LA",
    location: "Los Angeles, CA",
    category: "Restaurant",
    opportunity: "Weak Social Media",
    score: 80,
    email: "tacofiesta.la@gmail.com",
    ownerEmail: "manager@tacofiestala.com",
    phone: "(323) 555-0177",
    whatsapp: "+1 323 555 0177",
    instagram: "instagram.com/tacofiestala",
    website: "tacofiestala.com",
    reason: "Low social presence",
    service: "Social Media Growth",
    reviews: "48 Google reviews (4.3 ★)",
    accent: "from-emerald-500 to-teal-300",
  },
  {
    id: 5,
    company: "Pasta Palace LA",
    location: "Los Angeles, CA",
    category: "Restaurant",
    opportunity: "Weak Website",
    score: 72,
    email: "pastapalace.la@gmail.com",
    phone: "(323) 555-0188",
    facebookPage: "facebook.com/pastapalacela",
    instagram: "instagram.com/pastapalacela",
    website: "pastapalacela.com",
    reason: "Outdated booking experience",
    service: "Website Creation",
    reviews: "39 Google reviews (4.2 ★)",
    accent: "from-rose-500 to-orange-300",
  },
  {
    id: 6,
    company: "Harborview Coffee Co.",
    location: "San Diego, CA",
    category: "Coffee Shop",
    opportunity: "Media Opportunity",
    score: 78,
    email: "hello@harborviewcoffee.com",
    ownerEmail: "owner@harborviewcoffee.com",
    phone: "(619) 555-0124",
    whatsapp: "+1 619 555 0124",
    facebookPage: "facebook.com/harborviewcoffee",
    instagram: "instagram.com/harborviewcoffee",
    linkedinProfile: "linkedin.com/company/harborviewcoffee",
    googleProfile: "maps.example.com/harborview-coffee",
    website: "harborviewcoffee.com",
    reason: "Strong local business with limited media visibility",
    service: "Local Media Growth",
    reviews: "86 Google reviews (4.6 ★)",
    accent: "from-sky-500 to-indigo-400",
  },
];

const opportunityOptions = [
  ["No Website", "No website", "Globe2"],
  ["Weak Website", "Needs improvement", "PanelRight"],
  ["Outdated Website", "Old or outdated", "FileText"],
  ["Poor Mobile Exp.", "Not mobile-friendly", "Smartphone"],
  ["Weak SEO", "Low rankings", "Search"],
  ["Low Visibility", "Hard to find", "Activity"],
  ["Weak Reviews", "No or weak reviews", "Star"],
  ["No Booking System", "No online booking", "CalendarDays"],
  ["No Menu Online", "No menu on website", "FileText"],
  ["Media Opportunity", "Not in news or media", "BarChart3"],
  ["Competitor Gap", "Competitors ahead", "Target"],
  ["Slow Website", "Slow loading speed", "Timer"],
  ["Security Issues", "SSL or security problems", "ShieldCheck"],
  ["Branding Weak", "Weak brand presence", "Sparkles"],
  ["Weak Social Media", "Low social presence", "MessageCircle"],
] as const;

const topNavItems: ReadonlyArray<readonly [string, ComponentType<{ className?: string }>, boolean]> = [
  ["Search", Search, true],
  ["Leads", Users, false],
  ["Opportunities", Target, false],
  ["Outreach", Mail, false],
  ["Reports", BarChart3, false],
  ["Integrations", Layers3, false],
];

const businessTypeAliases: Record<string, string[]> = {
  Plumber: ["pl", "plu", "plum", "bl"],
  Restaurant: ["res", "rest", "food"],
  "Dental Clinic": ["dent", "dental"],
  "Real Estate Agency": ["real", "estate", "re"],
  "Digital Marketing Agency": ["marketing", "agency", "digital"],
};

const contactOptions: ReadonlyArray<readonly [string, ComponentType<{ className?: string }>, boolean]> = [
  ["Business Email", Mail, false],
  ["Owner / Manager Email", UserRound, false],
  ["CEO / Founder Email", CrownIcon, true],
  ["Phone Number", Phone, true],
  ["WhatsApp Number", MessageCircle, false],
  ["Facebook Page", Facebook, true],
  ["Instagram", Instagram, true],
  ["LinkedIn Profile", Linkedin, true],
  ["Google Business Profile", MapPin, false],
  ["Website", Globe2, false],
];

function CrownIcon({ className }: { className?: string }) {
  return <span className={className}>♛</span>;
}

function api<T>(path: string) {
  return fetch(path, { credentials: "include" }).then(async (response) => {
    if (!response.ok) throw new Error(`${response.status}:${await response.text()}`);
    return response.json() as Promise<T>;
  });
}

function scoreClass(score: number) {
  if (score >= 90) return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
  if (score >= 80) return "bg-amber-500/20 text-amber-300 border-amber-400/30";
  return "bg-orange-500/20 text-orange-300 border-orange-400/30";
}

export default function CompanyLeadSearch() {
  const searchMode: SearchMode = "company";
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Location selection state
  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [availableRegions, setAvailableRegions] = useState<LocationState[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [availableCities, setAvailableCities] = useState<LocationCity[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [businessType, setBusinessType] = useState("");
  const [businessTypeDropdownOpen, setBusinessTypeDropdownOpen] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(["Weak Website", "Weak Social Media"]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(["Business Email", "Owner / Manager Email", "WhatsApp Number", "Google Business Profile", "Website"]);
  const [selectedLeadId, setSelectedLeadId] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedDataFilters, setSelectedDataFilters] = useState<AvailabilityFilter[]>([]);
  const [actionNotice, setActionNotice] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [outreachLanguage, setOutreachLanguage] = useState("English");
  const [requestedResultCount, setRequestedResultCount] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedFilterView[]>([]);
  const [savedFilterName, setSavedFilterName] = useState("");
  const [savedFilterNotice, setSavedFilterNotice] = useState("");
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(false);
  const [searchCountError, setSearchCountError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<User>("/api/auth/me")
      .then((nextUser) => active && setUser(nextUser))
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof Error && requestError.message.startsWith("401:")) setLocation("/login");
        else setError("Unable to load your search workspace.");
      });
    return () => {
      active = false;
    };
  }, [setLocation]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setSavedFiltersLoading(true);
    api<SavedFilterView[]>(`/api/saved-filters?searchMode=${searchMode}`)
      .then((data) => active && setSavedFilters(data))
      .catch(() => active && setSavedFilterNotice("Unable to load saved filters."))
      .finally(() => active && setSavedFiltersLoading(false));
    return () => {
      active = false;
    };
  }, [user, searchMode]);

  useEffect(() => {
    let active = true;
    api<LocationCountry[]>("/api/locations/countries")
      .then((data) => {
        if (active) setCountries(data);
      })
      .catch(() => {
        if (active) setError("Unable to load countries. Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const query = countryInput.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(query));
  }, [countries, countryInput]);

  const filteredBusinessTypes = useMemo(() => {
    const query = businessType.trim().toLowerCase();
    if (!query) return commonBusinessTypes;
    return commonBusinessTypes.filter((type) => type.toLowerCase().includes(query) || businessTypeAliases[type]?.some((alias) => alias.startsWith(query))).slice(0, 8);
  }, [businessType]);

  const handleCountrySelect = async (country: LocationCountry) => {
    setSelectedCountry(country.code);
    setCountryInput(country.name);
    setCountryDropdownOpen(false);
    setAvailableRegions([]);
    setSelectedRegion("");
    setSelectedRegionCode("");
    setAvailableCities([]);
    setSelectedCity("");
    setLocationLoading(true);
    try {
      const states = await api<LocationState[]>(`/api/locations/countries/${country.code}/states`);
      setAvailableRegions(states);
    } catch {
      setError("Unable to load regions for this country.");
    } finally {
      setLocationLoading(false);
    }
  };

  const selectedCountryLabel = countries.find((country) => country.code === selectedCountry)?.name ?? "";

  const handleRegionChange = async (stateCode: string) => {
    const state = availableRegions.find((item) => item.code === stateCode);
    setSelectedRegion(state?.name ?? "");
    setSelectedRegionCode(stateCode);
    setAvailableCities([]);
    setSelectedCity("");
    if (!selectedCountry || !stateCode) return;
    setLocationLoading(true);
    try {
      const cities = await api<LocationCity[]>(`/api/locations/countries/${selectedCountry}/states/${stateCode}/cities`);
      setAvailableCities(cities);
    } catch {
      setError("Unable to load cities for this region.");
    } finally {
      setLocationLoading(false);
    }
  };

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0], [selectedLeadId]);
  const filteredLeads = useMemo(() => filterLeads(leads, selectedTab, selectedDataFilters), [selectedTab, selectedDataFilters]);
  const requestedCount = Number(requestedResultCount);
  const resultCount = searched && selectedTab === "All" && selectedDataFilters.length === 0 ? requestedCount : filteredLeads.length;
  const visibleLeads = searched && Number.isInteger(requestedCount) && requestedCount > 0 ? filteredLeads.slice(0, requestedCount) : filteredLeads;

  const toggle = (items: string[], value: string, setter: (value: string[]) => void) => {
    setter(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  const currentFilterPayload = (): SavedFilterPayload => buildSavedFilterPayload({
    selectedTab,
    selectedDataFilters,
    selectedOpportunities,
    selectedContacts,
    selectedCountry,
    countryInput,
    selectedRegion,
    selectedRegionCode,
    selectedCity,
    businessType,
    requestedResultCount,
  });

  const handleSaveFilter = async () => {
    const name = savedFilterName.trim();
    if (!name) {
      setSavedFilterNotice("Enter a name for this filter view first.");
      return;
    }
    setSavedFiltersLoading(true);
    setSavedFilterNotice("");
    try {
      const response = await fetch("/api/saved-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, searchMode, filters: currentFilterPayload() }),
      });
      if (!response.ok) throw new Error("Unable to save filter view");
      const view = await response.json() as SavedFilterView;
      setSavedFilters((current) => [view, ...current.filter((item) => item.name !== view.name)]);
      setSavedFilterName("");
      setSavedFilterNotice(`Saved filter “${view.name}”.`);
    } catch {
      setSavedFilterNotice("Unable to save this filter view. Please try again.");
    } finally {
      setSavedFiltersLoading(false);
    }
  };

  const handleApplySavedFilter = async (view: SavedFilterView) => {
    const filters = view.filters;
    setSelectedTab(filters.selectedTab || "All");
    setSelectedDataFilters(filters.selectedDataFilters || []);
    setSelectedOpportunities(filters.selectedOpportunities || []);
    setSelectedContacts(filters.selectedContacts || []);
    setSelectedCountry(filters.selectedCountry || "");
    setCountryInput(filters.countryInput || "");
    setSelectedRegion(filters.selectedRegion || "");
    setSelectedRegionCode(filters.selectedRegionCode || "");
    setSelectedCity(filters.selectedCity || "");
    setBusinessType(filters.businessType || "");
    setRequestedResultCount(filters.requestedResultCount || "");
    setSearched(Boolean(filters.requestedResultCount));
    setSavedFilterNotice(`Applied filter “${view.name}”.`);
    if (filters.selectedCountry) {
      try {
        const regions = await api<LocationState[]>(`/api/locations/countries/${filters.selectedCountry}/states`);
        setAvailableRegions(regions);
        if (filters.selectedRegionCode) {
          const cities = await api<LocationCity[]>(`/api/locations/countries/${filters.selectedCountry}/states/${filters.selectedRegionCode}/cities`);
          setAvailableCities(cities);
        }
      } catch {
        setSavedFilterNotice(`Applied “${view.name}”, but location options could not be reloaded.`);
      }
    }
  };

  const handleDeleteSavedFilter = async (id: number) => {
    try {
      const response = await fetch(`/api/saved-filters/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Unable to delete filter view");
      setSavedFilters((current) => current.filter((view) => view.id !== id));
      setSavedFilterNotice("Saved filter removed.");
    } catch {
      setSavedFilterNotice("Unable to remove this saved filter.");
    }
  };

  const clearAll = () => {
    setSelectedOpportunities([]);
    setSelectedContacts([]);
    setSelectedTab("All");
    setSelectedDataFilters([]);
    setSelectedRowIds([]);
    setActionNotice("");
    setCountryInput("");
    setSelectedCountry("");
    setSelectedRegion("");
    setSelectedCity("");
    setRequestedResultCount("");
    setSearchCountError("");
    setSearched(false);
  };

  const toggleDataFilter = (filter: AvailabilityFilter) => {
    setSelectedDataFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
    setActionNotice("");
  };

  const toggleRowSelection = (id: number) => {
    setSelectedRowIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleExport = () => {
    const rows = visibleLeads.filter((lead) => selectedRowIds.length === 0 || selectedRowIds.includes(lead.id));
    if (rows.length === 0) {
      setActionNotice("No matching results are available to export.");
      return;
    }
    const header = ["Business Name", "Category", "Opportunity", "Score", "Website", "Email", "Phone", "WhatsApp", "Google Profile"];
    const csv = [header, ...rows.map((lead) => [lead.company, lead.category, lead.opportunity, lead.score, lead.website, lead.email, lead.phone, lead.whatsapp ?? "", lead.googleProfile ?? ""])].map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `leadforge-${searchMode}-results.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setActionNotice(`${rows.length} filtered result${rows.length === 1 ? "" : "s"} exported.`);
  };

  const handleUseForOutreach = async () => {
    const rows = visibleLeads.filter((lead) => selectedRowIds.length === 0 || selectedRowIds.includes(lead.id));
    if (rows.length === 0) {
      setActionNotice("No matching results are available for outreach.");
      return;
    }
    try {
      const response = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          leads: rows.map((lead) => ({
            companyName: lead.company,
            category: lead.category,
            opportunity: lead.opportunity,
            score: lead.score,
            email: lead.email,
            phone: lead.phone,
            website: lead.website,
            location: selectedCity ? `${selectedCity}, ${selectedCountry || lead.location}` : (selectedCountry || lead.location),
            searchMode,
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to save outreach leads");
      setActionNotice(`${rows.length} filtered result${rows.length === 1 ? "" : "s"} saved to Outreach.`);
      setTimeout(() => setLocation("/outreach"), 800);
    } catch {
      setActionNotice("Unable to send leads to outreach. Please try again.");
    }
  };

  const handleSearch = () => {
    const normalizedCount = Number(requestedResultCount);
    if (!Number.isInteger(normalizedCount) || normalizedCount < 1) {
      setSearchCountError("Enter how many leads you want to search.");
      return;
    }
    setSearchCountError("");
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setSearched(true);
    }, 650);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setLocation("/");
  };

  if (error) return <div className="min-h-screen bg-[#020914] text-red-300 grid place-items-center p-6">{error}</div>;
  if (!user) return <div className="min-h-screen bg-[#020914] text-slate-300 grid place-items-center">Loading search workspace…</div>;

  return (
    <div data-search-mode={searchMode} className="min-h-screen bg-[#020914] text-slate-200 overflow-x-hidden">
      <header className="h-16 border-b border-slate-800/90 bg-[#050d19]/95 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-[185px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-950/40"><Zap className="w-5 h-5 text-white" /></div>
          <div className="leading-tight"><div className="font-semibold text-white">LeadForge</div><div className="text-[10px] text-slate-500">AI Client Acquisition</div></div>
        </div>
        <nav className="hidden lg:flex items-center gap-1 h-full">
          {topNavItems.map(([label, Icon, active]) => (
            <button key={label as string} onClick={() => label === 'Search' ? setLocation('/lead-search') : undefined} className={`h-full px-5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${active ? "text-violet-300 border-violet-500" : "text-slate-400 border-transparent hover:text-white"}`}>
              <Icon className="w-3.5 h-3.5" />{label as string}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden sm:grid place-items-center w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white"><Settings className="w-4 h-4" /></button>
          <button className="grid place-items-center w-8 h-8 rounded-lg bg-violet-600 text-white shadow-lg shadow-violet-900/30"><Zap className="w-4 h-4" /></button>
          <button onClick={() => setLocation('/settings')} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-800/80"><span className="w-7 h-7 rounded-full bg-slate-700 border border-slate-500 grid place-items-center text-[10px] font-bold">{(user.name ?? user.email).slice(0, 2).toUpperCase()}</span><span className="hidden sm:block text-xs text-slate-300">My Account</span><ChevronDown className="w-3.5 h-3.5 text-slate-500" /></button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className={`${sidebarOpen ? "w-56" : "w-16"} hidden md:flex shrink-0 bg-[#06101c] border-r border-slate-800/80 flex-col transition-all`}>
          <div className="p-3 border-b border-slate-800/80"><button onClick={() => setSidebarOpen((open) => !open)} className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-slate-800/70 text-slate-400"><Menu className="w-4 h-4" />{sidebarOpen && <span className="ml-2 text-xs">Collapse</span>}</button></div>
          <nav className="flex-1 p-3 space-y-1">
            <SideItem icon={Search} label="Lead Search" expanded={sidebarOpen} onClick={() => setLocation('/lead-search')} />
            <SideItem icon={Building2} label="Company Lead Search" active expanded={sidebarOpen} onClick={() => setLocation('/company-lead-search')} />
            <SideItem icon={Users} label="Leads" expanded={sidebarOpen} onClick={() => setLocation('/dashboard')} />
            <SideItem icon={Target} label="Opportunities" expanded={sidebarOpen} />
            <SideItem icon={Mail} label="Outreach" expanded={sidebarOpen} />
            <SideItem icon={BarChart3} label="Reports" expanded={sidebarOpen} />
            <SideItem icon={Settings} label="Settings" expanded={sidebarOpen} onClick={() => setLocation('/settings')} />
          </nav>
          <div className="p-3 border-t border-slate-800/80"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-800 hover:text-white"><ArrowLeft className="w-4 h-4 rotate-180" />{sidebarOpen && "Logout"}</button></div>
        </aside>

        <main className="flex-1 min-w-0 p-3 lg:p-5 space-y-3">
          <section className="rounded-xl border border-slate-800 bg-[#071321]/90 p-4 lg:p-5">
            <SectionTitle number="1" title="Where are you looking for businesses?" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              
              {/* Country Typeahead Filter */}
              <div className="relative">
                <span className="block text-[10px] text-slate-400 mb-1.5">Country</span>
                <div className="relative flex items-center">
                  <Globe2 className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={countryInput}
                    placeholder="Type to search country (e.g. France)…"
                    onChange={(event) => {
                      setCountryInput(event.target.value);
                      setCountryDropdownOpen(true);
                      if (!event.target.value) {
                        setSelectedCountry("");
                        setSelectedRegion("");
                        setSelectedRegionCode("");
                        setSelectedCity("");
                        setAvailableRegions([]);
                        setAvailableCities([]);
                      }
                    }}
                    onFocus={() => setCountryDropdownOpen(true)}
                    className="w-full rounded-lg border border-slate-700 bg-[#081724] pl-9 pr-8 py-3 text-xs text-slate-200 outline-none focus:border-violet-500"
                  />
                  <ChevronDown className="absolute right-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                {countryDropdownOpen && filteredCountries.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-700 bg-[#081724] shadow-xl z-20">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => void handleCountrySelect(country)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-violet-600/20 hover:text-white"
                      >
                        <span className="mr-2">{country.emoji}</span>{country.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* State / Region Selector (Automatic based on Country) */}
              <SelectField
                label="Region / State"
                value={selectedRegion}
                options={availableRegions.length > 0 ? availableRegions.map((region) => region.name) : [selectedCountry ? "No regions found" : "Select a country first"]}
                disabled={availableRegions.length === 0}
                onChange={(regionName) => {
                  const region = availableRegions.find((item) => item.name === regionName);
                  if (region) void handleRegionChange(region.code);
                }}
              />

              {/* City Selector (Automatic based on Region) */}
              <SelectField
                label="City"
                value={selectedCity}
                onChange={setSelectedCity}
                options={availableCities.length > 0 ? availableCities.map((city) => city.name) : [selectedRegion ? "No cities found" : "Select a region first"]}
                disabled={availableCities.length === 0}
              />

              {/* Business Type */}
              <div className="relative">
                <span className="block text-[10px] text-slate-400 mb-1.5">Business Type</span>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={businessType}
                    placeholder="Type a business (e.g. Plumber)…"
                    onChange={(event) => {
                      setBusinessType(event.target.value);
                      setBusinessTypeDropdownOpen(true);
                    }}
                    onFocus={() => setBusinessTypeDropdownOpen(true)}
                    className="w-full rounded-lg border border-slate-700 bg-[#081724] pl-9 pr-3 py-3 text-xs text-slate-200 outline-none focus:border-violet-500"
                  />
                </div>
                {businessTypeDropdownOpen && filteredBusinessTypes.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-700 bg-[#081724] shadow-xl z-20">
                    {filteredBusinessTypes.map((type) => (
                      <button key={type} type="button" onClick={() => { setBusinessType(type); setBusinessTypeDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-violet-600/20 hover:text-white">
                        {businessType.trim() ? `Did you mean ${type}?` : type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#071321]/90 p-4 lg:p-5">
            <SectionTitle number="2" title="What opportunity / need do you want to target?" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {opportunityOptions.map(([title, subtitle, iconName]) => {
                const active = selectedOpportunities.includes(title);
                const Icon = iconName === 'Search' ? Search : iconName === 'Activity' ? Activity : iconName === 'Star' ? Star : iconName === 'Target' ? Target : iconName === 'ShieldCheck' ? ShieldCheck : iconName === 'Sparkles' ? Sparkles : iconName === 'Timer' ? Timer : iconName === 'CalendarDays' ? CalendarDays : iconName === 'BarChart3' ? BarChart3 : iconName === 'PanelRight' ? PanelRight : FileText;
                return <button key={title} onClick={() => toggle(selectedOpportunities, title, setSelectedOpportunities)} className={`min-h-[56px] rounded-lg border px-3 py-2 text-left flex items-center gap-2.5 transition-colors ${active ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/25 hover:border-slate-700"}`}><Icon className={`w-4 h-4 shrink-0 ${active ? "text-violet-400" : "text-slate-500"}`} /><span className="min-w-0"><span className="block text-[11px] font-medium text-slate-200 truncate">{title}</span><span className="block text-[10px] text-slate-500 truncate">{subtitle}</span></span>{active && <Check className="w-3.5 h-3.5 ml-auto text-violet-300 shrink-0" />}</button>;
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#071321]/90 p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3 mb-3"><SectionTitle number="3" title="What contact & business data do you want to find?" /><button onClick={() => setSelectedContacts(selectedContacts.length === contactOptions.length ? [] : contactOptions.map(([label]) => label))} className="text-[11px] text-slate-300 hover:text-white">{selectedContacts.length === contactOptions.length ? "Clear All" : "Select All"} <span className="inline-grid place-items-center w-4 h-4 ml-1 rounded-full bg-violet-600 text-white">{selectedContacts.length === contactOptions.length ? <Check className="w-3 h-3" /> : ""}</span></button></div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {contactOptions.map(([label, Icon, pro]) => { const active = selectedContacts.includes(label); return <button key={label} onClick={() => toggle(selectedContacts, label, setSelectedContacts)} className={`min-h-[48px] rounded-lg border px-3 py-2 text-left flex items-center gap-2 ${active ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/25 hover:border-slate-700"}`}><Icon className={`w-4 h-4 shrink-0 ${active ? "text-violet-300" : "text-slate-500"}`} /><span className="text-[10px] text-slate-200 truncate">{label}</span>{pro && <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-red-900/80 text-red-200">PRO</span>}{active && <Check className="w-3.5 h-3.5 text-violet-300 shrink-0" />}</button>; })}
            </div>
            <div className="mt-3 rounded-lg border border-slate-800 bg-[#06101c] p-4 flex flex-col lg:flex-row lg:items-center gap-4"><div className="w-10 h-10 rounded-xl bg-violet-500/10 grid place-items-center"><Globe2 className="w-5 h-5 text-violet-400" /></div><div className="flex-1"><div className="flex items-center gap-2"><h3 className="text-sm font-medium text-white">Website</h3><span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300">Included</span></div><div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-1 mt-2 text-[10px] text-slate-400"><span className="text-emerald-400">✓ Website URL</span><span className="text-emerald-400">✓ Domain age</span><span className="text-emerald-400">✓ Mobile friendliness</span><span className="text-emerald-400">✓ SSL & security info</span><span className="text-emerald-400">✓ Last updated</span><span className="text-emerald-400">✓ Broken links (if any)</span><span className="text-emerald-400">✓ CMS / Technology used</span><span className="text-emerald-400">✓ Page speed score</span><span className="text-emerald-400">✓ Website quality score</span></div></div><div className="text-right text-[10px] text-slate-500">Estimated Credits / Lead: <span className="text-white">+1</span> <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-violet-600 text-white">✦</span></div></div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4"><div className="flex flex-wrap items-center gap-2"><button onClick={handleSearch} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500">{searching ? <Activity className="w-4 h-4 animate-pulse" /> : <Search className="w-4 h-4" />}{searching ? "Searching…" : "Search Leads"}</button><label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-300"><span className="whitespace-nowrap">Leads to find</span><input aria-label="Number of leads to search" type="number" min="1" step="1" inputMode="numeric" value={requestedResultCount} onChange={(event) => { setRequestedResultCount(event.target.value); setSearchCountError(""); }} placeholder="e.g. 170" className="w-20 bg-transparent text-right text-white outline-none placeholder:text-slate-600" /></label>{searchCountError && <span className="text-[10px] text-rose-300">{searchCountError}</span>}</div><button onClick={clearAll} className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">Clear All</button></div></section>

          <section className="rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden">
            <div className="p-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><SectionTitle number="4" title="Results" inline /><span className="text-xs text-violet-300">› {searched && resultCount > 0 ? `${resultCount.toLocaleString()} businesses found (showing ${Math.min(visibleLeads.length, resultCount)} preview rows)` : "Set a target count to search"}</span></div></div>{actionNotice && <div className="mx-4 mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-300">{actionNotice}</div>}<div className="px-4 py-3 border-b border-slate-800 flex flex-wrap gap-2">{["All", "No Website", "Weak Website", "Outdated Website", "Poor Mobile", "Weak SEO", "Media Opportunity", "Low Visibility", "Weak Reviews", "Weak Social Media"].map((tab) => { const value = tab === "Poor Mobile" ? "Poor Mobile Exp." : tab; const active = selectedTab === value; return <button key={tab} onClick={() => setSelectedTab(value)} className={`rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${active ? "border-violet-400 bg-white text-slate-950 ring-2 ring-violet-400/40" : "border-slate-700 bg-white text-slate-950 hover:bg-slate-100"}`}>{tab} {tab === "All" && searched ? `(${resultCount.toLocaleString()})` : ""}</button>; })}</div><div className="px-4 py-3 border-b border-slate-800 bg-[#06101c]"><div className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">Contact &amp; business data</div><div className="flex flex-wrap gap-2">{availabilityFilterOptions.map((filter) => <button key={filter} aria-label={`Filter results by ${filter}`} title={`Filter results by ${filter}`} onClick={() => toggleDataFilter(filter)} className={`rounded-md border px-2.5 py-1.5 text-[10px] font-medium leading-tight ${selectedDataFilters.includes(filter) ? "border-blue-300 bg-blue-600 text-white ring-2 ring-blue-300/40" : "border-slate-300 bg-white text-slate-950 hover:bg-slate-100"}`}>{filter}{selectedDataFilters.includes(filter) ? " ✓" : ""}</button>)}</div></div><div className="mx-4 mb-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2 sm:grid-cols-5"><div data-results-region="former-website-business-email" className="sm:col-span-2 inline-flex min-w-0 flex-wrap items-center gap-2"><span className="text-[10px] uppercase tracking-wide text-slate-400">Saved filters</span><input aria-label="Saved filter name" value={savedFilterName} onChange={(event) => setSavedFilterName(event.target.value)} placeholder="Name this filter" className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-[10px] text-white outline-none placeholder:text-slate-600" /><button onClick={handleSaveFilter} disabled={savedFiltersLoading} className="rounded-md bg-violet-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50">{savedFiltersLoading ? "Saving…" : "Save Filter"}</button>{savedFilterNotice && <span className="text-[10px] text-emerald-300">{savedFilterNotice}</span>}</div><div data-results-region="former-phone-whatsapp-google-profile" className="sm:col-span-3 flex min-w-0 flex-wrap items-center justify-end gap-2">{savedFilters.length > 0 && <div className="flex min-w-0 flex-wrap gap-2">{savedFilters.map((view) => <div key={view.id} className="inline-flex items-center rounded-md border border-violet-500/30 bg-violet-500/10"><button onClick={() => void handleApplySavedFilter(view)} className="max-w-[150px] truncate px-2.5 py-1.5 text-[10px] text-violet-200 hover:text-white">{view.name}</button><button aria-label={`Delete saved filter ${view.name}`} onClick={() => void handleDeleteSavedFilter(view.id)} className="border-l border-violet-500/30 px-1.5 text-violet-300 hover:text-white"><X className="h-3 w-3" /></button></div>)}</div>}<button onClick={handleExport} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-[10px] text-slate-300"><Download className="h-3.5 w-3.5" />Export <ChevronDown className="h-3.5 w-3.5" /></button><button aria-label="Choose result columns" className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-[10px] text-slate-300"><Database className="h-3.5 w-3.5" />Columns</button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] table-fixed text-left"><thead className="bg-[#06101c] text-[10px] text-slate-500"><tr><th className="px-4 py-3"><input type="checkbox" aria-label="Select all" checked={visibleLeads.length > 0 && visibleLeads.every((lead) => selectedRowIds.includes(lead.id))} onChange={() => setSelectedRowIds(visibleLeads.every((lead) => selectedRowIds.includes(lead.id)) ? [] : visibleLeads.map((lead) => lead.id))} /></th><th className="px-2 py-3">Business Name</th><th className="px-2 py-3">Category</th><th className="px-2 py-3">Opportunity</th><th className="px-2 py-3">Score</th><th className="px-2 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/80">{visibleLeads.map((lead) => <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`text-[10px] cursor-pointer ${selectedLeadId === lead.id ? "bg-violet-500/8" : "hover:bg-slate-900/70"}`}><td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${lead.company}`} checked={selectedRowIds.includes(lead.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggleRowSelection(lead.id)} /></td><td className="px-2 py-3"><div className="font-medium text-white">{lead.company}</div><div className="text-[9px] text-slate-500">{selectedCity ? `${selectedCity}, ` : ""}{selectedCountry || lead.location}</div></td><td className="px-2 py-3 text-slate-400">{lead.category}</td><td className="px-2 py-3"><span className="px-2 py-1 rounded bg-violet-500/20 text-violet-200">{lead.opportunity}</span></td><td className="px-2 py-3"><span className={`inline-grid place-items-center w-8 h-8 rounded-full border ${scoreClass(lead.score)}`}>{lead.score}</span></td><td className="px-2 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded hover:bg-slate-800"><Eye className="w-3.5 h-3.5 text-slate-400" /></button><button className="p-1.5 rounded hover:bg-slate-800"><MoreHorizontal className="w-3.5 h-3.5 text-slate-400" /></button></div></td></tr>)}</tbody></table></div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="xl:col-span-1 rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden"><div className={`h-32 bg-gradient-to-br ${selectedLead.accent} relative`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.35),transparent_30%)]" /><span className="absolute left-3 bottom-3 px-2 py-1 rounded bg-violet-700 text-[9px] text-white">{selectedLead.opportunity}</span></div><div className="p-4"><div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold text-white">{selectedLead.company}</h3><p className="text-[10px] text-slate-500 mt-1">{selectedLead.category} · {selectedCity ? `${selectedCity}, ` : ""}{selectedCountry || selectedLead.location}</p></div><Star className="w-4 h-4 text-slate-500" /></div><a href={`https://${selectedLead.website}`} className="inline-flex items-center gap-1 text-[10px] text-violet-300 mt-3">View on Google Maps <ExternalLink className="w-3 h-3" /></a><div className="mt-4 text-[10px] text-slate-500">Opportunity Score</div><div className="flex items-end gap-2 mt-1"><span className="text-4xl font-semibold text-emerald-400">{selectedLead.score}</span><span className="text-xs text-slate-500 mb-1">/100</span><span className="mb-1 px-2 py-1 rounded bg-emerald-500/15 text-emerald-300">Very High Opportunity</span></div><p className="text-[10px] text-slate-400 mt-3">This business has a very high potential for your outreach.</p></div></div>
            <div className="rounded-xl border border-slate-800 bg-[#071321]/90 p-4"><h3 className="text-sm font-medium text-white">Why is this a high opportunity?</h3><div className="mt-4 space-y-3 text-[11px]">{[selectedLead.reason, "No online booking system", "Weak social media presence", selectedLead.reviews, "High search volume for this business"].map((reason) => <div key={reason} className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400" />{reason}</div>)}<div className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-orange-400" />Competitors have better websites</div></div></div>
            <div className="rounded-xl border border-slate-800 bg-[#071321]/90 p-4 relative"><button className="absolute right-4 top-4 p-1 rounded-full border border-slate-700 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button><h3 className="text-sm font-medium text-white">Recommended Service / Offer</h3><div className="mt-5 flex items-center gap-2 text-violet-300"><Sparkles className="w-5 h-5" />{selectedLead.service}</div><p className="text-[11px] text-slate-400 leading-relaxed mt-4">Perfect opportunity to offer a professional service that builds trust and drives more customers.</p><button onClick={handleUseForOutreach} className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500"><Mail className="w-4 h-4" />Use for Outreach</button></div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden"><div className="border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 px-4"><div className="flex items-center gap-5 overflow-x-auto">{["Business Info", "Contact & Business Data", "Opportunity Insights", "Notes", "Outreach History"].map((tab, index) => <button key={tab} className={`py-4 text-[10px] whitespace-nowrap border-b-2 ${index === 0 ? "text-violet-300 border-violet-500" : "text-slate-500 border-transparent"}`}>{tab}</button>)}</div><div className="flex items-center gap-2 py-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center text-[10px]">AI</span><span className="text-xs text-slate-300">AI Outreach Preview</span><select value={outreachLanguage} onChange={(event) => setOutreachLanguage(event.target.value)} className="ml-3 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-300"><option>English</option><option>Spanish</option><option>French</option></select></div></div><div className="grid grid-cols-1 lg:grid-cols-3"><div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 text-[11px] border-r border-slate-800"><InfoItem icon={Globe2} label="Website" value={`https://${selectedLead.website}`} /><InfoItem icon={MapPin} label="Address" value={`123 Main St, ${selectedCity || "Los Angeles"}, ${selectedRegion || "CA"}, ${selectedCountry || "USA"}`} /><InfoItem icon={CalendarDays} label="Founded" value="2015" /><InfoItem icon={Mail} label="Business Email" value={selectedLead.email} /><InfoItem icon={MapPin} label="Google Business Profile" value="View on Google" /><InfoItem icon={Users} label="Employees" value="11-50" /><InfoItem icon={Phone} label="Phone Number" value={selectedLead.phone} /><InfoItem icon={Building2} label="Category" value={selectedLead.category} /><InfoItem icon={UserRound} label="Owner" value="Marco Rossi" /></div><div className="p-5 bg-[#06101c]"><div className="text-[11px] text-slate-300 leading-relaxed space-y-4"><p>Hi {selectedLead.company},</p><p>I noticed your restaurant in {selectedCity || "Los Angeles"} has a lot of potential, but your website could better showcase your amazing food and attract more customers.</p><p>I’d love to help you improve your online presence and grow your business.</p><p>Would you be open to a quick chat?</p></div><button className="mt-5 w-full py-2.5 rounded-lg border border-emerald-500/50 text-emerald-300 text-xs hover:bg-emerald-500/10">Generate {outreachLanguage} version</button></div></div></section>
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ number, title, inline = false }: { number: string; title: string; inline?: boolean }) {
  return <div className={`${inline ? "inline-flex" : "flex"} items-center gap-2 mb-4`}><span className="text-sm font-semibold text-white">{number}.</span><h2 className="text-sm font-semibold text-slate-200">{title}</h2><span className="text-[10px] text-slate-500">ⓘ</span></div>;
}

function SelectField({ label, value, onChange, options, icon, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; icon?: ReactNode; disabled?: boolean }) {
  return <label className="block"><span className="block text-[10px] text-slate-400 mb-1.5">{label}</span><span className="relative flex items-center"><span className="absolute left-3">{icon}</span><select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className={`w-full appearance-none rounded-lg border border-slate-700 bg-[#081724] ${icon ? "pl-9" : "pl-3"} pr-8 py-3 text-xs text-slate-200 outline-none focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="absolute right-3 w-4 h-4 text-slate-500 pointer-events-none" /></span></label>;
}

function SideItem({ icon: Icon, label, active = false, expanded, onClick }: { icon: typeof Search; label: string; active?: boolean; expanded: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`w-full flex items-center ${expanded ? "justify-start px-3" : "justify-center px-2"} gap-3 py-2.5 rounded-lg text-left text-xs ${active ? "bg-violet-600/15 text-violet-300 border border-violet-500/30" : "text-slate-500 hover:bg-slate-800/70 hover:text-slate-200"}`}><Icon className="w-4 h-4 shrink-0" />{expanded && <span>{label}</span>}</button>;
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return <div><div className="flex items-center gap-2 text-slate-500"><Icon className="w-4 h-4" />{label}</div><div className="text-slate-200 mt-2 break-words">{value}</div></div>;
}
