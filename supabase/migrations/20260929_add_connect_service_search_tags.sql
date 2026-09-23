begin;

-- =========================================================
-- Ko-Host Connect
-- Service search / intent tags
-- =========================================================

alter table public.connect_services
  add column if not exists search_tags text[] not null
  default '{}'::text[];

comment on column public.connect_services.search_tags is
  'Natural-language aliases, customer phrases, and keywords used to match consumer search intent to the canonical Connect service.';


-- =========================================================
-- Lawn Care
-- =========================================================

update public.connect_services
set search_tags = array[
  'lawn',
  'grass',
  'grass cutting',
  'cut grass',
  'cut my grass',
  'mow',
  'mowing',
  'lawn mowing',
  'mow lawn',
  'mow my lawn',
  'yard mowing',
  'lawn maintenance',
  'lawn service',
  'weed eating',
  'weed whacking',
  'edging',
  'lawn edging',
  'yard maintenance',
  'grass maintenance'
]
where slug = 'lawn-care';


-- =========================================================
-- House Cleaning
-- =========================================================

update public.connect_services
set search_tags = array[
  'clean house',
  'clean my house',
  'house cleaner',
  'housekeeper',
  'housekeeping',
  'home cleaning',
  'maid',
  'maid service',
  'cleaning service',
  'deep cleaning',
  'deep clean',
  'move out cleaning',
  'move in cleaning',
  'apartment cleaning',
  'clean apartment',
  'residential cleaning',
  'kitchen cleaning',
  'bathroom cleaning'
]
where slug = 'house-cleaning';


-- =========================================================
-- Handyman
-- =========================================================

update public.connect_services
set search_tags = array[
  'handyman',
  'handy man',
  'home repair',
  'home repairs',
  'small repairs',
  'odd jobs',
  'fix things',
  'fix something',
  'repair around house',
  'house repairs',
  'minor repairs',
  'home maintenance',
  'general repair',
  'install shelves',
  'hang shelves',
  'mount tv',
  'tv mounting'
]
where slug = 'handyman';


-- =========================================================
-- Plumbing
-- =========================================================

update public.connect_services
set search_tags = array[
  'plumber',
  'pipe',
  'pipes',
  'leaking pipe',
  'leaky pipe',
  'water leak',
  'leaking faucet',
  'dripping faucet',
  'faucet repair',
  'clogged drain',
  'drain clogged',
  'unclog drain',
  'clogged toilet',
  'toilet clogged',
  'toilet repair',
  'sink clogged',
  'garbage disposal',
  'water heater',
  'burst pipe',
  'sewer',
  'plumbing repair'
]
where slug = 'plumbing';


-- =========================================================
-- Electrical
-- =========================================================

update public.connect_services
set search_tags = array[
  'electrician',
  'electric',
  'electrical repair',
  'electrical problem',
  'wiring',
  'rewiring',
  'outlet',
  'outlet repair',
  'install outlet',
  'light switch',
  'breaker',
  'circuit breaker',
  'electrical panel',
  'power issue',
  'lights flickering',
  'ceiling fan installation',
  'install ceiling fan',
  'light fixture installation'
]
where slug = 'electrical';


-- =========================================================
-- Auto Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'car repair',
  'vehicle repair',
  'mechanic',
  'auto mechanic',
  'car mechanic',
  'car wont start',
  'car won''t start',
  'check engine light',
  'engine repair',
  'brake repair',
  'brakes',
  'oil change',
  'battery replacement',
  'car battery',
  'alternator',
  'starter',
  'transmission',
  'vehicle maintenance',
  'car maintenance'
]
where slug = 'auto-repair';


-- =========================================================
-- Dog Walking
-- =========================================================

update public.connect_services
set search_tags = array[
  'walk dog',
  'walk my dog',
  'dog walker',
  'dog walking service',
  'pet walking',
  'walk puppy',
  'puppy walking',
  'exercise dog',
  'take dog for walk'
]
where slug = 'dog-walking';


-- =========================================================
-- Moving
-- =========================================================

update public.connect_services
set search_tags = array[
  'movers',
  'moving company',
  'moving service',
  'move house',
  'move apartment',
  'move furniture',
  'help moving',
  'moving help',
  'load truck',
  'unload truck',
  'packing',
  'packing help',
  'relocation',
  'local move',
  'move belongings'
]
where slug = 'moving';


-- =========================================================
-- Landscaping
-- =========================================================

update public.connect_services
set search_tags = array[
  'landscaper',
  'landscape',
  'yard work',
  'yard cleanup',
  'yard makeover',
  'garden',
  'gardening',
  'garden design',
  'mulch',
  'mulching',
  'plant flowers',
  'plant shrubs',
  'flower beds',
  'landscape design',
  'yard design',
  'outdoor landscaping'
]
where slug = 'landscaping';


-- =========================================================
-- Tree Service
-- =========================================================

update public.connect_services
set search_tags = array[
  'tree',
  'trees',
  'tree removal',
  'remove tree',
  'remove a tree',
  'tree chopped down',
  'chop tree down',
  'cut tree down',
  'cut down tree',
  'cut down a tree',
  'tree cutting',
  'tree trimming',
  'trim tree',
  'tree pruning',
  'prune tree',
  'dead tree',
  'fallen tree',
  'tree fell',
  'tree cleanup',
  'stump',
  'stump removal',
  'remove stump',
  'grind stump',
  'stump grinding',
  'tree branches',
  'remove branches'
]
where slug = 'tree-service';


-- =========================================================
-- Pressure Washing
-- =========================================================

update public.connect_services
set search_tags = array[
  'pressure wash',
  'power wash',
  'power washing',
  'wash driveway',
  'clean driveway',
  'wash house',
  'wash siding',
  'clean siding',
  'deck washing',
  'patio washing',
  'concrete cleaning',
  'exterior cleaning',
  'pressure clean'
]
where slug = 'pressure-washing';


-- =========================================================
-- Junk Removal
-- =========================================================

update public.connect_services
set search_tags = array[
  'junk',
  'remove junk',
  'haul junk',
  'junk hauling',
  'trash removal',
  'debris removal',
  'haul away',
  'haul away furniture',
  'remove furniture',
  'old furniture removal',
  'appliance removal',
  'garage cleanout',
  'basement cleanout',
  'cleanout',
  'get rid of junk'
]
where slug = 'junk-removal';


-- =========================================================
-- Painting
-- =========================================================

update public.connect_services
set search_tags = array[
  'painter',
  'paint house',
  'paint room',
  'paint walls',
  'interior painting',
  'exterior painting',
  'house painting',
  'wall painting',
  'ceiling painting',
  'repaint',
  'painting contractor',
  'paint bedroom',
  'paint kitchen',
  'paint exterior'
]
where slug = 'painting';


-- =========================================================
-- Roofing
-- =========================================================

update public.connect_services
set search_tags = array[
  'roofer',
  'roof repair',
  'fix roof',
  'leaking roof',
  'roof leak',
  'new roof',
  'replace roof',
  'roof replacement',
  'roof damage',
  'missing shingles',
  'shingles',
  'roof inspection',
  'storm damage roof'
]
where slug = 'roofing';


-- =========================================================
-- HVAC
-- =========================================================

update public.connect_services
set search_tags = array[
  'hvac',
  'heating',
  'air conditioning',
  'air conditioner',
  'ac repair',
  'a/c repair',
  'air conditioning repair',
  'ac not working',
  'no ac',
  'furnace',
  'furnace repair',
  'heater',
  'heater repair',
  'heat not working',
  'no heat',
  'hvac repair',
  'hvac installation',
  'thermostat',
  'heat pump'
]
where slug = 'hvac';


-- =========================================================
-- Appliance Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'appliance',
  'fix appliance',
  'refrigerator repair',
  'fridge repair',
  'fridge not working',
  'washer repair',
  'washing machine repair',
  'dryer repair',
  'dishwasher repair',
  'oven repair',
  'stove repair',
  'microwave repair',
  'freezer repair',
  'appliance technician'
]
where slug = 'appliance-repair';


-- =========================================================
-- Pest Control
-- =========================================================

update public.connect_services
set search_tags = array[
  'exterminator',
  'bugs',
  'bug problem',
  'insects',
  'pests',
  'pest removal',
  'roach',
  'roaches',
  'cockroach',
  'ants',
  'ant problem',
  'mice',
  'mouse',
  'rats',
  'rat',
  'termites',
  'termite',
  'bed bugs',
  'spiders',
  'wasps',
  'hornets',
  'extermination'
]
where slug = 'pest-control';


-- =========================================================
-- Carpet Cleaning
-- =========================================================

update public.connect_services
set search_tags = array[
  'clean carpet',
  'carpet cleaner',
  'carpet shampoo',
  'carpet steam cleaning',
  'steam clean carpet',
  'carpet stains',
  'remove carpet stains',
  'rug cleaning',
  'clean rugs',
  'upholstery cleaning',
  'deep clean carpet'
]
where slug = 'carpet-cleaning';


-- =========================================================
-- Mobile Detailing
-- =========================================================

update public.connect_services
set search_tags = array[
  'car detailing',
  'auto detailing',
  'detail car',
  'detail my car',
  'mobile car wash',
  'car wash',
  'wash car',
  'clean car',
  'car interior cleaning',
  'interior detailing',
  'exterior detailing',
  'vehicle detailing',
  'car cleaning'
]
where slug = 'mobile-detailing';


-- =========================================================
-- Towing
-- =========================================================

update public.connect_services
set search_tags = array[
  'tow',
  'tow truck',
  'tow my car',
  'car towing',
  'vehicle towing',
  'need a tow',
  'car broke down',
  'stranded car',
  'roadside tow',
  'tow vehicle',
  'wrecked car towing'
]
where slug = 'towing';


-- =========================================================
-- Pet Sitting
-- =========================================================

update public.connect_services
set search_tags = array[
  'pet sitter',
  'dog sitter',
  'cat sitter',
  'watch my dog',
  'watch my cat',
  'watch my pet',
  'pet care',
  'dog sitting',
  'cat sitting',
  'pet sitting service',
  'feed my pet',
  'care for pet',
  'vacation pet care'
]
where slug = 'pet-sitting';


-- =========================================================
-- Pet Grooming
-- =========================================================

update public.connect_services
set search_tags = array[
  'pet groomer',
  'dog groomer',
  'dog grooming',
  'cat grooming',
  'groom dog',
  'groom cat',
  'pet haircut',
  'dog haircut',
  'dog bath',
  'pet bath',
  'nail trim dog',
  'pet nail trimming'
]
where slug = 'pet-grooming';


-- =========================================================
-- Furniture Assembly
-- =========================================================

update public.connect_services
set search_tags = array[
  'assemble furniture',
  'build furniture',
  'put furniture together',
  'furniture setup',
  'ikea assembly',
  'assemble bed',
  'assemble desk',
  'assemble dresser',
  'assemble table',
  'assemble chairs',
  'assemble bookshelf',
  'furniture installer'
]
where slug = 'furniture-assembly';


-- =========================================================
-- Home Organization
-- =========================================================

update public.connect_services
set search_tags = array[
  'organize house',
  'organize home',
  'home organizer',
  'professional organizer',
  'declutter',
  'decluttering',
  'organize closet',
  'closet organization',
  'organize garage',
  'garage organization',
  'organize kitchen',
  'pantry organization',
  'organize room'
]
where slug = 'home-organization';


-- =========================================================
-- Snow Removal
-- =========================================================

update public.connect_services
set search_tags = array[
  'remove snow',
  'snow clearing',
  'snow plowing',
  'snow plow',
  'plow driveway',
  'clear driveway',
  'shovel snow',
  'snow shoveling',
  'clear sidewalk',
  'ice removal',
  'snow cleanup'
]
where slug = 'snow-removal';


-- =========================================================
-- Photography
-- =========================================================

update public.connect_services
set search_tags = array[
  'photographer',
  'take pictures',
  'take photos',
  'photo shoot',
  'photoshoot',
  'family photos',
  'portrait photographer',
  'wedding photographer',
  'event photographer',
  'birthday photographer',
  'professional photos',
  'headshots',
  'real estate photography'
]
where slug = 'photography';


-- =========================================================
-- Computer Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'computer',
  'computer repair',
  'fix computer',
  'fix my computer',
  'pc repair',
  'laptop repair',
  'fix laptop',
  'computer wont start',
  'computer won''t start',
  'slow computer',
  'computer virus',
  'virus removal',
  'computer help',
  'tech support',
  'computer troubleshooting',
  'screen repair computer'
]
where slug = 'computer-repair';


-- =========================================================
-- Tutoring
-- =========================================================

update public.connect_services
set search_tags = array[
  'tutor',
  'private tutor',
  'school help',
  'homework help',
  'math tutor',
  'reading tutor',
  'english tutor',
  'science tutor',
  'algebra tutor',
  'test prep',
  'study help',
  'academic help',
  'student tutoring',
  'help with homework'
]
where slug = 'tutoring';


-- =========================================================
-- Babysitting
-- =========================================================

update public.connect_services
set search_tags = array[
  'babysitter',
  'baby sitter',
  'child care',
  'childcare',
  'watch my kids',
  'watch kids',
  'watch my child',
  'care for child',
  'care for kids',
  'sitter for kids',
  'date night sitter',
  'after school care',
  'child sitter'
]
where slug = 'babysitting';


-- =========================================================
-- Elder Care
-- =========================================================

update public.connect_services
set search_tags = array[
  'elderly care',
  'senior care',
  'senior assistance',
  'elderly assistance',
  'caregiver',
  'senior caregiver',
  'elderly caregiver',
  'help elderly',
  'help senior',
  'aging parent help',
  'in home senior care',
  'non medical senior care',
  'daily living assistance',
  'senior support'
]
where slug = 'elder-care';


-- =========================================================
-- House Sitting
-- =========================================================

update public.connect_services
set search_tags = array[
  'house sitter',
  'watch my house',
  'watch house',
  'home sitting',
  'home sitter',
  'look after house',
  'check on house',
  'vacation house sitting',
  'property sitting',
  'home watch'
]
where slug = 'house-sitting';


-- =========================================================
-- Pool Cleaning
-- =========================================================

update public.connect_services
set search_tags = array[
  'pool cleaner',
  'clean pool',
  'swimming pool cleaning',
  'pool maintenance',
  'pool service',
  'pool care',
  'dirty pool',
  'pool chemicals',
  'pool treatment',
  'pool vacuum',
  'pool algae',
  'open pool',
  'close pool'
]
where slug = 'pool-cleaning';


-- =========================================================
-- Gutter Cleaning
-- =========================================================

update public.connect_services
set search_tags = array[
  'clean gutters',
  'gutter cleaner',
  'clogged gutters',
  'gutters clogged',
  'gutter cleanup',
  'remove leaves from gutters',
  'clear gutters',
  'downspout cleaning',
  'clean downspouts',
  'gutter maintenance'
]
where slug = 'gutter-cleaning';


-- =========================================================
-- Window Cleaning
-- =========================================================

update public.connect_services
set search_tags = array[
  'clean windows',
  'window cleaner',
  'wash windows',
  'window washing',
  'exterior window cleaning',
  'interior window cleaning',
  'house window cleaning',
  'dirty windows',
  'glass cleaning'
]
where slug = 'window-cleaning';


-- =========================================================
-- Home Security Installation
-- =========================================================

update public.connect_services
set search_tags = array[
  'home security',
  'security system',
  'install security system',
  'alarm system',
  'install alarm',
  'security camera',
  'security cameras',
  'install cameras',
  'install security cameras',
  'doorbell camera',
  'video doorbell',
  'home surveillance',
  'camera installation'
]
where slug = 'home-security-installation';


-- =========================================================
-- Locksmith
-- =========================================================

update public.connect_services
set search_tags = array[
  'locksmith',
  'locked out',
  'locked out of house',
  'locked out of car',
  'unlock door',
  'unlock car',
  'change locks',
  'replace locks',
  'rekey',
  'rekey locks',
  'lost keys',
  'broken key',
  'door lock repair',
  'key replacement'
]
where slug = 'locksmith';


-- =========================================================
-- Garage Door Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'garage door',
  'fix garage door',
  'garage door repair',
  'garage door wont open',
  'garage door won''t open',
  'garage door wont close',
  'garage door opener',
  'garage opener repair',
  'garage door spring',
  'broken garage spring',
  'garage door track',
  'garage door installation'
]
where slug = 'garage-door-repair';


-- =========================================================
-- Flooring Installation
-- =========================================================

update public.connect_services
set search_tags = array[
  'flooring',
  'install floor',
  'install flooring',
  'new floors',
  'replace flooring',
  'hardwood installation',
  'laminate flooring',
  'vinyl flooring',
  'vinyl plank',
  'lvp installation',
  'tile flooring',
  'floor installer',
  'floor replacement'
]
where slug = 'flooring-installation';


-- =========================================================
-- Drywall Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'drywall',
  'fix drywall',
  'drywall repair',
  'hole in wall',
  'patch wall',
  'patch drywall',
  'wall repair',
  'repair wall',
  'drywall hole',
  'sheetrock',
  'sheetrock repair',
  'ceiling drywall repair'
]
where slug = 'drywall-repair';


-- =========================================================
-- Fence Installation & Repair
-- =========================================================

update public.connect_services
set search_tags = array[
  'fence',
  'fencing',
  'install fence',
  'new fence',
  'fence installation',
  'repair fence',
  'fix fence',
  'broken fence',
  'wood fence',
  'vinyl fence',
  'chain link fence',
  'privacy fence',
  'fence contractor',
  'fence gate repair'
]
where slug = 'fence-installation-repair';


-- =========================================================
-- Concrete & Masonry
-- =========================================================

update public.connect_services
set search_tags = array[
  'concrete',
  'masonry',
  'cement',
  'brick',
  'brick repair',
  'masonry repair',
  'concrete repair',
  'pour concrete',
  'concrete driveway',
  'concrete patio',
  'concrete walkway',
  'sidewalk repair',
  'brickwork',
  'stonework',
  'retaining wall',
  'mason'
]
where slug = 'concrete-masonry';


-- =========================================================
-- Interior Design
-- =========================================================

update public.connect_services
set search_tags = array[
  'interior designer',
  'decorate house',
  'decorate room',
  'home decorating',
  'room design',
  'home design',
  'interior decorating',
  'redesign room',
  'living room design',
  'bedroom design',
  'decorating help',
  'home decor'
]
where slug = 'interior-design';


-- =========================================================
-- Personal Training
-- =========================================================

update public.connect_services
set search_tags = array[
  'personal trainer',
  'fitness trainer',
  'workout trainer',
  'fitness coach',
  'workout coach',
  'exercise coach',
  'gym trainer',
  'strength training',
  'weight training',
  'private trainer',
  'fitness help',
  'workout help'
]
where slug = 'personal-training';


-- =========================================================
-- Makeup Artist
-- =========================================================

update public.connect_services
set search_tags = array[
  'makeup',
  'makeup artist',
  'makeup application',
  'professional makeup',
  'wedding makeup',
  'bridal makeup',
  'prom makeup',
  'event makeup',
  'party makeup',
  'beauty makeup',
  'mobile makeup artist'
]
where slug = 'makeup-artist';


-- =========================================================
-- Hair Stylist / Barber
-- =========================================================

update public.connect_services
set search_tags = array[
  'hair stylist',
  'hairstylist',
  'barber',
  'haircut',
  'hair cut',
  'cut hair',
  'hair styling',
  'hair color',
  'hair coloring',
  'braids',
  'braiding',
  'mens haircut',
  'women haircut',
  'kids haircut',
  'mobile barber',
  'mobile stylist'
]
where slug = 'hair-stylist-barber';


-- =========================================================
-- Catering
-- =========================================================

update public.connect_services
set search_tags = array[
  'caterer',
  'catering service',
  'food catering',
  'event food',
  'party food',
  'wedding catering',
  'birthday catering',
  'corporate catering',
  'food for event',
  'food for party',
  'meal catering',
  'buffet catering'
]
where slug = 'catering';


-- =========================================================
-- Event Planning
-- =========================================================

update public.connect_services
set search_tags = array[
  'event planner',
  'party planner',
  'plan event',
  'plan party',
  'wedding planner',
  'birthday planner',
  'event coordinator',
  'party coordinator',
  'event planning help',
  'organize event',
  'organize party'
]
where slug = 'event-planning';


-- =========================================================
-- DJ Services
-- =========================================================

update public.connect_services
set search_tags = array[
  'dj',
  'disc jockey',
  'party dj',
  'wedding dj',
  'event dj',
  'birthday dj',
  'music for party',
  'music for wedding',
  'music for event',
  'dj for party',
  'dj for wedding',
  'mobile dj'
]
where slug = 'dj-services';


-- =========================================================
-- Tax Preparation
-- =========================================================

update public.connect_services
set search_tags = array[
  'taxes',
  'tax preparer',
  'prepare taxes',
  'file taxes',
  'tax filing',
  'income tax',
  'tax return',
  'tax return preparation',
  'business taxes',
  'personal taxes',
  'tax help',
  'tax preparation help'
]
where slug = 'tax-preparation';


-- =========================================================
-- Notary Services
-- =========================================================

update public.connect_services
set search_tags = array[
  'notary',
  'notarize',
  'notarize document',
  'notarized',
  'notary public',
  'mobile notary',
  'document notarization',
  'signature notarization',
  'need document notarized',
  'witness signature'
]
where slug = 'notary-services';


-- =========================================================
-- Animal Control
-- =========================================================

update public.connect_services
set search_tags = array[
  'animal control',
  'wildlife removal',
  'remove animal',
  'animal removal',
  'wild animal',
  'animal in attic',
  'animal under house',
  'raccoon',
  'raccoon removal',
  'squirrel removal',
  'snake removal',
  'bat removal',
  'possum removal',
  'opossum removal',
  'nuisance animal',
  'stray animal'
]
where slug = 'animal-control';


-- =========================================================
-- Companionship
-- =========================================================

update public.connect_services
set search_tags = array[
  'companion',
  'companion care',
  'companionship',
  'senior companion',
  'elderly companion',
  'social companion',
  'someone to visit',
  'someone to talk to',
  'conversation companion',
  'companionship service',
  'visit elderly',
  'senior social support',
  'non medical companion'
]
where slug = 'companionship';


-- =========================================================
-- Real Estate
-- =========================================================

update public.connect_services
set search_tags = array[
  'real estate',
  'realtor',
  'real estate agent',
  'buy house',
  'buy a house',
  'sell house',
  'sell my house',
  'home buying',
  'home selling',
  'find a house',
  'find home',
  'property',
  'property agent',
  'listing agent',
  'buyers agent',
  'buyer agent',
  'sell property'
]
where slug = 'real-estate';


-- =========================================================
-- Financial Services
-- =========================================================

update public.connect_services
set search_tags = array[
  'financial services',
  'financial advisor',
  'financial planning',
  'financial planner',
  'money management',
  'budget help',
  'budgeting',
  'retirement planning',
  'investment planning',
  'financial guidance',
  'personal finance',
  'wealth planning',
  'financial consultation'
]
where slug = 'financial-services';


commit;