// Script para interactividad básica

document.addEventListener('DOMContentLoaded', () => {
    console.log('Documento cargado completamente.');

    // Resaltar el enlace activo en el menú
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Animación al hacer scroll
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => {
        observer.observe(section);
    });
});