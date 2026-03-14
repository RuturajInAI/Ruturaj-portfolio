import { GoogleGenAI } from "@google/genai";

// --- DOM Elements ---
const nav = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const navUl = nav?.querySelector("ul");
const typingText = document.getElementById("typing-text");
const chatHistory = document.getElementById("chat-history");
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const loader = document.getElementById("loader");
const backgroundCanvas = document.getElementById(
  "background-canvas",
) as HTMLCanvasElement;
const profileCanvas = document.getElementById(
  "profile-canvas",
) as HTMLCanvasElement;
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const downloadOptionsModalContainer = document.getElementById('download-options-modal-container');
const downloadFullPdfBtn = document.getElementById('download-full-pdf-btn');
const downloadSummaryPdfBtn = document.getElementById('download-summary-pdf-btn');

// Modal Elements
const chatBubble = document.getElementById("chat-bubble");
const chatModalContainer = document.getElementById("chat-modal-container");
const emailModalContainer = document.getElementById("email-modal-container");
const projectModalContainer = document.getElementById(
  "project-modal-container",
);
const projectModalTitle = document.getElementById("project-modal-title");
const projectModalDetailsContent = document.getElementById(
  "project-modal-details-content",
);
const getInTouchBtn = document.getElementById("get-in-touch-btn");
const contactSectionBtn = document.getElementById("contact-section-btn");
const modalContainers = document.querySelectorAll(".modal-container");
const aiAssistantNavLink = document.getElementById("ai-assistant-nav-link");
const PORTFOLIO_PDF_URL = "/Portfolio_Ruturaj.pdf";
let cachedPortfolioPdfBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function getPortfolioPdfBase64() {
  if (cachedPortfolioPdfBase64) {
    return cachedPortfolioPdfBase64;
  }

  const response = await fetch(PORTFOLIO_PDF_URL, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error(
      `Failed to load portfolio PDF: ${response.status} ${response.statusText}`,
    );
  }

  const pdfBuffer = await response.arrayBuffer();
  cachedPortfolioPdfBase64 = arrayBufferToBase64(pdfBuffer);
  return cachedPortfolioPdfBase64;
}

function buildPdfAssistantPrompt(question: string) {
  return `
You are the AI assistant for Ruturaj Dilip Gawade's portfolio website.

The attached PDF is the single source of truth.
Read it carefully and answer only from that PDF.

Rules:
1. Do not copy-paste long parts from the PDF.
2. Answer naturally, clearly, and professionally.
3. Distinguish between:
   - confirmed professional or project experience
   - tools or technologies listed only under technical skills
   - academic exposure or foundational knowledge
4. If something is listed only in the skills section and not supported by project or work evidence, say that it appears in the skills section, so it suggests familiarity or foundational working knowledge, but direct professional hands-on experience is not clearly confirmed.
5. If the PDF does not clearly support something, say: "That is not clearly stated in the portfolio PDF."
6. Prefer short paragraphs over long lists unless the user asks for a list.
7. When useful, mention why you reached the answer in one short sentence.

User question:
"${question}"
    `.trim();
}

// --- Typing Animation ---
const words = [
  "PLC Programmer",
  "SCADA Developer",
  "HMI Designer",
  "Commissioning Expert",
  "Customer Support Specialist",
];
let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function type() {
  if (!typingText) return;
  currentWord = words[i];
  if (isDeleting) {
    j--;
    typingText.textContent = currentWord.substring(0, j);
  } else {
    j++;
    typingText.textContent = currentWord.substring(0, j);
  }

  if (!isDeleting && j === currentWord.length) {
    setTimeout(() => (isDeleting = true), 2000);
  } else if (isDeleting && j === 0) {
    isDeleting = false;
    i = (i + 1) % words.length;
  }

  const typingSpeed = isDeleting ? 100 : 200;
  setTimeout(type, typingSpeed);
}

// --- Navbar Scroll Effect ---
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav?.classList.add("scrolled");
  } else {
    nav?.classList.remove("scrolled");
  }
});

// --- Mobile Menu Toggle ---
menuBtn?.addEventListener("click", () => {
  navUl?.classList.toggle("active");
});

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.1 },
);

revealElements.forEach((el) => {
  revealObserver.observe(el);
});

// --- "Read More" Logic for Project & Experience Cards ---
const readMoreBtns = document.querySelectorAll(".read-more-btn");
readMoreBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const card = (btn as HTMLElement).closest(
      ".project-card, .experience-card",
    );
    if (!card) return;

    // Handle Experience card expansion (accordion)
    if (card.classList.contains("experience-card")) {
      card.classList.toggle("expanded");
      btn.textContent = card.classList.contains("expanded")
        ? "Read Less"
        : "Read More";
      return;
    }

    // Handle Project card modal
    if (
      !projectModalContainer ||
      !projectModalTitle ||
      !projectModalDetailsContent
    )
      return;

    const title = card.querySelector("h3")?.textContent || "Project Details";
    const detailsHTML =
      card.querySelector(".details")?.innerHTML ||
      "<p>No details available.</p>";

    projectModalTitle.textContent = title;
    projectModalDetailsContent.innerHTML = detailsHTML;

    openModal(projectModalContainer);
  });
});

// --- Close button for expanded Quick Overview cards ---
const scanAccordions = document.querySelectorAll(".scan-accordion");

scanAccordions.forEach((accordion) => {
  const detailsEl = accordion as HTMLDetailsElement;

  if (detailsEl.querySelector(".scan-close-btn")) return;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "scan-close-btn";
  closeBtn.setAttribute("aria-label", "Close quick overview");
  closeBtn.innerHTML = "&times;";

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    detailsEl.removeAttribute("open");

    const projectCard = detailsEl.closest(
      ".project-card",
    ) as HTMLElement | null;
    const thumb =
      (projectCard?.querySelector(".project-thumb") as HTMLElement | null) ||
      (projectCard?.querySelector("img") as HTMLElement | null) ||
      projectCard;

    const navHeight =
      (document.getElementById("navbar") as HTMLElement | null)?.offsetHeight ||
      0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!thumb) return;

        const targetTop =
          thumb.getBoundingClientRect().top + window.scrollY - navHeight - 12;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });
      });
    });
  });

  detailsEl.appendChild(closeBtn);
});

// --- PDF Download Logic ---
const FULL_PORTFOLIO_PDF_URL = '/Portfolio_Ruturaj.pdf';
const SUMMARY_PORTFOLIO_PDF_URL = '/Portfolio_Ruturaj_Summary.pdf';

function downloadFile(fileUrl: string, downloadName: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = downloadName;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

downloadPdfBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(downloadOptionsModalContainer);
});

downloadFullPdfBtn?.addEventListener('click', () => {
    downloadFile(FULL_PORTFOLIO_PDF_URL, 'Ruturaj_Gawade_Full_Portfolio.pdf');
    closeModal();
});

downloadSummaryPdfBtn?.addEventListener('click', () => {
    downloadFile(SUMMARY_PORTFOLIO_PDF_URL, 'Ruturaj_Gawade_Portfolio_Summary.pdf');
    closeModal();
});

// --- Profile Picture Canvas Animation ---
if (profileCanvas) {
  const p_ctx = profileCanvas.getContext("2d");
  profileCanvas.width = 200;
  profileCanvas.height = 200;
  let p_particlesArray: ProfileParticle[] = [];
  const p_numberOfParticles = 40;
  const center = { x: profileCanvas.width / 2, y: profileCanvas.height / 2 };

  let mouseHover = false;
  const profilePicContainer = document.querySelector(".profile-pic-container");
  profilePicContainer?.addEventListener(
    "mouseenter",
    () => (mouseHover = true),
  );
  profilePicContainer?.addEventListener(
    "mouseleave",
    () => (mouseHover = false),
  );

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
      const speed = Math.random() * 1.5 + 0.5;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.size = Math.random() * 1.5 + 1;
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
      const speed = Math.random() * 1.5 + 0.5;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.life = this.maxLife;
    }

    draw() {
      if (p_ctx) {
        p_ctx.fillStyle = `rgba(0, 255, 204, ${(this.life / this.maxLife) * 0.8})`;
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
            Math.pow(p_particlesArray[a].y - p_particlesArray[b].y, 2),
        );

        if (distance < 35) {
          opacityValue = 1 - distance / 35;
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
  const ctx = backgroundCanvas.getContext("2d");

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
      Math.max(width, height) * 0.7,
    );
    gradient.addColorStop(0, "rgba(0, 255, 170, 0.06)");
    gradient.addColorStop(0.45, "rgba(0, 255, 170, 0.025)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawVerticalRail = (x: number) => {
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, height * 0.12);
    ctx.lineTo(x, height * 0.88);
    ctx.strokeStyle = "rgba(0, 255, 170, 0.28)";
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
    ctx.strokeStyle = "rgba(0, 255, 170, 0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawContact = (x: number, y: number, open: boolean = true) => {
    if (!ctx) return;

    const h = 24;
    const gap = 8;

    ctx.strokeStyle = "rgba(0, 255, 170, 0.75)";
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
      ctx.strokeStyle = "rgba(0, 255, 170, 0.45)";
      ctx.stroke();
    }
  };

  const drawCoil = (x: number, y: number) => {
    if (!ctx) return;

    ctx.strokeStyle = "rgba(0, 255, 170, 0.78)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x - 7, y, 10, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 7, y, 10, Math.PI * 1.5, Math.PI * 0.5, false);
    ctx.stroke();
  };

  const drawBranch = (
    x1: number,
    x2: number,
    yTop: number,
    yBottom: number,
  ) => {
    if (!ctx) return;

    ctx.strokeStyle = "rgba(0, 255, 170, 0.18)";
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
      ctx.fillStyle = "rgba(0, 255, 170, 0.8)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 170, 0.08)";
      ctx.fill();
    });
  };

  const getPulsePath = (): Point[] => {
    const leftRail = width * 0.18;
    const rightRail = width * 0.82;

    return [
      { x: leftRail, y: height * 0.24 },
      { x: width * 0.3, y: height * 0.24 },
      { x: width * 0.42, y: height * 0.24 },
      { x: width * 0.56, y: height * 0.24 },
      { x: width * 0.7, y: height * 0.24 },
      { x: rightRail, y: height * 0.24 },

      { x: leftRail, y: height * 0.4 },
      { x: width * 0.3, y: height * 0.4 },
      { x: width * 0.44, y: height * 0.4 },
      { x: width * 0.58, y: height * 0.4 },
      { x: width * 0.72, y: height * 0.4 },
      { x: rightRail, y: height * 0.4 },

      { x: leftRail, y: height * 0.56 },
      { x: width * 0.3, y: height * 0.56 },
      { x: width * 0.46, y: height * 0.56 },
      { x: width * 0.6, y: height * 0.56 },
      { x: width * 0.72, y: height * 0.56 },
      { x: rightRail, y: height * 0.56 },

      { x: leftRail, y: height * 0.72 },
      { x: width * 0.32, y: height * 0.72 },
      { x: width * 0.48, y: height * 0.72 },
      { x: width * 0.62, y: height * 0.72 },
      { x: width * 0.74, y: height * 0.72 },
      { x: rightRail, y: height * 0.72 },
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
    ctx.fillStyle = "rgba(0, 255, 170, 1)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 170, 0.12)";
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

    const rungYs = [height * 0.24, height * 0.4, height * 0.56, height * 0.72];

    rungYs.forEach(drawRung);

    drawContact(width * 0.3, height * 0.24, true);
    drawContact(width * 0.42, height * 0.24, true);
    drawCoil(width * 0.72, height * 0.24);

    drawContact(width * 0.3, height * 0.4, true);
    drawContact(width * 0.44, height * 0.4, false);
    drawCoil(width * 0.72, height * 0.4);

    drawContact(width * 0.3, height * 0.56, true);
    drawBranch(width * 0.4, width * 0.54, height * 0.56, height * 0.63);
    drawContact(width * 0.47, height * 0.56, true);
    drawContact(width * 0.47, height * 0.63, false);
    drawCoil(width * 0.72, height * 0.56);

    drawContact(width * 0.32, height * 0.72, true);
    drawContact(width * 0.48, height * 0.72, true);
    drawCoil(width * 0.74, height * 0.72);

    drawTerminalDots([
      { x: leftRail, y: height * 0.24 },
      { x: rightRail, y: height * 0.24 },
      { x: leftRail, y: height * 0.4 },
      { x: rightRail, y: height * 0.4 },
      { x: leftRail, y: height * 0.56 },
      { x: rightRail, y: height * 0.56 },
      { x: leftRail, y: height * 0.72 },
      { x: rightRail, y: height * 0.72 },
    ]);

    drawPulse(getPulsePath());

    animationFrameId = requestAnimationFrame(drawScene);
  };

  const handleResize = () => {
    setCanvasSize();
  };

  setCanvasSize();
  drawScene();

  window.addEventListener("resize", handleResize);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationFrameId);
  });
}

// --- Gemini AI Assistant ---
let ai;
try {
  ai = new GoogleGenAI({ apiKey: "AIzaSyBxwm1_wCZSW7TxlChq1daqtpxQQiJsxNg" });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
  addMessageToHistory(
    "ai",
    "Error: AI service could not be initialized. Please check the API key configuration.",
  );
}

async function handleSendMessage() {
  if (!ai) {
    addMessageToHistory("ai", "AI is not available.");
    return;
  }

  const question = chatInput.value.trim();
  if (!question) return;

  addMessageToHistory("user", question);
  chatInput.value = "";
  showLoader(true);

  try {
    const pdfBase64 = await getPortfolioPdfBase64();
    const fullPrompt = buildPdfAssistantPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
      ],
    });

    const text = response.text;
    addMessageToHistory("ai", text);
  } catch (error) {
    console.error("Error generating content:", error);
    addMessageToHistory(
      "ai",
      "Sorry, I encountered an error. Please try again.",
    );
  } finally {
    showLoader(false);
  }
}

function addMessageToHistory(sender: "user" | "ai", message: string) {
  if (!chatHistory) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);

  // Naive markdown-like formatting for bold and lists
  let formattedMessage = message.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>",
  );
  formattedMessage = formattedMessage.replace(/^\* (.*$)/gm, "<li>$1</li>");
  if (formattedMessage.includes("<li>")) {
    formattedMessage = `<ul>${formattedMessage}</ul>`;
  }

  messageElement.innerHTML = formattedMessage;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showLoader(show: boolean) {
  if (!loader || !sendBtn) return;
  if (show) {
    loader.classList.remove("hidden");
    sendBtn.disabled = true;
  } else {
    loader.classList.add("hidden");
    sendBtn.disabled = false;
  }
}

// --- Modal Logic ---
function openModal(modal: HTMLElement | null) {
  if (modal) modal.classList.add("active");
}

function closeModal() {
  modalContainers.forEach((modal) => modal.classList.remove("active"));
}

chatBubble?.addEventListener("click", () => openModal(chatModalContainer));
aiAssistantNavLink?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(chatModalContainer);
});
getInTouchBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(emailModalContainer);
});
contactSectionBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(emailModalContainer);
});

modalContainers.forEach((modal) => {
  const closeBtn = modal.querySelector(".close-btn");
  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});

// --- Event Listeners & Initializations ---
document.addEventListener("DOMContentLoaded", () => {
  type();
  addMessageToHistory(
    "ai",
    "Hello! I am Ruturaj's AI assistant. How can I help you today?",
  );
});

sendBtn?.addEventListener("click", handleSendMessage);
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSendMessage();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId && targetId.startsWith("#") && targetId.length > 1) {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});
