export const CATEGORIES = [
    {
        value: 'power_sockets',
        label: 'Power & Sockets',
        icon: 'fa-bolt',
        jobs: [
            { value: 'new_socket', label: 'New Socket Installation', icon: 'fa-plug' },
            { value: 'additional_circuit', label: 'Additional Circuit Installation', icon: 'fa-sitemap' },
            { value: 'outbuilding_power', label: 'Outbuilding Power Supply', icon: 'fa-building-o' },
            { value: 'ev_charger', label: 'EV Charger Installation', icon: 'fa-car' },
        ]
    },
    {
        value: 'lighting_controls',
        label: 'Lighting & Controls',
        icon: 'fa-lightbulb-o',
        jobs: [
            { value: 'new_light', label: 'New Light Installation', icon: 'fa-lightbulb-o' },
            { value: 'downlights', label: 'Downlights / Spotlights', icon: 'fa-dot-circle-o' },
            { value: 'smart_lighting', label: 'Smart Lighting Systems', icon: 'fa-toggle-on' },
            { value: 'outdoor_lighting', label: 'Outdoor & Security Lighting', icon: 'fa-tree' },
            { value: 'dimmer_install', label: 'Dimmer Switch Installation', icon: 'fa-sliders' },
        ]
    },
    {
        value: 'consumer_unit_safety',
        label: 'Consumer Unit & Safety',
        icon: 'fa-shield',
        jobs: [
            { value: 'consumer_unit', label: 'Consumer Unit / Fusebox Upgrade', icon: 'fa-power-off' },
            { value: 'rccb_install', label: 'RCD / RCBO Installation', icon: 'fa-shield' },
            { value: 'surge_protection', label: 'Surge Protection Devices', icon: 'fa-bolt' },
            { value: 'eicr', label: 'EICR / Safety Report', icon: 'fa-file-text-o' },
            { value: 'smoke_alarms', label: 'Smoke & Heat Alarm Installation', icon: 'fa-fire-extinguisher' },
            { value: 'earthing_bonding', label: 'Main Earthing & Bonding', icon: 'fa-link' },
            { value: 'fixed_wire_testing', label: 'Fixed Wire Testing', icon: 'fa-wrench' },
            { value: 'emergency_lighting', label: 'Emergency Lighting', icon: 'fa-lightbulb-o' },
        ]
    },
    {
        value: 'rewires_small_works',
        label: 'Rewires & Small Works',
        icon: 'fa-wrench',
        jobs: [
            { value: 'full_rewire', label: 'Full Rewire', icon: 'fa-home' },
            { value: 'partial_rewire', label: 'Partial Rewire', icon: 'fa-pencil' },
            { value: 'dado_trunking', label: 'Dado Trunking', icon: 'fa-columns' },
            { value: 'industrial_rewire', label: 'Industrial & Commercial Rewire', icon: 'fa-industry' },
            { value: 'minor_works', label: 'Minor Electrical Works', icon: 'fa-tasks' },
            { value: 'fault_finding', label: 'Fault Finding & Troubleshooting', icon: 'fa-search' },
        ]
    },
    {
        value: 'cabling_networking',
        label: 'Cabling & Networking',
        icon: 'fa-sitemap',
        jobs: [
            { value: 'structured_cabling', label: 'Structured & Data Cabling', icon: 'fa-sitemap' },
            { value: 'ethernet_point', label: 'Ethernet Point Installation', icon: 'fa-plug' },
            { value: 'wifi_booster', label: 'Wi-Fi Extender / Mesh Node', icon: 'fa-wifi' },
        ]
    },
    {
        value: 'heating_hot_water',
        label: 'Heating & Hot Water',
        icon: 'fa-thermometer',
        jobs: [
            { value: 'electric_shower', label: 'Electric Shower Installation', icon: 'fa-shower' },
            { value: 'underfloor_heating', label: 'Underfloor Heating Wiring', icon: 'fa-thermometer' },
            { value: 'heating_controls', label: 'Heating System Controls Installation', icon: 'fa-sliders' },
            { value: 'smart_heating_controls', label: 'Smart Heating Controls Integration', icon: 'fa-mobile' },
        ]
    },
    {
        value: 'smart_home_building_controls',
        label: 'Smart Home & Building Controls',
        icon: 'fa-home',
        jobs: [
            { value: 'smart_hub', label: 'Smart Home Hub Integration', icon: 'fa-home' },
            { value: 'knx_system', label: 'KNX Automation System', icon: 'fa-cogs' },
            { value: 'home_automation_panel', label: 'Automation Control Panel', icon: 'fa-tachometer' },
            { value: 'access_control', label: 'Access Control & Door Entry', icon: 'fa-key' },
            { value: 'cctv', label: 'CCTV & Security Systems', icon: 'fa-video-camera' },
            { value: 'automated_gates', label: 'Automated Gates & Barriers', icon: 'fa-road' },
        ]
    },
];

export const SOCKET_STYLES = [
    { value: 'standard', label: 'Standard' },
    { value: 'usb', label: 'USB Integrated' },
    { value: 'smart', label: 'Smart Socket' }
];

export const STEP_COUNTS = {
    // Power & Sockets
    'new_socket': 5, // Basic, Bonding, Fuse Board, Socket Details, Notes
    'additional_circuit': 5,
    'outbuilding_power': 5,
    'ev_charger': 4, // Basic, Bonding, Fuse Board, Notes
    // Lighting & Controls
    'new_light': 4,
    'downlights': 4,
    'smart_lighting': 4,
    'outdoor_lighting': 4,
    'dimmer_install': 4,
    // Consumer Unit & Safety
    'consumer_unit': 3,
    'rccb_install': 3,
    'surge_protection': 3,
    'eicr': 3,
    'smoke_alarms': 3,
    'earthing_bonding': 3,
    'fixed_wire_testing': 3,
    'emergency_lighting': 3,
    // Rewires & Small Works
    'full_rewire': 5,
    'partial_rewire': 5,
    'dado_trunking': 5,
    'industrial_rewire': 5,
    'minor_works': 5,
    'fault_finding': 5,
    // Cabling & Networking
    'structured_cabling': 4,
    'ethernet_point': 4,
    'wifi_booster': 4,
    // Heating & Hot Water
    'electric_shower': 4,
    'underfloor_heating': 4,
    'heating_controls': 4,
    'smart_heating_controls': 4,
    // Smart Home & Building Controls
    'smart_hub': 3,
    'knx_system': 3,
    'home_automation_panel': 3,
    'access_control': 3,
    'cctv': 3,
    'automated_gates': 3,
};