// Script para interactividad básica

document.addEventListener('DOMContentLoaded', () => {
    console.log('Documento cargado completamente.');

    // Ejemplo: Resaltar el enlace activo en el menú
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});