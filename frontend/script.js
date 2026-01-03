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
        
        setTimeout(() => {
            core.classList.remove('thinking');
            addMessage('Neural processing complete. High-level architecture detected. Connection to secondary backend pending routing protocols.', 'ai-message', 'Veronika AI');
        }, 1500);
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
