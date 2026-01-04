const input = document.getElementById('user-input');
const history = document.getElementById('chat-history');
const core = document.getElementById('ai-core');

// Clock Update
setInterval(() => {
    const now = new Date();
    document.getElementById('system-clock').innerText = now.toTimeString().split(' ')[0];
}, 1000);

// Random Stat Animation
setInterval(() => {
    const cpu = Math.floor(Math.random() * 40) + 20;
    const mem = Math.floor(Math.random() * 20) + 60;
    const lat = Math.floor(Math.random() * 30) + 5;

    document.getElementById('cpu-val').innerText = `${cpu}%`;
    document.getElementById('cpu-bar').style.width = `${cpu}%`;
    
    document.getElementById('mem-val').innerText = `${(mem * 0.04).toFixed(1)}GB`;
    document.getElementById('mem-bar').style.width = `${mem}%`;

    document.getElementById('lat-val').innerText = `${lat}ms`;
    document.getElementById('lat-bar').style.width = `${lat}%`;
}, 3000);

input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        const text = this.value;
        this.value = '';
        
        // Add User Message
        addMessage(text, 'user-message', 'User');
        
        // Thinking State
        core.classList.add('thinking');
        
        // Send to Backend API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            core.classList.remove('thinking');
            addMessage(data.response, 'ai-message', 'Veronika AI');
        })
        .catch(error => {
            console.error('Error:', error);
            core.classList.remove('thinking');
            addMessage('<span style="color: #ff4d4d; font-weight: bold;">CONNECTION LOST: SERVER UNREACHABLE</span>', 'ai-message', 'SYSTEM');
        });

    }
});

function addMessage(content, type, label) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerHTML = `
        <div class="message-label">${label}</div>
        <div>${content}</div>
    `;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
}
