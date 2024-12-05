document.addEventListener('DOMContentLoaded', async () => {
    const cpuNameElement = document.getElementById('cpu-name');
    const gpuNameElement = document.getElementById('gpu-name');
    const ramAmountElement = document.getElementById('ram-amount');
    const threadsElement = document.createElement('p');
    threadsElement.innerHTML = 'Threads: <span id="threads-count">Not loaded</span>';
    const hardwareInfoDiv = document.getElementById('hardware-info');
    hardwareInfoDiv.appendChild(threadsElement);

    const browserNameElement = document.createElement('p');
    browserNameElement.innerHTML = 'Browser: <span id="browser-name">Loading...</span>';
    hardwareInfoDiv.appendChild(browserNameElement);

    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    
    let cpuName = 'Unknown CPU';
    let gpuName = 'Unknown GPU';
    let ramAmount = 'Unknown';
    let threadsCount = 'Unknown';

    
    const cpuCookie = getCookie('cpu');
    const gpuCookie = getCookie('gpu');
    const ramCookie = getCookie('ram');
    const threadsCookie = getCookie('threads');
    const browserCookie = getCookie('browser');

    if (cpuCookie) cpuName = cpuCookie;
    if (gpuCookie) gpuName = gpuCookie;
    if (ramCookie) ramAmount = ramCookie;
    if (threadsCookie) threadsCount = threadsCookie;

    
    cpuNameElement.textContent = cpuName;
    gpuNameElement.textContent = gpuName;
    ramAmountElement.textContent = ramAmount;
    document.getElementById('threads-count').textContent = threadsCount;

    
    const navigatorInfo = navigator.userAgent;
    const memory = navigator.deviceMemory || 'Unknown';
    const navigatorThreads = navigator.hardwareConcurrency || 'Unknown';

    let browserName = getBrowserName(navigatorInfo);
    if (browserCookie) {
        browserName = browserCookie;
    } else {
        
        document.cookie = `browser=${browserName}; path=/`;
    }
    document.getElementById('browser-name').textContent = browserName;

    
    document.cookie = `username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

    
    const usernameInput = document.getElementById('username');
    const continueButton = document.getElementById('continue-button');

    
    continueButton.disabled = true;

    
    usernameInput.addEventListener('input', () => {
        continueButton.disabled = usernameInput.value.trim() === '';
    });

    
    continueButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();

        
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (!username) {
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.color = 'red';
            errorMessage.style.marginTop = '10px';
            errorMessage.textContent = 'Please enter a username before continuing';

            usernameInput.parentNode.insertBefore(errorMessage, usernameInput.nextSibling);
            usernameInput.focus();
            return;
        }

        
        document.cookie = `username=${username}; path=/`;
        window.location.href = '/test';
    });

    const modal = document.getElementById('instruction-modal');
    const getInfoButton = document.getElementById('get-info-button');
    const closeModal = document.querySelector('.close');
    const cmdCodeElement = document.getElementById('cmd-code');
    const copyButton = document.getElementById('copy-button');
    const successMessage = document.getElementById('success-message');

    if (!modal) console.error('Modal element is missing');
    if (!getInfoButton) console.error('Get Info Button element is missing');
    if (!closeModal) console.error('Close Modal element is missing');
    if (!cmdCodeElement) console.error('CMD Code Element is missing');
    if (!copyButton) console.error('Copy Button element is missing');
    if (!successMessage) console.error('Success Message element is missing');

    if (!modal || !getInfoButton || !closeModal || !cmdCodeElement || !copyButton || !successMessage) {
        return;
    }

    let linkCode = null;
    let statusInterval = null;

    getInfoButton.addEventListener('click', async () => {
        if (!linkCode) {
            modal.style.display = 'block';

            
            const response = await fetch('/api/v1/link/generate', { method: 'GET' });
            const data = await response.json();
            linkCode = data.code;

            
            const isWindows = navigator.platform.indexOf('Win') > -1;

            
            let cmdCode;
            if (isWindows) {
                cmdCode = `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
                ; Invoke-WebRequest -Uri "https://circlebenchmark.pythonanywhere.com/src/hwinfo.ps1" -OutFile "hwinfo.ps1"; .\\hwinfo.ps1 -code "${linkCode}"`;
            } else {
                cmdCode = `curl -O 'https://circlebenchmark.pythonanywhere.com/api/v1/hwinfo.sh?code=${linkCode}' && chmod +x hwinfo.sh && ./hwinfo.sh ${linkCode}`;
            }
            cmdCodeElement.textContent = cmdCode;

            
            const checkLinkCodeStatus = async () => {
                const statusResponse = await fetch(`/api/v1/link/status/${linkCode}`);
                if (statusResponse.status === 404) {
                    console.error('Status endpoint not found.');
                    clearInterval(statusInterval);
                    return;
                }
                const statusData = await statusResponse.json();
                if (statusData.status === 'success') {
                    successMessage.style.display = 'block';
                    clearInterval(statusInterval);

                    
                    const hardwareInfo = statusData.hardware_info;
                    cpuName = hardwareInfo.cpu;
                    gpuName = hardwareInfo.gpu;
                    ramAmount = hardwareInfo.ram;
                    threadsCount = hardwareInfo.threads;

                    
                    cpuNameElement.textContent = cpuName;
                    gpuNameElement.textContent = gpuName;
                    ramAmountElement.textContent = ramAmount;
                    document.getElementById('threads-count').textContent = threadsCount;

                    
                    document.cookie = `cpu=${cpuName}; path=/`;
                    document.cookie = `gpu=${gpuName}; path=/`;
                    document.cookie = `ram=${ramAmount}; path=/`;
                    document.cookie = `threads=${threadsCount}; path=/`;

                    
                    modal.style.display = 'none';
                }
            };

            statusInterval = setInterval(checkLinkCodeStatus, 1000);
        } else {
            modal.style.display = 'block';
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(cmdCodeElement.textContent).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        });
    });
});

document.getElementById('view-source-button').addEventListener('click', () => {
    window.open('', '_blank');
});

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