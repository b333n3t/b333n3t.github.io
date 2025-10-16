
document.addEventListener('DOMContentLoaded', () => {
  const dials = document.querySelectorAll('.dial');
  const screen = document.querySelector('.panel-screen');

  const labels = [
    { title: 'Über mich', text: 'Bio & Einblicke' },
    { title: 'Projekte', text: 'Arbeiten & Ideen' },
    { title: 'Galerie', text: 'Bilder & Eindrücke' },
    { title: 'Kontakt', text: 'Erreichbarkeit' },
    { title: 'Credits', text: '© b3nn3t' }
  ];

  dials.forEach((dial, idx) => {
    dial.addEventListener('click', () => {
      const { title, text } = labels[idx] || {};
      screen.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
    });
  });
});
