let activePage = "home";
let enteredAt = Date.now();

export function markLearningPage(page) {
  if (activePage === page) return;
  activePage = page;
  enteredAt = Date.now();
}

export function activeLearningDuration(page) {
  return activePage === page ? Math.max(0, Date.now() - enteredAt) : 0;
}

