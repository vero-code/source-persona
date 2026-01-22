const input = document.getElementById('user-input');
const history = document.getElementById('chat-history');
const core = document.getElementById('ai-core');
const statusEl = document.getElementById('holo-status');

// --- TOGGLES & SLIDERS ---
const modeToggle = document.getElementById('challenge-mode-toggle');
const hrLabel = document.getElementById('hr-label');
const techLabel = document.getElementById('tech-label');

const senioritySlider = document.getElementById('seniority-slider');
const seniorityDisplay = document.getElementById('seniority-display');
const seniorityLevels = ["Junior", "Middle", "Senior", "CTO"];

// Initialize Mermaid
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', fontFamily: 'Fira Code' });
}

// --- TERMINAL ---
const Terminal = {
    element: document.getElementById('debug-console'),
    log: function(message, type = 'info') {
        if (!this.element) return;
        const entry = document.createElement('div');
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        let cssClass = 'log-info';
        if (type === 'warn') cssClass = 'log-warn';
        if (type === 'error') cssClass = 'log-error';
        if (type === 'sys') cssClass = 'log-sys';
        entry.className = `log-entry ${cssClass}`;
        entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
        this.element.appendChild(entry);
        this.element.scrollTop = this.element.scrollHeight;
        if (this.element.children.length > 50) {
            this.element.removeChild(this.element.firstChild);
        }
    }
};

// --- BACKGROUND TASKS ---
setInterval(() => {
    document.getElementById('system-clock').innerText = new Date().toLocaleTimeString();
}, 1000);

setInterval(() => {
    const cpu = Math.floor(Math.random() * 40) + 20;
    const mem = Math.floor(Math.random() * 20) + 60;
    const lat = Math.floor(Math.random() * 30) + 5;

    updateStat('cpu-val', 'cpu-bar', `${cpu}%`, cpu);
    updateStat('mem-val', 'mem-bar', `${(mem * 0.04).toFixed(1)}GB`, mem);
    updateStat('lat-val', 'lat-bar', `${lat}ms`, lat);
}, 3000);

function updateStat(textId, barId, text, percent) {
    const textEl = document.getElementById(textId);
    const barEl = document.getElementById(barId);
    if (textEl && barEl) {
        textEl.innerText = text;
        barEl.style.width = `${percent}%`;
    }
}

// --- EVENT LISTENERS ---

// 1. Slider Logic (Junior -> CTO)
if (senioritySlider && seniorityDisplay) {
    senioritySlider.addEventListener('input', function() {
        const val = parseInt(this.value);
        seniorityDisplay.innerText = seniorityLevels[val];
        if (val === 3) seniorityDisplay.style.color = '#bc13fe';
        else seniorityDisplay.style.color = 'var(--accent-cyan)';
        const temp = (0.8 - (val * 0.2)).toFixed(1);
        Terminal.log(`SENIORITY_LEVEL adjusted to ${seniorityLevels[val].toUpperCase()} (${val})`, 'sys');
        Terminal.log(`MODEL_CONFIG: Temperature set to ${temp}`, 'sys');
    });
}

// 2. Mode Toggle Logic (HR -> Tech Lead)
if (modeToggle) {
    modeToggle.addEventListener('change', () => {
        if (modeToggle.checked) {
            techLabel.style.opacity = "1";
            hrLabel.style.opacity = "0.5";
            Terminal.log("PROTOCOL_OVERRIDE: Switching to TECH_LEAD mode", 'warn');
        } else {
            techLabel.style.opacity = "0.5";
            hrLabel.style.opacity = "1";
            Terminal.log("PROTOCOL_RESTORE: Switching to HR_FRIENDLY mode", 'sys');
        }
    });
}

// --- VISUALIZED THINKING PROCESS ---
let thinkingInterval;
let statusMessageElement = null;

function startThinkingAnim() {
    statusMessageElement = document.createElement('div');
    statusMessageElement.className = 'message ai-message holo-status';
    history.appendChild(statusMessageElement);
    history.scrollTop = history.scrollHeight;
    const steps = [
        "ESTABLISHING UPLINK...",
        "SEARCHING VECTOR DB (RAG)...",
        "ANALYZING SECURITY PROTOCOLS...",
        "OPTIMIZING RESPONSE...",
        "GENERATING OUTPUT..."
    ];
    let i = 0;
    statusMessageElement.innerText = steps[0];
    thinkingInterval = setInterval(() => {
        i++;
        if (i < steps.length) {
            if (statusMessageElement) {
                statusMessageElement.innerText = steps[i];
                history.scrollTop = history.scrollHeight;
            }
        }
    }, 800);
}

function stopThinkingAnim() {
    clearInterval(thinkingInterval);
    if (statusMessageElement) {
        statusMessageElement.remove();
        statusMessageElement = null;
    }
}

// 2.5 Suggestion Chips Logic
const chips = document.querySelectorAll('.suggestion-chip');
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        input.value = question;
        // Trigger the enter key event manually to reuse existing logic
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubble: true,
            cancelable: true
        });
        input.dispatchEvent(event);
    });
});

// 3. Main Chat Logic
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        const text = this.value;
        this.value = '';

        const currentMode = modeToggle && modeToggle.checked ? 'tech_lead' : 'hr';
        const currentSeniority = senioritySlider ? parseInt(senioritySlider.value) : 2;
        
        // UI Updates
        addMessage(text, 'user-message', 'User');
        core.classList.add('thinking');

        startThinkingAnim();

        Terminal.log(`UPLINK: Sending ${text.length} bytes`, 'info');
        Terminal.log(`PAYLOAD: { mode: "${currentMode}", level: ${currentSeniority} }`, 'info');
        
        // Send to Backend API
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, mode: currentMode, seniority: currentSeniority }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            stopThinkingAnim();
            core.classList.remove('thinking');
            Terminal.log(`DOWNLINK: Received ${data.response.length} chars`, 'info');
            if (data.response.includes('[SECURITY_ALERT]')) {
                Terminal.log("🚨 THREAT DETECTED: Prompt Injection", 'error');
                Terminal.log("ACTION: Executing Security Protocol", 'error');
            } else {
                Terminal.log("RAG_VERIFICATION: PASS", 'info');
            }
            addMessage(data.response, 'ai-message', 'Veronika AI');
        })
        .catch(error => {
            console.error('Error:', error);
            stopThinkingAnim();
            core.classList.remove('thinking');
            Terminal.log("CONNECTION_ERROR: Server Unreachable", 'error');
            addMessage('<span style="color: #ff4d4d; font-weight: bold;">CONNECTION LOST</span>', 'ai-message', 'SYSTEM');
        });

    }
});

// --- HELPER: Message Rendering ---
function addMessage(content, type, label) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;

    // --- Security Alert Handling ---
    if (content.includes('[SECURITY_ALERT]')) {
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
    if (typeof marked !== 'undefined') { 
        try { parsedContent = marked.parse(content); } catch (e) { console.error(e); }
    }
    msg.innerHTML = `<div class="message-label">${label}</div><div class="markdown-content">${parsedContent}</div>`;
    history.appendChild(msg);

    // Mermaid Rendering
    if (typeof mermaid !== 'undefined') {
        const mermaidBlocks = msg.querySelectorAll('pre code.language-mermaid');
        mermaidBlocks.forEach((block, index) => {
            const graphDefinition = block.textContent;
            const uniqueId = `mermaid-${Date.now()}-${index}`;
            const container = document.createElement('div');
            container.className = 'mermaid';
            container.id = uniqueId;
            container.textContent = graphDefinition;
            block.parentElement.replaceWith(container);
            try { mermaid.run({ nodes: [container] }); } catch (e) { console.error(e); }
        });
    }

    history.scrollTop = history.scrollHeight;
}
