document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const deletionProgress = document.getElementById('deletion-progress');
    const progressFill = document.querySelector('.progress-fill');
    const deletionMessage = document.getElementById('deletion-message');
    const deletedCount = document.getElementById('deleted-count');
    const totalCount = document.getElementById('total-count');
    
    let fileCount = 0;
    let sessionDeletedCount = 0;
    let totalDeletedCount = 0;
    let deletionInProgress = false;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop zone when item is dragged over it (only if no deletion in progress)
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            if (!deletionInProgress) {
                highlight();
            } else {
                showBusy(e);
            }
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('dragover');
    }
    
    function unhighlight() {
        dropZone.classList.remove('dragover');
        dropZone.classList.remove('busy');
    }
    
    function showBusy(e) {
        // Show busy state when user tries to drag while deletion is in progress
        dropZone.classList.add('busy');
        
        // Create and show a busy notification if it doesn't exist
        if (!document.getElementById('busy-notification')) {
            const notification = document.createElement('div');
            notification.id = 'busy-notification';
            notification.textContent = 'Please wait for current deletion to complete';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = '#e74c3c';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        // Only process drops if no deletion is in progress
        if (deletionInProgress) {
            showBusy(e);
            return;
        }
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileCount = files.length;
            simulateFileDeletion(files);
        }
    }
    
    // Click to select files
    dropZone.addEventListener('click', () => {
        // Only allow file selection if no deletion is in progress
        if (deletionInProgress) {
            showBusy(null);
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                fileCount = e.target.files.length;
                simulateFileDeletion(e.target.files);
            }
        };
        input.click();
    });
    
    function simulateFileDeletion(files) {
        // Set deletion in progress
        deletionInProgress = true;
        
        // Add busy class to body to change cursor everywhere
        document.body.classList.add('busy-deleting');
        
        // Show deletion progress
        dropZone.classList.add('hidden');
        deletionProgress.classList.remove('hidden');
        
        // Get file names for messages
        const fileNames = Array.from(files).map(file => file.name);
        
        // Deletion process
        let progress = 0;
        const totalSteps = 10;
        const interval = setInterval(() => {
            progress++;
            
            // Update progress bar
            progressFill.style.width = `${progress * (100 / totalSteps)}%`;
            
            // Update message based on progress
            updateDeletionMessage(progress, totalSteps, fileNames);
            
            if (progress >= totalSteps) {
                clearInterval(interval);
                finishDeletion();
            }
        }, 300);
    }
    
    function updateDeletionMessage(progress, totalSteps, fileNames) {
        const messages = [
            "Preparing to delete your files...",
            `Analyzing ${fileNames.slice(0, 3).join(', ')}${fileNames.length > 3 ? '...' : ''}`,
            "Initializing deletion process...",
            "Fragmenting file data...",
            "Applying proprietary deletion algorithm...",
            "Removing file metadata...",
            "Erasing digital footprint...",
            "Clearing memory blocks...",
            "Sanitizing storage space...",
            "Finalizing deletion process..."
        ];
        
        const messageIndex = Math.floor((progress / totalSteps) * messages.length);
        deletionMessage.textContent = messages[Math.min(messageIndex, messages.length - 1)];
    }
    
    function finishDeletion() {
        // Update counters
        sessionDeletedCount += fileCount;
        totalDeletedCount += fileCount;
        
        deletedCount.textContent = sessionDeletedCount;
        totalCount.textContent = totalDeletedCount;
        
        // Show completion message
        deletionMessage.textContent = `Successfully deleted ${fileCount} file${fileCount !== 1 ? 's' : ''}!`;
        
        // Add shake animation to stats
        document.getElementById('stats').classList.add('shake');
        setTimeout(() => {
            document.getElementById('stats').classList.remove('shake');
        }, 500);
        
        // Reset after 2 seconds
        setTimeout(() => {
            progressFill.style.width = '0';
            deletionProgress.classList.add('hidden');
            dropZone.classList.remove('hidden');
            
            // Reset deletion in progress flag
            deletionInProgress = false;
            
            // Remove busy class from body
            document.body.classList.remove('busy-deleting');
        }, 2000);
    }
}); 