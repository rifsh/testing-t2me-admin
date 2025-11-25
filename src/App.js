import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import store from "./store";
import history from "./history";
import Layouts from "./layouts";
import { THEME_CONFIG } from "./configs/AppConfig";
// import "./lang";
import mockServer from "./mock";
import { getCurrentUser } from "configs/UserAccessConfig";

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

const environment = process.env.NODE_ENV;

if (environment !== "production") {
  mockServer({ environment });
}

// Clear all caches on app load
const clearAllCaches = async () => {
  try {
    // Clear all Cache Storage
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("All caches cleared");
    }

    // Clear Service Worker caches and unregister
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );
      console.log("Service workers unregistered");
    }

    // Clear Session Storage
    sessionStorage.clear();
    console.log("Session storage cleared");

  } catch (error) {
    console.error("Error clearing caches:", error);
  }
};

function App() {
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Clear caches on first load
    clearAllCaches();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="App">
      <Provider store={store}>
        <BrowserRouter history={history}>
          <ThemeSwitcherProvider
            themeMap={themes}
            defaultTheme={THEME_CONFIG.currentTheme}
            insertionPoint="styles-insertion-point"
          >
            <Layouts />
          </ThemeSwitcherProvider>
        </BrowserRouter>
      </Provider>
    </div>
  );
}

export default App;

// "test:coverage": "jest --coverage",
// "test:ci": "jest --coverage --runInBand"