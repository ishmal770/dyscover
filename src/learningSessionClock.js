let activePage = "home";
let enteredAt = clockNow();

export function clockNow() {
  return Date.now();
}

export function markLearningPage(page) {
  if (activePage === page) return;
  activePage = page;
  enteredAt = clockNow();
}

export function activeLearningDuration(page) {
  return activePage === page ? Math.max(0, clockNow() - enteredAt) : 0;
}

