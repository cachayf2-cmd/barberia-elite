'use strict';

// Número configurado por el propietario: Perú (51), sin +, espacios ni guiones.
const WHATSAPP_NUMBER = '51998617639';

// Fotografías locales: recupera el SVG si el archivo falta o no puede decodificarse.
document.querySelectorAll('img[data-fallback-src]').forEach(image => {
  const useFallback = () => {
    image.src = image.dataset.fallbackSrc;
    image.alt = image.dataset.fallbackAlt;
    if (image.id === 'hero-image') {
      document.querySelector('#hero-image-note').textContent = 'ILUSTRACIÓN CONCEPTUAL';
    }
  };
  image.addEventListener('error', useFallback, { once: true });
  // También cubre un error ocurrido antes de ejecutar este script diferido.
  if (image.complete && image.naturalWidth === 0) useFallback();
});

// La ilustración permanece visible mientras carga la foto opcional, o si esta falla.
const heroImage = document.querySelector('#hero-image');
if (heroImage?.dataset.photoSrc && heroImage.dataset.photoAlt?.trim()) {
  const photo = new Image();
  photo.decoding = 'async';
  photo.fetchPriority = 'high';
  photo.onload = () => {
    heroImage.src = photo.src;
    heroImage.alt = heroImage.dataset.photoAlt.trim();
    document.querySelector('#hero-image-note').textContent = 'FOTOGRAFÍA DE REFERENCIA';
  };
  photo.src = heroImage.dataset.photoSrc;
}

function whatsappUrl(message) {
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    throw new Error('Configura WHATSAPP_NUMBER con 8 a 15 dígitos, incluido el código de país.');
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const desktop = window.matchMedia('(min-width: 901px)');
const backgroundElements = document.querySelectorAll('main, footer, .whatsapp-float, .skip-link, .header > .brand');

function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  backgroundElements.forEach(element => { element.inert = false; });
  if (restoreFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(true);
    return;
  }
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Cerrar menú');
  navigation.classList.add('is-open');
  document.body.classList.add('menu-open');
  backgroundElements.forEach(element => { element.inert = true; });
  navigation.querySelector('a').focus();
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
}));

document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu(true);
  } else if (event.key === 'Tab') {
    const controls = [menuButton, ...navigation.querySelectorAll('a')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

desktop.addEventListener('change', event => {
  const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
  const hadNavigationFocus = navigation.contains(document.activeElement);
  closeMenu();
  if (event.matches && wasOpen) navigation.querySelector('a').focus();
  if (!event.matches && hadNavigationFocus) menuButton.focus();
});

// El navegador gestiona anclas e historial; CSS respeta movimiento reducido.
document.querySelectorAll('a[href^="#"]:not([data-whatsapp])').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

document.querySelectorAll('[data-whatsapp]').forEach(link => {
  const message = link.dataset.service
    ? `Hola, quisiera reservar ${link.dataset.service}. ¿Qué horarios tienen disponibles?`
    : 'Hola, quisiera reservar una cita en Barbería Élite. ¿Qué horarios tienen disponibles?';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-description', 'Abre WhatsApp en otra pestaña con un mensaje preparado.');
  try {
    link.href = whatsappUrl(message);
  } catch (error) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.title = error.message;
  }
});

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const continueLink = document.querySelector('#continue-whatsapp');
const fields = [...contactForm.querySelectorAll('input, select, textarea')];

function validationMessage(field) {
  const value = field.value.trim();
  if (!value) return 'Completa este campo.';
  if (field.id === 'contact-name' && value.length < 2) return 'Escribe al menos 2 caracteres para tu nombre.';
  if (field.id === 'contact-phone' && !/^\+?[\d\s()-]{7,25}$/.test(value)) return 'Usa solo números y, si necesitas, +, espacios, paréntesis o guiones.';
  if (field.id === 'contact-phone' && !/^\d{7,15}$/.test(value.replace(/\D/g, ''))) return 'Escribe un teléfono de entre 7 y 15 dígitos.';
  if (field.id === 'contact-message' && value.length < 10) return 'Escribe al menos 10 caracteres para tu consulta.';
  if (field.validity.tooLong) return `Usa como máximo ${field.maxLength} caracteres.`;
  if (!field.validity.valid) return 'Revisa el valor de este campo.';
  return '';
}

function validateField(field) {
  const message = validationMessage(field);
  document.querySelector(`#${field.id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

fields.forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validateField(field);
    continueLink.hidden = true;
    continueLink.removeAttribute('href');
    formStatus.textContent = '';
  });
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  continueLink.hidden = true;
  continueLink.removeAttribute('href');
  const invalid = fields.filter(field => !validateField(field));
  if (invalid.length) {
    formStatus.textContent = 'Revisa los campos indicados antes de continuar a WhatsApp.';
    invalid[0].focus();
    return;
  }
  const data = new FormData(contactForm);
  const message = [
    'Hola, quisiera consultar una reserva en Barbería Élite.',
    `Nombre: ${data.get('name').trim()}`,
    `Teléfono: ${data.get('phone').trim()}`,
    `Servicio: ${data.get('service')}`,
    `Consulta: ${data.get('message').trim()}`
  ].join('\n');
  try {
    const url = whatsappUrl(message);
    continueLink.href = url;
    continueLink.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
    formStatus.textContent = 'Continúa en WhatsApp y revisa el mensaje antes de enviarlo. Si no se abrió otra pestaña, usa el enlace de abajo. Todavía no se ha enviado el mensaje ni confirmado ninguna reserva.';
  } catch (error) {
    formStatus.textContent = error.message;
  }
});

contactForm.noValidate = true;
document.querySelector('#year').textContent = new Date().getFullYear();
