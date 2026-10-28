import { ProblemCategory } from '@/types/report';

export interface DepartmentInfo {
  category: ProblemCategory;
  domain: string;
  name: string;
  shortCode: string;
}

export const DEPARTMENT_REGISTRY: Record<ProblemCategory, DepartmentInfo> = {
  road_damage: {
    category: 'road_damage',
    domain: 'road.com',
    name: 'Road & Infrastructure Dept',
    shortCode: 'ROAD',
  },
  garbage: {
    category: 'garbage',
    domain: 'garbage.com',
    name: 'Solid Waste Management Dept',
    shortCode: 'GARBAGE',
  },
  water_supply: {
    category: 'water_supply',
    domain: 'water.com',
    name: 'Water Supply Board',
    shortCode: 'WATER',
  },
  streetlight: {
    category: 'streetlight',
    domain: 'light.com',
    name: 'Streetlight & Electrical Dept',
    shortCode: 'LIGHT',
  },
  drainage: {
    category: 'drainage',
    domain: 'drainage.com',
    name: 'Drainage & Sewerage Board',
    shortCode: 'DRAINAGE',
  },
  other: {
    category: 'other',
    domain: 'other.com',
    name: 'Public Works & Emergency',
    shortCode: 'OTHER',
  },
};

export interface BengaluruLocality {
  pincode: string;
  suffix: string;
  name: string;
  zone: string;
}

// Known major Bengaluru post office names mapped to their 3-digit suffix (1 to 117)
const BENGALURU_NAMED_PINCODES: Record<string, { name: string; zone: string }> = {
  '001': { name: 'Ashok Nagar / MG Road / GPO', zone: 'East Zone' },
  '002': { name: 'City Market / Chickpet', zone: 'South Zone' },
  '003': { name: 'Malleshwaram / Vyalikaval', zone: 'West Zone' },
  '004': { name: 'Basavanagudi / Gandhi Bazaar', zone: 'South Zone' },
  '005': { name: 'Frazer Town / Pulakeshinagar', zone: 'East Zone' },
  '006': { name: 'J.C. Nagar / Munireddypalya', zone: 'East Zone' },
  '007': { name: 'Air Force Station Yelahanka', zone: 'Yelahanka' },
  '008': { name: 'Halasuru (Ulsoor)', zone: 'East Zone' },
  '009': { name: 'Majestic / Gandhi Nagar', zone: 'West Zone' },
  '010': { name: 'Rajajinagar', zone: 'West Zone' },
  '011': { name: 'Jayanagar (1st to 4th Block)', zone: 'South Zone' },
  '012': { name: 'Subramanyanagar', zone: 'West Zone' },
  '013': { name: 'Jalahalli', zone: 'Dasarahalli' },
  '014': { name: 'Jalahalli East', zone: 'Dasarahalli' },
  '015': { name: 'Jalahalli West', zone: 'Dasarahalli' },
  '016': { name: 'Ramamurthy Nagar', zone: 'K.R. Puram' },
  '017': { name: 'Vimanapura / HAL Old Airport', zone: 'East Zone' },
  '018': { name: 'Chamrajpet', zone: 'South Zone' },
  '019': { name: 'Gavipuram Extension', zone: 'South Zone' },
  '020': { name: 'Seshadripuram', zone: 'West Zone' },
  '021': { name: 'Sriramapuram', zone: 'West Zone' },
  '022': { name: 'Yeshwanthpur', zone: 'West Zone' },
  '023': { name: 'Magadi Road / Tollgate', zone: 'West Zone' },
  '024': { name: 'Hebbal / Ganganagar', zone: 'Yelahanka' },
  '025': { name: 'Richmond Town / Langford Town', zone: 'East Zone' },
  '026': { name: 'Bapuji Nagar / Mysore Road', zone: 'South Zone' },
  '027': { name: 'Shanti Nagar / Wilson Garden', zone: 'South Zone' },
  '028': { name: 'Padmanabhanagar', zone: 'South Zone' },
  '029': { name: 'Dharmaram College / Tavarekere', zone: 'South Zone' },
  '030': { name: 'Adugodi / Dairy Circle', zone: 'South Zone' },
  '031': { name: 'Austin Town / Neelasandra', zone: 'East Zone' },
  '032': { name: 'R.T. Nagar', zone: 'East Zone' },
  '033': { name: 'Kadugondanahalli / Arabic College', zone: 'East Zone' },
  '034': { name: 'Koramangala (All Blocks)', zone: 'South Zone' },
  '035': { name: 'Carmelaram / Sarjapur Road', zone: 'Mahadevapura' },
  '036': { name: 'Krishnarajapuram (K.R. Puram)', zone: 'K.R. Puram' },
  '037': { name: 'Marathahalli', zone: 'Mahadevapura' },
  '038': { name: 'Indiranagar / HAL 2nd Stage', zone: 'East Zone' },
  '039': { name: 'Nayandahalli', zone: 'South Zone' },
  '040': { name: 'Vijayanagar', zone: 'West Zone' },
  '041': { name: 'Jayanagar 9th Block', zone: 'South Zone' },
  '042': { name: 'Kammanahalli', zone: 'East Zone' },
  '043': { name: 'Banaswadi / Kalyan Nagar', zone: 'East Zone' },
  '045': { name: 'Lingarajapuram', zone: 'East Zone' },
  '046': { name: 'Tannery Road', zone: 'East Zone' },
  '047': { name: 'Neelasandra / Bazaar Street', zone: 'East Zone' },
  '048': { name: 'Hoodi / ITPL', zone: 'Mahadevapura' },
  '049': { name: 'Virgonagar / Avalahalli', zone: 'East Zone' },
  '050': { name: 'Banashankari (1st Stage)', zone: 'South Zone' },
  '051': { name: 'Shivajinagar / Commercial Street', zone: 'East Zone' },
  '052': { name: 'Vasanth Nagar / High Grounds', zone: 'East Zone' },
  '053': { name: 'Cottonpet / Chickpet', zone: 'West Zone' },
  '054': { name: 'Mathikere / Gokula', zone: 'West Zone' },
  '055': { name: 'Sadashivanagar', zone: 'West Zone' },
  '056': { name: 'Bangalore University / Jnana Bharati', zone: 'R.R. Nagar' },
  '057': { name: 'Peenya 1st Stage', zone: 'Dasarahalli' },
  '058': { name: 'Peenya Small Industries', zone: 'Dasarahalli' },
  '059': { name: 'Kengeri', zone: 'R.R. Nagar' },
  '060': { name: 'Kengeri Satellite Town', zone: 'R.R. Nagar' },
  '061': { name: 'Subramanyapura / Uttarahalli', zone: 'South Zone' },
  '062': { name: 'Doddakallasandra / Kanakapura Rd', zone: 'South Zone' },
  '063': { name: 'Yelahanka Satellite Town', zone: 'Yelahanka' },
  '064': { name: 'Yelahanka Old Town', zone: 'Yelahanka' },
  '065': { name: 'Vidyaranyapura', zone: 'Yelahanka' },
  '066': { name: 'Whitefield', zone: 'Mahadevapura' },
  '067': { name: 'Kadugodi', zone: 'Mahadevapura' },
  '068': { name: 'Madivala / Silk Board', zone: 'South Zone' },
  '069': { name: 'Byrasandra / Jayanagar East', zone: 'South Zone' },
  '070': { name: 'Banashankari 2nd Stage', zone: 'South Zone' },
  '071': { name: 'Domlur / EGL', zone: 'East Zone' },
  '072': { name: 'Nagarabhavi', zone: 'R.R. Nagar' },
  '073': { name: 'Bagalgunte / Chikkabanavara', zone: 'Dasarahalli' },
  '074': { name: 'Kumbalgodu Industrial Area', zone: 'R.R. Nagar' },
  '075': { name: 'New Thippasandra / ISRO', zone: 'East Zone' },
  '076': { name: 'BTM 2nd Stage / Bannerghatta Rd', zone: 'South Zone' },
  '077': { name: 'Kothanur / Hennur', zone: 'East Zone' },
  '078': { name: 'J.P. Nagar (1st to 6th Phase)', zone: 'South Zone' },
  '079': { name: 'Basaveshwaranagar', zone: 'West Zone' },
  '080': { name: 'RMV Extension / Dollars Colony', zone: 'West Zone' },
  '081': { name: 'Bannerghatta National Park Road', zone: 'South Zone' },
  '082': { name: 'Avalahalli / Anjanapura', zone: 'South Zone' },
  '083': { name: 'Gottigere / Hulimavu', zone: 'Bommanahalli' },
  '084': { name: 'HBR Layout', zone: 'East Zone' },
  '085': { name: 'Banashankari 3rd Stage', zone: 'South Zone' },
  '086': { name: 'Mahalakshmi Layout', zone: 'West Zone' },
  '087': { name: 'Varthur / Gunjur', zone: 'Mahadevapura' },
  '088': { name: 'Konanakunte / Kumaraswamy Layout', zone: 'South Zone' },
  '089': { name: 'Hesaraghatta', zone: 'Yelahanka' },
  '090': { name: 'Chikkabanavara', zone: 'Dasarahalli' },
  '091': { name: 'Viswaneedam / Sunkadakatte', zone: 'Dasarahalli' },
  '092': { name: 'Sahakara Nagar / Kodigehalli', zone: 'Yelahanka' },
  '093': { name: 'C.V. Raman Nagar / Kaggadasapura', zone: 'East Zone' },
  '094': { name: 'Sanjaynagar / RMV 2nd Stage', zone: 'West Zone' },
  '095': { name: 'Koramangala 8th Block / ST Bed', zone: 'South Zone' },
  '096': { name: 'Nandini Layout', zone: 'West Zone' },
  '097': { name: 'Rajarajeshwari Nagar (R.R. Nagar)', zone: 'R.R. Nagar' },
  '098': { name: 'BEML Layout / Rajarajeshwari Nagar', zone: 'R.R. Nagar' },
  '099': { name: 'Bommasandra Industrial Area', zone: 'Bommanahalli' },
  '100': { name: 'Electronic City (Phases 1 & 2)', zone: 'Bommanahalli' },
  '101': { name: 'G.K.V.K. Campus', zone: 'Yelahanka' },
  '102': { name: 'HSR Layout (Sectors 1 to 7)', zone: 'Bommanahalli' },
  '103': { name: 'Bellandur / Outer Ring Road', zone: 'Mahadevapura' },
  '104': { name: 'RPC Layout / Vijayanagar 2nd Stage', zone: 'West Zone' },
  '105': { name: 'Kasavanahalli / Hosa Road', zone: 'Mahadevapura' },
  '106': { name: 'Chandapura / Anekal Road', zone: 'Bommanahalli' },
  '107': { name: 'Nelamangala Highway', zone: 'Dasarahalli' },
  '108': { name: 'Attibele Border', zone: 'Bommanahalli' },
  '109': { name: 'Jigani Industrial Area', zone: 'Bommanahalli' },
  '110': { name: 'Doddaballapur Road Industrial Area', zone: 'Yelahanka' },
  '111': { name: 'Devanahalli Town', zone: 'Yelahanka' },
  '112': { name: 'Bagalur / Airport Link Rd', zone: 'Yelahanka' },
  '113': { name: 'Sarjapur Town Extension', zone: 'Mahadevapura' },
  '114': { name: 'Anekal Town Extension', zone: 'Bommanahalli' },
  '115': { name: 'Bidadi Town Corridor', zone: 'R.R. Nagar' },
  '116': { name: 'Magadi Road Outskirts', zone: 'West Zone' },
  '117': { name: 'Dasarahalli / Bengaluru West Hub', zone: 'Dasarahalli' },
};

/**
 * Returns the full list of ALL 117 Bengaluru PIN codes (560001 to 560117)
 */
export function getAll117BengaluruPincodes(): BengaluruLocality[] {
  const result: BengaluruLocality[] = [];

  for (let i = 1; i <= 117; i++) {
    const suffix = i.toString().padStart(3, '0');
    const pincode = `560${suffix}`;
    const info = BENGALURU_NAMED_PINCODES[suffix] || {
      name: `Bengaluru Sector ${suffix}`,
      zone: 'Greater Bengaluru Area',
    };

    result.push({
      pincode,
      suffix,
      name: info.name,
      zone: info.zone,
    });
  }

  return result;
}

export const ALL_117_BENGALURU_PINCODES = getAll117BengaluruPincodes();

// Precise coordinates for Bengaluru ward PIN codes
export const BENGALURU_PINCODE_COORDS: Record<string, { lat: number; lng: number }> = {
  '001': { lat: 12.9756, lng: 77.6066 }, // Ashok Nagar / MG Road
  '002': { lat: 12.9642, lng: 77.5768 }, // City Market
  '003': { lat: 13.0031, lng: 77.5643 }, // Malleshwaram
  '004': { lat: 12.9422, lng: 77.5753 }, // Basavanagudi
  '005': { lat: 12.9982, lng: 77.6125 }, // Frazer Town
  '008': { lat: 12.9786, lng: 77.6256 }, // Ulsoor
  '009': { lat: 12.9772, lng: 77.5729 }, // Majestic
  '010': { lat: 12.9915, lng: 77.5524 }, // Rajajinagar
  '011': { lat: 12.9308, lng: 77.5838 }, // Jayanagar
  '017': { lat: 12.9554, lng: 77.6645 }, // Vimanapura / HAL
  '024': { lat: 13.0358, lng: 77.5970 }, // Hebbal
  '025': { lat: 12.9632, lng: 77.6033 }, // Richmond Town
  '034': { lat: 12.9352, lng: 77.6245 }, // Koramangala
  '037': { lat: 12.9569, lng: 77.7011 }, // Marathahalli
  '038': { lat: 12.9784, lng: 77.6408 }, // Indiranagar
  '040': { lat: 12.9698, lng: 77.5358 }, // Vijayanagar
  '043': { lat: 13.0104, lng: 77.6508 }, // Banaswadi
  '064': { lat: 13.1007, lng: 77.5963 }, // Yelahanka
  '066': { lat: 12.9698, lng: 77.7499 }, // Whitefield
  '068': { lat: 12.8912, lng: 77.6234 }, // Bommanahalli
  '076': { lat: 12.8984, lng: 77.5991 }, // BTM Layout
  '078': { lat: 12.9081, lng: 77.5855 }, // J.P. Nagar
  '085': { lat: 12.9254, lng: 77.5468 }, // Banashankari 3rd Stage
  '097': { lat: 12.9237, lng: 77.5186 }, // Rajarajeshwari Nagar
  '100': { lat: 12.8452, lng: 77.6602 }, // Electronic City
  '102': { lat: 12.9121, lng: 77.6446 }, // HSR Layout
  '103': { lat: 12.9304, lng: 77.6784 }, // Bellandur
  '104': { lat: 12.9600, lng: 77.5385 }, // RPC Layout / Vijayanagar 2nd Stage
};

export function findNearestPincodeByCoords(
  lat: number,
  lng: number
): { pincode: string; suffix: string } | null {
  let minDistance = Infinity;
  let closestSuffix: string | null = null;

  for (const [suf, coord] of Object.entries(BENGALURU_PINCODE_COORDS)) {
    const dLat = lat - coord.lat;
    const dLng = lng - coord.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closestSuffix = suf;
    }
  }

  if (closestSuffix) {
    return { pincode: `560${closestSuffix}`, suffix: closestSuffix };
  }
  return null;
}

/**
 * Extracts a 6-digit PIN code from text, or formats a 3-digit suffix into a full 560XXX PIN.
 * If text contains a known Bengaluru locality name (e.g., "RPC Layout", "Indiranagar"),
 * automatically resolves to that ward's PIN code.
 */
export function normalizePincode(input?: string | null): { pincode: string; suffix: string } {
  if (!input) {
    return { pincode: '560001', suffix: '001' };
  }

  const cleaned = input.trim();

  // 1. If already 6 digits starting with 560
  const match6 = cleaned.match(/560\d{3}/);
  if (match6) {
    const pin = match6[0];
    return { pincode: pin, suffix: pin.slice(3) };
  }

  // 2. Any other 6-digit number
  const any6 = cleaned.match(/\b\d{6}\b/);
  if (any6) {
    const pin = any6[0];
    return { pincode: pin, suffix: pin.slice(-3) };
  }

  // 3. If user passed just digits like "038", "38", "104"
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length > 0 && digitsOnly.length <= 3) {
    const suffix = digitsOnly.padStart(3, '0');
    return { pincode: `560${suffix}`, suffix };
  }

  // 4. Locality name matching across all 117 Bengaluru wards
  const lower = cleaned.toLowerCase();
  for (const [suf, info] of Object.entries(BENGALURU_NAMED_PINCODES)) {
    const parts = info.name.toLowerCase().split(/[\/,()]+/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length >= 3 && lower.includes(trimmed)) {
        return { pincode: `560${suf}`, suffix: suf };
      }
    }
  }

  return { pincode: '560001', suffix: '001' };
}

/**
 * Computes official email and password for any of the 117 Bengaluru PIN codes and category
 */
export function getOfficialCredentials(
  category: ProblemCategory,
  pincodeOrSuffix: string
): {
  email: string;
  password: string;
  departmentName: string;
  pincode: string;
  suffix: string;
} {
  const { pincode, suffix } = normalizePincode(pincodeOrSuffix);
  const dept = DEPARTMENT_REGISTRY[category] || DEPARTMENT_REGISTRY.other;

  const email = `dept${suffix}@${dept.domain}`.toLowerCase();
  const password = `Dept${suffix}`;

  return {
    email,
    password,
    departmentName: dept.name,
    pincode,
    suffix,
  };
}

/**
 * Main auto-routing function.
 * Called when a citizen submits an issue.
 * Accurately determines department and ward official email using explicit PIN,
 * location address text, or GPS coordinates.
 */
export function routeComplaint(
  category: ProblemCategory,
  locationText: string,
  explicitPincode?: string | null,
  latitude?: number | null,
  longitude?: number | null
): {
  assignedOfficialEmail: string;
  assignedDepartment: string;
  pincode: string;
  pincodeSuffix: string;
  officialPasswordHint: string;
} {
  let resolvedPin: { pincode: string; suffix: string } | null = null;

  // 1. Prioritize explicit PIN if given
  if (explicitPincode && explicitPincode.trim().length > 0) {
    resolvedPin = normalizePincode(explicitPincode);
  }

  // 2. Try location text (6-digit PIN or locality name)
  if (!resolvedPin || resolvedPin.suffix === '001') {
    const textPin = normalizePincode(locationText);
    if (textPin.suffix !== '001') {
      resolvedPin = textPin;
    }
  }

  // 3. If still not matched, use GPS coordinates if available
  if ((!resolvedPin || resolvedPin.suffix === '001') && typeof latitude === 'number' && typeof longitude === 'number') {
    const nearest = findNearestPincodeByCoords(latitude, longitude);
    if (nearest) {
      resolvedPin = nearest;
    }
  }

  // 4. Default fallback if nothing resolved
  if (!resolvedPin) {
    resolvedPin = { pincode: '560001', suffix: '001' };
  }

  const dept = DEPARTMENT_REGISTRY[category] || DEPARTMENT_REGISTRY.other;
  const email = `dept${resolvedPin.suffix}@${dept.domain}`.toLowerCase();
  const password = `Dept${resolvedPin.suffix}`;

  return {
    assignedOfficialEmail: email,
    assignedDepartment: dept.name,
    pincode: resolvedPin.pincode,
    pincodeSuffix: resolvedPin.suffix,
    officialPasswordHint: password,
  };
}

/**
 * Returns all 6 department credentials for a given PIN code.
 */
export function getPincodeDepartmentMatrix(pincodeOrSuffix: string) {
  const { pincode, suffix } = normalizePincode(pincodeOrSuffix);

  return (Object.keys(DEPARTMENT_REGISTRY) as ProblemCategory[]).map((cat) => {
    const info = DEPARTMENT_REGISTRY[cat];
    return {
      category: cat,
      departmentName: info.name,
      domain: info.domain,
      email: `dept${suffix}@${info.domain}`.toLowerCase(),
      password: `Dept${suffix}`,
      pincode,
      suffix,
    };
  });
}
