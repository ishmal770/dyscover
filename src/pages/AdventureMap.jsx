// The adventure map: one scrolling lesson path with Unit 1 (Jungle Games)
// followed by Unit 2 (Canopy Quest). Each circle is a lesson (a game).
import LessonPath from "../components/LessonPath";

function AdventureMap({ onHome, onStartLesson }) {
  return (
    <LessonPath
      onHome={onHome}
      onStartLesson={onStartLesson}
      guideMessage="Welcome to the Adventure Map! Follow the path and tap the glowing circle to start your next lesson."
      guideInstructions="This is your adventure map. Each circle is a lesson. Finish one to open the next. Tap the glowing circle, then press Start. Tap the logo to go back home."
    />
  );
}

export default AdventureMap;
