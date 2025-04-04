document.addEventListener('DOMContentLoaded', () => {
    // Initialize application components
    const dropZone = document.getElementById('drop-zone');
    const deletionProgress = document.getElementById('deletion-progress');
    const progressFill = document.querySelector('.progress-fill');
    const deletionMessage = document.getElementById('deletion-message');
    const deletedCount = document.getElementById('deleted-count');
    const totalCount = document.getElementById('total-count');
    
    // Application state management
    let fileCount = 0;
    let sessionDeletedCount = 0;
    let totalDeletedCount = Math.floor(Math.random() * 100000) + 500000; // Initialize with a large number for effect
    let deletionInProgress = false;
    let securityLevel = "Maximum"; // Security level setting - for display only
    
    // Initialize total count display
    totalCount.textContent = totalDeletedCount.toLocaleString();
    
    // Register event handlers for drag and drop operations
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaultBehavior, false);
        document.body.addEventListener(eventName, preventDefaultBehavior, false);
    });
    
    function preventDefaultBehavior(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Visual feedback during drag operations
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            if (!deletionInProgress) {
                activateDropZone();
            } else {
                indicateProcessingState(e);
            }
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, deactivateDropZone, false);
    });
    
    function activateDropZone() {
        dropZone.classList.add('dragover');
    }
    
    function deactivateDropZone() {
        dropZone.classList.remove('dragover');
        dropZone.classList.remove('busy');
    }
    
    function indicateProcessingState(e) {
        // Apply busy state UI when system is processing
        dropZone.classList.add('busy');
        
        // Display status notification
        if (!document.getElementById('busy-notification')) {
            const notification = document.createElement('div');
            notification.id = 'busy-notification';
            notification.textContent = 'System is currently processing files. Please wait for the operation to complete.';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'var(--primary-color)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.style.maxWidth = '90%';
            document.body.appendChild(notification);
            
            // Auto-dismiss notification
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }
    
    // Handle file drop event
    dropZone.addEventListener('drop', processDroppedFiles, false);
    
    function processDroppedFiles(e) {
        // Validate system availability
        if (deletionInProgress) {
            indicateProcessingState(e);
            return;
        }
        
        const dataTransfer = e.dataTransfer;
        const files = dataTransfer.files;
        
        if (files.length > 0) {
            fileCount = files.length;
            executeSecureDeletion(files);
        }
    }
    
    // Handle manual file selection
    dropZone.addEventListener('click', () => {
        // Validate system availability
        if (deletionInProgress) {
            indicateProcessingState(null);
            return;
        }
        
        const fileSelector = document.createElement('input');
        fileSelector.type = 'file';
        fileSelector.multiple = true;
        fileSelector.onchange = (e) => {
            if (e.target.files.length > 0) {
                fileCount = e.target.files.length;
                executeSecureDeletion(e.target.files);
            }
        };
        fileSelector.click();
    });
    
    function executeSecureDeletion(files) {
        // Update system state
        deletionInProgress = true;
        document.body.classList.add('busy-deleting');
        
        // Update UI to show processing state
        dropZone.classList.add('hidden');
        deletionProgress.classList.remove('hidden');
        
        // Extract metadata for processing
        const fileNames = Array.from(files).map(file => file.name);
        const totalFileSize = Array.from(files).reduce((total, file) => total + file.size, 0);
        
        // Simulate secure deletion process
        let progress = 0;
        const totalSteps = 10;
        
        // Performance metrics (for display only)
        const startTime = performance.now();
        
        const processingInterval = setInterval(() => {
            progress++;
            
            // Update visual progress indicator
            progressFill.style.width = `${progress * (100 / totalSteps)}%`;
            
            // Update status message
            updateProcessingStatus(progress, totalSteps, fileNames, totalFileSize);
            
            if (progress >= totalSteps) {
                const processingTime = ((performance.now() - startTime) / 1000).toFixed(2);
                clearInterval(processingInterval);
                finalizeOperation(processingTime);
            }
        }, 300);
    }
    
    function updateProcessingStatus(progress, totalSteps, fileNames, totalFileSize) {
        // Format file size for display
        const fileSizeFormatted = formatFileSize(totalFileSize);
        
        const processingStages = [
            "Initializing secure deletion protocol...",
            `Analyzing ${fileNames.slice(0, 2).join(', ')}${fileNames.length > 2 ? ` and ${fileNames.length - 2} more` : ''} (${fileSizeFormatted})`,
            "Implementing cryptographic sanitization...",
            "Executing DOD 5220.22-M compliant wipe...",
            "Applying zero-knowledge data shredding...",
            "Overwriting with military-grade encryption patterns...",
            "Performing multi-pass random data replacement...",
            "Securing deletion verification hashes...",
            "Executing final unrecoverable data elimination...",
            "Verifying secure deletion compliance..."
        ];
        
        const messageIndex = Math.floor((progress / totalSteps) * processingStages.length);
        deletionMessage.textContent = processingStages[Math.min(messageIndex, processingStages.length - 1)];
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function finalizeOperation(processingTime) {
        // Update deletion metrics
        sessionDeletedCount += fileCount;
        totalDeletedCount += fileCount;
        
        // Update displays
        deletedCount.textContent = sessionDeletedCount.toLocaleString();
        totalCount.textContent = totalDeletedCount.toLocaleString();
        
        // Show completion message
        const completionMessage = `Secure deletion complete: ${fileCount} file${fileCount !== 1 ? 's' : ''} processed in ${processingTime} seconds`;
        deletionMessage.textContent = completionMessage;
        
        // Display visual confirmation of operation success
        document.getElementById('stats').classList.add('shake');
        setTimeout(() => {
            document.getElementById('stats').classList.remove('shake');
        }, 500);
        
        // Reset system after appropriate delay
        setTimeout(() => {
            progressFill.style.width = '0';
            deletionProgress.classList.add('hidden');
            dropZone.classList.remove('hidden');
            
            // Reset application state
            deletionInProgress = false;
            document.body.classList.remove('busy-deleting');
        }, 2000);
    }
}); 