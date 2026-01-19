const input = document.getElementById('user-input');
const history = document.getElementById('chat-history');
const core = document.getElementById('ai-core');

// Initialize Mermaid
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Fira Code'
    });
}

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

    let parsedContent = content;

    if (typeof marked === 'undefined') {
        console.error('Error: Marked library not found!');
    } else {
        try {
            parsedContent = marked.parse(content);
        } catch (error) {
            console.error('Error parsing Markdown:', error);
        }
    }
    msg.innerHTML = `
        <div class="message-label">${label}</div>
        <div class="markdown-content">${parsedContent}</div>
    `;
    history.appendChild(msg);

    // Initial Render for Mermaid
    if (typeof mermaid !== 'undefined') {
        const mermaidBlocks = msg.querySelectorAll('pre code.language-mermaid');
        mermaidBlocks.forEach((block, index) => {
            const graphDefinition = block.textContent;
            const uniqueId = `mermaid-${Date.now()}-${index}`;
            const mermaidContainer = document.createElement('div');
            mermaidContainer.className = 'mermaid';
            mermaidContainer.id = uniqueId;
            mermaidContainer.textContent = graphDefinition;
            
            block.parentElement.replaceWith(mermaidContainer);
            
            mermaid.run({
                nodes: [mermaidContainer]
            });
        });
    }

    history.scrollTop = history.scrollHeight;
}
