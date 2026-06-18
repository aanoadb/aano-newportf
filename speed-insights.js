/**
 * Vercel Speed Insights Integration
 * 
 * This file provides Speed Insights tracking for the portfolio site.
 * It uses the manual script injection method recommended for static sites.
 * 
 * For more information, see: https://vercel.com/docs/speed-insights/quickstart
 */

// Initialize the Speed Insights queue
(function() {
    'use strict';
    
    // Set up the queue system for Speed Insights
    window.si = window.si || function() {
        (window.siq = window.siq || []).push(arguments);
    };
    
    // Configuration options
    const config = {
        // Enable debug mode in development (logs events to console)
        debug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        
        // Sample rate: 1.0 = 100% of events sent (can be reduced to 0.5 for 50%, etc.)
        sampleRate: 1.0,
        
        // Framework identifier
        framework: 'vanilla'
    };
    
    // Apply configuration if needed
    if (config.debug) {
        window.si('beforeSend', function(event) {
            console.log('[Speed Insights]', event);
            return event;
        });
    }
    
    // The actual Speed Insights script will be automatically injected by Vercel
    // when you enable Speed Insights in your project settings at vercel.com
    // 
    // If you need to self-host or customize the script location, you can add:
    // <script defer src="/_vercel/speed-insights/script.js"></script>
    // to your HTML <head> section
    
    console.log('Speed Insights initialized (waiting for Vercel script injection)');
})();
