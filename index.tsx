import { GoogleGenAI } from "@google/genai";

// --- DOM Elements ---
const nav = document.getElementById('navbar');
const menuBtn = document.getElementById('menu-btn');
const navUl = nav?.querySelector('ul');
const typingText = document.getElementById('typing-text');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const loader = document.getElementById('loader');
const backgroundCanvas = document.getElementById('background-canvas') as HTMLCanvasElement;
const profileCanvas = document.getElementById('profile-canvas') as HTMLCanvasElement;
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// Modal Elements
const chatBubble = document.getElementById('chat-bubble');
const chatModalContainer = document.getElementById('chat-modal-container');
const emailModalContainer = document.getElementById('email-modal-container');
const projectModalContainer = document.getElementById('project-modal-container');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalDetailsContent = document.getElementById('project-modal-details-content');
const getInTouchBtn = document.getElementById('get-in-touch-btn');
const contactSectionBtn = document.getElementById('contact-section-btn');
const modalContainers = document.querySelectorAll('.modal-container');
const aiAssistantNavLink = document.getElementById('ai-assistant-nav-link');


// --- Typing Animation ---
const words = ["PLC Programmer", "SCADA Developer", "HMI Designer", "Commissioning Expert", "Customer Support Specialist"];
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
        if (!projectModalContainer || !projectModalTitle || !projectModalDetailsContent) return;

        const title = card.querySelector('h3')?.textContent || 'Project Details';
        const detailsHTML = card.querySelector('.details')?.innerHTML || '<p>No details available.</p>';
        
        projectModalTitle.textContent = title;
        projectModalDetailsContent.innerHTML = detailsHTML;

        openModal(projectModalContainer);
    });
});

// --- Close button for expanded Quick Overview cards ---
const scanAccordions = document.querySelectorAll('.scan-accordion');

scanAccordions.forEach((accordion) => {
    const detailsEl = accordion as HTMLDetailsElement;

    if (detailsEl.querySelector('.scan-close-btn')) return;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'scan-close-btn';
    closeBtn.setAttribute('aria-label', 'Close quick overview');
    closeBtn.innerHTML = '&times;';

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        detailsEl.removeAttribute('open');

        const projectCard = detailsEl.closest('.project-card') as HTMLElement | null;
        const thumb =
            projectCard?.querySelector('.project-thumb') as HTMLElement | null ||
            projectCard?.querySelector('img') as HTMLElement | null ||
            projectCard;

        const navHeight = (document.getElementById('navbar') as HTMLElement | null)?.offsetHeight || 0;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!thumb) return;

                const targetTop = thumb.getBoundingClientRect().top + window.scrollY - navHeight - 12;

                window.scrollTo({
                    top: Math.max(targetTop, 0),
                    behavior: 'smooth'
                });
            });
        });
    });

    detailsEl.appendChild(closeBtn);
});

// --- PDF Download Logic ---
/**
 * Triggers the download of the uploaded PDF file.
 */
function downloadPDF() {
  const sourceFileName = "https://raw.githubusercontent.com/RuturajInAI/Ruturaj-portfolio/main/Portfolio_Ruturaj_Dilip_Gawade.pdf";
  const downloadName = "Ruturaj_Gawade_Resume.pdf";
  
  const link = document.createElement("a");
  link.href = sourceFileName; 
  link.download = downloadName;
  link.target = "_blank";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

downloadPdfBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  downloadPDF();
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
                
                if (distance < 35) {
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

// --- Fullscreen Ladder Logic Background ---
if (backgroundCanvas) {
    const ctx = backgroundCanvas.getContext('2d');

    type Point = {
        x: number;
        y: number;
    };

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let pulseOffset = 0;

    const setCanvasSize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        backgroundCanvas.width = width;
        backgroundCanvas.height = height;
    };

    const drawBackgroundGlow = () => {
        if (!ctx) return;

        const gradient = ctx.createRadialGradient(
            width * 0.5,
            height * 0.45,
            50,
            width * 0.5,
            height * 0.45,
            Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 255, 170, 0.06)');
        gradient.addColorStop(0.45, 'rgba(0, 255, 170, 0.025)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    const drawVerticalRail = (x: number) => {
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, height * 0.12);
        ctx.lineTo(x, height * 0.88);
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.28)';
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const drawRung = (y: number) => {
        if (!ctx) return;

        const leftRail = width * 0.18;
        const rightRail = width * 0.82;

        ctx.beginPath();
        ctx.moveTo(leftRail, y);
        ctx.lineTo(rightRail, y);
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.18)';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const drawContact = (x: number, y: number, open: boolean = true) => {
        if (!ctx) return;

        const h = 24;
        const gap = 8;

        ctx.strokeStyle = 'rgba(0, 255, 170, 0.75)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x - gap, y - h / 2);
        ctx.lineTo(x - gap, y + h / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + gap, y - h / 2);
        ctx.lineTo(x + gap, y + h / 2);
        ctx.stroke();

        if (!open) {
            ctx.beginPath();
            ctx.moveTo(x - gap, y - h / 2 + 2);
            ctx.lineTo(x + gap, y + h / 2 - 2);
            ctx.strokeStyle = 'rgba(0, 255, 170, 0.45)';
            ctx.stroke();
        }
    };

    const drawCoil = (x: number, y: number) => {
        if (!ctx) return;

        ctx.strokeStyle = 'rgba(0, 255, 170, 0.78)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(x - 7, y, 10, Math.PI * 1.5, Math.PI * 0.5, true);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 7, y, 10, Math.PI * 1.5, Math.PI * 0.5, false);
        ctx.stroke();
    };

    const drawBranch = (x1: number, x2: number, yTop: number, yBottom: number) => {
        if (!ctx) return;

        ctx.strokeStyle = 'rgba(0, 255, 170, 0.18)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x1, yTop);
        ctx.lineTo(x1, yBottom);
        ctx.lineTo(x2, yBottom);
        ctx.lineTo(x2, yTop);
        ctx.stroke();
    };

    const drawTerminalDots = (points: Point[]) => {
        if (!ctx) return;

        points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 170, 0.8)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 170, 0.08)';
            ctx.fill();
        });
    };

    const getPulsePath = (): Point[] => {
        const leftRail = width * 0.18;
        const rightRail = width * 0.82;

        return [
            { x: leftRail, y: height * 0.24 },
            { x: width * 0.30, y: height * 0.24 },
            { x: width * 0.42, y: height * 0.24 },
            { x: width * 0.56, y: height * 0.24 },
            { x: width * 0.70, y: height * 0.24 },
            { x: rightRail, y: height * 0.24 },

            { x: leftRail, y: height * 0.40 },
            { x: width * 0.30, y: height * 0.40 },
            { x: width * 0.44, y: height * 0.40 },
            { x: width * 0.58, y: height * 0.40 },
            { x: width * 0.72, y: height * 0.40 },
            { x: rightRail, y: height * 0.40 },

            { x: leftRail, y: height * 0.56 },
            { x: width * 0.30, y: height * 0.56 },
            { x: width * 0.46, y: height * 0.56 },
            { x: width * 0.60, y: height * 0.56 },
            { x: width * 0.72, y: height * 0.56 },
            { x: rightRail, y: height * 0.56 },

            { x: leftRail, y: height * 0.72 },
            { x: width * 0.32, y: height * 0.72 },
            { x: width * 0.48, y: height * 0.72 },
            { x: width * 0.62, y: height * 0.72 },
            { x: width * 0.74, y: height * 0.72 },
            { x: rightRail, y: height * 0.72 }
        ];
    };

    const drawPulse = (path: Point[]) => {
        if (!ctx || path.length < 2) return;

        pulseOffset += 0.035;
        const total = path.length - 1;
        const pulseIndex = pulseOffset % total;
        const segmentIndex = Math.floor(pulseIndex);
        const progress = pulseIndex - segmentIndex;

        const from = path[segmentIndex];
        const to = path[segmentIndex + 1];

        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;

        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 170, 1)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 170, 0.12)';
        ctx.fill();
    };

    const drawScene = () => {
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        drawBackgroundGlow();

        const leftRail = width * 0.18;
        const rightRail = width * 0.82;

        drawVerticalRail(leftRail);
        drawVerticalRail(rightRail);

        const rungYs = [
            height * 0.24,
            height * 0.40,
            height * 0.56,
            height * 0.72
        ];

        rungYs.forEach(drawRung);

        drawContact(width * 0.30, height * 0.24, true);
        drawContact(width * 0.42, height * 0.24, true);
        drawCoil(width * 0.72, height * 0.24);

        drawContact(width * 0.30, height * 0.40, true);
        drawContact(width * 0.44, height * 0.40, false);
        drawCoil(width * 0.72, height * 0.40);

        drawContact(width * 0.30, height * 0.56, true);
        drawBranch(width * 0.40, width * 0.54, height * 0.56, height * 0.63);
        drawContact(width * 0.47, height * 0.56, true);
        drawContact(width * 0.47, height * 0.63, false);
        drawCoil(width * 0.72, height * 0.56);

        drawContact(width * 0.32, height * 0.72, true);
        drawContact(width * 0.48, height * 0.72, true);
        drawCoil(width * 0.74, height * 0.72);

        drawTerminalDots([
            { x: leftRail, y: height * 0.24 },
            { x: rightRail, y: height * 0.24 },
            { x: leftRail, y: height * 0.40 },
            { x: rightRail, y: height * 0.40 },
            { x: leftRail, y: height * 0.56 },
            { x: rightRail, y: height * 0.56 },
            { x: leftRail, y: height * 0.72 },
            { x: rightRail, y: height * 0.72 }
        ]);

        drawPulse(getPulsePath());

        animationFrameId = requestAnimationFrame(drawScene);
    };

    const handleResize = () => {
        setCanvasSize();
    };

    setCanvasSize();
    drawScene();

    window.addEventListener('resize', handleResize);

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
    });
}

// --- Gemini AI Assistant ---
let ai;
try {
    ai = new GoogleGenAI({ apiKey: "AIzaSyBxwm1_wCZSW7TxlChq1daqtpxQQiJsxNg" });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    addMessageToHistory('ai', 'Error: AI service could not be initialized. Please check the API key configuration.');
}

const getResumeContext = () => {
    // This resume text is based on the provided PDF document to give the AI assistant full context.
    const resumeText = `
        This is the resume for Ruturaj Dilip Gawade. Use this data, along with the detailed project portfolio that follows, to answer questions.

        --- START OF RESUME ---

        **Ruturaj Dilip Gawade**
        ruturajabroad@gmail.com | +49 15560133862 | Walther-Rathenau-Straße 55, 39104 Magdeburg

        **PROFILE**
        Automation & Commissioning Engineer with 3 years of hands-on experience in PLC, HMI, and SCADA-based industrial automation, delivering projects for clients of German, Italian, UK, US, and Indian origin. Proficient in Siemens, Allen-Bradley, and Mitsubishi automation platforms with exposure to Beckhoff (TwinCAT) and Schneider control environments. Experienced in commissioning, troubleshooting, field integration, and remote customer support, ensuring reliable system performance under real production conditions. Currently pursuing M.Sc. in Digital Engineering at Otto von Guericke University Magdeburg, specializing in real-time industrial data synchronization and control system integration. Fluent in English (C1) and German (A2), possessing the language skills necessary for effective communication in diverse environments.

        **PROFESSIONAL EXPERIENCE**
        **Automation & Commissioning Engineer**
        Promatics Solutions | 03.2021 - 04.2024 | Pune, India
        Delivered end-to-end automation projects for international clients covering PLC/HMI logic development, on-site commissioning, fault analysis, on-site/online support and customer handover documentation.
        (Note: During the pandemic, my college followed a flexible mode of learning. With official approval, I began full-time industrial work in 2021, continued it as my final-year internship equivalent, and remained full-time after completing my B.Tech.)

        *A summary of key projects is listed below. Full, detailed descriptions for these projects are available in the portfolio section that is provided after this resume text.*
        
        *   **Automotive Test Loop Line (German Client):** Developed PLC/HMI logic (Mitsubishi FX5U), conducted commissioning.
        *   **Boiler House Automation (Indian Client):** Programmed Siemens S7-1200 with WinCC SCADA and PID control.
        *   **Multi-Lift & Conveyor Automation System (UK Client):** Commissioned Allen-Bradley CompactLogix with encoder-based feedback.
        *   **Tea Production Plant Automation (Indian Client):** Delivered full-plant automation with Siemens S7-1200 and WinCC Runtime.
        *   **Wheel Hub & Hydraulic Press Machines (US Client):** Programmed servo/stepper systems (Siemens S7-1200) with MES integration and AutoCAD Electrical design.
        *   **Axle & Wheel Hub Stud Pressing Line (Italian Client):** Validated PLC-HMI systems with OPC UA data exchange and safety-curtain logic.
        *   **Spices Grinding & Packing Automation (Indian Client):** Commissioned five grinding lines under a centralized SCADA and Siemens S7-1500.
        *   **Multi-Station Axle & Bearing Assembly SCADA (Italian Client):** Enhanced ASEM HMI/SCADA connected to Siemens S7-1200/1500 PLCs, managing 1800 alarms and recipes.
        *   **Pharma Powder Conveying & Grinding (Indian Client):** Commissioned Allen-Bradley CompactLogix 5370 system.

        **EDUCATION**
        *   **Master's in Digital Engineering** (04.2024 – Present) | Otto von Guericke University Magdeburg, Germany
            *Key Competencies:* Industrial Automation & Control Systems, PLC & SCADA Integration, IoT & Edge Data Communication, Robotics & Machine Vision, System Simulation & Modeling, Cybersecurity in Industrial Networks.
        *   **Bachelor of Technology in Electrical Engineering** (06.2020 - 07.2023) | Savitribai Phule Pune University, India
            *Key Competencies:* PLC Programming & HMI Development, Industrial Instrumentation, Control Systems & Automation, Electrical Design & Power Electronics, Motor Drives & Energy Systems.

        **ACADEMIC PROJECTS**
        *   **(M.Sc.) Environmental Representation of Autonomous Robots:** Developed a LiDAR and radar-based detection system to classify humans vs non-humans.
        *   **(M.Sc.) Smart City Traffic Control and Safety Analysis (with City of Magdeburg):** Designed a traffic simulation model in AnyLogic using real sensor data to analyze pedestrian safety.
        *   **(B.Tech.) PLC Development Using Arduino and Factory I/O Simulation:** Built a prototype integrating an Arduino with Factory I/O to simulate a packaging line with web-based monitoring.

        **TECHNICAL SKILLS**
        *Automation & Control*
        - PLC Programming (Siemens • Allen-Bradley • Mitsubishi • Beckhoff • Omron • Schneider Electric • Delta Electronics • B&R Industrial Automation • Keyence • Fuji Electric • Phoenix Contact)
        - HMI & SCADA Development
        - Industrial Commissioning & Troubleshooting
        - Safety Interlocks & Control Logic Design
        - PID Control & Analog/Digital I/O Configuration
        - Motion Control (Servo & Stepper Motors)
        - VFD Integration & Drive Commissioning

        *Engineering Tools*
        - Siemens TIA Portal (V14–V17)
        - STEP7
        - WinCC SCADA / Runtime Advanced
        - TwinCAT 3 (Beckhoff)
        - Studio 5000 (Allen-Bradley)
        - GX Works 3 / GT Designer 3 (Mitsubishi)
        - Sysmac Studio (Omron)
        - EcoStruxure Control Expert / SoMachine (Schneider Electric)
        - ISPSoft / WPLSoft (Delta Electronics)
        - Automation Studio (B&R Industrial Automation)
        - KV Studio (Keyence)
        - MICREX-SX / MONITOUCH Configurator (Fuji Electric)
        - PLCnext Engineer (Phoenix Contact)
        - AutoCAD Electrical

        *Industrial Communication*
        - Profinet • Profibus • EtherNet/IP • Modbus • OPC UA
        - PLC–HMI–SCADA Network Configuration
        - MES & Data Exchange Integration

        *Process Expertise*
        - Automotive Assembly & Press Lines
        - Conveyor & Lift Automation
        - Boiler & Utility Automation
        - Food / Pharma / Packaging Systems

        *Key Technologies*
        - Beckhoff TwinCAT 3 Programming
        - Siemens S7-1200 / S7-1500 PLCs
        - Safety PLC Configuration (F-Series / TwinSAFE)
        - Industry 4.0 & OPC UA Integration

        **PROFESSIONAL SKILLS**
        - On-Site Commissioning
        - Cross-Functional Team Collaboration
        - Technical Documentation & Operator Training
        - Troubleshooting & Root Cause Analysis

        **LANGUAGES**
        *   English: C1 (IELTS)
        *   German: A2 (currently improving)

        --- END OF RESUME ---
    `;

    // Dynamically build project portfolio from the DOM to ensure a single source of truth.
    let projectsData = '\n\n--- START OF DETAILED PROJECT PORTFOLIO ---\n\n';
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent?.trim();
        const summary = card.querySelector('p')?.textContent?.trim();
        const detailsContainer = card.querySelector('.details');
        
        projectsData += `**Project ${index + 1}: ${title}**\n`;
        if (summary) {
            projectsData += `${summary}\n`;
        }
        
        if (detailsContainer) {
            detailsContainer.childNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                const element = node as HTMLElement;
                const text = element.textContent?.trim();
                if (!text) return;

                switch(element.tagName.toLowerCase()) {
                    case 'h4':
                        projectsData += `\n**${text}**\n`;
                        break;
                    case 'p':
                        projectsData += `${text}\n`;
                        break;
                    case 'ul':
                        element.querySelectorAll('li').forEach(li => {
                            const liText = li.textContent?.trim();
                            if (liText) {
                                projectsData += `- ${liText}\n`;
                            }
                        });
                        break;
                }
            });
        }
        projectsData += '\n---\n\n'; // Separator between projects
    });
    projectsData += '--- END OF DETAILED PROJECT PORTFOLIO ---\n';

    return resumeText + projectsData;
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
aiAssistantNavLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(chatModalContainer);
});
getInTouchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(emailModalContainer);
});
contactSectionBtn?.addEventListener('click', (e) => {
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
    addMessageToHistory('ai', "Hello! I am Ruturaj's AI assistant. How can I help you today?");
});

sendBtn?.addEventListener('click', handleSendMessage);
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
             e.preventDefault();
             const targetElement = document.querySelector(targetId);
             if (targetElement) {
                 targetElement.scrollIntoView({
                     behavior: 'smooth'
                 });
             }
        }
    });
});