# Mecenate Publications Feed App

This is a mobile application developed as a test assignment for Mecenate. It displays a feed of publications with infinite scrolling, pull-to-refresh, and support for paid content.

---

### Переменные окружения

Для работы приложения необходимо настроить переменные окружения. Создайте файл `.env` в корне проекта, скопировав содержимое из `.env.example`:

```bash
cp .env.example .env
```

**Доступные переменные:**
- `EXPO_PUBLIC_API_URL`: Базовый URL API (например, `https://k8s.mectest.ru/test-app`).
- `EXPO_PUBLIC_API_TOKEN`: Токен для авторизации в Slack/WebSocket (по умолчанию `550e8400-e29b-41d4-a716-446655440000`).

### Как запустить

1. **Установите зависимости:**
   ```bash
   npm install
   ```
2. **Запустите Expo сервер:**
   ```bash
   npm start
   ```
   Или для конкретной платформы:
   - `npm run ios` — для запуска в симуляторе iOS.
   - `npm run android` — для запуска в эмуляторе Android.

3. **Просмотр:**
   - Используйте приложение **Expo Go** на смартфоне, отсканировав QR-код из терминала.
   - Или нажмите **i** (iOS) / **a** (Android) прямо в терминале после запуска.

---

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [MobX](https://mobx.js.org/) (Client state) & [React Query](https://tanstack.com/query/latest) (Server state)
- **Networking**: [Axios](https://axios-http.com/)
- **Styling**: Vanilla StyleSheet with Design Tokens
- **Icons**: [Lucide React Native](https://lucide.dev/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

## Features

- **Infinite Scroll**: Cursor-based pagination using React Query's `useInfiniteQuery`.
- **Pull-to-Refresh**: Refresh the feed by pulling down the list.
- **Paid Content**: Blurred placeholder for posts with a "paid" tier and empty body.
- **Error Handling**: Custom error screen with a "Retry" button.
- **Optimistic Likes**: Instant UI feedback when liking a post, with automatic rollback on failure.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your mobile device (optional, for testing on real device)

### Installation

1. Clone the repository (or navigate to the project directory).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Review and update variables if needed:
     ```bash
     cp .env.example .env
     ```

### Running the App

Start the Expo development server:
```bash
npx expo start
```

- Press **i** for iOS simulator (macOS only).
- Press **a** for Android emulator.
- Scan the QR code with the **Expo Go** app to run on a physical device.

## Design

The application follows the provided Figma design, utilizing a custom theme system (`src/theme/theme.ts`) to ensure consistency in colors, spacing, and typography.
