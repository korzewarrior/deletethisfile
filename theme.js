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
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Check for saved theme preference or use the system preference
        const currentTheme = localStorage.getItem('theme') || 
                            (prefersDarkScheme.matches ? 'dark' : 'light');
        
        // Apply the current theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Toggle theme when button is clicked
        themeSwitch.addEventListener('click', function() {
            let switchToTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
                                ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', switchToTheme);
            localStorage.setItem('theme', switchToTheme);
        });

        // Listen for system theme changes
        prefersDarkScheme.addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                // Only auto-switch if user hasn't manually set a preference
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        });
    }

    // Run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})(); 