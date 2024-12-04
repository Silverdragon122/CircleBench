// index.js

document.addEventListener('DOMContentLoaded', async () => {
    const cpuNameElement = document.getElementById('cpu-name');
    const gpuNameElement = document.getElementById('gpu-name');
    const ramAmountElement = document.getElementById('ram-amount');
    
    // Add browser name element
    const browserNameElement = document.createElement('p');
    browserNameElement.innerHTML = 'Browser: <span id="browser-name">Loading...</span>';
    const hardwareInfoDiv = document.getElementById('hardware-info');
    hardwareInfoDiv.appendChild(browserNameElement);

    // Get hardware info
    const navigatorInfo = navigator.userAgent;
    const memory = navigator.deviceMemory || 'Unknown';
    const threads = navigator.hardwareConcurrency || 'Unknown';

    // Detect browser name
    const browserName = getBrowserName(navigatorInfo);
    document.getElementById('browser-name').textContent = browserName;

    // CPU name detection is generally not possible in browsers due to security restrictions
    let cpuName = 'Unknown CPU';

    // Construct CPU info string with thread count
    if (cpuName === 'Unknown CPU') {
        cpuName = `Unknown Name: ${threads} threads`;
    } else {
        cpuName = `${cpuName} Threads ${threads}`;
    }

    // Get GPU info
    const gpuName = await getWebGLInfo();
    const ramAmount = memory;
    cpuNameElement.textContent = cpuName;
    gpuNameElement.textContent = gpuName;
    ramAmountElement.textContent = `${ramAmount} GB`;

    // Store data in cookies
    document.cookie = `username=; path=/`;
    document.cookie = `cpu=${cpuName}; path=/`;
    document.cookie = `gpu=${gpuName}; path=/`;
    document.cookie = `ram=${ramAmount} GB; path=/`;
    document.cookie = `browser=${browserName}; path=/`;

    // Handle continue button
    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', () => {
        const usernameInput = document.getElementById('username').value.trim();
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    
        // Validate username
        if (!usernameInput) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.color = 'red';
            errorMessage.style.marginTop = '10px';
            errorMessage.textContent = 'Please enter a username before continuing';
            
            const usernameElement = document.getElementById('username');
            usernameElement.parentNode.insertBefore(errorMessage, usernameElement.nextSibling);
            usernameElement.focus();
            return;
        }
    
        // Proceed with valid username
        document.cookie = `username=${usernameInput}; path=/`;
        window.location.href = '/test';
    });
});

// Function to detect browser name
function getBrowserName(userAgent) {
    if (userAgent.indexOf('Firefox') > -1) {
        return 'Mozilla Firefox';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
        return 'Opera';
    } else if (userAgent.indexOf('Trident') > -1) {
        return 'Microsoft Internet Explorer';
    } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
        return 'Microsoft Edge';
    } else if (userAgent.indexOf('Chrome') > -1) {
        return 'Google Chrome or Chromium';
    } else if (userAgent.indexOf('Safari') > -1) {
        return 'Safari';
    } else {
        return 'Other';
    }
}

// Function to get GPU info
async function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'Unknown GPU';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    return 'Unknown GPU';
}