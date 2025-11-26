import reducer, {
    toggleCollapsedNav,
    onNavStyleChange,
    onLocaleChange,
    onNavTypeChange,
    onTopNavColorChange,
    onHeaderNavColorChange,
    onMobileNavToggle,
    onSwitchTheme,
    onDirectionChange,
    onBlankLayout,
} from "../../../src/store/slices/themeSlice";

import { initialState } from "../../../src/store/slices/themeSlice";
import { THEME_CONFIG } from "configs/AppConfig";

describe("themeSlice", () => {
    // -----------------------------------
    // Initial State
    // -----------------------------------
    test("should return initial state correctly", () => {
        expect(reducer(undefined, { type: "@@INIT" })).toEqual(THEME_CONFIG);
    });

    // Utility function for cleaner reducer tests
    const applyAction = (action, state = initialState) => reducer(state, action);

    // -----------------------------------
    // Reducer Tests
    // -----------------------------------
    test("toggleCollapsedNav should update navCollapsed", () => {
        const result = applyAction(toggleCollapsedNav(true));
        expect(result.navCollapsed).toBe(true);
    });

    test("onNavStyleChange should update sideNavTheme", () => {
        const result = applyAction(onNavStyleChange("dark"));
        expect(result.sideNavTheme).toBe("dark");
    });

    test("onLocaleChange should update locale", () => {
        const result = applyAction(onLocaleChange("fr"));
        expect(result.locale).toBe("fr");
    });

    test("onNavTypeChange should update navType", () => {
        const result = applyAction(onNavTypeChange("top"));
        expect(result.navType).toBe("top");
    });

    test("onTopNavColorChange should update topNavColor", () => {
        const result = applyAction(onTopNavColorChange("#ff0000"));
        expect(result.topNavColor).toBe("#ff0000");
    });

    test("onHeaderNavColorChange should update headerNavColor", () => {
        const result = applyAction(onHeaderNavColorChange("#00ff00"));
        expect(result.headerNavColor).toBe("#00ff00");
    });

    test("onMobileNavToggle should update mobileNav", () => {
        const result = applyAction(onMobileNavToggle(true));
        expect(result.mobileNav).toBe(true);
    });

    test("onSwitchTheme should update currentTheme", () => {
        const result = applyAction(onSwitchTheme("dark"));
        expect(result.currentTheme).toBe("dark");
    });

    test("onDirectionChange should update direction", () => {
        const result = applyAction(onDirectionChange("rtl"));
        expect(result.direction).toBe("rtl");
    });

    test("onBlankLayout should update blankLayout", () => {
        const result = applyAction(onBlankLayout(true));
        expect(result.blankLayout).toBe(true);
    });
});
