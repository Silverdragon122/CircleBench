document.addEventListener('DOMContentLoaded', () => {
    const cpuNameElement = document.getElementById('cpu-name');
    const gpuNameElement = document.getElementById('gpu-name');
    const ramAmountElement = document.getElementById('ram-amount');
    const continueButton = document.getElementById('continue-button');

    // Function to get hardware information
    async function getHardwareInfo() {
        // Get CPU information
        const cpu = await navigator.hardwareConcurrency;
        cpuNameElement.textContent = `Logical processors: ${cpu}`;

        // Get GPU information
        const gl = document.createElement('canvas').getContext('webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        gpuNameElement.textContent = gpu;

        // Get RAM information
        const ram = navigator.deviceMemory || 'Unknown';
        ramAmountElement.textContent = `${ram} GB`;
    }

    getHardwareInfo();

    continueButton.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        if (username) {
            // Save data to cookies
            document.cookie = `username=${username}; path=/`;
            document.cookie = `cpu=${cpuNameElement.textContent}; path=/`;
            document.cookie = `gpu=${gpuNameElement.textContent}; path=/`;
            document.cookie = `ram=${ramAmountElement.textContent}; path=/`;

            // Redirect to /test
            window.location.href = '/test';
        } else {
            alert('Please enter a username.');
        }
    });
});