

document.addEventListener('DOMContentLoaded', async () => {
    
    const cpuNameElement = document.getElementById('cpu-name');
    const gpuNameElement = document.getElementById('gpu-name');
    const ramAmountElement = document.getElementById('ram-amount');

    const browserNameElement = document.createElement('p');
    browserNameElement.innerHTML = 'Browser: <span id="browser-name">Loading...</span>';
    const hardwareInfoDiv = document.getElementById('hardware-info');
    hardwareInfoDiv.appendChild(browserNameElement);


    const navigatorInfo = navigator.userAgent;
    const memory = navigator.deviceMemory || 'Unknown';
    const threads = navigator.hardwareConcurrency || 'Unknown';


    const browserName = getBrowserName(navigatorInfo);
    document.getElementById('browser-name').textContent = browserName;


    let cpuName = 'Unknown CPU';


    if (cpuName === 'Unknown CPU') {
        cpuName = `Unknown Name: ${threads} threads`;
    } else {
        cpuName = `${cpuName} Threads ${threads}`;
    }


    const gpuName = await getWebGLInfo();
    const ramAmount = memory;
    cpuNameElement.textContent = cpuName;
    gpuNameElement.textContent = gpuName;
    ramAmountElement.textContent = `${ramAmount} GB`;

    document.cookie = `username=; path=/`;
    document.cookie = `cpu=${cpuName}; path=/`;
    document.cookie = `gpu=${gpuName}; path=/`;
    document.cookie = `ram=${ramAmount} GB; path=/`;
    document.cookie = `browser=${browserName}; path=/`;


    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', () => {
        const usernameInput = document.getElementById('username').value.trim();

        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    

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
    

        document.cookie = `username=${usernameInput}; path=/`;
        window.location.href = '/test';
    });


    const modal = document.getElementById('instruction-modal');
    const getInfoButton = document.getElementById('get-info-button');
    const closeModal = document.querySelector('.close');
    const cmdCodeElement = document.getElementById('cmd-code');
    const copyButton = document.getElementById('copy-button');
    const linkCodeElement = document.getElementById('link-code');
    const successMessage = document.getElementById('success-message');

    if (!modal) console.error('Modal element is missing');
    if (!getInfoButton) console.error('Get Info Button element is missing');
    if (!closeModal) console.error('Close Modal element is missing');
    if (!cmdCodeElement) console.error('CMD Code Element is missing');
    if (!copyButton) console.error('Copy Button element is missing');
    if (!linkCodeElement) console.error('Link Code Element is missing');
    if (!successMessage) console.error('Success Message element is missing');
    
    if (!modal || !getInfoButton || !closeModal || !cmdCodeElement || !copyButton || !linkCodeElement || !successMessage) {
        return;
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const cpuNameElement = document.getElementById('cpu-name');
        const gpuNameElement = document.getElementById('gpu-name');
        const ramAmountElement = document.getElementById('ram-amount');
        

        const browserNameElement = document.createElement('p');
        browserNameElement.innerHTML = 'Browser: <span id="browser-name">Loading...</span>';
        const hardwareInfoDiv = document.getElementById('hardware-info');
        hardwareInfoDiv.appendChild(browserNameElement);
    

        const navigatorInfo = navigator.userAgent;
        const memory = navigator.deviceMemory || 'Unknown';
        const threads = navigator.hardwareConcurrency || 'Unknown';
    

        const browserName = getBrowserName(navigatorInfo);
        document.getElementById('browser-name').textContent = browserName;
    

        let cpuName = 'Unknown CPU';
    

        if (cpuName === 'Unknown CPU') {
            cpuName = `Unknown Name: ${threads} threads`;
        } else {
            cpuName = `${cpuName} Threads ${threads}`;
        }
    

        const gpuName = await getWebGLInfo();
        const ramAmount = memory;
        cpuNameElement.textContent = cpuName;
        gpuNameElement.textContent = gpuName;
        ramAmountElement.textContent = `${ramAmount} GB`;
    

        document.cookie = `username=; path=/`;
        document.cookie = `cpu=${cpuName}; path=/`;
        document.cookie = `gpu=${gpuName}; path=/`;
        document.cookie = `ram=${ramAmount} GB; path=/`;
        document.cookie = `browser=${browserName}; path=/`;
    

        const continueButton = document.getElementById('continue-button');
        continueButton.addEventListener('click', () => {
            const usernameInput = document.getElementById('username').value.trim();
            

            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        

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
        

            document.cookie = `username=${usernameInput}; path=/`;
            window.location.href = '/test';
        });
    

        const modal = document.getElementById('instruction-modal');
        const getInfoButton = document.getElementById('get-info-button');
        const closeModal = document.querySelector('.close');
        const cmdCodeElement = document.getElementById('cmd-code');
        const copyButton = document.getElementById('copy-button');
        const linkCodeElement = document.getElementById('link-code');
        const successMessage = document.getElementById('success-message');
    
        if (!modal) console.error('Modal element is missing');
        if (!getInfoButton) console.error('Get Info Button element is missing');
        if (!closeModal) console.error('Close Modal element is missing');
        if (!cmdCodeElement) console.error('CMD Code Element is missing');
        if (!copyButton) console.error('Copy Button element is missing');
        if (!linkCodeElement) console.error('Link Code Element is missing');
        if (!successMessage) console.error('Success Message element is missing');
        
        if (!modal || !getInfoButton || !closeModal || !cmdCodeElement || !copyButton || !linkCodeElement || !successMessage) {
            return;
        }
    
        getInfoButton.addEventListener('click', () => {
            modal.style.display = 'block';
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
    

        const downloadButton = document.getElementById('download-button');
        downloadButton.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = '/src/hwinfo.cmd';
            link.download = 'hwinfo.cmd';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
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