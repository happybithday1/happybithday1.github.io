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

// Флаг мобильного устройства — определяем один раз при старте
const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

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
  const classes = className.split(' ').filter(Boolean);
  for (let index = 0; index < count; index += 1) {
    const element = factory(index);
    element.classList.add(...classes);
    container.appendChild(element);
  }
}

function createAtmosphere() {
  const starsContainer = document.querySelector('.sky.stars');

  // На мобиле — меньше звёзд, без тяжёлых теней
  const starCount      = isMobile ? 20  : 60;
  const tinyStarCount  = isMobile ? 30  : 120;
  const fireflyCount   = isMobile ? 8   : 35;

  // Основной звёздный слой
  buildAtmosphereLayer(starsContainer, 'star', starCount, () => {
    const star = document.createElement('span');
    const size = rand(1, 3);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${rand(0, 100)}%`;
    star.style.top = `${rand(0, 100)}%`;
    star.style.opacity = `${rand(0.2, 0.7)}`;
    star.style.position = 'absolute';
    star.style.borderRadius = '50%';
    star.style.background = '#fff';
    if (!isMobile) {
      star.style.boxShadow = `0 0 ${rand(2, 5)}px rgba(255,240,200,0.8)`;
    }
    star.style.pointerEvents = 'none';

    gsap.to(star, {
      opacity: rand(0.5, 1),
      duration: rand(isMobile ? 5 : 2, isMobile ? 12 : 6),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: rand(0, 5)
    });
    return star;
  });

  // Мелкие звёзды — на мобиле статичные (без GSAP-твина)
  buildAtmosphereLayer(starsContainer, 'star star--tiny', tinyStarCount, () => {
    const star = document.createElement('span');
    const size = rand(0.5, 1.5);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${rand(0, 100)}%`;
    star.style.top = `${rand(0, 100)}%`;
    star.style.opacity = `${rand(0.1, 0.45)}`;
    star.style.position = 'absolute';
    star.style.borderRadius = '50%';
    star.style.background = 'rgba(255, 240, 210, 0.9)';
    star.style.pointerEvents = 'none';

    if (!isMobile) {
      gsap.to(star, {
        opacity: rand(0.3, 0.7),
        duration: rand(3, 8),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: rand(0, 8)
      });
    }
    return star;
  });

  // Светлячки — на мобиле без mixBlendMode и boxShadow, без летящей петли
  buildAtmosphereLayer(particles, 'firefly', fireflyCount, () => {
    const firefly = document.createElement('span');
    const size = rand(3, 8);
    firefly.style.width = `${size}px`;
    firefly.style.height = `${size}px`;
    firefly.style.left = `${rand(2, 98)}%`;
    firefly.style.top = `${rand(5, 95)}%`;
    firefly.style.opacity = `${rand(0.4, 0.8)}`;
    firefly.style.background = 'radial-gradient(circle, rgba(255, 240, 160, 1) 0 20%, rgba(255, 230, 120, 0.6) 45%, transparent 75%)';
    if (!isMobile) {
      firefly.style.boxShadow = `0 0 ${rand(6, 15)}px rgba(255, 220, 80, 0.9)`;
      firefly.style.mixBlendMode = 'screen';
    }
    firefly.style.zIndex = '50';

    // Пульсация — на мобиле реже
    gsap.to(firefly, {
      opacity: rand(0.6, 1),
      scale: rand(1.1, 1.6),
      duration: rand(isMobile ? 3 : 1.5, isMobile ? 7 : 4),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: rand(0, 4)
    });

    // Полёт — только на десктопе
    if (!isMobile) {
      function fly() {
        const xMove = rand(-window.innerWidth * 0.25, window.innerWidth * 0.25);
        const yMove = rand(-window.innerHeight * 0.2, window.innerHeight * 0.2);
        gsap.to(firefly, {
          x: `+=${xMove}`,
          y: `+=${yMove}`,
          duration: rand(12, 25),
          ease: 'sine.inOut',
          onComplete: fly
        });
      }
      setTimeout(fly, rand(0, 3000));
    }

    return firefly;
  });

  // Зеленые лепестки (листья) удалены по просьбе пользователя
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
    // На мобиле анимация blur пропущена — дорогая операция для GPU
    const props = {
      opacity: 1,
      y: index === 1 ? -150 : 0,
      duration: 0.9,
      ease: 'power3.out'
    };
    if (!isMobile) props.filter = 'blur(0px)';
    timeline.to(line, props, index === 0 ? 0 : '+=0.95');
    timeline.to(line, { opacity: 0.88, duration: 1.2 }, '+=1.0');
  });
  return timeline;
}

function shapeScene() {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

  timeline.to(document.documentElement, { '--camera-scale': 1.0, duration: 1.1 }, 0);
  timeline.to(document.documentElement, { '--camera-y': '-12px', duration: 1.1 }, 0);
  timeline.to(prologue, { opacity: 1, duration: 0.4 }, 0.1);
  timeline.add(showPrologue(TEXT.intro), 0.2);
  timeline.to(prologue, { opacity: 0, duration: 0.8 }, '+=0.5');
  timeline.to(document.documentElement, { '--camera-scale': 0.82, duration: 1.8 }, '>-0.2');
  timeline.to(document.documentElement, { '--camera-y': '10px', duration: 1.8 }, '<');
  timeline.to(document.documentElement, { '--camera-x': '0px', duration: 1.8 }, '<');
  timeline.to(hint, { opacity: 1, y: 0, duration: 1 }, '+=0.2');
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
  // camera-scale при письме убран - письмо теперь fixed
  // camera-y при письме убран
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
    launchBursts(cake, isMobile ? 15 : 40);
  }, 1.4);
}

function setupBlowScene() {
  if (STATE.finale) return;
  STATE.finale = true;

  document.querySelector('.scene').classList.add('is-blown', 'is-dark');
  gsap.to(document.documentElement, { '--camera-scale': 1.0, duration: 1.2, ease: 'power3.inOut' });
  gsap.to(document.documentElement, { '--camera-y': '18px', duration: 1.2, ease: 'power3.inOut' });
  gsap.to('.candle__flame', { opacity: 0, scale: 0, duration: 0.5, stagger: 0.12, ease: 'power2.in' });
  gsap.to(cake, { filter: 'brightness(0.95) drop-shadow(0 0 10px rgba(241, 198, 90, 0.28))', duration: 0.8 });

  // Убиваем возможные конфликтующие анимации письма и отключаем клики
  gsap.killTweensOf([letterWrap, letter]);
  gsap.set(letterWrap, { pointerEvents: 'none' });

  // Письмо полностью исчезает
  gsap.to(letterWrap, { opacity: 0, scale: 0.9, y: 40, duration: 1.0, ease: 'power2.inOut' });
  gsap.to(letter, { scale: 0.92, duration: 0.8 });

  // Финальная надпись появляется ПОСЛЕ исчезновения письма
  finale.classList.add('is-visible');
  finale.setAttribute('aria-hidden', 'false');
  finaleMessage.textContent = TEXT.finale;

  // Строгая очередь для надписей
  const textSeq = gsap.timeline();

  // 1. Появляется "Этот день принадлежит только тебе"
  textSeq.to(cheerMain, { opacity: 1, duration: 1.2, ease: 'power2.out' }, '+=1.0');

  // 2. Висит и исчезает
  textSeq.to(cheerMain, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, '+=2.8');

  // 3. Появляется "С Днем Рождения!"
  textSeq.to(finale, { opacity: 1, duration: 1.2, ease: 'power2.out' }, '+=0.4');

  // 4. Висит и исчезает (а затем выстраиваются светлячки)
  textSeq.to(finale, { opacity: 0, duration: 2.0, ease: 'power2.inOut', onComplete: formFireflyText }, '+=3.5');

  // Скрываем торт с тенью, чтобы экран был полностью чистым для светлячков
  textSeq.to(document.getElementById('centerStage'), { opacity: 0, duration: 2.0, ease: 'power2.inOut' }, '<');

  const bottomSparkCount = isMobile ? 40 : 120;
  for (let index = 0; index < bottomSparkCount; index += 1) {
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
    function fireworkWave() {
      // На мобиле — меньше фейерверков, реже
      const count = Math.floor(rand(isMobile ? 2 : 5, isMobile ? 4 : 10));
      for (let index = 0; index < count; index += 1) {
        window.setTimeout(() => launchFirework(), index * (isMobile ? 1100 : 700));
      }
      setTimeout(fireworkWave, rand(isMobile ? 5000 : 3000, isMobile ? 8000 : 4500));
    }
    fireworkWave();
  }, 900);
}

function formFireflyText() {
  const text = "Для Айши";
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const fontSize = Math.min(w * 0.22, 140);
  ctx.font = `bold ${fontSize}px "Cormorant Garamond", serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 - 20); // slightly above center

  const data = ctx.getImageData(0, 0, w, h).data;
  const points = [];
  // На мобиле — более редкая сетка, меньше точек
  const step = isMobile
    ? Math.max(Math.floor(w / 130), 6)
    : Math.max(Math.floor(w / 280), 3);

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      if (data[idx] > 100) {
        points.push({ x: x + rand(-0.5, 0.5), y: y + rand(-0.5, 0.5) });
      }
    }
  }

  points.sort(() => Math.random() - 0.5);
  const maxPoints = isMobile ? 150 : 500;
  if (points.length > maxPoints) points.length = maxPoints;

  const fireflies = Array.from(document.querySelectorAll('.firefly'));

  while (fireflies.length < points.length) {
    const firefly = document.createElement('span');
    firefly.className = 'firefly';
    const size = rand(3, 8);
    firefly.style.width = `${size}px`;
    firefly.style.height = `${size}px`;
    firefly.style.left = `${rand(0, 100)}%`;
    firefly.style.top = `${rand(0, 100)}%`;
    firefly.style.opacity = '0';
    firefly.style.background = 'radial-gradient(circle, rgba(255, 240, 160, 1) 0 20%, rgba(255, 230, 120, 0.6) 45%, transparent 75%)';
    firefly.style.boxShadow = `0 0 ${rand(6, 15)}px rgba(255, 220, 80, 0.9)`;
    firefly.style.mixBlendMode = 'screen';
    firefly.style.zIndex = '50';
    particles.appendChild(firefly);
    fireflies.push(firefly);
  }

  points.forEach((pt, i) => {
    const f = fireflies[i];
    gsap.killTweensOf(f);
    gsap.to(f, {
      left: `${pt.x}px`,
      top: `${pt.y}px`,
      x: 0,
      y: 0,
      opacity: rand(0.6, 1),
      scale: rand(0.4, 0.8),
      duration: rand(3.5, 6.0),
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.to(f, {
          y: rand(-1.5, 1.5),
          x: rand(-1.5, 1.5),
          opacity: rand(0.6, 1),
          duration: rand(1.5, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });
  });

  for (let i = points.length; i < fireflies.length; i++) {
    gsap.killTweensOf(fireflies[i]);
    gsap.to(fireflies[i], { opacity: 0, duration: 2, onComplete: () => fireflies[i].remove() });
  }
}

function launchFirework() {
  const originX = rand(window.innerWidth * 0.2, window.innerWidth * 0.8);
  const originY = rand(window.innerHeight * 0.2, window.innerHeight * 0.55);
  const colors = ['#ffd774', '#ffefb6', '#ffb95c', '#f2d48a'];
  const particleCount = isMobile ? 14 : 32;

  for (let index = 0; index < particleCount; index += 1) {
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
  // Wiggle при наведении на торт
  cake.addEventListener('pointerenter', () => {
    gsap.to(cake, { rotation: 2, duration: 0.12, ease: 'power1.out', yoyo: true, repeat: 5, onComplete: () => gsap.set(cake, { rotation: 0 }) });
    gsap.to(cake, { scale: 1.05, duration: 0.25, ease: 'power2.out' });
  });
  cake.addEventListener('pointerleave', () => {
    gsap.to(cake, { scale: 1, duration: 0.35, ease: 'power2.out' });
  });

  // Обычный scale для кнопки задуть
  blowButton.addEventListener('pointerenter', () => {
    gsap.to(blowButton, { scale: 1.05, duration: 0.25, ease: 'power2.out' });
  });
  blowButton.addEventListener('pointerleave', () => {
    gsap.to(blowButton, { scale: 1, duration: 0.35, ease: 'power2.out' });
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
