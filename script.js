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

// a onça só aparece a partir da seção "Experimente" (demo) até o final do site
const WM_OPACITY_VISIBLE = 0.35;
const demoSection = document.getElementById('demo');
function getWatermarkRevealTarget() {
  return demoSection ? demoSection.offsetTop : window.innerHeight;
}
let wmRevealTarget = getWatermarkRevealTarget();
window.addEventListener('resize', () => { wmRevealTarget = getWatermarkRevealTarget(); }, { passive: true });

function onScroll() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';

  // onça desliza verticalmente conforme a rolagem da página (0% a 100%), sem cortar
  const wmShift = (scrolled / 100) * (wmRange * 2) - wmRange;
  root.style.setProperty('--wm-scroll', wmShift.toFixed(1) + 'px');

  // só revela a onça quando a rolagem alcança (ou passa d)a seção "Experimente"
  const reachedDemo = h.scrollTop + window.innerHeight * 0.4 >= wmRevealTarget;
  root.style.setProperty('--wm-opacity', reachedDemo ? WM_OPACITY_VISIBLE : 0);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Esconde a logo flutuante do canto assim que a página rola para além do hero */
const heroSection = document.querySelector('.hero');
if (heroSection) {
  const brandObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      document.body.classList.toggle('hide-brand', !entry.isIntersecting);
    });
  }, { threshold: 0.05 });
  brandObserver.observe(heroSection);
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

/* Demonstrações animadas (farmácia / painel / WhatsApp) — tocam só quando visíveis */
const demoMocks = document.querySelectorAll('.demo-mock');
const demoMockObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('is-playing', entry.isIntersecting);
  });
}, { threshold: 0.35 });
demoMocks.forEach(el => demoMockObserver.observe(el));

/* Service cards - didactic expand */
document.querySelectorAll('.service-card').forEach(card => {
  const btn = card.querySelector('.service-toggle');
  btn.addEventListener('click', () => {
    const isOpen = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});

/* Interactive chatbot demo — fluxo guiado: setor -> serviço -> agendamento */
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const WPP_NUMBER = '5562983392107';

const SERVICES = [
  { key: 'sites', label: '🌐 Sites & Sistemas',
    blurb: 'Ótima escolha! Criamos sites, sistemas e aplicativos autorais, pensados para o seu negócio vender mais e atender com mais presença.' },
  { key: 'automacao', label: '⚙️ Automação com IA',
    blurb: 'Ótima escolha! Nossa automação com IA cuida das tarefas repetitivas — vendas, atendimento, organização — pra sua equipe ganhar tempo (e presença) pro que importa.' },
  { key: 'chatbot', label: '💬 Chatbots Inteligentes',
    blurb: 'Ótima escolha! Um chatbot Kairos de verdade aprende sobre o seu negócio e conversa com seus clientes a qualquer hora, no WhatsApp, site ou Instagram — como este aqui, só que de verdade! 😉' },
];

const RULES = [
  { keys: ['preço', 'preco', 'valor', 'quanto custa', 'investimento'],
    reply: 'Cada projeto é único e autoral, então o valor depende do escopo. Preenche o formulário de contato que a gente te manda uma proposta personalizada, sem compromisso. 💜' },
  { keys: ['como funciona', 'processo', 'etapas'],
    reply: 'É simples: me conta a área do seu negócio que mais precisa de cuidado, eu te indico o melhor caminho entre os nossos 3 serviços, e a gente já agenda um diagnóstico gratuito pelo WhatsApp. 💜' },
  { keys: ['contato', 'falar', 'humano', 'pessoa'],
    reply: 'Claro! Você pode preencher o formulário aqui embaixo ou nos chamar no Instagram @_kairosdigital_ 💬' },
];

const DEFAULT_REPLY = 'Ótima pergunta! Na Kairos Strategy a gente resolve isso com tecnologia e sensibilidade, sob medida. Quer falar com a nossa equipe pelo formulário ou pelo Instagram @_kairosdigital_?';

function matchReply(text) {
  const t = text.toLowerCase();
  const found = RULES.find(r => r.keys.some(k => t.includes(k)));
  return found ? found.reply : DEFAULT_REPLY;
}

function matchServiceKey(text) {
  const t = text.toLowerCase();
  if (/site|sistema|app|aplicativo/.test(t)) return 'sites';
  if (/automa/.test(t)) return 'automacao';
  if (/chatbot|whats|atendimento/.test(t)) return 'chatbot';
  return null;
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

function addQuickReplies(onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-quick-replies';
  SERVICES.forEach(service => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-quick-reply';
    btn.textContent = service.label;
    btn.addEventListener('click', () => {
      wrap.remove();
      addMessage(service.label, 'user');
      onPick(service.key);
    });
    wrap.appendChild(btn);
  });
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
  return wrap;
}

function addCtaLink(text, href) {
  const a = document.createElement('a');
  a.className = 'chat-cta-link';
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = text;
  chatBody.appendChild(a);
  chatBody.scrollTop = chatBody.scrollHeight;
}

let stage = 'sector'; // sector -> service -> done
let clientSector = '';

function askServiceStep() {
  const typingEl = showTyping();
  setTimeout(() => {
    typingEl.remove();
    addMessage('Entendi! E qual desses 3 caminhos faz mais sentido pro seu momento agora?', 'bot');
    addQuickReplies(handleServiceChoice);
    stage = 'service';
  }, 600 + Math.random() * 400);
}

function handleServiceChoice(key) {
  const service = SERVICES.find(s => s.key === key) || SERVICES[0];
  const typingEl = showTyping();
  setTimeout(() => {
    typingEl.remove();
    addMessage(service.blurb, 'bot');
    const typingEl2 = showTyping();
    setTimeout(() => {
      typingEl2.remove();
      addMessage('Vamos agendar o seu diagnóstico gratuito! 🎉', 'bot');
      const text = encodeURIComponent(
        `Quero agendar meu diagnóstico gratuito. Área que precisa de atenção: ${clientSector}. Serviço de interesse: ${service.label}.`
      );
      addCtaLink('Agendar diagnóstico gratuito →', `https://wa.me/${WPP_NUMBER}?text=${text}`);
      stage = 'done';
    }, 700 + Math.random() * 400);
  }, 600 + Math.random() * 400);
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  addMessage(value, 'user');
  chatInput.value = '';

  if (stage === 'sector') {
    clientSector = value;
    askServiceStep();
    return;
  }

  if (stage === 'service') {
    const key = matchServiceKey(value);
    if (key) {
      handleServiceChoice(key);
    } else {
      const typingEl = showTyping();
      setTimeout(() => {
        typingEl.remove();
        addMessage('Pra eu te indicar certinho, escolhe uma das opções abaixo 👇', 'bot');
        addQuickReplies(handleServiceChoice);
      }, 500 + Math.random() * 300);
    }
    return;
  }

  // stage === 'done' — segue no papo livre
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
