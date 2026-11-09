// Sin dependencias: node --test tests/functional.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');

function setup(options = {}) {
  const nodes = new Map();
  const document = { activeElement: null };
  function element(id = '') {
    const attributes = new Map();
    const classes = new Set();
    return {
      id, value: '', textContent: '', hidden: false, inert: false, dataset: {}, validity: { valid: true },
      events: {}, classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) },
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name); },
      hasAttribute(name) { return attributes.has(name); },
      removeAttribute(name) { attributes.delete(name); if (name === 'href') delete this.href; },
      addEventListener(type, listener) { (this.events[type] ??= []).push(listener); },
      dispatch(type, event = {}) { for (const listener of this.events[type] ?? []) listener(event); },
      focus() { document.activeElement = this; }
    };
  }
  for (const selector of ['.menu-toggle', '#navigation', '#contact-form', '#form-status', '#continue-whatsapp', '#year']) nodes.set(selector, element());
  if (options.photo) {
    const hero = element();
    hero.src = 'assets/barberia.svg';
    hero.alt = 'Original illustration';
    hero.dataset = { photoSrc: 'assets/licensed-photo.webp', photoAlt: 'Barber chair photograph' };
    nodes.set('#hero-image', hero);
    nodes.set('#hero-image-note', element());
  }
  const fallbackImage = element('hero-image');
  fallbackImage.src = 'assets/images/missing.webp';
  fallbackImage.dataset = { fallbackSrc: 'assets/barberia.svg', fallbackAlt: 'Original illustration' };
  fallbackImage.complete = Boolean(options.alreadyFailed);
  fallbackImage.naturalWidth = 0;
  if (options.fallback) nodes.set('#hero-image-note', element());
  const fields = ['name', 'phone', 'service', 'message'].map(name => {
    const field = element(`contact-${name}`);
    nodes.set(`#${field.id}-error`, element());
    return field;
  });
  const reservation = element();
  reservation.dataset.service = 'Ritual \u00c9lite';
  const links = [element(), reservation];
  const backgrounds = [element(), element()];
  const nav = nodes.get('#navigation');
  nav.querySelector = () => links[0];
  nav.querySelectorAll = () => links;
  nav.contains = node => links.includes(node);
  nodes.get('#contact-form').querySelectorAll = () => fields;
  document.querySelector = selector => nodes.get(selector);
  document.querySelectorAll = selector => {
    if (selector === 'img[data-fallback-src]') return options.fallback ? [fallbackImage] : [];
    if (selector === '[data-whatsapp]') return [reservation];
    if (selector.startsWith('main,')) return backgrounds;
    return [];
  };
  const events = {};
  document.addEventListener = (type, listener) => { events[type] = listener; };
  document.body = element();
  const media = { addEventListener(type, listener) { this.change = listener; } };
  const opened = [];
  const photos = [];
  const context = vm.createContext({ document, Image: class { constructor() { photos.push(this); } }, window: { matchMedia: () => media, open: (...args) => opened.push(args) }, FormData: class {
    get(name) { return fields.find(field => field.id === `contact-${name}`).value; }
  } });
  vm.runInContext(source, context);
  return { nodes, fields, reservation, backgrounds, links, events, media, opened, document, context, photos, fallbackImage };
}

test('image error restores SVG and accurate alternative description', () => {
  const { nodes, fallbackImage } = setup({ fallback: true });
  fallbackImage.dispatch('error');
  assert.equal(fallbackImage.src, 'assets/barberia.svg');
  assert.equal(fallbackImage.alt, 'Original illustration');
  assert(nodes.get('#hero-image-note').textContent);
});

test('image failure before deferred script also restores SVG', () => {
  const { fallbackImage } = setup({ fallback: true, alreadyFailed: true });
  assert.equal(fallbackImage.src, 'assets/barberia.svg');
  assert.equal(fallbackImage.alt, 'Original illustration');
});

test('optional photo keeps illustration until successfully loaded', () => {
  const { nodes, photos } = setup({ photo: true });
  const hero = nodes.get('#hero-image');
  assert.equal(hero.src, 'assets/barberia.svg');
  assert.equal(photos[0].src, 'assets/licensed-photo.webp');
  // A failed or pending load never runs onload, leaving the original image intact.
  assert.equal(hero.alt, 'Original illustration');
  photos[0].onload();
  assert.equal(hero.src, 'assets/licensed-photo.webp');
  assert.equal(hero.alt, 'Barber chair photograph');
  assert(nodes.get('#hero-image-note').textContent);
});

test('default hero makes no optional photo request', () => {
  assert.equal(setup().photos.length, 0);
});

test('reservation URL encodes service and uses safe external link attributes', () => {
  const { reservation } = setup();
  const url = new URL(reservation.href);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/51998617639');
  assert.match(url.searchParams.get('text'), /Ritual \u00c9lite/);
  assert.equal(reservation.target, '_blank');
  assert.equal(reservation.rel, 'noopener noreferrer');
});

test('mobile menu manages focus, keyboard loop, Escape and resizing', () => {
  const { nodes, backgrounds, links, events, media, document } = setup();
  const toggle = nodes.get('.menu-toggle');
  toggle.dispatch('click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(document.activeElement, links[0]);
  assert(backgrounds.every(node => node.inert));
  links.at(-1).focus();
  let prevented = false;
  events.keydown({ key: 'Tab', preventDefault() { prevented = true; } });
  assert(prevented);
  assert.equal(document.activeElement, toggle);
  events.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert(backgrounds.every(node => !node.inert));
  toggle.dispatch('click');
  media.change({ matches: true });
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert(!document.body.classList.contains('menu-open'));
});

test('invalid form blocks navigation and focuses first field', () => {
  const { nodes, fields, opened, document } = setup();
  nodes.get('#contact-form').dispatch('submit', { preventDefault() {} });
  assert.equal(opened.length, 0);
  assert.equal(document.activeElement, fields[0]);
  assert(fields.every(field => field.getAttribute('aria-invalid') === 'true'));
  assert(nodes.get('#form-status').textContent);
});

test('validation rejects spaces, short queries and invalid phones', () => {
  const { context } = setup();
  for (const [id, value] of [['contact-name', '  '], ['contact-phone', 'abc1234567'], ['contact-phone', '123'], ['contact-message', 'hola']]) {
    context.field = { id, value, validity: { valid: true } };
    assert(vm.runInContext('validationMessage(field)', context));
  }
});

test('valid form opens encoded data, preserves values and clears stale fallback after edits', () => {
  const { nodes, fields, opened } = setup();
  const values = ['Ana & Jos\u00e9', '+51 999 123 456', 'Ritual \u00c9lite', 'Consulta para el s\u00e1bado & domingo #1'];
  fields.forEach((field, index) => { field.value = values[index]; });
  nodes.get('#contact-form').dispatch('submit', { preventDefault() {} });
  assert.equal(opened.length, 1);
  assert.equal(opened[0][2], 'noopener,noreferrer');
  const message = new URL(opened[0][0]).searchParams.get('text');
  values.forEach(value => assert(message.includes(value)));
  assert.equal(nodes.get('#continue-whatsapp').hidden, false);
  assert.equal(nodes.get('#continue-whatsapp').href, opened[0][0]);
  assert.equal(fields[0].value, values[0]);
  fields[0].dispatch('input');
  assert.equal(nodes.get('#continue-whatsapp').hidden, true);
  assert.equal(nodes.get('#continue-whatsapp').href, undefined);
});
