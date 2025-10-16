
document.addEventListener('DOMContentLoaded', () => {
  const dials = document.querySelectorAll('.dial');
  const screen = document.querySelector('.panel-screen');

  const messages = [
    { title: 'Über mich', text: 'Bio & Einblicke' },
    { title: 'Projekte', text: 'Arbeiten & Ideen' },
    { title: 'Galerie', text: 'Bilder & Eindrücke' },
    { title: 'Kontakt', text: 'Erreichbarkeit' },
    { title: 'Credits', text: '© b3nn3t' }
  ];

  dials.forEach((dial, i) => {
    dial.addEventListener('click', () => {
      const msg = messages[i];
      screen.innerHTML = `<h3>${msg.title}</h3><p>${msg.text}</p>`;
    });
  });
});
