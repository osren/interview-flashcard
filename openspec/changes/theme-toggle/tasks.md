## 1. State Management

- [x] 1.1 Add `themeMode` type to `useThemeStore` (light/dark)
- [x] 1.2 Add `setThemeMode` action to store
- [x] 1.3 Update persist storage to include `themeMode`

## 2. Theme Provider

- [x] 2.1 Modify `ThemeProvider` to add/remove `dark` class on `<html>` based on `themeMode`

## 3. Theme Switcher UI

- [x] 3.1 Add light/dark toggle button to `ThemeSwitcher`
- [x] 3.2 Wire up toggle to call `setThemeMode`

## 4. Dark Mode Styles

- [x] 4.1 Add `dark:` styles to `FlashCard` component (background, text, border)
- [x] 4.2 Add `dark:` styles to `Button` component
- [x] 4.3 Add `dark:` styles to `Badge` component
- [x] 4.4 Add `dark:` styles to `Progress` component
- [x] 4.5 Add `dark:` styles to `Header` component
- [x] 4.6 Add `dark:` styles to `Footer` component
- [x] 4.7 Verify all pages render correctly in dark mode