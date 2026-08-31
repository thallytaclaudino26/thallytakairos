document.getElementById('year').textContent = new Date().getFullYear();

/* Progress bar + parallax da marca d'água */
const progressBar = document.getElementById('progressBar');
const root = document.documentElement;
const watermarkImg = document.querySelector('.site-watermark img');

// calcula quanto dá pra deslocar a onça verticalmente sem cortar a imagem
// (metade do espaço livre acima/abaixo dela na tela, com uma margem de segurança)
function getWatermarkRange() {
  if (!watermarkImg) return 0;
  const headroom = (window.innerHeight - watermarkImg.offsetHeight) / 2;
  return Math.max(0, Math.min(110, headroom - 12));
}
let wmRange = getWatermarkRange();
window.addEventListener('resize', () => { wmRange = getWatermarkRange(); }, { passive: true });
if (watermarkImg && !watermarkImg.complete) {
  watermarkImg.addEventListener('load', () => { wmRange = getWatermarkRange(); });
}

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';

  // onça desliza verticalmente conforme a rolagem da página (0% a 100%), sem cortar
  const wmShift = (scrolled / 100) * (wmRange * 2) - wmRange;
  root.style.setProperty('--wm-scroll', wmShift.toFixed(1) + 'px');
}, { passive: true });

/* Esconde a marca d'água de fundo enquanto a trilha de pegadas (portfólio) está na tela */
const portfolioSection = document.getElementById('portfolio');
if (portfolioSection) {
  const watermarkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      document.body.classList.toggle('hide-watermark', entry.isIntersecting);
    });
  }, { threshold: 0.05 });
  watermarkObserver.observe(portfolioSection);
}

/* Mobile menu */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.classList.toggle('open');
  mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuToggle.classList.remove('open');
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* Service cards - didactic expand */
document.querySelectorAll('.service-card').forEach(card => {
  const btn = card.querySelector('.service-toggle');
  btn.addEventListener('click', () => {
    const isOpen = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});

/* Timeline (Como funciona) */
const steps = document.querySelectorAll('.timeline-step');
const panels = document.querySelectorAll('.timeline-panel');
steps.forEach(step => {
  step.addEventListener('click', () => {
    const target = step.dataset.step;
    steps.forEach(s => s.classList.toggle('active', s === step));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
  });
});

/* Interactive chatbot demo */
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const RULES = [
  { keys: ['preço', 'preco', 'valor', 'quanto custa', 'investimento'],
    reply: 'Cada projeto é único, então o valor depende do escopo. Preencha o formulário de contato que te enviamos uma proposta personalizada sem compromisso. 💜' },
  { keys: ['site', 'sistema', 'aplicativo', 'app'],
    reply: 'Criamos sites, sistemas e aplicativos sob medida! O processo passa por diagnóstico, protótipo, desenvolvimento e suporte. Quer que eu te direcione para a equipe?' },
  { keys: ['automação', 'automacao', 'automatizar'],
    reply: 'Nossa automação com IA cuida de tarefas repetitivas — vendas, atendimento, organização — para sua equipe ganhar tempo. Posso te mostrar exemplos reais no formulário de contato.' },
  { keys: ['chatbot', 'atendimento', 'whatsapp'],
    reply: 'Este chat é um exemplo simplificado! Um chatbot Kairos real aprende sobre o seu negócio e atende seus clientes 24h, no WhatsApp, site ou Instagram.' },
  { keys: ['como funciona', 'processo', 'etapas'],
    reply: 'É simples: 1) Diagnóstico gratuito, 2) Proposta personalizada, 3) Desenvolvimento, 4) Suporte contínuo. Dá uma olhada na seção "Como funciona" acima ☝️' },
  { keys: ['contato', 'falar', 'humano', 'pessoa'],
    reply: 'Claro! Você pode preencher o formulário aqui embaixo ou nos chamar no Instagram @_kairosdigital_ 💬' },
  { keys: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
    reply: 'Oi! Que bom te ver por aqui. Quer saber sobre sites, automação com IA ou chatbots?' },
];

const DEFAULT_REPLY = 'Ótima pergunta! Na Kairos Digital a gente resolve isso com IA sob medida. Quer falar com a nossa equipe pelo formulário ou pelo Instagram @_kairosdigital_?';

function matchReply(text) {
  const t = text.toLowerCase();
  const found = RULES.find(r => r.keys.some(k => t.includes(k)));
  return found ? found.reply : DEFAULT_REPLY;
}

function addMessage(text, who) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + who;
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  return msg;
}

function showTyping() {
  const msg = document.createElement('div');
  msg.className = 'chat-msg bot typing';
  msg.innerHTML = '<span></span><span></span><span></span>';
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  return msg;
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  addMessage(value, 'user');
  chatInput.value = '';

  const typingEl = showTyping();
  const delay = 600 + Math.random() * 500;
  setTimeout(() => {
    typingEl.remove();
    addMessage(matchReply(value), 'bot');
  }, delay);
});

/* Contact form (client-side only — no backend yet) */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formNote.textContent = 'Mensagem pronta! Em breve conectamos este formulário ao nosso atendimento. Por enquanto, fale com a gente pelo Instagram @_kairosdigital_ 💜';
  contactForm.reset();
});

/* Nav scroll-spy: destaca o link da seção visível */
const navLinks = document.querySelectorAll('#mainNav a[href^="#"]');
const spySections = [...navLinks]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
spySections.forEach(s => spyObserver.observe(s));
