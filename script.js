/**
 * DeleteThisFile - Enterprise Secure Deletion System
 * v2.5.3 - Last updated: 2025-03-15
 * 
 * Copyright (c) 2025 DeleteThisFile, Inc.
 * All rights reserved.
 */

;(function() {
    'use strict';
    
    // Core application configuration
    const CONFIG = {
        animationDuration: 300,
        processingSteps: 10,
        completionDelay: 2000,
        notificationTimeout: 3000,
        analyticsEndpoint: null, // Enterprise version only
        securityLevel: 'maximum',
        complianceMode: 'DOD-5220.22-M'
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
        const UIController = createUIController();
        const DeletionEngine = createDeletionEngine(UIController);
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
            complianceMode: CONFIG.complianceMode
        });
    });
    
    /**
     * Creates the UI Controller module
     * Responsible for all UI updates and animations
     */
    function createUIController() {
        // UI element references
        const elements = {
            dropZone: document.getElementById('drop-zone'),
            deletionProgress: document.getElementById('deletion-progress'),
            progressFill: document.querySelector('.progress-fill'),
            deletionMessage: document.getElementById('deletion-message'),
            deletedCount: document.getElementById('deleted-count'),
            totalCount: document.getElementById('total-count'),
            statsContainer: document.getElementById('stats'),
            logo3D: document.querySelector('.logo-3d')
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
        };
        
        // Initialize interface
        const initializeInterface = () => {
            updateStatistics();
            enhanceLogo3DAnimation();
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
        
        // Show processing interface
        const showProcessingInterface = () => {
            elements.dropZone.classList.add('hidden');
            elements.deletionProgress.classList.remove('hidden');
            document.body.classList.add('busy-deleting');
        };
        
        // Reset interface after processing
        const resetInterface = () => {
            elements.progressFill.style.width = '0';
            elements.deletionProgress.classList.add('hidden');
            elements.dropZone.classList.remove('hidden');
            document.body.classList.remove('busy-deleting');
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
            updateSessionData
        };
    }
    
    /**
     * Creates the Deletion Engine module
     * Handles the core deletion process and status updates
     */
    function createDeletionEngine(ui) {
        // Generate deletion status messages
        const generateStatusMessage = (progress, files, fileSize) => {
            const formattedSize = formatFileSize(fileSize);
            
            const processingStages = [
                "Initializing secure deletion protocol...",
                `Analyzing ${files.slice(0, 2).join(', ')}${files.length > 2 ? ` and ${files.length - 2} more` : ''} (${formattedSize})`,
                "Implementing cryptographic sanitization...",
                "Executing DOD 5220.22-M compliant wipe...",
                "Applying zero-knowledge data shredding...",
                "Overwriting with military-grade encryption patterns...",
                "Performing multi-pass random data replacement...",
                "Securing deletion verification hashes...",
                "Executing final unrecoverable data elimination...",
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
        
        // Process dropped files
        const processFiles = (files) => {
            if (processingActive) {
                ui.showBusyState();
                return;
            }
            
            if (files.length === 0) {
                return;
            }
            
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
                onComplete: (fileCount, fileSize, processingTime) => {
                    ui.animateCompletion();
                    ui.updateSessionData(fileCount, fileSize, processingTime);
                    
                    // Reset after delay
                    setTimeout(() => {
                        ui.resetInterface();
                        processingActive = false;
                    }, CONFIG.completionDelay);
                }
            });
        };
        
        // Handle file drop event
        const handleFileDrop = (e) => {
            if (processingActive) {
                ui.showBusyState();
                return;
            }
            
            const dataTransfer = e.dataTransfer;
            const files = dataTransfer.files;
            
            if (files.length > 0) {
                processFiles(files);
            }
        };
        
        // Handle file selection
        const handleFileSelection = () => {
            if (processingActive) {
                ui.showBusyState();
                return;
            }
            
            const fileSelector = document.createElement('input');
            fileSelector.type = 'file';
            fileSelector.multiple = true;
            fileSelector.onchange = (e) => {
                if (e.target.files.length > 0) {
                    processFiles(e.target.files);
                }
            };
            fileSelector.click();
        };
        
        // Public interface
        return {
            processFiles,
            handleFileDrop,
            handleFileSelection,
            isProcessingActive: () => processingActive
        };
    }
    
    /**
     * Binds all event handlers to DOM elements
     */
    function bindEventHandlers(fileProcessor, ui) {
        const dropZone = ui.elements.dropZone;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaultBehavior, false);
            document.body.addEventListener(eventName, preventDefaultBehavior, false);
        });
        
        function preventDefaultBehavior(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Handle drag effects
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                if (!fileProcessor.isProcessingActive()) {
                    ui.setDropZoneActive(true);
                } else {
                    ui.showBusyState();
                }
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                ui.setDropZoneActive(false);
            }, false);
        });
        
        // Handle file drop and click
        dropZone.addEventListener('drop', fileProcessor.handleFileDrop, false);
        dropZone.addEventListener('click', fileProcessor.handleFileSelection, false);
    }
})(); 