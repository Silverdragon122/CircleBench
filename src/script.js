document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const counterElement = document.getElementById('counter');
    let totalSides = 0;
    const sidesPerSecond = 1200;
    const durationInSeconds = 60;
    const interval = 1000 / sidesPerSecond;
    const circlesPerSecond = 100; // Decrease the number of circles created per second
    let lastFrameTime = performance.now();
    let stutterDetected = false;

    function createCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');

        // Set random position
        const containerRect = container.getBoundingClientRect();
        const circleSize = 100; // Assuming the circle size is 100px
        const maxX = containerRect.width - circleSize;
        const maxY = containerRect.height - circleSize;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        circle.style.left = `${randomX}px`;
        circle.style.top = `${randomY}px`;

        // Set random color
        circle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

        container.appendChild(circle);

        let sides = 0;
        const intervalId = setInterval(() => {
            sides++;
            totalSides++;
            counterElement.textContent = `${totalSides} sides`;

            if (sides >= sidesPerSecond * durationInSeconds) {
                clearInterval(intervalId);
                container.removeChild(circle);
            }
        }, interval);
    }

    function monitorFrameRate() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        if (delta > 100) { // If frame time exceeds 100ms, consider it a stutter
            stutterDetected = true;
            displayDoneScreen();
        } else {
            requestAnimationFrame(monitorFrameRate);
        }
    }

    function displayDoneScreen() {
        const doneScreen = document.createElement('div');
        doneScreen.classList.add('done-screen');
        doneScreen.textContent = 'Done';
        container.innerHTML = ''; // Clear the container
        container.appendChild(doneScreen);

        // Save side amount and upload data
        uploadData(totalSides);
    }

    function uploadData(sides) {
        const username = getCookie('username');
        const cpu = getCookie('cpu');
        const gpu = getCookie('gpu');
        const ram = getCookie('ram');

        const data = {
            username,
            cpu,
            gpu,
            ram,
            sides
        };

        fetch('/api/v1/leaderboard/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            fetchLeaderboard();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function fetchLeaderboard() {
        fetch('/api/v1/leaderboard/fetch')
        .then(response => response.json())
        .then(data => {
            displayLeaderboard(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function displayLeaderboard(data) {
        const leaderboard = document.createElement('div');
        leaderboard.classList.add('leaderboard');
        leaderboard.innerHTML = '<h2>Leaderboard</h2>';

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Username</th><th>CPU</th><th>GPU</th><th>RAM</th><th>Sides</th>';
        table.appendChild(headerRow);

        data.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${entry.username}</td><td>${entry.cpu}</td><td>${entry.gpu}</td><td>${entry.ram}</td><td>${entry.sides}</td>`;
            table.appendChild(row);
        });

        leaderboard.appendChild(table);
        container.appendChild(leaderboard);
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    setInterval(() => {
        if (!stutterDetected) {
            for (let i = 0; i < circlesPerSecond; i++) {
                createCircle();
            }
        }
    }, 1000);

    requestAnimationFrame(monitorFrameRate);
});