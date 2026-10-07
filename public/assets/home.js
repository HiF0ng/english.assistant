const preview = document.querySelector('.product-screen');
if (preview) {
  const controls = [...preview.querySelectorAll('[data-preview]')];
  for (const control of controls) control.addEventListener('click', () => {
    for (const item of controls) {
      const selected = item === control;
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(`preview-${item.dataset.preview}`).hidden = !selected;
    }
  });
}
