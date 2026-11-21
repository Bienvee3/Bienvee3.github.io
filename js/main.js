(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.topbar');

    /* ---------- Altura real del header ---------- */
    function syncHeaderOffset() {
        if (header) document.documentElement.style.setProperty('--header-offset', header.offsetHeight + 'px');
    }

    /* ---------- Scrollspy (menú + barra de estado) ---------- */
    const navLinks = Array.from(document.querySelectorAll('.topbar nav a[href^="#"]'));
    const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const sbPath = document.getElementById('sb-path');
    const pathNames = { home: 'inicio', readme: 'README.md', projects: 'proyectos', stack: 'stack.yml', log: 'trayectoria.log', contact: 'contacto' };

    function setActive(id) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        if (sbPath) sbPath.textContent = '~/' + (pathNames[id] || id);
    }

    let ticking = false;
    function updateActive() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const pos = window.scrollY + (header ? header.offsetHeight : 0) + window.innerHeight * 0.25;
            let current = sections.length ? sections[0].id : '';
            for (const s of sections) if (pos >= s.offsetTop) current = s.id;
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            if (atBottom && sections.length) current = sections[sections.length - 1].id;
            if (current) setActive(current);
            ticking = false;
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', () => { syncHeaderOffset(); updateActive(); });
    syncHeaderOffset();
    updateActive();

    /* ---------- Menú móvil ---------- */
    const nav = document.getElementById('menu');
    const toggle = document.querySelector('.menu-toggle');
    function setMenu(open) {
        nav.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        toggle.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('active')));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('active')) { setMenu(false); toggle.focus(); }
    });
    navLinks.forEach(a => a.addEventListener('click', () => { setActive(a.getAttribute('href').slice(1)); setMenu(false); }));

    /* ---------- Entrada al hacer scroll ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }

    /* ---------- Reloj de Zagreb ---------- */
    const clock = document.getElementById('sb-clock');
    if (clock) {
        const fmt = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Zagreb', hour: '2-digit', minute: '2-digit' });
        const tickClock = () => { clock.textContent = 'Zagreb ' + fmt.format(new Date()); };
        tickClock();
        setInterval(tickClock, 15000);
    }

    /* ---------- Copiar email ---------- */
    document.querySelectorAll('.copy-btn').forEach(btn => {
        const label = btn.querySelector('span');
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(btn.dataset.copy);
                btn.classList.add('done');
                label.textContent = 'copiado';
            } catch {
                label.textContent = 'usa Ctrl+C';
            }
            setTimeout(() => { btn.classList.remove('done'); label.textContent = 'copiar'; }, 2000);
        });
    });

    /* ---------- Terminal ---------- */
    const out = document.getElementById('term-out');
    const form = document.getElementById('term-form');
    const input = document.getElementById('term-input');
    const body = document.getElementById('term-body');
    if (!out || !form || !input) return;

    const EMAIL = 'bienvedoalto3@gmail.com';
    const history = [];
    let hIndex = 0;

    // Cada línea es una lista de segmentos: texto plano, {t, c} con clase, o {t, href} enlace.
    function print(lines, cls = 'res') {
        lines.forEach(segs => {
            const div = document.createElement('div');
            div.className = cls;
            (Array.isArray(segs) ? segs : [segs]).forEach(s => {
                if (typeof s === 'string') { div.appendChild(document.createTextNode(s)); return; }
                const el = document.createElement(s.href ? 'a' : 'span');
                el.textContent = s.t;
                if (s.c) el.className = s.c;
                if (s.href) {
                    el.href = s.href;
                    if (/^https?:/.test(s.href)) { el.target = '_blank'; el.rel = 'noopener'; }
                }
                div.appendChild(el);
            });
            out.appendChild(div);
        });
        body.scrollTop = body.scrollHeight;
    }

    function echo(cmd) {
        print([[{ t: 'bienve@zagreb', c: 'p-user' }, { t: ':~$ ', c: 'p' }, cmd]], 'cmd');
    }

    function goTo(id) {
        const el = document.getElementById(id);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 350);
    }

    const sectionAlias = {
        readme: 'readme', 'readme.md': 'readme', proyectos: 'projects', stack: 'stack', 'stack.yml': 'stack',
        trayectoria: 'log', 'trayectoria.log': 'log', contacto: 'contact', '~': 'home', '..': 'home'
    };

    const commands = {
        help: () => print([
            'comandos disponibles:',
            [{ t: '  whoami     ', c: 'hl' }, 'quién soy'],
            [{ t: '  proyectos  ', c: 'hl' }, 'lo que he construido'],
            [{ t: '  stack      ', c: 'hl' }, 'tecnologías que uso'],
            [{ t: '  contacto   ', c: 'hl' }, 'cómo hablar conmigo'],
            [{ t: '  cv         ', c: 'hl' }, 'descargar currículum'],
            [{ t: '  ls · cd    ', c: 'hl' }, 'navegar por la página'],
            [{ t: '  clear      ', c: 'hl' }, 'limpiar la terminal']
        ]),
        whoami: () => print([
            [{ t: 'Bienvenido Doalto', c: 'hl' }],
            'Estudiante de 3.º de Ingeniería Informática (UEA)',
            'Erasmus en Algebra Bernays University · Zagreb',
            'Backend · web · sistemas · ciberseguridad'
        ]),
        proyectos: () => {
            print([
                [{ t: 'P-01 ', c: 'hl' }, { t: 'SportsLeagueManagement', href: 'https://github.com/Bienvee3/SportsLeagueManagement' }, '  java · spring boot'],
                [{ t: 'P-02 ', c: 'hl' }, { t: 'AgentManager', href: 'https://github.com/Bienvee3/AgentManager' }, '  python · fastapi'],
                [{ t: 'P-03 ', c: 'hl' }, { t: 'Benchmarks-VM-vs-Docker', href: 'https://github.com/Bienvee3/Benchmarks-VM-vs-Docker' }, '  docker · bash']
            ]);
            goTo('projects');
        },
        stack: () => {
            print([
                [{ t: 'lenguajes: ', c: 'hl' }, 'java, python, javascript, c/c++, sql, bash'],
                [{ t: 'backend:   ', c: 'hl' }, 'spring boot, fastapi, websockets'],
                [{ t: 'datos:     ', c: 'hl' }, 'postgresql, modelo relacional'],
                [{ t: 'infra:     ', c: 'hl' }, 'docker, linux, virtualbox, vmware']
            ]);
        },
        contacto: () => {
            print([
                [{ t: 'email     ', c: 'hl' }, { t: EMAIL, href: 'mailto:' + EMAIL }],
                [{ t: 'linkedin  ', c: 'hl' }, { t: 'in/bienvenidodoalto', href: 'https://www.linkedin.com/in/bienvenidodoalto' }],
                [{ t: 'github    ', c: 'hl' }, { t: 'Bienvee3', href: 'https://github.com/Bienvee3' }]
            ]);
            goTo('contact');
        },
        cv: () => {
            print(['descargando cv_bienvenido_doalto.pdf ...']);
            const a = document.createElement('a');
            a.href = 'cv_bienvenido_doalto.pdf';
            a.download = '';
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
        github: () => { print(['abriendo github.com/Bienvee3 ...']); window.open('https://github.com/Bienvee3', '_blank', 'noopener'); },
        ls: () => print([[{ t: 'README.md  proyectos/  stack.yml  trayectoria.log  contacto/  cv.pdf', c: 'res' }]]),
        pwd: () => print(['/home/bienve']),
        date: () => print([new Date().toLocaleString('es-ES', { timeZone: 'Europe/Zagreb' }) + ' (Zagreb)']),
        echo: args => print([args.join(' ')]),
        clear: () => { out.textContent = ''; },
        sudo: () => print([[{ t: 'bienve no está en el archivo sudoers. Este incidente será reportado. ;)', c: 'err' }]]),
        exit: () => print(['no tan rápido: aún quedan proyectos por ver.'])
    };
    commands.projects = commands.proyectos;
    commands.contact = commands.contacto;
    commands.about = commands.whoami;
    commands['?'] = commands.help;

    function nav2(target) {
        const id = sectionAlias[(target || '').replace(/\/$/, '').toLowerCase()];
        if (!id) return false;
        goTo(id);
        return true;
    }
    commands.cd = args => {
        if (!args.length) { goTo('home'); return; }
        if (!nav2(args[0])) print([[{ t: 'cd: ' + args[0] + ': no existe el directorio', c: 'err' }]]);
    };
    commands.cat = args => {
        if (!args.length) { print([[{ t: 'uso: cat <archivo>', c: 'err' }]]); return; }
        if (args[0].toLowerCase() === 'readme.md') { print(['abriendo README.md ...']); goTo('readme'); return; }
        if (!nav2(args[0])) print([[{ t: 'cat: ' + args[0] + ': no existe el archivo', c: 'err' }]]);
    };

    function run(raw) {
        const line = raw.trim();
        echo(line);
        if (!line) return;
        history.push(line);
        hIndex = history.length;
        const [name, ...args] = line.split(/\s+/);
        const fn = commands[name.toLowerCase()];
        if (fn) fn(args);
        else print([[{ t: 'comando no encontrado: ' + name + '. Prueba ', c: 'err' }, { t: 'help', c: 'hl' }]]);
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        run(input.value);
        input.value = '';
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault();
            hIndex = Math.max(0, hIndex - 1);
            input.value = history[hIndex];
        } else if (e.key === 'ArrowDown' && history.length) {
            e.preventDefault();
            hIndex = Math.min(history.length, hIndex + 1);
            input.value = history[hIndex] || '';
        } else if (e.key === 'Tab' && input.value) {
            const match = Object.keys(commands).find(c => c.startsWith(input.value.toLowerCase()));
            if (match) { e.preventDefault(); input.value = match; }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            commands.clear();
        }
    });

    // Click en la terminal enfoca el input (sin robar selecciones de texto)
    body.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        if (!window.getSelection().toString()) input.focus({ preventScroll: true });
    });

    document.querySelectorAll('.term-chips button').forEach(b => {
        b.addEventListener('click', () => run(b.dataset.cmd));
    });

    // Arranque: escribe "whoami" como si alguien lo tecleara
    function boot() {
        print([[{ t: 'Last login: ' + new Date().toLocaleDateString('es-ES') + ' desde bienvee3.github.io', c: 'p' }]]);
        if (reduceMotion) {
            run('whoami');
            print([[{ t: 'escribe ', c: 'p' }, { t: 'help', c: 'hl' }, { t: ' para ver los comandos', c: 'p' }]]);
            return;
        }
        const word = 'whoami';
        let i = 0;
        input.value = '';
        const timer = setInterval(() => {
            if (document.activeElement === input) { clearInterval(timer); input.value = ''; return; }
            input.value = word.slice(0, ++i);
            if (i === word.length) {
                clearInterval(timer);
                setTimeout(() => {
                    if (input.value !== word) return;
                    input.value = '';
                    run(word);
                    print([[{ t: 'escribe ', c: 'p' }, { t: 'help', c: 'hl' }, { t: ' o pulsa un comando de abajo', c: 'p' }]]);
                }, 380);
            }
        }, 110);
    }
    setTimeout(boot, 650);
})();
