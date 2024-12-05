
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const counterElement = document.getElementById('counter');
    const timerElement = document.createElement('div');
    timerElement.id = 'timer';

    
    timerElement.style.position = 'absolute';
    timerElement.style.top = '10px';
    timerElement.style.right = '10px';
    timerElement.style.color = '#fff';
    timerElement.style.fontSize = '24px';

    container.appendChild(timerElement);

    const durationInSeconds = 30;
    const circlesPerSecond = 2;
    const startingCircles = 2500; 
    let lastFrameTime = performance.now();
    let fpsValues = [];
    let startTime = performance.now();
    let animationId;
    let circleAdditionInterval;
    let explosionInterval;

    const circles = [];

    function createCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');

        
        const containerRect = container.getBoundingClientRect();
        const circleSize = 100; 
        const maxX = containerRect.width - circleSize;
        const maxY = containerRect.height - circleSize;
        const posX = Math.random() * maxX;
        const posY = Math.random() * maxY;

        
        const speedX = (Math.random() - 0.5) * 10; 
        const speedY = (Math.random() - 0.5) * 10;

        
        circle.style.width = `${circleSize}px`;
        circle.style.height = `${circleSize}px`;
        circle.style.left = `${posX}px`;
        circle.style.top = `${posY}px`;
        circle.style.background = `radial-gradient(circle at 50% 50%, hsl(${Math.random() * 360}, 100%, 70%), hsl(${Math.random() * 360}, 100%, 30%))`;
        circle.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.pointerEvents = 'none';

        
        circles.push({
            element: circle,
            posX,
            posY,
            speedX,
            speedY,
            size: circleSize,
            mass: circleSize / 10 
        });

        container.appendChild(circle);
    }

    function createInitialCircles() {
        for (let i = 0; i < startingCircles; i++) {
            createCircle();
        }
    }

    function createExplosion() {
        
        const containerRect = container.getBoundingClientRect();
        const explosionX = Math.random() * containerRect.width;
        const explosionY = Math.random() * containerRect.height;
        const explosionForce = 1000; 
        const explosionRadius = 300; 
    
        
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.left = `${explosionX - 50}px`;
        explosion.style.top = `${explosionY - 50}px`;
        explosion.style.width = '100px';
        explosion.style.height = '100px';
        explosion.style.background = 'radial-gradient(circle at center, rgba(255,255,0,1), rgba(255,0,0,0))';
        explosion.style.borderRadius = '50%';
        explosion.style.pointerEvents = 'none';
        explosion.style.opacity = '0.8';
        container.appendChild(explosion);
    
        
        setTimeout(() => {
            try {
                if (container.contains(explosion)) {
                    container.removeChild(explosion);
                }
            } catch (error) {
                console.log('Explosion element already removed');
            }
        }, 500);
    
        
        circles.forEach(circle => {
            const dx = circle.posX + circle.size / 2 - explosionX;
            const dy = circle.posY + circle.size / 2 - explosionY;
            const distance = Math.hypot(dx, dy);
    
            if (distance < explosionRadius) {
                const effect = (explosionRadius - distance) / explosionRadius;
                const angle = Math.atan2(dy, dx);
                const force = explosionForce * effect;
                circle.speedX += Math.cos(angle) * force / circle.mass;
                circle.speedY += Math.sin(angle) * force / circle.mass;
            }
        });
    }

    function updateCircles() {
        const containerRect = container.getBoundingClientRect();

        for (let i = 0; i < circles.length; i++) {
            const circleA = circles[i];
            circleA.posX += circleA.speedX;
            circleA.posY += circleA.speedY;

            
            circleA.speedY += 0.5; 

            
            circleA.speedX *= 0.99;
            circleA.speedY *= 0.99;

            
            if (circleA.posX <= 0) {
                circleA.posX = 0;
                circleA.speedX *= -1;
            } else if (circleA.posX >= containerRect.width - circleA.size) {
                circleA.posX = containerRect.width - circleA.size;
                circleA.speedX *= -1;
            }

            if (circleA.posY <= 0) {
                circleA.posY = 0;
                circleA.speedY *= -1;
            } else if (circleA.posY >= containerRect.height - circleA.size) {
                circleA.posY = containerRect.height - circleA.size;
                circleA.speedY *= -1;
            }

            
            for (let j = i + 1; j < circles.length; j++) {
                const circleB = circles[j];
                const dx = circleA.posX - circleB.posX;
                const dy = circleA.posY - circleB.posY;
                const distance = Math.hypot(dx, dy);
                const minDist = (circleA.size + circleB.size) / 2;

                if (distance < minDist) {
                    
                    const overlap = minDist - distance;
                    const totalMass = circleA.mass + circleB.mass;
                    const weightA = circleB.mass / totalMass;
                    const weightB = circleA.mass / totalMass;

                    circleA.posX += dx / distance * overlap * weightA;
                    circleA.posY += dy / distance * overlap * weightA;
                    circleB.posX -= dx / distance * overlap * weightB;
                    circleB.posY -= dy / distance * overlap * weightB;

                    
                    const collisionAngle = Math.atan2(dy, dx);

                    
                    const speedA = rotate(circleA.speedX, circleA.speedY, collisionAngle);
                    const speedB = rotate(circleB.speedX, circleB.speedY, collisionAngle);

                    
                    const newSpeedA = {
                        x: ((circleA.mass - circleB.mass) * speedA.x + 2 * circleB.mass * speedB.x) / totalMass,
                        y: speedA.y
                    };
                    const newSpeedB = {
                        x: ((circleB.mass - circleA.mass) * speedB.x + 2 * circleA.mass * speedA.x) / totalMass,
                        y: speedB.y
                    };

                    
                    const finalSpeedA = rotate(newSpeedA.x, newSpeedA.y, -collisionAngle);
                    const finalSpeedB = rotate(newSpeedB.x, newSpeedB.y, -collisionAngle);

                    circleA.speedX = finalSpeedA.x;
                    circleA.speedY = finalSpeedA.y;
                    circleB.speedX = finalSpeedB.x;
                    circleB.speedY = finalSpeedB.y;
                }
            }

            circleA.element.style.left = `${circleA.posX}px`;
            circleA.element.style.top = `${circleA.posY}px`;
        }
    }

    
    function rotate(x, y, angle) {
        return {
            x: x * Math.cos(angle) - y * Math.sin(angle),
            y: x * Math.sin(angle) + y * Math.cos(angle)
        };
    }

    function monitorFrameRate() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;
    
        const fps = 1000 / delta;
        fpsValues.push(fps);
    
        
        counterElement.textContent = `FPS: ${fps.toFixed(2)}`;
        const elapsedTime = Math.floor((now - startTime) / 1000);
        const remainingTime = durationInSeconds - elapsedTime;
        timerElement.textContent = `Time: ${remainingTime}s`;
    
        updateCircles();
    
        if (now - startTime < durationInSeconds * 1000) {
            
            setTimeout(monitorFrameRate, 0);
        } else {
            
            displayDoneScreen();
        }
    }

    function displayDoneScreen() {
        
        cancelAnimationFrame(animationId);
        clearInterval(circleAdditionInterval);
        clearInterval(explosionInterval);

        
        container.innerHTML = '';

        const doneScreen = document.createElement('div');
        doneScreen.classList.add('done-screen');
        doneScreen.textContent = 'Test Complete';
        container.appendChild(doneScreen);

        
        const averageFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;

        
        const fpsDisplay = document.createElement('div');
        fpsDisplay.textContent = `Average FPS: ${averageFps.toFixed(2)}`;
        fpsDisplay.style.color = '#fff';
        fpsDisplay.style.fontSize = '24px';
        container.appendChild(fpsDisplay);

        
        uploadData(averageFps);
    }

    function fetchLeaderboard() {
        fetch('/api/v1/leaderboard/fetch')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            
            data.sort((a, b) => b.averageFps - a.averageFps);
            displayLeaderboard(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
            const errorMessage = document.createElement('div');
            errorMessage.style.color = 'red';
            errorMessage.textContent = 'Failed to load leaderboard. Please try again.';
            container.appendChild(errorMessage);
        });
    }

    function uploadData(averageFps) {
        const username = getCookie('username');
        const cpu = getCookie('cpu');
        const gpu = getCookie('gpu');
        const ram = getCookie('ram');
        const browser = getCookie('browser');
    
        const data = {
            username,
            cpu,
            gpu,
            ram,
            browser,
            averageFps
        };
    
        fetch('/api/v1/leaderboard/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            
            fetchLeaderboard();
        })
        .catch(error => {
            console.error('Error uploading data:', error);
            
            const errorMessage = document.createElement('div');
            errorMessage.style.color = 'red';
            errorMessage.textContent = 'Failed to upload results. Please try again.';
            container.appendChild(errorMessage);
        });
    }

    function displayLeaderboard(data) {
    const leaderboard = document.createElement('div');
    leaderboard.classList.add('leaderboard');
    
    
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 Refresh';
    refreshButton.style.marginBottom = '10px';
    refreshButton.style.padding = '5px 10px';
    refreshButton.style.backgroundColor = '#333';
    refreshButton.style.color = '#fff';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '5px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.addEventListener('click', fetchLeaderboard);
    
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = '<h2>Leaderboard</h2>';
    header.appendChild(refreshButton);
    leaderboard.appendChild(header);

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Username</th><th>CPU</th><th>GPU</th><th>RAM</th><th>Browser</th><th>Average FPS</th>';
    table.appendChild(headerRow);

    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.username}</td>
            <td>${entry.cpu}</td>
            <td>${entry.gpu}</td>
            <td>${entry.ram}</td>
            <td>${entry.browser}</td>
            <td>${entry.averageFps.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });

    leaderboard.appendChild(table);
    
    
    const oldLeaderboard = container.querySelector('.leaderboard');
    if (oldLeaderboard) {
        container.removeChild(oldLeaderboard);
    }
    
    container.appendChild(leaderboard);
}

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    
    function startTest() {
        
        let countdown = 3;
        counterElement.textContent = `Starting in ${countdown}...`;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                counterElement.textContent = `Starting in ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                counterElement.textContent = '';
                
                createInitialCircles();
                
                circleAdditionInterval = setInterval(() => {
                    for (let i = 0; i < circlesPerSecond; i++) {
                        createCircle();
                    }
                }, 1000);
                
                explosionInterval = setInterval(() => {
                    createExplosion();
                }, 1000);
                
                startTime = performance.now();
                monitorFrameRate();
            }
        }, 1000);
    }

    startTest();
});