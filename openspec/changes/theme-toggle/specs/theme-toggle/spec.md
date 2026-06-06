## ADDED Requirements

### Requirement: Theme mode can be switched between light and dark

The system SHALL allow users to switch between light mode and dark mode. The theme mode SHALL be independent of the color theme (blue/rose/sunset, etc.).

#### Scenario: User switches to dark mode

- **WHEN** user clicks the dark mode toggle in ThemeSwitcher
- **THEN** system adds `dark` class to `<html>` element
- **AND** all components with `dark:` styles respond to dark mode
- **AND** theme mode preference is persisted to localStorage

#### Scenario: User switches to light mode

- **WHEN** user clicks the light mode toggle in ThemeSwitcher
- **THEN** system removes `dark` class from `<html>` element
- **AND** all components display light mode styles
- **AND** theme mode preference is persisted to localStorage

#### Scenario: Theme preference persists across sessions

- **WHEN** user selects dark mode and closes the browser
- **AND** user opens the application again
- **THEN** system SHALL restore dark mode preference from localStorage
- **AND** page renders in dark mode immediately

### Requirement: Dark mode has consistent styling

The system SHALL render dark mode with consistent low-brightness colors that reduce eye strain.

#### Scenario: Dark mode applies to card components

- **WHEN** dark mode is active
- **THEN** FlashCard background becomes dark surface color
- **AND** text becomes light colored for readability
- **AND** borders become subtle for contrast

#### Scenario: Dark mode applies to UI components

- **WHEN** dark mode is active
- **THEN** buttons, badges, and inputs use dark mode color scheme
- **AND** modal backgrounds use dark overlay

### Requirement: Theme mode toggle is accessible

The system SHALL provide a visible and accessible theme mode toggle in the ThemeSwitcher component.

#### Scenario: Theme mode toggle is visible in header

- **WHEN** user views the application header
- **THEN** user can see a theme mode toggle control
- **AND** current mode (light/dark) is indicated visually

#### Scenario: Theme mode can be toggled via keyboard

- **WHEN** user navigates to theme mode toggle with keyboard (Tab)
- **THEN** user can activate toggle with Enter or Space key