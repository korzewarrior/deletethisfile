// Theme switcher functionality
(function() {
    // Add the theme switch button to the page if it doesn't exist
    function createThemeButton() {
        if (!document.getElementById('theme-switch')) {
            const button = document.createElement('button');
            button.id = 'theme-switch';
            button.setAttribute('aria-label', 'Toggle dark/light mode');
            button.textContent = '🌓';
            document.body.appendChild(button);
        }
        return document.getElementById('theme-switch');
    }

    // Initialize theme functionality
    function initTheme() {
        const themeSwitch = createThemeButton();
        
        // Always default to light theme if no preference is saved
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Apply the current theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Toggle theme when button is clicked
        themeSwitch.addEventListener('click', function() {
            let switchToTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
                                ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', switchToTheme);
            localStorage.setItem('theme', switchToTheme);
        });

        // No longer auto-switch based on system preference
        // We'll keep the event listener but only for informational purposes
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDarkScheme.addEventListener('change', function(e) {
            // Don't automatically change theme based on system preference
            console.log('System preference changed to', e.matches ? 'dark' : 'light', 'mode, but not auto-switching');
        });
    }

    // Run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})(); 