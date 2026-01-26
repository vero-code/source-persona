const input = document.getElementById('user-input');
const history = document.getElementById('chat-history');
const core = document.getElementById('ai-core');
const statusEl = document.getElementById('holo-status');
const micBtn = document.getElementById('mic-btn');
const visualizerCanvas = document.getElementById('voice-visualizer');

// --- TOGGLES & SLIDERS ---
const modeToggle = document.getElementById('challenge-mode-toggle');
const hrLabel = document.getElementById('hr-label');
const techLabel = document.getElementById('tech-label');

const senioritySlider = document.getElementById('seniority-slider');
const seniorityDisplay = document.getElementById('seniority-display');
const seniorityLevels = ["Junior", "Middle", "Senior", "CTO"];

// --- MOBILE MENU TOGGLE ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileTerminalBtn = document.getElementById('mobile-terminal-btn');
const sidebarLeft = document.querySelector('.sidebar-left');
const sidebarRight = document.querySelector('.sidebar-right');

if (mobileMenuBtn && sidebarLeft) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarLeft.classList.toggle('open');
        if (sidebarRight) sidebarRight.classList.remove('open');
        mobileMenuBtn.innerText = sidebarLeft.classList.contains('open') ? '✕' : '☰';
    });
}

if (mobileTerminalBtn && sidebarRight) {
    mobileTerminalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarRight.classList.toggle('open');
        if (sidebarLeft) sidebarLeft.classList.remove('open');
        mobileMenuBtn.innerText = '☰'; // Reset menu btn if terminal opens
    });
}

// Close sidebars when clicking outside
document.addEventListener('click', (e) => {
    if (sidebarLeft && sidebarLeft.classList.contains('open') && 
        !sidebarLeft.contains(e.target) && 
        e.target !== mobileMenuBtn) {
        sidebarLeft.classList.remove('open');
        mobileMenuBtn.innerText = '☰';
    }
    if (sidebarRight && sidebarRight.classList.contains('open') && 
        !sidebarRight.contains(e.target) && 
        e.target !== mobileTerminalBtn) {
        sidebarRight.classList.remove('open');
    }
});

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



// --- VOICE & VISUALIZER SYSTEM ---
const VoiceSystem = {
    audioContext: null,
    analyser: null,
    source: null,
    dataArray: null,
    isListening: false,
    recognition: null,
    currentAudio: null,
    currentListenBtn: null,

    init: function() {
        // Init Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = true;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (micBtn) {
                    micBtn.style.background = 'rgba(255, 77, 77, 0.2)';
                    micBtn.style.color = '#ff4d4d';
                    micBtn.style.boxShadow = '0 0 15px #ff4d4d';
                }
                Terminal.log("VOICE_INPUT: Listening...", 'info');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (micBtn) {
                    micBtn.style.background = ''; // reset
                    micBtn.style.color = '';
                    micBtn.style.boxShadow = '';
                }
                Terminal.log("VOICE_INPUT: Stopped", 'info');
            };

            this.recognition.onresult = (event) => {
                const result = event.results[event.resultIndex];
                const transcript = result[0].transcript;
                
                if (input) {
                    input.value = transcript;
                    
                    if (result.isFinal) {
                        Terminal.log(`VOICE_INPUT (FINAL): "${transcript}"`, 'info');
                        // Auto-submit only on final result
                        const ke = new KeyboardEvent('keydown', {
                            key: 'Enter', bubble: true
                        });
                        input.dispatchEvent(ke);
                    } else {
                         // Optional: Log interim results if needed, or just let them show in input
                         // Terminal.log(`VOICE_INPUT (INTERIM): "${transcript}"`, 'sys');
                    }
                }
            };
        }

        // Init Mic Button
        if (micBtn && this.recognition) {
            micBtn.addEventListener('click', () => {
                if (this.isListening) this.recognition.stop();
                else this.recognition.start();
            });
        }
    },

    stopTTS: function() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        if (this.currentListenBtn) {
            this.currentListenBtn.innerHTML = '🔊 LISTEN';
            this.currentListenBtn.classList.remove('playing');
            this.currentListenBtn = null;
        }
        Terminal.log("AUDIO_PLAYBACK: Stopped", 'info');
    },

    playTTS: function(text, btn) {
        if (this.currentAudio) {
            this.stopTTS();
        }

        this.currentListenBtn = btn;
        this.currentListenBtn.innerHTML = '⏹ STOP';
        this.currentListenBtn.classList.add('playing');

        Terminal.log("TTS_REQ: Requesting audio stream...", 'info');
        
        fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        })
        .then(res => res.blob())
        .then(blob => {
            if (!this.currentListenBtn) return; // Case where it was stopped before fetch returned
            const url = URL.createObjectURL(blob);
            this.visualizeAudio(url);
        })
        .catch(err => {
            Terminal.log("TTS_ERROR: " + err, 'error');
            this.stopTTS();
        });
    },

    visualizeAudio: function(audioUrl) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const audio = new Audio(audioUrl);
        audio.crossOrigin = "anonymous";
        this.currentAudio = audio;

        audio.onended = () => {
            this.stopTTS();
        };

        const source = this.audioContext.createMediaElementSource(audio);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        source.connect(analyser);
        analyser.connect(this.audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        audio.play();
        Terminal.log("AUDIO_PLAYBACK: Playing...", 'info');

        // Canvas Setup
        if (!visualizerCanvas) return;
        const ctx = visualizerCanvas.getContext('2d');
        const width = visualizerCanvas.width;
        const height = visualizerCanvas.height;

        const renderFrame = () => {
            if (audio.paused || audio.ended) {
                ctx.clearRect(0, 0, width, height);
                return;
            }
            requestAnimationFrame(renderFrame);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);
            
            // Circular Visualization (around the core)
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 30; // base radius

            ctx.beginPath();
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2; 
                const angle = (i * 2 * Math.PI) / bufferLength; // map to circle
                
                const x = centerX + Math.cos(angle) * (radius + barHeight);
                const y = centerY + Math.sin(angle) * (radius + barHeight);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        };

        renderFrame();
    }
};

VoiceSystem.init();

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

// 3. Report Generation
const downloadBtn = document.getElementById('download-report-btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        Terminal.log("INITIATING: Report Generation Sequence...", 'info');
        Terminal.log("ANALYZING: Chat History & Candidate Data...", 'info');
        
        // Visual Feedback
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '⏳ GENERATING...';
        downloadBtn.disabled = true;

        // Collect Chat History
        const messages = [];
        document.querySelectorAll('#chat-history .message').forEach(msg => {
            const labelEl = msg.querySelector('.message-label');
            if (!labelEl) return;
            
            const roleLabel = labelEl.innerText;
            const contentEl = msg.querySelector('.markdown-content');
            let content = "";
            
            if (contentEl) {
                content = contentEl.innerText;
            } else {
                content = msg.innerText; 
            }

            let role = "user";
            if (roleLabel.toLowerCase().includes("veronika")) role = "model";
            
            if (roleLabel.includes("System")) return;

            messages.push({ role: role, content: content });
        });

        if (messages.length === 0) {
            Terminal.log("WARN: No data to analyze", 'warn');
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            return;
        }

        // Send to API
        fetch('/api/generate-report', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ chat_history: messages })
        })
        .then(response => {
            if (response.ok) return response.blob();
            throw new Error("Report generation failed");
        })
        .then(blob => {
            // Create Download Link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOURCE_PERSONA_REPORT_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            Terminal.log("SUCCESS: Report Generated", 'info');
            Terminal.log("DOWNLOAD: Starting transmission...", 'info');
            
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        })
        .catch(err => {
            Terminal.log("ERROR: Generation Failed", 'error');
            console.error(err);
            downloadBtn.innerHTML = '❌ ERROR';
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }, 3000);
        });
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
const chipsContainer = document.getElementById('suggestion-chips');
const scrollHint = document.getElementById('scroll-hint');
const chips = document.querySelectorAll('.suggestion-chip');

if (chipsContainer && scrollHint) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let moved = false;

    chipsContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        chipsContainer.classList.add('active');
        startX = e.pageX - chipsContainer.offsetLeft;
        scrollLeft = chipsContainer.scrollLeft;
    });

    chipsContainer.addEventListener('mouseleave', () => {
        isDown = false;
        chipsContainer.classList.remove('active');
    });

    chipsContainer.addEventListener('mouseup', () => {
        isDown = false;
        chipsContainer.classList.remove('active');
    });

    chipsContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - chipsContainer.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        if (Math.abs(walk) > 5) {
            moved = true;
        }
        chipsContainer.scrollLeft = scrollLeft - walk;
    });

    // Add mouse wheel horizontal scrolling
    chipsContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        chipsContainer.scrollLeft += e.deltaY + e.deltaX;
    }, { passive: false });

    chipsContainer.addEventListener('scroll', () => {
        if (chipsContainer.scrollLeft > 20) {
            scrollHint.style.opacity = '0';
            setTimeout(() => { scrollHint.style.display = 'none'; }, 300);
        }
    }, { passive: true });

    // Handle clicks on chips to prevent action if dragging
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const question = chip.getAttribute('data-question');
            input.value = question;
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubble: true,
                cancelable: true
            });
            input.dispatchEvent(event);
        });
    });
}

function updateChipsCursor() {
    if (chipsContainer) {
        const isScrollable = chipsContainer.scrollWidth > chipsContainer.clientWidth;
        chipsContainer.classList.toggle('is-scrollable', isScrollable);
        if (scrollHint) {
            scrollHint.style.display = isScrollable ? 'block' : 'none';
        }
    }
}

// Check on load and resize
window.addEventListener('load', updateChipsCursor);
window.addEventListener('resize', updateChipsCursor);

// 3. Main Chat Logic
function handleSendMessage() {
    const text = input.value.trim();
    if (text === '') return;

    input.value = '';
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
        addMessage(data.response, 'ai-message', "Veronika's digital twin");
    })
    .catch(error => {
        console.error('Error:', error);
        stopThinkingAnim();
        core.classList.remove('thinking');
        Terminal.log("CONNECTION_ERROR: Server Unreachable", 'error');
        addMessage('<span style="color: #ff4d4d; font-weight: bold;">CONNECTION LOST</span>', 'ai-message', 'SYSTEM');
    });
}

// Event Listeners for sending
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

const sendBtn = document.getElementById('send-btn');
if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
}

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
    history.scrollTop = history.scrollHeight;

    // Add Listen Button for AI messages
    if (type === 'ai-message' && label !== 'SYSTEM') {
        const listenBtn = document.createElement('button');
        listenBtn.className = 'cyber-btn';
        listenBtn.innerHTML = '🔊 LISTEN';
        listenBtn.style.marginTop = '10px';
        listenBtn.style.padding = '5px 10px';
        listenBtn.style.fontSize = '0.7em';
        listenBtn.onclick = () => {
            if (VoiceSystem.currentListenBtn === listenBtn) {
                VoiceSystem.stopTTS();
            } else {
                // Extract text only (remove markdown symbols roughly if needed, 
                // but TTS is usually okay with some cleaner)
                // Ideally we pass the raw 'content' before markdown parsing, 
                // but here we use 'content' variable which is raw.
                VoiceSystem.playTTS(content.replace(/[*#`]/g, ''), listenBtn);
            }
        };
        msg.appendChild(listenBtn);
    }
}
