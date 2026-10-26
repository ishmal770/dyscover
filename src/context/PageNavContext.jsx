// Lets the top bars on every page jump to another page of the game strip (e.g. the Adventure Map).
// Outside the strip (the backpack and dashboards) there is no provider, so they go back to the app.
import { createContext, useContext } from "react";

export const PageNavContext = createContext(null);

export const usePageNav = () => useContext(PageNavContext);
