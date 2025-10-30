import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

// --- DOM Elements ---
const nav = document.getElementById('navbar');
const menuBtn = document.getElementById('menu-btn');
const navUl = nav?.querySelector('ul');
const typingText = document.getElementById('typing-text');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const loader = document.getElementById('loader');
const skillsCanvas = document.getElementById('skills-canvas') as HTMLCanvasElement;
const profileCanvas = document.getElementById('profile-canvas') as HTMLCanvasElement;

// Modal Elements
const chatBubble = document.getElementById('chat-bubble');
const chatModalContainer = document.getElementById('chat-modal-container');
const emailModalContainer = document.getElementById('email-modal-container');
const projectModalContainer = document.getElementById('project-modal-container');
const projectModalImg = document.getElementById('project-modal-img') as HTMLImageElement;
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalDetailsContent = document.getElementById('project-modal-details-content');
const getInTouchBtn = document.getElementById('get-in-touch-btn');
const modalContainers = document.querySelectorAll('.modal-container');


// --- Typing Animation ---
const words = ["PLC Programmer", "SCADA Specialist", "Commissioning Engineer"];
let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function type() {
    if(!typingText) return;
    currentWord = words[i];
    if (isDeleting) {
        j--;
        typingText.textContent = currentWord.substring(0, j);
    } else {
        j++;
        typingText.textContent = currentWord.substring(0, j);
    }

    if (!isDeleting && j === currentWord.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
    }

    const typingSpeed = isDeleting ? 100 : 200;
    setTimeout(type, typingSpeed);
}

// --- Navbar Scroll Effect ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
});

// --- Mobile Menu Toggle ---
menuBtn?.addEventListener('click', () => {
    navUl?.classList.toggle('active');
});

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    revealObserver.observe(el);
});


// --- "Read More" Logic for Project & Experience Cards ---
const readMoreBtns = document.querySelectorAll('.read-more-btn');
readMoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = (btn as HTMLElement).closest('.project-card, .experience-card');
        if (!card) return;

        // Handle Experience card expansion (accordion)
        if (card.classList.contains('experience-card')) {
            card.classList.toggle('expanded');
            btn.textContent = card.classList.contains('expanded') ? 'Read Less' : 'Read More';
            return;
        }

        // Handle Project card modal
        if (!projectModalContainer || !projectModalTitle || !projectModalImg || !projectModalDetailsContent) return;

        const title = card.querySelector('h3')?.textContent || 'Project Details';
        const imgSrc = card.querySelector('img')?.src || '';
        const detailsHTML = card.querySelector('.details')?.innerHTML || '<p>No details available.</p>';
        
        projectModalTitle.textContent = title;
        projectModalImg.src = imgSrc;
        projectModalImg.alt = title;
        projectModalDetailsContent.innerHTML = detailsHTML;

        openModal(projectModalContainer);
    });
});


// --- Profile Picture Canvas Animation ---
if (profileCanvas) {
    const p_ctx = profileCanvas.getContext('2d');
    profileCanvas.width = 200;
    profileCanvas.height = 200;
    let p_particlesArray: ProfileParticle[] = [];
    const p_numberOfParticles = 40;
    const center = { x: profileCanvas.width / 2, y: profileCanvas.height / 2 };
    
    let mouseHover = false;
    const profilePicContainer = document.querySelector('.profile-pic-container');
    profilePicContainer?.addEventListener('mouseenter', () => mouseHover = true);
    profilePicContainer?.addEventListener('mouseleave', () => mouseHover = false);

    class ProfileParticle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        life: number;
        maxLife: number;

        constructor() {
            this.x = center.x;
            this.y = center.y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 1.5) + 0.5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.size = (Math.random() * 1.5) + 1;
            this.maxLife = Math.random() * 60 + 40;
            this.life = this.maxLife;
        }

        update() {
            this.x += this.speedX * (mouseHover ? 1.5 : 1);
            this.y += this.speedY * (mouseHover ? 1.5 : 1);
            this.life -= 1;
            if (this.life <= 0) {
                this.reset();
            }
        }
        
        reset() {
            this.x = center.x;
            this.y = center.y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 1.5) + 0.5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.life = this.maxLife;
        }

        draw() {
            if (p_ctx) {
                p_ctx.fillStyle = `rgba(0, 255, 204, ${this.life / this.maxLife * 0.8})`;
                p_ctx.beginPath();
                p_ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                p_ctx.closePath();
                p_ctx.fill();
            }
        }
    }

    function p_init() {
        p_particlesArray = [];
        for (let i = 0; i < p_numberOfParticles; i++) {
            p_particlesArray.push(new ProfileParticle());
        }
    }

    function p_connect() {
        if (!p_ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < p_particlesArray.length; a++) {
            for (let b = a; b < p_particlesArray.length; b++) {
                const distance = Math.sqrt(
                    Math.pow(p_particlesArray[a].x - p_particlesArray[b].x, 2) +
                    Math.pow(p_particlesArray[a].y - p_particlesArray[b].y, 2)
                );
                
                if (distance < 35) { // Connection distance
                    opacityValue = 1 - (distance / 35);
                    p_ctx.strokeStyle = `rgba(255, 0, 255, ${opacityValue * 0.5})`;
                    p_ctx.lineWidth = 1;
                    p_ctx.beginPath();
                    p_ctx.moveTo(p_particlesArray[a].x, p_particlesArray[a].y);
                    p_ctx.lineTo(p_particlesArray[b].x, p_particlesArray[b].y);
                    p_ctx.stroke();
                }
            }
        }
    }

    function p_animate() {
        if (p_ctx) {
            p_ctx.clearRect(0, 0, profileCanvas.width, profileCanvas.height);
            for (const particle of p_particlesArray) {
                particle.update();
                particle.draw();
            }
            p_connect();
        }
        requestAnimationFrame(p_animate);
    }

    p_init();
    p_animate();
}

// --- Skills Canvas Animation ---
if (skillsCanvas) {
    const ctx = skillsCanvas.getContext('2d');
    let particlesArray: Particle[] = [];
    const numberOfParticles = 80;

    const skillsSection = document.getElementById('skills');

    const setCanvasSize = () => {
        if (skillsSection && ctx) {
            skillsCanvas.width = skillsSection.offsetWidth;
            skillsCanvas.height = skillsSection.offsetHeight;
        }
    };

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (event) => {
        const rect = skillsCanvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    skillsSection?.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        x: number;
        y: number;
        directionX: number;
        directionY: number;
        size: number;
        color: string;

        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            if (ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
                ctx.fill();
            }
        }

        update() {
            if (this.x > skillsCanvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > skillsCanvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * 2) + 1;
            const x = (Math.random() * (skillsCanvas.width - size * 2) + size);
            const y = (Math.random() * (skillsCanvas.height - size * 2) + size);
            const directionX = (Math.random() * .4) - .2;
            const directionY = (Math.random() * .4) - .2;
            const color = 'rgba(0, 255, 204, 0.5)';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connect() {
        if (!ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (skillsCanvas.width / 7) * (skillsCanvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(0, 255, 204, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        if (ctx) {
            ctx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }
    }
    
    window.addEventListener('resize', () => {
        setCanvasSize();
        init();
    });

    setCanvasSize();
    init();
    animate();
}

// --- Gemini AI Assistant ---
let ai;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    addMessageToHistory('ai', 'Error: AI service could not be initialized. Please check the API key configuration.');
}

const getResumeContext = () => {
    return `
        This is the resume and detailed project portfolio for Ruturaj Dilip Gawade. Use this data to answer questions.

        --- START OF RESUME ---

        Ruturaj Dilip Gawade
        +49 15560133862 | ruturajabroad@gmail.com | Walther-Rathenau-Straße 55, 39104 Magdeburg | LinkedIn

        **PROFILE**
        Automation & Commissioning Engineer with 3 years of hands-on experience in PLC, HMI, and SCADA-based industrial automation, delivering projects for clients of German, Italian, UK, US, and Indian origin. Proficient in Siemens, Allen-Bradley, and Mitsubishi automation platforms with exposure to Beckhoff (TwinCAT) and Schneider control environments. Experienced in commissioning, troubleshooting, field integration, and remote customer support. Currently pursuing M.Sc. in Digital Engineering at Otto von Guericke University Magdeburg. Fluent in English (C1) and German (A2).

        **PROFESSIONAL EXPERIENCE**
        Automation & Commissioning Engineer
        Promatics Solutions | 03.2021 - 04.2024 | Pune, India
        Executed automation and process control projects for multiple international clients, focusing on PLC/HMI logic development, on-site commissioning, fault analysis, and customer handover documentation.

        **EDUCATION**
        - Master in Digital Engineering (04.2024 – Present) - Otto von Guericke University Magdeburg, Germany
        - Bachelor of Technology in Electrical Engineering (06.2020 - 07.2023) - Savitribai Phule Pune University, India

        **TECHNICAL SKILLS**
        - PLC/SCADA Platforms: Siemens (TIA Portal, S7-1200/1400, WinCC), Allen-Bradley (CompactLogix, Studio 5000, FactoryTalk), Mitsubishi (FX5U, GX Works 3), Beckhoff TwinCAT, Schneider EcoStruxure.
        - Protocols & Interfaces: OPC UA, Modbus TCP, MES, IIoT, Profinet, EtherCAT, EtherNet/IP.
        - Core Skills: PLC Programming, HMI Design, SCADA Configuration, Commissioning, Troubleshooting, PID Control, Motion & Servo Integration, Safety Interlocks.
        
        --- END OF RESUME ---

        --- START OF DETAILED PROJECT PORTFOLIO ---

        **Project 1: Automotive Test Loop Line**
        - Client Origin: Germany
        - Role: PLC & HMI Programmer
        - Technologies: Mitsubishi FX5U PLC, GX Works 3, GT Designer 3 (GOT 2000 Series HMI), Ethernet Communication, Safety Relays.
        - Objective: To design and implement the PLC and HMI control logic for a fully automated vehicle test loop line consisting of multiple stations, including turntables, conveyors, stoppers, presses, and lift tables.
        - Responsibilities: Developed complete PLC programs in GX Works 3; Created auto and manual operation modes; Implemented turntable and lift synchronization; Designed and configured HMI screens; Tested Auto/Manual transitions and safety logic.
        - Key Achievements: Delivered a robust multi-station PLC + HMI solution integrating over 10 subsystems; Improved process reliability through modular, reusable PLC code blocks; Achieved synchronized operation of turntables and conveyors without collisions.

        **Project 2: Boiler House Automation**
        - Client Origin: India
        - Role: PLC & SCADA Programmer | Commissioning Engineer
        - Technologies: Siemens S7-1200 PLC, TIA Portal V14, WinCC SCADA, PID Control, Furnace Automation.
        - Objective: To design, program, and commission a fully automated boiler house system including dual furnaces, fuel handling units, and safety interlocks, with complete SCADA visualization and data logging.
        - Responsibilities: Developed PLC logic for boiler start-up, auto-run, and shutdown; Designed WinCC SCADA screens; Configured PID control loops for steam-pressure; Calibrated analog signals; Conducted full commissioning (cold, hot, and production trials).
        - Key Achievements: Delivered a fully operational PLC + SCADA-based boiler automation system; Resolved major modulation issues, stabilizing pressure control; Designed intuitive SCADA interface for simplified operator control.

        **Project 3: Multi-Lift and Conveyor Automation System**
        - Client Origin: United Kingdom
        - Role: PLC & HMI Programmer | On-Site Commissioning Engineer
        - Technologies: Allen-Bradley CompactLogix PLC, Studio 5000, FactoryTalk View ME, Ethernet/IP, Encoder-Based Lift Positioning.
        - Objective: To design, modify, and commission a multi-lift and conveyor control system for a UK-based automotive client, handling vehicle transport and elevation between assembly levels.
        - Responsibilities: Developed and modified PLC logic in Studio 5000; Implemented encoder-based logic for accurate lift positioning; Added new conveyor logic to the existing Auto sequence; Debugged and corrected manual mode functions.
        - Key Achievements: Successfully expanded an existing Allen-Bradley-based conveyor network with new lift integration; Achieved precise lift motion control via encoder feedback; Eliminated job spacing and sequencing issues between conveyors and lifts.

        **Project 4: Tea Production Plant Complete Process Automation**
        - Client Origin: India
        - Role: PLC & SCADA Engineer
        - Technologies: Siemens S7-1200 PLC, TIA Portal V16, WinCC SCADA (Runtime Advanced), PID Control, Anydesk.
        - Objective: To develop and commission a fully automated control and monitoring system for a tea production plant, covering all stages from raw leaf feeding to packaging.
        - Responsibilities: Designed and configured a complete SCADA system; Developed PLC logic for feeders, dryers, conveyors; Configured PID loops for temperature and humidity control; Provided online customer support through Anydesk.
        - Key Achievements: Delivered a fully functional end-to-end automated tea manufacturing line; Reduced manual intervention by over 70%; Designed intuitive SCADA visuals providing clear process flow.

        **Project 5: Wheel Hub Seal, Bearing Stud & Hydraulic Press Machines**
        - Client Origin: United States
        - Role: PLC, HMI & Electrical Design Engineer
        - Technologies: Siemens S7-1200 PLC, TIA Portal V16, Servo Motor Drive, Stepper Motor Positioning, MES Communication, AutoCAD Electrical Design.
        - Objective: To design, program, and commission two advanced press automation machines (Wheel Hub Seal Press & Hydraulic Station Press) with MES connectivity and servo/stepper control.
        - Responsibilities: Developed PLC programs in TIA Portal V16; Integrated servo drive and stepper motor; Implemented MES–PLC data exchange; Designed and released AutoCAD electrical drawings.
        - Key Achievements: Delivered two MES-integrated press machines operating seamlessly; Achieved real-time job selection and traceability through MES data mapping; Attained micron-level pressing accuracy via optimized servo control.

        **Project 6: Axle & Wheel Hub Stud Pressing Line – OPC UA Integration**
        - Client Origin: Italy
        - Role: PLC & HMI Programmer | On-Site Commissioning Engineer
        - Technologies: Siemens S7-1200 PLC, TIA Portal V14, OPC UA Communication, Safety Curtain Integration.
        - Objective: To modify, validate, and integrate the PLC-HMI system of an automated pressing line, including OPC UA-based data exchange for centralized monitoring.
        - Responsibilities: Modified PLC logic for a new press model; Updated and redesigned HMI screens; Developed OPC UA communication channels; Added and tested safety-curtain logic.
        - Key Achievements: Successfully implemented OPC UA integration enabling remote process monitoring; Enhanced safety compliance through curtain interlocks; Achieved an intuitive, operator-friendly HMI interface.

        **Project 7: Spices Grinding & Packing Automation**
        - Client Origin: India
        - Role: Automation & Commissioning Engineer
        - Technologies: Siemens S7-1400 PLC, TIA Portal V14, TIA Portal SCADA (WinCC Runtime Advanced), Multi-Line Automation.
        - Objective: To design, test, and commission an integrated automation system for five independent spice grinding and packing lines, controlled via a centralized SCADA.
        - Responsibilities: Developed modular PLC logic for five lines; Developed centralized SCADA for all five lines; Performed no-load and on-load testing; Addressed and resolved fan tripping issues.
        - Key Achievements: Successfully commissioned all five systems under a unified SCADA monitoring station; Improved operational visibility by centralizing five PLCs; Delivered stable production-ready logic.

        **Project 8: Multi-Station Axle & Bearing Assembly SCADA Integration**
        - Client Origin: Italy
        - Role: SCADA Development & Integration Engineer
        - Technologies: ASEM Industrial PC (Supervisory), ASEM HMI Panels, CSV Tag & Alarm Configuration, OPC Communication, Siemens S7-1200/1500 PLC, Recipe Management.
        - Objective: To enhance and integrate a four-station automated axle and bearing assembly line, implementing efficient alarm management (~1800 alarms), manual operation, and recipe control.
        - Responsibilities: Optimized the SCADA layer; Reorganized and optimized a large-scale alarm system (≈1800 alarms) using CSV import/export; Developed recipe management functionality; Performed detailed testing and debugging.
        - Key Achievements: Delivered a robust and synchronized multi-station SCADA system; Streamlined a complex 1800-alarm database, improving accuracy; Established recipe-based production flexibility, reducing changeover time.

        **Project 9: Pharma Powder Conveying & Grinding Automation**
        - Client Origin: India
        - Role: Automation & Commissioning Engineer
        - Technologies: CompactLogix 5370, Studio 5000 (v32), PanelView Plus 7, FactoryTalk View ME, EtherNet/IP, VFDs.
        - Objective: To commission and validate an automated line for powder conveying, grinding, mixing, weighment and packing, ensuring reliable AUTO/MANUAL operation and safe interlocks.
        - Responsibilities: Performed complete I/O verification and sensor calibration; Implemented and tested PLC sequencing for three auto cycles; Configured VFD integration (start/stop, setpoints, fault handling); Implemented safety permissives (metal detector, e-stop).
        - Key Achievements: Verified stable AUTO/MANUAL operation across all subsystems; Completed dry-run auto cycles using signal simulation for FAT-style validation; Strengthened alarm and interlock logic, reducing unsafe starts.
        --- END OF DETAILED PROJECT PORTFOLIO ---
    `;
};

async function handleSendMessage() {
    if (!ai) {
        addMessageToHistory('ai', 'AI is not available.');
        return;
    }

    const question = chatInput.value.trim();
    if (!question) return;

    addMessageToHistory('user', question);
    chatInput.value = '';
    showLoader(true);

    try {
        const resumeContext = getResumeContext();
        const fullPrompt = `${resumeContext}\n\nBased on the information above, answer the following question as Ruturaj's helpful AI assistant: "${question}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        const text = response.text;
        addMessageToHistory('ai', text);

    } catch (error) {
        console.error("Error generating content:", error);
        addMessageToHistory('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
        showLoader(false);
    }
}

function addMessageToHistory(sender: 'user' | 'ai', message: string) {
    if (!chatHistory) return;
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    
    // Naive markdown-like formatting for bold and lists
    let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/^\* (.*$)/gm, '<li>$1</li>');
    if(formattedMessage.includes('<li>')) {
        formattedMessage = `<ul>${formattedMessage}</ul>`;
    }

    messageElement.innerHTML = formattedMessage;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showLoader(show: boolean) {
    if (!loader || !sendBtn) return;
    if (show) {
        loader.classList.remove('hidden');
        sendBtn.disabled = true;
    } else {
        loader.classList.add('hidden');
        sendBtn.disabled = false;
    }
}

// --- Modal Logic ---
function openModal(modal: HTMLElement | null) {
    if (modal) modal.classList.add('active');
}

function closeModal() {
    modalContainers.forEach(modal => modal.classList.remove('active'));
}

chatBubble?.addEventListener('click', () => openModal(chatModalContainer));
getInTouchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(emailModalContainer);
});

modalContainers.forEach(modal => {
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});


// --- Event Listeners & Initializations ---
document.addEventListener('DOMContentLoaded', () => {
    type();
    addMessageToHistory('ai', "Hello! I am Ruturaj's AI assistant. Feel free to ask me anything about his resume.");
});

sendBtn?.addEventListener('click', handleSendMessage);
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// --- Smooth Scrolling and Modal/Menu Management ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (navUl && navUl.contains(anchor)) {
            navUl.classList.remove('active');
        }

        if (targetId === '#contact') {
            openModal(chatModalContainer);
        } else if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});