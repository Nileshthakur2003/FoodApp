// app/page.tsx
'use client';
import { MapPinIcon, X ,Send} from 'lucide-react';
import { Page,
   Navbar, 
   Block, 
   BlockTitle, 
   List, 
   ListItem, 
   Button , 
   Link, 
  Panel, 
  MenuList, 
  MenuListItem , 
  Searchbar ,
  Notification,
  Popover
} from 'konsta/react';
import { useState ,useEffect} from 'react';
export default function Home() {

  const [size, setSize] = useState('Default');
   const [isTransparent, setIsTransparent] = useState(false);
    const [navigationPanelOpened, setNavigationPanelOpened] = useState(false);
    const [locationPanelOpened, setLocationPanelOpened] = useState(false);
    const [selected, setSelected] = useState('home');
    const [selectedMedia, setSelectedMedia] = useState('home');

    const [searchQuery, setSearchQuery] = useState('');


     const [GeolocationErrorNotification, setGeolocationErrorNotification] = useState(false);
  
  const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
  
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <Page className="min-h-screen bg-gray-50 dark:bg-black">
      {/* 
        FIXED WRAPPER:
        - px-0 on mobile so elements hit the true physical edge of the phone window.
        - md:px-12 on desktop screens so content remains centered with clean, breathable margins.
      */}
      <Navbar
        title="EatRight"
        subtitle="&#128205;Katihar"
        className="top-0 sticky z-40"
        medium={size === 'Medium'}
        large={size === 'Large'}
        transparent={isTransparent}
        right={<Link><MapPinIcon onClick={() => setLocationPanelOpened(true)} /></Link>}
        left={<Link onClick={() => setNavigationPanelOpened(true)}>&equiv;</Link>}
      />
      <div className="relative">
      <div className="w-full max-w-(screen-xl) mx-0 min-h-screen bg-white dark:bg-[#1c1c1e] px-0 md:px-0 ">
        
        {/* Premium Apple-style iOS navigation header */}
        
        
        {/* 
          Responsive Grid Layout:
          - Mobile: Single column, items stretch neatly with standard iOS inset gaps.
          - Desktop: Two grid columns utilizing laptop horizontal viewport territory.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-6">
          
          {/* Welcome Block Section (Left Side) */}
          <div className="flex flex-col justify-start">
            <Block strong inset className="space-y-6 bg-gray-50/60 dark:bg-zinc-900/40 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 md:p-6">
              
              <Searchbar
                   value={searchQuery}
                    onInput={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a restaurant or cuisine..."
                    clearButton={searchQuery.length > 0}
                    onClear={() => setSearchQuery('')}
          // Extra right padding inside the native text element to avoid text-overlapping
                   inputStyle={{ paddingRight: '40px' }} 
                />

              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg leading-relaxed">
                Rating the health, authenticity, and real value of street food, restaurants, and hotels. Discover the best quality, prices, and portions near you.
              </p>
              <Button large rounded className="bg-blue-600 text-white font-medium shadow-md transition-all hover:bg-blue-700 active:scale-98 cursor-pointer w-full md:w-auto md:px-8">
                Explore Restaurants
              </Button>
            </Block>
          </div>

          {/* Categorized List Section (Right Side) */}
          <div className="flex flex-col justify-start">
            <BlockTitle className="text-lg md:text-xl font-semibold mb-1">Popular Categories</BlockTitle>
            <List strong inset className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
              <ListItem 
                title="Gourmet Burgers" 
                after="12 Shops" 
                link 
                chevron
                className="cursor-pointer py-1 md:py-2"
              />
              <ListItem 
                title="Authentic Sushi" 
                after="8 Shops" 
                link 
                chevron
                className="cursor-pointer py-1 md:py-2"
              />
              <ListItem 
                title="Artisan Dessert" 
                after="15 Shops" 
                link 
                chevron
                className="cursor-pointer py-1 md:py-2"
              />
            </List>
          </div>
          
        </div>
      </div>
      </div>
       <Panel
        side="left"
        opened={navigationPanelOpened}
        onBackdropClick={() => setNavigationPanelOpened(false)}
      >
        <Page>
          <Navbar
            title="Left Panel"
            right={
              <Link iconOnly onClick={() => setNavigationPanelOpened(false)}>
                <X />
              </Link>
            }
          />
          <Block className="space-y-4">
       <MenuList strongIos outlineIos>
        <MenuListItem
          title="Home"
          active={selected === 'home'}
          onClick={() => setSelected('home')}
          media={<Send />}
        />
        <MenuListItem
          title="Profile"
          active={selected === 'profile'}
          onClick={() => setSelected('profile')}
          media={<Send />}
        />
        <MenuListItem
          title="Settings"
          active={selected === 'settings'}
          onClick={() => setSelected('settings')}
          media={<Send />}
        />
      </MenuList>
          </Block>
        </Page>
      </Panel>


      <Panel
        side="right"
        opened={locationPanelOpened}
        onBackdropClick={() => setLocationPanelOpened(false)}
         className="w-[85vw] md:w-[60vw] lg:w-[45vw] xl:w-[35vw]"
      >
        <Page>
          <Navbar
            title="Left Panel"
            right={
              <Link iconOnly onClick={() => setLocationPanelOpened(false)}>
                <X />
              </Link>
            }
          />
          <Block className="space-y-4">
           <div className="relative w-full">
        <Searchbar
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.target.value)}
          placeholder="Search area or get current location..."
          clearButton={searchQuery.length > 0}
          onClear={() => setSearchQuery('')}
          // Extra right padding inside the native text element to avoid text-overlapping
          inputStyle={{ paddingRight: '40px' }} 
        />

        {/* Absolute Geolocation Trigger Button */}
        <button
          type="button"
          onClick={async () => {
  const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  // 1. Check current permission status before asking (supported in most modern browsers)
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'denied') {
        alert("🔒 Location access is blocked. Please reset your location permissions in your browser's address bar settings to proceed.");
        return; // Stop here because browser won't show the prompt if it's already blocked
      }
    } catch (e) {
      console.warn("Permissions API check failed, falling back to direct request.", e);
    }
  }

  // 2. This call will automatically trigger the native browser popup asking for access
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy}`);

      if (accuracy > 15) {
        setGeolocationErrorNotification(true);
      }
    },
    (error) => {
      console.error('Error obtaining location:', { code: error.code, message: error.message });

      switch (error.code) {
        case error.PERMISSION_DENIED:
          // Triggers if they click "Block" or "Deny" on the browser popup
          alert("We need your location to show nearby items. Please allow location access in your browser or phone settings.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable. Check if your phone's GPS is turned on.");
          break;
        case error.TIMEOUT:
          alert("The request to get your location timed out. Try moving near a window.");
          break;
        default:
          alert("An unknown error occurred.");
          break;
      }
    },
    geolocationOptions
  );
}}

          className="absolute y-center right-1 ios:right-1 z-20 flex items-center justify-center w-8 h-8 text-primary active:opacity-50 cursor-pointer"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {/* SVG Geolocation Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </button>
      </div>

       {/* Results List */}
      <List strong insetIos>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ListItem key={item} title={item} />
          ))
        ) : (
          <ListItem title="No results found" className="text-gray-500" />
        )}
      </List>
          </Block>
        </Page>
      </Panel>
      
       <Notification
        opened={GeolocationErrorNotification}
        icon={<MapPinIcon />}
        title="EatRight"
        titleRightText="now"
        onClick={() => setGeolocationErrorNotification(false)}
        subtitle="Geolocation Error"
        text="Your device doesn't support high-accuracy location services. For more accurate geolocation, please use an Android or iOS phone."
      />
      
     
    </Page>
  );
}
