/**
 * DeleteThisFile - Enterprise Secure Deletion System
 * v2.6.2 - Last updated: 2025-04-10
 * 
 * Copyright (c) 2025 DeleteThisFile, Inc.
 * All rights reserved.
 */

;(function() {
    'use strict';
    
    // Core application configuration
    const CONFIG = {
        animationDuration: 500,
        processingSteps: 15,
        completionDelay: 2500,
        notificationTimeout: 3000,
        analyticsEndpoint: null, // Enterprise version only
        securityLevel: 'maximum',
        complianceMode: 'DOD-5220.22-M',
        // Gamification settings
        gamification: {
            enabled: true,
            pointsPerFile: 50,
            bonusPoints: {
                firstDelete: 100,
                bulkDelete: 200,
                speedDemon: 150,
                fileTypes: {
                    // Bonus points for specific file types
                    'pdf': 10,
                    'docx': 15,
                    'xlsx': 20,
                    'pptx': 15,
                    'jpg': 5,
                    'mp4': 25
                }
            },
            levelThresholds: [0, 500, 1000, 2500, 5000, 10000, 20000, 50000]
        }
    };
    
    // Analytics tracker (disabled in client version)
    const Analytics = {
        trackEvent: (eventName, eventData) => {
            if (CONFIG.analyticsEndpoint && typeof eventData === 'object') {
                console.log(`[Analytics] ${eventName}:`, eventData);
                // Enterprise version implements actual tracking
            }
        }
    };
    
    // Application initialization
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize application modules
        const GamificationSystem = createGamificationSystem();
        const UIController = createUIController(GamificationSystem);
        const DeletionEngine = createDeletionEngine(UIController, GamificationSystem);
        const FileProcessor = createFileProcessor(DeletionEngine, UIController);
        
        // Bind event handlers
        bindEventHandlers(FileProcessor, UIController);
        
        // Initialize UI
        UIController.initializeInterface();
        
        // Log application ready status
        console.log(`[DeleteThisFile] System initialized - Security Level: ${CONFIG.securityLevel}`);
        
        // Track application load
        Analytics.trackEvent('application_initialized', {
            timestamp: new Date().toISOString(),
            securityLevel: CONFIG.securityLevel,
            complianceMode: CONFIG.complianceMode,
            gamificationEnabled: CONFIG.gamification.enabled
        });
    });
    
    /**
     * Creates the Gamification System module
     * Manages achievements, points, and rewards
     */
    function createGamificationSystem() {
        // User's achievement and scoring state
        const userState = {
            points: 0,
            level: 1,
            achievements: {
                "first-deletion": { earned: false, title: "First Deletion", description: "Delete your first file" },
                "bulk-deletion": { earned: false, title: "Bulk Cleaner", description: "Delete 5+ files at once" },
                "speed-demon": { earned: false, title: "Speed Demon", description: "Process files in under 3 seconds" },
                "file-master": { earned: false, title: "File Master", description: "Delete 10+ files in a session" },
                "secure-hero": { earned: false, title: "Security Hero", description: "Reach 1000 secure points" },
                "persistence": { earned: false, title: "Persistence", description: "Multiple deletion sessions" }
            },
            sessionStats: {
                filesDeleted: 0,
                sessionsCompleted: 0
            }
        };
        
        // Try to load saved state from localStorage
        const loadSavedState = () => {
            try {
                const savedState = localStorage.getItem('deleteThisFileState');
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    if (parsedState && typeof parsedState === 'object') {
                        // Merge saved state with default state (preserving defaults for new properties)
                        userState.points = parsedState.points || 0;
                        userState.level = parsedState.level || 1;
                        if (parsedState.achievements) {
                            Object.keys(userState.achievements).forEach(key => {
                                if (parsedState.achievements[key]) {
                                    userState.achievements[key].earned = parsedState.achievements[key].earned || false;
                                }
                            });
                        }
                        if (parsedState.sessionStats) {
                            userState.sessionStats.filesDeleted = parsedState.sessionStats.filesDeleted || 0;
                            userState.sessionStats.sessionsCompleted = parsedState.sessionStats.sessionsCompleted || 0;
                        }
                    }
                }
            } catch (e) {
                console.error("Error loading saved gamification state:", e);
            }
        };
        
        // Save current state to localStorage
        const saveState = () => {
            try {
                localStorage.setItem('deleteThisFileState', JSON.stringify(userState));
            } catch (e) {
                console.error("Error saving gamification state:", e);
            }
        };
        
        // Calculate level based on points
        const calculateLevel = (points) => {
            const thresholds = CONFIG.gamification.levelThresholds;
            for (let i = thresholds.length - 1; i >= 0; i--) {
                if (points >= thresholds[i]) {
                    return i + 1;
                }
            }
            return 1;
        };
        
        // Award points to the user
        const awardPoints = (amount, reason) => {
            if (!CONFIG.gamification.enabled) return 0;
            
            const previousLevel = userState.level;
            userState.points += amount;
            
            // Check if level changed
            userState.level = calculateLevel(userState.points);
            const leveledUp = userState.level > previousLevel;
            
            // Check achievements
            if (userState.points >= 1000 && !userState.achievements["secure-hero"].earned) {
                unlockAchievement("secure-hero");
            }
            
            // Save state
            saveState();
            
            return {
                pointsAwarded: amount,
                newTotal: userState.points,
                leveledUp: leveledUp,
                newLevel: userState.level
            };
        };
        
        // Calculate points for deletion
        const calculateDeletionPoints = (files, processingTime) => {
            if (!CONFIG.gamification.enabled) return 0;
            
            let points = files.length * CONFIG.gamification.pointsPerFile;
            let bonusReasons = [];
            
            // First deletion bonus
            if (!userState.achievements["first-deletion"].earned) {
                points += CONFIG.gamification.bonusPoints.firstDelete;
                bonusReasons.push("First deletion bonus!");
            }
            
            // Bulk deletion bonus
            if (files.length >= 5) {
                points += CONFIG.gamification.bonusPoints.bulkDelete;
                bonusReasons.push("Bulk deletion bonus!");
            }
            
            // Speed bonus
            if (processingTime < 3) {
                points += CONFIG.gamification.bonusPoints.speedDemon;
                bonusReasons.push("Speed demon bonus!");
            }
            
            // File type bonus points
            let fileTypeBonus = 0;
            Array.from(files).forEach(file => {
                const extension = file.name.split('.').pop().toLowerCase();
                if (CONFIG.gamification.bonusPoints.fileTypes[extension]) {
                    fileTypeBonus += CONFIG.gamification.bonusPoints.fileTypes[extension];
                }
            });
            
            if (fileTypeBonus > 0) {
                points += fileTypeBonus;
                bonusReasons.push("File type bonus!");
            }
            
            return {
                total: points,
                bonusReasons: bonusReasons
            };
        };
        
        // Unlock an achievement
        const unlockAchievement = (achievementId) => {
            if (!CONFIG.gamification.enabled) return null;
            
            if (userState.achievements[achievementId] && !userState.achievements[achievementId].earned) {
                userState.achievements[achievementId].earned = true;
                saveState();
                
                return {
                    id: achievementId,
                    title: userState.achievements[achievementId].title,
                    description: userState.achievements[achievementId].description
                };
            }
            
            return null;
        };
        
        // Update UI with achievements
        const updateAchievementsUI = () => {
            Object.keys(userState.achievements).forEach(achievementId => {
                const achievementCard = document.querySelector(`.achievement-card[data-achievement="${achievementId}"]`);
                if (achievementCard && userState.achievements[achievementId].earned) {
                    achievementCard.classList.remove('locked');
                    achievementCard.classList.add('unlocked');
                    
                    // Update the tooltip to show when it was earned
                    const tooltipSpan = achievementCard.querySelector('.tooltip');
                    if (tooltipSpan) {
                        tooltipSpan.textContent = `Achievement earned: ${userState.achievements[achievementId].title} - ${userState.achievements[achievementId].description}`;
                    }
                }
            });
            
            // Update secure points display
            const securePointsElement = document.getElementById('secure-points');
            if (securePointsElement) {
                securePointsElement.textContent = userState.points.toLocaleString();
                
                // Add level indicator if it doesn't exist
                const parent = securePointsElement.parentNode;
                if (!parent.querySelector('.level-indicator')) {
                    const levelIndicator = document.createElement('span');
                    levelIndicator.className = 'level-indicator';
                    levelIndicator.textContent = userState.level;
                    parent.appendChild(levelIndicator);
                } else {
                    parent.querySelector('.level-indicator').textContent = userState.level;
                }
            }
        };
        
        // Check and unlock achievements based on operation
        const checkAchievements = (operation, data) => {
            if (!CONFIG.gamification.enabled) return [];
            
            const unlockedAchievements = [];
            
            if (operation === 'deletion_complete') {
                // First deletion achievement
                if (!userState.achievements["first-deletion"].earned) {
                    const achievement = unlockAchievement("first-deletion");
                    if (achievement) unlockedAchievements.push(achievement);
                }
                
                // Bulk deletion achievement
                if (data.fileCount >= 5 && !userState.achievements["bulk-deletion"].earned) {
                    const achievement = unlockAchievement("bulk-deletion");
                    if (achievement) unlockedAchievements.push(achievement);
                }
                
                // Speed demon achievement
                if (data.processingTime < 3 && !userState.achievements["speed-demon"].earned) {
                    const achievement = unlockAchievement("speed-demon");
                    if (achievement) unlockedAchievements.push(achievement);
                }
                
                // Update session statistics
                userState.sessionStats.filesDeleted += data.fileCount;
                userState.sessionStats.sessionsCompleted += 1;
                
                // File master achievement
                if (userState.sessionStats.filesDeleted >= 10 && !userState.achievements["file-master"].earned) {
                    const achievement = unlockAchievement("file-master");
                    if (achievement) unlockedAchievements.push(achievement);
                }
                
                // Persistence achievement
                if (userState.sessionStats.sessionsCompleted >= 3 && !userState.achievements["persistence"].earned) {
                    const achievement = unlockAchievement("persistence");
                    if (achievement) unlockedAchievements.push(achievement);
                }
                
                saveState();
            }
            
            return unlockedAchievements;
        };
        
        // Initialize
        loadSavedState();
        
        // Return public interface
        return {
            getPoints: () => userState.points,
            getLevel: () => userState.level,
            awardPoints,
            calculateDeletionPoints,
            unlockAchievement,
            updateAchievementsUI,
            checkAchievements
        };
    }
    
    /**
     * Creates the UI Controller module
     * Responsible for all UI updates and animations
     */
    function createUIController(gamificationSystem) {
        // UI element references
        const elements = {
            dropZone: document.getElementById('drop-zone'),
            dropZoneOriginal: null, // Will hold a clone of the original drop zone
            deletionProgress: document.getElementById('deletion-progress'),
            progressFill: document.querySelector('.progress-fill'),
            deletionMessage: document.getElementById('deletion-message'),
            deletedCount: document.getElementById('deleted-count'),
            totalCount: document.getElementById('total-count'),
            securePoints: document.getElementById('secure-points'),
            statsContainer: document.getElementById('stats'),
            logo3D: document.querySelector('.logo-3d'),
            achievementPopup: document.getElementById('achievement-popup'),
            achievementName: document.getElementById('achievement-name'),
            confettiCanvas: document.getElementById('confetti-canvas')
        };
        
        // Reference to file processor - will be set later
        let fileProcessor = null;

        // Set the file processor reference
        const setFileProcessor = (processor) => {
            fileProcessor = processor;
        };
        
        // Session statistics
        let sessionStats = {
            deletionsPerformed: 0,
            totalFilesDeleted: Math.floor(Math.random() * 100000) + 500000,
            totalBytesProcessed: 0,
            averageProcessingTime: 0,
            processingTimeHistory: []
        };
        
        // Update UI with initial statistics
        const updateStatistics = () => {
            elements.deletedCount.textContent = sessionStats.deletionsPerformed.toLocaleString();
            elements.totalCount.textContent = sessionStats.totalFilesDeleted.toLocaleString();
            
            // Update gamification elements
            if (CONFIG.gamification.enabled && gamificationSystem) {
                elements.securePoints.textContent = gamificationSystem.getPoints().toLocaleString();
                gamificationSystem.updateAchievementsUI();
            }
        };
        
        // Initialize interface
        const initializeInterface = () => {
            updateStatistics();
            enhanceLogo3DAnimation();
            initializeConfetti();
        };
        
        // Enhance 3D logo animation with random speed variations
        const enhanceLogo3DAnimation = () => {
            if (elements.logo3D) {
                setInterval(() => {
                    const rotationSpeed = 8 + Math.random() * 4; // Random speed between 8-12s
                    elements.logo3D.style.animationDuration = `${rotationSpeed}s`;
                }, 10000);
            }
        };
        
        // Initialize confetti
        let confetti = null;
        const initializeConfetti = () => {
            if (!elements.confettiCanvas) return;
            
            // Simple confetti implementation
            confetti = {
                canvas: elements.confettiCanvas,
                ctx: elements.confettiCanvas.getContext('2d'),
                particles: [],
                colors: ['#0056b3', '#4285f4', '#0a8c46', '#fbbc05', '#ea4335'],
                
                create: function() {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                    this.particles = [];
                    
                    for (let i = 0; i < 150; i++) {
                        this.particles.push({
                            x: Math.random() * this.canvas.width,
                            y: Math.random() * this.canvas.height - this.canvas.height,
                            size: Math.random() * 10 + 5,
                            color: this.colors[Math.floor(Math.random() * this.colors.length)],
                            speed: Math.random() * 3 + 2,
                            rotation: Math.random() * 360,
                            rotationSpeed: (Math.random() - 0.5) * 2
                        });
                    }
                },
                
                animate: function() {
                    if (this.particles.length === 0) return;
                    
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    for (let i = 0; i < this.particles.length; i++) {
                        const p = this.particles[i];
                        
                        this.ctx.save();
                        this.ctx.translate(p.x, p.y);
                        this.ctx.rotate(p.rotation * Math.PI / 180);
                        
                        this.ctx.fillStyle = p.color;
                        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                        
                        this.ctx.restore();
                        
                        p.y += p.speed;
                        p.rotation += p.rotationSpeed;
                        
                        if (p.y > this.canvas.height) {
                            this.particles.splice(i, 1);
                            i--;
                        }
                    }
                    
                    if (this.particles.length > 0) {
                        requestAnimationFrame(() => this.animate());
                    }
                },
                
                start: function() {
                    this.create();
                    this.animate();
                }
            };
            
            // Handle window resize for confetti
            window.addEventListener('resize', () => {
                if (confetti) {
                    confetti.canvas.width = window.innerWidth;
                    confetti.canvas.height = window.innerHeight;
                }
            });
        };
        
        // Show achievement popup
        const showAchievement = (achievement) => {
            if (!elements.achievementPopup || !elements.achievementName) return;
            
            elements.achievementName.textContent = achievement.title;
            elements.achievementPopup.classList.remove('hidden');
            
            // Reset animation by removing and adding the element
            const parent = elements.achievementPopup.parentNode;
            const clone = elements.achievementPopup.cloneNode(true);
            parent.removeChild(elements.achievementPopup);
            parent.appendChild(clone);
            
            elements.achievementPopup = clone;
            elements.achievementName = clone.querySelector('#achievement-name');
            
            // Trigger confetti for achievement unlocked
            if (confetti) confetti.start();
            
            // Hide after animation completes
            setTimeout(() => {
                if (clone.parentNode) {
                    clone.classList.add('hidden');
                }
            }, 5000);
        };
        
        // Create floating points element
        const showPointsAnimation = (points, x, y) => {
            const pointsElement = document.createElement('div');
            pointsElement.className = 'floating-points';
            pointsElement.textContent = `+${points}`;
            
            Object.assign(pointsElement.style, {
                position: 'fixed',
                left: `${x}px`,
                top: `${y}px`,
                color: 'var(--points-color)',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                zIndex: '1000',
                pointerEvents: 'none',
                textShadow: '0 0 5px rgba(255,255,255,0.7)',
                animation: 'float-up 1.5s ease-out forwards'
            });
            
            document.body.appendChild(pointsElement);
            
            setTimeout(() => {
                if (pointsElement.parentNode) {
                    pointsElement.parentNode.removeChild(pointsElement);
                }
            }, 1500);
        };
        
        // Animate points being added
        const animatePointsAdded = (pointsData) => {
            if (!elements.securePoints) return;
            
            // Create points animation at a random position near the center
            const centerX = window.innerWidth / 2 + (Math.random() * 100 - 50);
            const centerY = window.innerHeight / 2 + (Math.random() * 100 - 50);
            showPointsAnimation(pointsData.pointsAwarded, centerX, centerY);
            
            // Update points display with animation
            elements.securePoints.textContent = pointsData.newTotal.toLocaleString();
            elements.securePoints.classList.add('points-added');
            
            setTimeout(() => {
                elements.securePoints.classList.remove('points-added');
            }, 800);
            
            // Update level indicator if needed
            if (pointsData.leveledUp) {
                const parent = elements.securePoints.parentNode;
                const levelIndicator = parent.querySelector('.level-indicator') || document.createElement('span');
                levelIndicator.className = 'level-indicator';
                levelIndicator.textContent = pointsData.newLevel;
                
                if (!parent.querySelector('.level-indicator')) {
                    parent.appendChild(levelIndicator);
                }
                
                // Level up animation
                levelIndicator.classList.add('level-up');
                setTimeout(() => {
                    levelIndicator.classList.remove('level-up');
                }, 1000);
                
                // Celebration for level up! - Also trigger confetti for level up
                if (confetti) confetti.start();
            }
        };
        
        // Show processing interface
        const showProcessingInterface = () => {
            // Instead of just saving the innerHTML, let's clone the entire element
            // to preserve all event listeners and state
            if (!elements.dropZoneOriginal) {
                elements.dropZoneOriginal = elements.dropZone.cloneNode(true);
            }
            
            // Create processing interface content
            const processingContent = `
                <h2>Processing Secure Deletion</h2>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-status">
                        <div class="status-icon"></div>
                        <p id="deletion-message">Initializing secure deletion protocol...</p>
                    </div>
                </div>
            `;
            
            // Apply processing styles to drop zone
            elements.dropZone.classList.add('processing-mode');
            elements.dropZone.innerHTML = processingContent;
            
            // Update element references to the new DOM elements inside the drop zone
            elements.progressFill = elements.dropZone.querySelector('.progress-fill');
            elements.deletionMessage = elements.dropZone.querySelector('#deletion-message');
            
            // Add busy state to body
            document.body.classList.add('busy-deleting');
            
            // Hide the original deletion progress panel (we don't need it anymore)
            if (elements.deletionProgress) {
                elements.deletionProgress.classList.add('hidden');
            }
        };
        
        // Reset interface after processing
        const resetInterface = () => {
            // Reset progress
            if (elements.progressFill) {
            elements.progressFill.style.width = '0';
            }
            
            // Restore the drop zone using the cloned original
            if (elements.dropZone && elements.dropZoneOriginal) {
                // Get the parent node of the current drop zone
                const parent = elements.dropZone.parentNode;
                
                // Create a fresh clone of the original drop zone
                const freshDropZone = elements.dropZoneOriginal.cloneNode(true);
                
                // Replace the current drop zone with the fresh clone
                parent.replaceChild(freshDropZone, elements.dropZone);
                
                // Update the element reference
                elements.dropZone = freshDropZone;
                
                // The cloned node will need event listeners reattached
                // This will be done in the bindEventHandlers function when resetInterface completes
            } else {
                // Fallback if the original isn't available
                if (elements.dropZone) {
                    elements.dropZone.classList.remove('processing-mode');
            elements.dropZone.classList.remove('hidden');
                    elements.dropZone.classList.remove('busy');
                    elements.dropZone.classList.remove('dragover');
                    
                    elements.dropZone.style.border = '2px dashed var(--gray-400)';
                    elements.dropZone.style.backgroundColor = 'white';
                    elements.dropZone.style.boxShadow = 'var(--box-shadow)';
                    elements.dropZone.style.cursor = 'pointer';
                    
                    // Fallback to recreating the default content
                    elements.dropZone.innerHTML = `
                        <div class="drop-zone-content">
                            <div class="icon-container">
                                <div class="icon">🗑️</div>
                                <div class="pulse-ring"></div>
                            </div>
                            <p>Drag Files From Your Computer For Secure Deletion</p>
                            <p class="small">Drag a file from your file explorer/finder or Linux file manager</p>
                        </div>
                    `;
                }
            }
            
            // Remove busy state
            document.body.classList.remove('busy-deleting');
            
            // Signal that event handlers need to be rebound
            return true;
        };
        
        // Update progress bar
        const updateProgressBar = (percentage) => {
            elements.progressFill.style.width = `${percentage}%`;
        };
        
        // Show notification
        const showNotification = (message, type = 'info') => {
            if (document.getElementById('notification')) {
                return; // Prevent multiple notifications
            }
            
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '5px',
                zIndex: '1000',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                maxWidth: '90%',
                animation: 'fade-in 0.3s',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 'var(--font-weight-medium)',
                fontSize: '0.95rem'
            });
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'fade-out 0.3s';
                    setTimeout(() => {
                        notification.parentNode.removeChild(notification);
                    }, 300);
                }
            }, CONFIG.notificationTimeout);
        };
        
        // Highlight dropzone
        const setDropZoneActive = (isActive) => {
            if (isActive) {
                elements.dropZone.classList.add('dragover');
            } else {
                elements.dropZone.classList.remove('dragover');
                elements.dropZone.classList.remove('busy');
            }
        };
        
        // Show busy state
        const showBusyState = () => {
            elements.dropZone.classList.add('busy');
            showNotification('System is currently processing files. Please wait for the operation to complete.');
        };
        
        // Animate stats completion
        const animateCompletion = () => {
            elements.statsContainer.classList.add('shake');
            setTimeout(() => {
                elements.statsContainer.classList.remove('shake');
            }, 500);
            
            // Only trigger confetti for achievements, not regular deletions
            // Removed: if (confetti) confetti.start();
        };
        
        // Update status message
        const updateStatusMessage = (message) => {
            elements.deletionMessage.textContent = message;
        };
        
        // Update session statistics
        const updateSessionData = (fileCount, fileSize, processingTime) => {
            sessionStats.deletionsPerformed += fileCount;
            sessionStats.totalFilesDeleted += fileCount;
            sessionStats.totalBytesProcessed += fileSize;
            
            // Update average processing time
            sessionStats.processingTimeHistory.push(processingTime);
            const totalTimes = sessionStats.processingTimeHistory.reduce((sum, time) => sum + time, 0);
            sessionStats.averageProcessingTime = totalTimes / sessionStats.processingTimeHistory.length;
            
            updateStatistics();
        };
        
        // Add CSS for floating points animation if not already defined
        if (!document.querySelector('style#animation-styles')) {
            const style = document.createElement('style');
            style.id = 'animation-styles';
            style.textContent = `
                @keyframes float-up {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { transform: translateY(-10px); opacity: 1; }
                    90% { transform: translateY(-50px); opacity: 1; }
                    100% { transform: translateY(-70px); opacity: 0; }
                }
                
                @keyframes level-up {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.5); box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
                    100% { transform: scale(1); }
                }
                
                .level-up {
                    animation: level-up 1s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Public interface
        return {
            elements,
            initializeInterface,
            showProcessingInterface,
            resetInterface,
            updateProgressBar,
            showNotification,
            setDropZoneActive,
            showBusyState,
            animateCompletion,
            updateStatusMessage,
            updateSessionData,
            showAchievement,
            animatePointsAdded,
            setFileProcessor
        };
    }
    
    /**
     * Creates the Deletion Engine module
     * Handles the core deletion process and status updates
     */
    function createDeletionEngine(ui, gamificationSystem) {
        // Generate deletion status messages
        const generateStatusMessage = (progress, files, fileSize) => {
            const formattedSize = formatFileSize(fileSize);
            
            const processingStages = [
                "Initializing secure deletion protocol...",
                `Analyzing ${files.slice(0, 2).join(', ')}${files.length > 2 ? ` and ${files.length - 2} more` : ''} (${formattedSize})`,
                "Implementing cryptographic sanitization...",
                "Executing DOD 5220.22-M compliant wipe...",
                "Applying zero-knowledge data shredding...",
                "Scanning for nested file structures...",
                "Overwriting with military-grade encryption patterns...",
                "Performing quantum-resistant data replacement...",
                "Securing deletion verification hashes...",
                "Implementing blockchain verification sequence...",
                "Bypassing potential data recovery vectors...",
                "Neutralizing forensic recovery methods...",
                "Executing final unrecoverable data elimination...",
                "Applying NSA-level sanitization protocol...",
                "Verifying secure deletion compliance..."
            ];
            
            const index = Math.floor((progress / 100) * processingStages.length);
            return processingStages[Math.min(index, processingStages.length - 1)];
        };
        
        // Format file size for display
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        
        // Execute the deletion process
        const executeProcess = (files, callbacks) => {
            const startTime = performance.now();
            const fileNames = Array.from(files).map(file => file.name);
            const totalFileSize = Array.from(files).reduce((total, file) => total + file.size, 0);
            
            let currentStep = 0;
            const totalSteps = CONFIG.processingSteps;
            
            // Start the deletion progress animation
            const processInterval = setInterval(() => {
                currentStep++;
                
                // Calculate progress percentage
                const progressPercentage = (currentStep / totalSteps) * 100;
                
                // Update UI with current progress
                callbacks.onProgress(progressPercentage);
                
                // Update status message
                const statusMessage = generateStatusMessage(progressPercentage, fileNames, totalFileSize);
                callbacks.onStatusUpdate(statusMessage);
                
                // Check if deletion is complete
                if (currentStep >= totalSteps) {
                    clearInterval(processInterval);
                    
                    const processingTime = (performance.now() - startTime) / 1000;
                    
                    // Report completion
                    const completionMessage = `Secure deletion complete: ${files.length} file${files.length !== 1 ? 's' : ''} processed in ${processingTime.toFixed(2)} seconds`;
                    callbacks.onStatusUpdate(completionMessage);
                    
                    // Handle gamification
                    if (CONFIG.gamification.enabled && gamificationSystem) {
                        // Calculate points for this operation
                        const pointsData = gamificationSystem.calculateDeletionPoints(files, processingTime);
                        
                        // Award points
                        const award = gamificationSystem.awardPoints(pointsData.total, 'file_deletion');
                        
                        // Check for achievements
                        const unlockedAchievements = gamificationSystem.checkAchievements('deletion_complete', {
                            fileCount: files.length,
                            processingTime,
                            totalSize: totalFileSize
                        });
                        
                        // Trigger UI updates for gamification
                        callbacks.onGamificationUpdate({
                            pointsData: award,
                            bonusReasons: pointsData.bonusReasons,
                            achievements: unlockedAchievements
                        });
                    }
                    
                    // Finalize the operation
                    callbacks.onComplete(files.length, totalFileSize, processingTime);
                }
            }, CONFIG.animationDuration);
            
            // Track deletion operation
            Analytics.trackEvent('deletion_started', {
                fileCount: files.length,
                totalSize: totalFileSize,
                timestamp: new Date().toISOString()
            });
        };
        
        // Public interface
        return {
            executeProcess,
            formatFileSize
        };
    }
    
    /**
     * Creates the File Processor module
     * Handles file input and processing initialization
     */
    function createFileProcessor(deletionEngine, ui) {
        // Track if deletion is in progress
        let processingActive = false;
        
        // Create the processor object first so we can reference it within functions
        const processor = {
            processFiles: null,
            handleFileSelection: null,
            isProcessingActive: () => processingActive
        };
        
        // Process dropped files
        processor.processFiles = (files) => {
            if (processingActive) {
                ui.showBusyState();
                return;
            }
            
            if (files.length === 0) {
                return;
            }
            
            console.log(`Processing ${files.length} files...`);
            
            // Set processing state
            processingActive = true;
            
            // Show processing interface
            ui.showProcessingInterface();
            
            // Execute deletion process
            deletionEngine.executeProcess(files, {
                onProgress: (progress) => {
                    ui.updateProgressBar(progress);
                },
                onStatusUpdate: (message) => {
                    ui.updateStatusMessage(message);
                },
                onGamificationUpdate: (gamificationData) => {
                    // Handle points awarded
                    if (gamificationData.pointsData) {
                        ui.animatePointsAdded(gamificationData.pointsData);
                    }
                    
                    // Handle achievements unlocked
                    if (gamificationData.achievements && gamificationData.achievements.length > 0) {
                        // Show each achievement with a small delay between them
                        let delay = 0;
                        gamificationData.achievements.forEach(achievement => {
                            setTimeout(() => {
                                ui.showAchievement(achievement);
                            }, delay);
                            delay += 1000;
                        });
                    }
                },
                onComplete: (fileCount, fileSize, processingTime) => {
                    ui.animateCompletion();
                    ui.updateSessionData(fileCount, fileSize, processingTime);
                    
                    // Reset after delay
                    setTimeout(() => {
                        // Reset the interface and rebind events if needed
                        const needsRebind = ui.resetInterface();
                        if (needsRebind) {
                            // Re-bind event handlers for the fresh drop zone
                            // Using the processor object we defined earlier
                            bindDropZoneEvents(ui.elements.dropZone, processor, ui);
                        }
                        processingActive = false;
                    }, CONFIG.completionDelay);
                }
            });
        };
        
        // Handle file selection
        processor.handleFileSelection = () => {
            if (processingActive) {
                ui.showBusyState();
                return;
            }
            
            const fileSelector = document.createElement('input');
            fileSelector.type = 'file';
            fileSelector.multiple = true;
            fileSelector.onchange = (e) => {
                if (e.target.files.length > 0) {
                    processor.processFiles(e.target.files);
                }
            };
            fileSelector.click();
        };
        
        // Return the processor object
        return processor;
    }
    
    /**
     * Binds all event handlers to DOM elements
     */
    function bindEventHandlers(fileProcessor, ui) {
        // Store the fileProcessor reference in the UI controller
        ui.setFileProcessor(fileProcessor);
        
        // Get the drop zone from UI elements
        const dropZone = ui.elements.dropZone;
        
        // Add debugging info
        console.log('Setting up drag and drop handlers for browsers');
        
        // Call our extracted function for binding events
        bindDropZoneEvents(dropZone, fileProcessor, ui);
        
        // Safari/Webkit fix: make the entire document able to receive drops
        document.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, false);
        
        document.addEventListener('drop', function(e) {
            // Only prevent default if not in the dropzone (to avoid double handling)
            if (!dropZone.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Document drop prevented (outside drop zone)');
            }
            return false;
        }, false);
        
        // Add simple styling for drag state
        const style = document.createElement('style');
        style.id = 'drag-helper-styles';
        style.textContent = `
            #drop-zone.dragover {
                border-color: var(--primary-color);
                background-color: rgba(0, 86, 179, 0.05);
                box-shadow: var(--box-shadow-lg);
                transform: scale(1.02);
                transition: all 0.2s ease;
            }
        `;
        
        // Remove any existing style to prevent duplication
        const existingStyle = document.getElementById('drag-helper-styles');
        if (existingStyle && existingStyle.parentNode) {
            existingStyle.parentNode.removeChild(existingStyle);
        }
        
        document.head.appendChild(style);
    }

    // Function to bind drop zone event handlers - extracted for reuse
    function bindDropZoneEvents(dropZone, fileProcessor, ui) {
        // Simple file drop handler
        function handleFiles(files) {
            if (!files || files.length === 0) {
                ui.showNotification('No files selected', 'error');
                return;
            }
            
            if (fileProcessor.isProcessingActive()) {
                ui.showBusyState();
                return;
            }
            
            console.log(`Processing ${files.length} files...`);
            fileProcessor.processFiles(Array.from(files)); // Ensure it's an array for consistent processing
        }
        
        // Prevent default behavior for all drag events to allow dropping
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
            return false; // For older browsers
        }
        
        // Add visual feedback for drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            preventDefaults(e);
            dropZone.classList.add('dragover');
            
            // Update drop zone text for better UX
            const textElement = dropZone.querySelector('p');
            if (textElement && textElement.dataset.originalText === undefined) {
                textElement.dataset.originalText = textElement.textContent;
                textElement.textContent = "Release to Delete File";
            }
        }
        
        function unhighlight(e) {
            preventDefaults(e);
            dropZone.classList.remove('dragover');
            
            // Restore original text
            const textElement = dropZone.querySelector('p');
            if (textElement && textElement.dataset.originalText !== undefined) {
                textElement.textContent = textElement.dataset.originalText;
                delete textElement.dataset.originalText;
            }
        }
        
        // Handle the drop
        dropZone.addEventListener('drop', function(e) {
            console.log('Drop event fired');
            e.preventDefault();
            e.stopPropagation();
            
            // Debug dataTransfer object
            console.log('Drop event details:', {
                types: Array.from(e.dataTransfer.types || []),
                filesCount: e.dataTransfer.files?.length || 0,
                itemsCount: e.dataTransfer.items?.length || 0
            });
            
            // Try multiple methods to get files
            let files = [];
            
            // Method 1: Direct files property
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                files = e.dataTransfer.files;
                console.log('Method 1: Got', files.length, 'files from dataTransfer.files');
            } 
            // Method 2: DataTransferItemList
            else if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                console.log('Method 2: Trying to get files from dataTransfer items...');
                
                // First check if this is text content that might be usable
                const hasStringContent = Array.from(e.dataTransfer.items).some(item => item.kind === 'string');
                let textProcessingStarted = false;
                
                if (hasStringContent) {
                    console.log('String content detected in drag');
                    
                    // Look for different types of string content
                    const types = Array.from(e.dataTransfer.types);
                    console.log('Available types:', types);
                    
                    // Special handling for Linux file managers (Hyprland, etc.)
                    if (types.includes('text/x-moz-url') || types.includes('text/uri-list')) {
                        textProcessingStarted = true;
                        
                        // Get the URL/path string
                        const uriData = e.dataTransfer.getData(types.includes('text/x-moz-url') ? 'text/x-moz-url' : 'text/uri-list');
                        console.log('Linux file path/URL content:', uriData);
                        
                        // For Linux, files might be separated by newlines
                        const uriLines = uriData.split('\n').filter(line => line.trim().length > 0);
                        const fileList = [];
                        
                        // Process each line that represents a file
                        for (let i = 0; i < uriLines.length; i++) {
                            // Skip every other line if it doesn't start with file:// as it might be just the filename
                            if (i % 2 === 0 || uriLines[i].startsWith('file://')) {
                                let filePath = uriLines[i].trim();
                                let fileName = '';
                                
                                // Try to get the filename from the next line if available
                                if (i + 1 < uriLines.length && !uriLines[i+1].startsWith('file://')) {
                                    fileName = uriLines[i+1].trim();
                                } else {
                                    // Extract filename from the path
                                    if (filePath.startsWith('file://')) {
                                        const pathParts = decodeURIComponent(filePath.replace('file://', '')).split('/');
                                        fileName = pathParts[pathParts.length - 1];
                                    } else {
                                        fileName = `dragged-file-${i+1}.txt`;
                                    }
                                }
                                
                                // Clean up the path for display
                                if (filePath.startsWith('file://')) {
                                    filePath = decodeURIComponent(filePath.replace('file://', ''));
                                }
                                
                                console.log('Extracted path:', filePath);
                                console.log('Extracted filename:', fileName);
                                
                                // Create a synthetic file with the path info
                                const fileContent = `File contents from: ${filePath}`;
                                const blob = new Blob([fileContent], {type: 'text/plain'});
                                const file = new File([blob], fileName || `dragged-file-${i+1}.txt`, {type: 'text/plain'});
                                
                                fileList.push(file);
                            }
                        }
                        
                        if (fileList.length > 0) {
                            console.log(`Created ${fileList.length} file representations from Linux paths`);
                            
                            // Show informative notification that looks like a real deletion is happening
                            ui.showNotification('Preparing files for secure deletion...', 'info');
                            
                            handleFiles(fileList);
                return;
            }
                    }
                    
                    // Prioritize different content types
                    if (types.includes('text/plain')) {
                        textProcessingStarted = true;
                        
                        // Find the item with text/plain
                        for (let i = 0; i < e.dataTransfer.items.length; i++) {
                            if (e.dataTransfer.items[i].kind === 'string' && e.dataTransfer.items[i].type === 'text/plain') {
                                e.dataTransfer.items[i].getAsString(function(text) {
                                    console.log('Plain text content:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
                                    
                                    if (text.trim().length > 0) {
                                        // Create a synthetic file from the text
                                        const blob = new Blob([text], {type: 'text/plain'});
                                        const file = new File([blob], 'dragged-text.txt', {type: 'text/plain'});
                                        
                                        console.log('Created file from text:', file.name, file.size, 'bytes');
                                        
                                        // Show a notification that we've converted text to a file
                                        ui.showNotification('Preparing file for secure deletion...', 'info');
                                        
                                        handleFiles([file]);
                                    } else {
                                        ui.showNotification('The dragged text was empty. Try dropping files from your computer instead.', 'error');
                                    }
                                });
                                break;
                            }
                        }
                    } else if (types.includes('text/html')) {
                        textProcessingStarted = true;
                        
                        // Find the item with text/html
                        for (let i = 0; i < e.dataTransfer.items.length; i++) {
                            if (e.dataTransfer.items[i].kind === 'string' && e.dataTransfer.items[i].type === 'text/html') {
                                e.dataTransfer.items[i].getAsString(function(html) {
                                    console.log('HTML content:', html.substring(0, 100) + (html.length > 100 ? '...' : ''));
                                    
                                    if (html.trim().length > 0) {
                                        // Create a synthetic file from the HTML
                                        const blob = new Blob([html], {type: 'text/html'});
                                        const file = new File([blob], 'dragged-content.html', {type: 'text/html'});
                                        
                                        console.log('Created file from HTML:', file.name, file.size, 'bytes');
                                        
                                        // Show a notification that we've converted HTML to a file
                                        ui.showNotification('Preparing file for secure deletion...', 'info');
                                        
                                        handleFiles([file]);
                                    } else {
                                        ui.showNotification('The dragged HTML was empty. Try dropping files from your computer instead.', 'error');
                                    }
                                });
                                break;
                            }
                        }
                    } else if (types.includes('text/uri-list')) {
                        textProcessingStarted = true;
                        
                        // Find the item with text/uri-list
                        const url = e.dataTransfer.getData('text/uri-list');
                        console.log('URL content:', url);
                        
                        if (url.trim().length > 0) {
                            // Create a text file with the URL
                            const blob = new Blob([url], {type: 'text/plain'});
                            const file = new File([blob], 'dragged-url.txt', {type: 'text/plain'});
                            
                            console.log('Created file from URL:', file.name, file.size, 'bytes');
                            
                            // Show a notification
                            ui.showNotification('Preparing file for secure deletion...', 'info');
                            
                            handleFiles([file]);
                        } else {
                            ui.showNotification('The dragged URL was empty. Try dropping files from your computer instead.', 'error');
                        }
                    }
                    
                    if (textProcessingStarted) {
                        return; // Skip further processing since we're handling the string content
                    }
                }
                
                // Continue with normal file processing
                for (let i = 0; i < e.dataTransfer.items.length; i++) {
                    // Check if this item is a file
                    if (e.dataTransfer.items[i].kind === 'file') {
                        const file = e.dataTransfer.items[i].getAsFile();
                        if (file) {
                            files.push(file);
                            console.log(`Found file: ${file.name} (${file.type})`);
                        }
                    } else {
                        console.log(`Item ${i} is not a file, it's a ${e.dataTransfer.items[i].kind}`);
                    }
                }
                console.log(`Retrieved ${files.length} files from items`);
            }
            
            // If we still don't have files, check if this is a special type of drag
            if (files.length === 0) {
                // Check if there are any URLs being dropped
                if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/uri-list')) {
                    const url = e.dataTransfer.getData('text/uri-list');
                    console.log('Dropped URL:', url);
                    ui.showNotification('URL detected. Please use Secure URL Protocol for web addresses.', 'error');
                    return;
                } else if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/plain')) {
                    const text = e.dataTransfer.getData('text/plain');
                    console.log('Dropped text:', text);
                    ui.showNotification('Unstructured text detected. Please drop a valid file for secure deletion.', 'error');
                    return;
                }
                
                // If we got here and still don't have files, show a helpful message
                ui.showNotification('No valid files detected. Please ensure you\'re dragging a complete file.', 'error');
                console.warn('No valid files found in drop event');
                return;
            }
            
            // Process the files if any were dropped
            console.log(`Final file count: ${files.length} files to process`);
            handleFiles(files);
        }, false);
        
        // Click handler for traditional file selection
        dropZone.addEventListener('click', function(e) {
            if (fileProcessor.isProcessingActive()) {
                ui.showBusyState();
                return;
            }
            fileProcessor.handleFileSelection();
        });
    }
})(); 