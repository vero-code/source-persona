const input = document.getElementById('user-input');
const history = document.getElementById('chat-history');
const core = document.getElementById('ai-core');
const modeToggle = document.getElementById('challenge-mode-toggle');
const hrLabel = document.getElementById('hr-label');
const techLabel = document.getElementById('tech-label');

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

        const currentMode = modeToggle.checked ? 'tech_lead' : 'hr';
        
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
            body: JSON.stringify({ message: text, mode: currentMode }),
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

modeToggle.addEventListener('change', () => {
    if (modeToggle.checked) {
        techLabel.style.opacity = "1";
        hrLabel.style.opacity = "0.5";
        console.log("PERSONA: Tech Lead Protocol Activated");
    } else {
        techLabel.style.opacity = "0.5";
        hrLabel.style.opacity = "1";
        console.log("PERSONA: HR Protocol Activated");
    }
});

function addMessage(content, type, label) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;

    // --- SECURITY DEFENSE LOGIC ---
    if (content.includes('[SECURITY_ALERT]')) {
        console.log("🚨 SECURITY ALERT DETECTED! Switching UI to RED.");
        document.body.classList.add('security-alert');
        
        const alertGif = "./public/alert.gif";
        content = content.replace('[SECURITY_ALERT]', 
            `<img src="${alertGif}" class="security-gif" style="width:100%; border-radius:8px; margin-top:10px; border: 2px solid #ff4d4d;">`);
    } else {
        if (!content.includes('Access Denied')) {
            document.body.classList.remove('security-alert');
        }
    }

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
