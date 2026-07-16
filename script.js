const TEXT = {
  intro: [
    'Сегодня необычный день...',
    'Сегодня день, когда мы отмечаем твой день рождения!',
  ],
  title: 'Этот день принадлежит только тебе',
  letterTitle: 'Для Айши',
  letterBody: `Привет! С днём рождения! 🎉

Желаю тебе успехов в жизни, учёбе и во всех новых начинаниях. Хочу, чтобы ты всегда была счастлива и чтобы с твоего лица никогда не исчезала улыбка :_>

Желаю тебе долгих лет жизни, крепкого здоровья и чтобы ты добилась всего, о чём мечтаешь. С праздником! Загадывай желание и задувай свечи на торте! 🎂`,
  hint: 'Нажми на торт',
  loading: 'Открываем двери в ... ',
  finale: 'С Днем Рождения!',
};

// Local Lenis-compatible fallback keeps the page smooth even without the CDN.
if (typeof window.Lenis === 'undefined') {
  window.Lenis = class LenisFallback {
    constructor() {
      this._target = 0;
      this._current = window.scrollY || 0;
      this._running = false;
      this._boundOnWheel = this._onWheel.bind(this);
      this._boundOnTouchMove = this._onTouchMove.bind(this);
      window.addEventListener('wheel', this._boundOnWheel, { passive: false });
      window.addEventListener('touchmove', this._boundOnTouchMove, { passive: false });
    }

    _onWheel(event) {
      event.preventDefault();
      this._target = clamp(this._target + event.deltaY, 0, document.documentElement.scrollHeight - window.innerHeight);
    }

    _onTouchMove(event) {
      if (!event.touches || !event.touches[0]) return;
      const touch = event.touches[0];
      this._target = clamp(this._target + (window.innerHeight - touch.clientY) * 0.02, 0, document.documentElement.scrollHeight - window.innerHeight);
    }

    raf() {
      this._current += (this._target - this._current) * 0.08;
      window.scrollTo(0, this._current);
    }
  };
}

const STATE = {
  opened: false,
  finale: false,
  ready: false,
};

const DURATION = {
  intro: 1.4,
  settle: 1.2,
  cakeGlow: 1.0,
  finale: 1.2,
};

const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const app = document.getElementById('app');
const cursor = document.getElementById('cursor');
const particles = document.getElementById('particles');
const butterflies = document.getElementById('butterflies');
const petals = document.getElementById('petals');
const leaves = document.getElementById('leaves');
const prologue = document.getElementById('prologue');
const camera = document.getElementById('camera');
const cake = document.getElementById('cake');
const hint = document.getElementById('hint');
const cheerMain = document.getElementById('cheerMain');
const letterWrap = document.getElementById('letterWrap');
const letter = document.getElementById('letter');
const letterText = document.getElementById('letterText');
const blowButton = document.getElementById('blowButton');
const finale = document.getElementById('finale');
const finaleSky = document.getElementById('finaleSky');
const finaleMessage = finale.querySelector('.finale__message');

let cursorX = window.innerWidth * 0.5;
let cursorY = window.innerHeight * 0.45;
let loadProgress = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setRootPosition(x, y) {
  document.documentElement.style.setProperty('--mouse-x', `${x}px`);
  document.documentElement.style.setProperty('--mouse-y', `${y}px`);
}

function buildAtmosphereLayer(container, className, count, factory) {
  for (let index = 0; index < count; index += 1) {
    const element = factory(index);
    element.classList.add(className);
    container.appendChild(element);
  }
}

function createAtmosphere() {
  buildAtmosphereLayer(particles, 'firefly', 18, () => {
    const firefly = document.createElement('span');
    const size = rand(2, 6);
    firefly.style.width = `${size}px`;
    firefly.style.height = `${size}px`;
    firefly.style.left = `${rand(4, 96)}%`;
    firefly.style.top = `${rand(8, 72)}%`;
    firefly.style.opacity = `${rand(0.18, 0.8)}`;
    return firefly;
  });

  buildAtmosphereLayer(butterflies, 'butterfly', 18, () => {
    const butterfly = document.createElement('span');
    butterfly.style.left = `${rand(10, 90)}%`;
    butterfly.style.top = `${rand(18, 72)}%`;
    
    function fly() {
      const xMove = rand(-window.innerWidth * 0.4, window.innerWidth * 0.4);
      const yMove = rand(-window.innerHeight * 0.3, window.innerHeight * 0.3);
      const direction = xMove > 0 ? 1 : -1;
      
      gsap.to(butterfly, {
        x: `+=${xMove}`,
        y: `+=${yMove}`,
        rotation: rand(-15, 15),
        scaleX: direction,
        duration: rand(8, 14),
        ease: 'sine.inOut',
        onComplete: fly
      });
    }
    
    setTimeout(fly, rand(0, 2000));
    return butterfly;
  });

  buildAtmosphereLayer(petals, 'petal', 24, () => {
    const petal = document.createElement('span');
    petal.style.left = `${rand(4, 96)}%`;
    petal.style.top = `${rand(-10, 100)}vh`;
    petal.style.opacity = `${rand(0.3, 0.8)}`;
    
    function fall() {
      gsap.to(petal, {
        y: window.innerHeight + 200,
        x: `+=${rand(-100, 100)}`,
        rotation: rand(-360, 360),
        duration: rand(10, 18),
        ease: 'none',
        onComplete: () => {
          gsap.set(petal, { y: -100, top: '-5vh', x: 0 });
          fall();
        }
      });
    }
    fall();
    
    return petal;
  });

  buildAtmosphereLayer(leaves, 'leaf', 20, () => {
    const leaf = document.createElement('span');
    leaf.style.left = `${rand(2, 98)}%`;
    leaf.style.top = `${rand(-10, 100)}vh`;
    leaf.style.opacity = `${rand(0.35, 0.7)}`;
    
    function fall() {
      gsap.to(leaf, {
        y: window.innerHeight + 200,
        x: `+=${rand(-120, 120)}`,
        rotation: rand(-360, 360),
        duration: rand(12, 22),
        ease: 'none',
        onComplete: () => {
          gsap.set(leaf, { y: -100, top: '-5vh', x: 0 });
          fall();
        }
      });
    }
    fall();
    
    return leaf;
  });
}

function setLoadingProgress(value) {
  loadProgress = clamp(value, 0, 100);
  loadingBar.style.width = `${loadProgress}%`;
}

function showPrologue(lines) {
  const lineElements = [...prologue.querySelectorAll('.prologue__line')];
  lineElements.forEach((line, index) => {
    line.textContent = lines[index] ?? '';
  });

  const timeline = gsap.timeline();
  lineElements.forEach((line, index) => {
    timeline.to(line, {
    opacity: 1,
    y: index === 1 ? -150 : 0,
    filter: 'blur(0px)',
    duration: 0.9,
    ease: 'power3.out'
}, index === 0 ? 0 : '+=0.95');
    timeline.to(line, { opacity: 0.88, duration: 1.2 }, '+=1.0');
  });
  return timeline;
}

function shapeScene() {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

  timeline.to(document.documentElement, { '--camera-scale': 0.96, duration: 1.1 }, 0);
  timeline.to(document.documentElement, { '--camera-y': '-12px', duration: 1.1 }, 0);
  timeline.to(prologue, { opacity: 1, duration: 0.4 }, 0.1);
  timeline.add(showPrologue(TEXT.intro), 0.2);
  timeline.to(prologue, { opacity: 0, duration: 0.8 }, '+=0.5');
  timeline.to(document.documentElement, { '--camera-scale': 0.82, duration: 1.8 }, '>-0.2');
  timeline.to(document.documentElement, { '--camera-y': '10px', duration: 1.8 }, '<');
  timeline.to(document.documentElement, { '--camera-x': '0px', duration: 1.8 }, '<');
  timeline.to(cheerMain, { opacity: 1, y: 0, duration: 1.1 }, '+=0.5');
  timeline.to(hint, { opacity: 1, y: 0, duration: 1 }, '-=0.3');
  timeline.to(cake, { scale: 1, duration: 0.01 }, 0);
  timeline.to(cake, { rotate: 0, duration: 0.01 }, 0);
  timeline.to('.scene__camera', { filter: 'brightness(1) saturate(1)', duration: 0.01 }, 0);

  return timeline;
}

function createSpark(element, duration = 1.8) {
  const spark = document.createElement('span');
  spark.className = 'finale__spark';
  const rect = element.getBoundingClientRect();
  spark.style.left = `${rect.left + rect.width * 0.5}px`;
  spark.style.top = `${rect.top + rect.height * 0.22}px`;
  finaleSky.appendChild(spark);

  const angle = rand(0, Math.PI * 2);
  const distance = rand(80, 220);
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance - rand(20, 120);
  const size = rand(2, 5);

  gsap.set(spark, { width: size, height: size, x: 0, y: 0, scale: 0.8 });
  gsap.to(spark, {
    x: targetX,
    y: targetY,
    scale: rand(0.8, 1.6),
    opacity: 0,
    duration,
    ease: 'power2.out',
    onComplete: () => spark.remove(),
  });
}

function launchBursts(target, burstCount = 64) {
  for (let index = 0; index < burstCount; index += 1) {
    const delay = Math.random() * 0.28;
    window.setTimeout(() => createSpark(target, rand(1.1, 2.2)), delay * 1000);
  }
}

function createAmbientBurst(target) {
  const rect = target.getBoundingClientRect();
  const burst = document.createElement('span');
  burst.className = 'firefly';
  burst.style.left = `${rect.left + rect.width * 0.5}px`;
  burst.style.top = `${rect.top + rect.height * 0.35}px`;
  burst.style.width = '160px';
  burst.style.height = '160px';
  burst.style.opacity = '0.55';
  burst.style.position = 'fixed';
  burst.style.zIndex = '70';
  document.body.appendChild(burst);
  gsap.fromTo(burst, { scale: 0.2, opacity: 0.1 }, { scale: 1.35, opacity: 0, duration: 1.8, ease: 'power2.out', onComplete: () => burst.remove() });
}

function revealLetter() {
  if (STATE.opened) return;
  STATE.opened = true;

  document.querySelector('.scene').classList.add('is-glow');
  hint.textContent = '';

  // Устанавливаем текст письма ДО анимации
  letterText.textContent = TEXT.letterBody;

  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Камера плавно приближается
  timeline.to(document.documentElement, { '--camera-scale': 1.06, duration: 1.6, ease: 'power2.inOut' }, 0);
  timeline.to(document.documentElement, { '--camera-y': '-14px', duration: 1.6, ease: 'power2.inOut' }, 0);
  timeline.to(camera, { filter: 'brightness(1.08) saturate(1.06)', duration: 1.4 }, 0);

  // Скрываем всё лишнее плавно
  timeline.to(hint, { opacity: 0, duration: 0.5 }, 0.1);
  timeline.to(".road", { opacity: 0, duration: 0.7 }, 0.2);
  timeline.to(prologue, { opacity: 0, duration: 0.6 }, 0.1);

  // Торт плавно уходит
  timeline.to(cake, { opacity: 0, scale: 0.9, duration: 1.0, ease: 'power2.inOut' }, 0.3);
  timeline.to('.cake-halo', { opacity: 0, duration: 0.8 }, 0.3);

  // Письмо целиком плавно появляется (без blur, чтобы не было "резкости" в конце)
  timeline.fromTo(letterWrap,
    { opacity: 0, scale: 0.94, y: 60 },
    { opacity: 1, scale: 1, y: 0, duration: 2.2, ease: 'power2.out' },
    0.8
  );
  timeline.to(letter, { pointerEvents: 'auto' }, 1.2);

  timeline.add(() => {
    createAmbientBurst(cake);
    launchBursts(cake, 40);
  }, 1.4);
}

function setupBlowScene() {
  if (STATE.finale) return;
  STATE.finale = true;

  document.querySelector('.scene').classList.add('is-blown', 'is-dark');
  gsap.to(document.documentElement, { '--camera-scale': 0.94, duration: 1.2, ease: 'power3.inOut' });
  gsap.to(document.documentElement, { '--camera-y': '18px', duration: 1.2, ease: 'power3.inOut' });
  gsap.to('.candle__flame', { opacity: 0, scale: 0, duration: 0.5, stagger: 0.12, ease: 'power2.in' });
  gsap.to(cake, { filter: 'brightness(0.95) drop-shadow(0 0 10px rgba(241, 198, 90, 0.28))', duration: 0.8 });

  // Письмо полностью исчезает
  gsap.to(letterWrap, { opacity: 0, scale: 0.9, y: 40, duration: 1.0, ease: 'power2.inOut' });
  gsap.to(letter, { scale: 0.92, duration: 0.8 });

  // Финальная надпись появляется ПОСЛЕ исчезновения письма
  finale.classList.add('is-visible');
  finale.setAttribute('aria-hidden', 'false');
  finaleMessage.textContent = TEXT.finale;
  gsap.fromTo(finale, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.8, ease: 'power2.out' });

  for (let index = 0; index < 120; index += 1) {
    const spark = document.createElement('span');
    spark.className = 'finale__spark';
    spark.style.left = `${rand(10, 90)}vw`;
    spark.style.top = `${rand(72, 94)}vh`;
    spark.style.opacity = '1';
    spark.style.width = `${rand(2, 4)}px`;
    spark.style.height = spark.style.width;
    finaleSky.appendChild(spark);

    gsap.to(spark, {
      y: rand(-240, -520),
      x: rand(-80, 80),
      opacity: 0,
      scale: rand(1, 2.2),
      duration: rand(2.2, 4.8),
      delay: rand(0, 1.2),
      ease: 'power1.out',
      onComplete: () => spark.remove(),
    });
  }

  setTimeout(() => {
    for (let index = 0; index < 10; index += 1) {
      window.setTimeout(() => launchFirework(), index * 700);
    }
  }, 900);
}

function launchFirework() {
  const originX = rand(window.innerWidth * 0.2, window.innerWidth * 0.8);
  const originY = rand(window.innerHeight * 0.2, window.innerHeight * 0.55);
  const colors = ['#ffd774', '#ffefb6', '#ffb95c', '#f2d48a'];

  for (let index = 0; index < 32; index += 1) {
    const spark = document.createElement('span');
    spark.className = 'finale__spark';
    spark.style.left = `${originX}px`;
    spark.style.top = `${originY}px`;
    spark.style.background = choose(colors);
    spark.style.boxShadow = `0 0 18px ${choose(colors)}`;
    spark.style.width = `${rand(2, 4)}px`;
    spark.style.height = spark.style.width;
    finaleSky.appendChild(spark);

    const angle = (Math.PI * 2 * index) / 32;
    const distance = rand(70, 190);
    gsap.to(spark, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: rand(0.8, 1.6),
      duration: rand(1.2, 2.2),
      ease: 'power2.out',
      onComplete: () => spark.remove(),
    });
  }
}

function bindHoverEffects() {
  const hoverTargets = [cake, blowButton];
  hoverTargets.forEach((element) => {
    element.addEventListener('pointerenter', () => {
      gsap.to(element, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
    });

    element.addEventListener('pointerleave', () => {
      gsap.to(element, { scale: 1, duration: 0.35, ease: 'power2.out' });
    });
  });
}

function bindParallax() {
  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    setRootPosition(cursorX, cursorY);

    if (window.innerWidth < 900) return;

    const xPercent = (event.clientX / window.innerWidth - 0.5) * 2;
    const yPercent = (event.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(document.documentElement, {
      '--camera-x': `${xPercent * -10}px`,
      '--camera-y': `${yPercent * -8}px`,
      duration: 1.1,
      overwrite: true,
      ease: 'power3.out',
    });

    gsap.to('.fog--far', { x: xPercent * -6, duration: 1.4, overwrite: true });
    gsap.to('.fog--mid', { x: xPercent * -12, duration: 1.4, overwrite: true });
    gsap.to('.fog--near', { x: xPercent * -18, duration: 1.4, overwrite: true });
    gsap.to('.lights', { x: xPercent * 10, y: yPercent * 8, duration: 1.4, overwrite: true });
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    gsap.to(document.documentElement, {
      '--camera-x': '0px',
      '--camera-y': '0px',
      duration: 1.2,
      ease: 'power3.out',
    });
  });
}

function bootstrapLenis() {
  if (typeof window.Lenis === 'undefined') return null;

  const lenis = new window.Lenis({
    lerp: 0.08,
    smoothWheel: true,
    smoothTouch: true,
    duration: 1.2,
  });

  function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }

  window.requestAnimationFrame(raf);
  return lenis;
}

function bootSequence() {
  createAtmosphere();
  bindHoverEffects();
  bindParallax();
  bootstrapLenis();

  letterText.textContent = '';
  finaleMessage.textContent = '';
  document.querySelector('.loading-screen__title').textContent = TEXT.loading;
  prologue.querySelector('[data-line="0"]').textContent = TEXT.intro[0];
  prologue.querySelector('[data-line="1"]').textContent = TEXT.intro[1];
  cheerMain.textContent = TEXT.title;
  hint.textContent = TEXT.hint;
  letter.querySelector('.letter__title').textContent = TEXT.letterTitle;
  cake.style.opacity = '0';
  cheerMain.style.opacity = '0';
  hint.style.opacity = '0';
  letterWrap.style.opacity = '0';
  finale.style.opacity = '0';

  const readyTimeline = gsap.timeline({
    onComplete: () => {
      STATE.ready = true;
      setLoadingProgress(100);
      loadingScreen.classList.add('is-hidden');
      app.classList.add('is-visible');
      shapeScene();
    },
  });
  readyTimeline.to(loadingBar, { width: '100%', duration: 2.1, ease: 'power2.inOut' }, 0);
  readyTimeline.to(cake, { opacity: 1, duration: 0.01 }, 0);
  readyTimeline.to(loadingScreen, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 1.7);
  readyTimeline.to(app, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 1.8);
  readyTimeline.add(() => setLoadingProgress(100), 1.85);
}

function initEvents() {
  cake.addEventListener('click', revealLetter);
  cake.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      revealLetter();
    }
  });

  blowButton.addEventListener('click', setupBlowScene);
}

function initCursor() {
  if (window.matchMedia('(pointer: fine)').matches === false) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  gsap.set(cursor, { x: cursorX, y: cursorY });
  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    gsap.to(cursor, { x: cursorX, y: cursorY, duration: 0.16, ease: 'power2.out' });
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    gsap.to(cursor, { scale: 1.35, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 });
  });
}

function simulateLoading() {
  const checkpoints = [12, 24, 36, 48, 60, 72, 84, 92, 100];
  checkpoints.forEach((value, index) => {
    window.setTimeout(() => setLoadingProgress(value), index * 180);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initEvents();
  simulateLoading();
  bootSequence();
});

window.addEventListener('resize', () => {
  setRootPosition(cursorX, cursorY);
});
