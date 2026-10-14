/**
 * Smoothly scrolls to an element by its ID, accounting for sticky navbar height.
 */
export const scrollToElement = (elementId: string) => {
  const cleanId = elementId.replace(/^#/, '');
  const el = document.getElementById(cleanId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
