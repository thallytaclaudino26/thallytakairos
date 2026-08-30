document.getElementById('year').textContent = new Date().getFullYear();

/* Header scroll state + progress bar */
const header = document.getElementById('header');
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}, { passive: true });

/* Mobile menu */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  mainNav.classList.toggle('open');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuToggle.classList.remove('open');
  mainNav.classList.remove('open');
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
