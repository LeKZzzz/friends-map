# 🗺️ Friends Map

[中文](README.md) | [English](#project-overview)

## 🌟 Project Overview

**Friends Map** is a dynamic web application built with React and TypeScript that helps users visualize the distribution of friends on world maps and China maps. It supports precise positioning based on countries, provinces, cities, and detailed addresses.

**Light Mode**

![World Map - Light](image/preview-world-light.png)

![China Map - Light](image/preview-china-light.png)

**Dark Mode**

![World Map - Dark](image/preview-world-dark.png)

![China Map - Dark](image/preview-china-dark.png)

## ✨ Features

### Map & Navigation
- 🌍 **World Map / China Map**: One-click switch between global view and detailed China view
- 📍 **Marker Clustering**: Nearby friends are automatically grouped into clusters; click to expand, spiderfy on max zoom
- 🎯 **flyTo Navigation**: Click a friend in the sidebar to fly to their location with a highlight animation
- 🔗 **Filter Sync**: Sidebar search/filter syncs with map markers; unmatched markers fade out

### Search & Filter
- 🔍 **Live Search**: Fuzzy search by name, city, province, address (debounced)
- 📍 **Region Filter**: Dropdown filter by province with friend counts
- 🏷️ **Tag Groups**: Custom tags (classmate, coworker, etc.) for filtering friends

### Data Management
- 📤 **Export JSON**: One-click export friends data as a JSON file
- 📥 **Import JSON**: Import JSON with format validation, auto-persist to localStorage
- 📊 **Stats Panel**: Friend count, province/city coverage, Top 10 rankings

### Theme & Appearance
- 🌙 **Light / Dark / System**: Three theme modes driven by CSS custom properties
- 📱 **Mobile Responsive**: Swipe to open/close sidebar, friend details as bottom sheet
- 👤 **Gravatar Avatars**: Uses Gravatar monsterid as default avatars

### Accessibility & Shortcuts
- ♿ **Keyboard Navigation**: Tab through friend list, Enter to locate, arrow keys in dropdowns
- 🎹 **Keyboard Shortcuts**: `M` toggle map, `F` focus search, `,` open settings, `?` show help
- 🗣️ **ARIA Support**: Focus trap in modals, dialog roles, marker aria-labels
- 🔤 **IME Compatible**: Shortcuts are disabled during IME composition input

### Sharing
- 📤 **Friend Sharing**: Native Web Share API with clipboard copy fallback

## 🛠️ Tech Stack

- ⚛️ **React 18 + TypeScript**: Modern frontend framework
- 🗺️ **Leaflet / React-Leaflet**: Open-source mapping library
- 🧩 **react-leaflet-cluster**: Marker clustering
- 🌐 **OpenStreetMap**: Open-source map tiles

## 📁 Project Structure

```
friends-map
├── src
│   ├── components
│   │   ├── MapView.tsx           # 🗺️ Unified map component (clustering + filter sync + highlight)
│   │   ├── FriendInfo.tsx        # 💬 Friend detail popup (share + focus trap)
│   │   ├── FriendItem.tsx        # 📋 Friend list item (keyboard support)
│   │   ├── CustomSelect.tsx      # 📝 Custom dropdown (arrow key nav + ARIA)
│   │   ├── SettingsPanel.tsx     # ⚙️ Settings panel (theme + preferences)
│   │   ├── StatsPanel.tsx        # 📊 Stats panel (rankings)
│   │   ├── DataManager.tsx       # 💾 Import/Export component
│   │   └── ErrorBoundary.tsx     # 🛡️ Error boundary
│   ├── hooks
│   │   ├── useTheme.ts           # 🎨 Theme hook (light/dark/system)
│   │   ├── useFriends.ts         # 🔍 Friend filter hook (search + region + tags)
│   │   ├── useMapNavigation.ts   # 🧭 Map navigation hook (flyTo)
│   │   ├── useKeyboardShortcuts.ts # 🎹 Keyboard shortcuts (IME compatible + help panel)
│   │   ├── useFocusTrap.ts       # ♿ Focus trap hook
│   │   ├── useStorage.ts         # 💾 localStorage/sessionStorage hook
│   │   ├── useDebounce.ts        # ⏱️ Debounce hook
│   │   └── usePerformance.ts     # 📈 Performance monitoring hook
│   ├── data
│   │   ├── friends.json          # 📊 Friends data (excluded by .gitignore)
│   │   └── friends.example.json  # 📋 Data template
│   ├── types
│   │   └── index.ts              # 🔤 TypeScript type definitions
│   ├── utils
│   │   └── mapUtils.ts           # 🔧 Map utility functions
│   ├── App.tsx                   # 🏠 Main application component
│   ├── App.css                   # 🎨 Global styles (CSS variable themes)
│   └── index.tsx                 # 🚀 Application entry point
├── public
│   └── index.html                # 📝 HTML template
├── package.json                  # 📦 Project configuration and dependencies
├── tsconfig.json                 # ⚙️ TypeScript configuration
└── README.md                     # 📖 Project documentation
```

## 🚀 Quick Start

1. 📥 Clone the repository:
   ```bash
   git clone https://github.com/LeKZzzz/friends-map
   ```
2. 📂 Navigate to the project directory:
   ```bash
   cd friends-map
   ```
3. 📦 Install dependencies:
   ```bash
   npm install
   ```
4. 🎉 Start the development server:
   ```bash
   npm start
   ```

## 📋 Usage

### 📊 Data Format

Friends' information is stored in `src/data/friends.json` with the following format:

```json
[
  {
    "id": "1",
    "name": "Zhang San",
    "province": "Beijing",
    "city": "Beijing",
    "address": "Chaoyang District",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "avatar": "https://www.gravatar.com/avatar/1?s=50&d=monsterid&r=pg",
    "description": "Friend from Beijing",
    "tags": ["classmate", "university"]
  }
]
```

### 📝 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Friend's name |
| `province` | string | ✅ | Province/State/Country |
| `city` | string | ✅ | City |
| `address` | string | ❌ | Detailed address |
| `latitude` | number | ✅ | Latitude |
| `longitude` | number | ✅ | Longitude |
| `avatar` | string | ❌ | Avatar URL (defaults to Gravatar) |
| `description` | string | ❌ | Description |
| `tags` | string[] | ❌ | Tags (e.g., "classmate", "coworker") |

### ➕ Adding Friends

- **Manual editing**: Edit `src/data/friends.json` directly
- **Import**: Click the "📥 Import JSON" button in the sidebar to select a formatted JSON file

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `M` | Toggle world/China map |
| `F` | Focus search input |
| `Esc` | Clear search / Close panel |
| `,` | Open settings |
| `?` | Show keyboard shortcuts help |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.

## ⚠️ Disclaimer

When using the Leaflet open-source mapping library in this project:
- 🇨🇳 We support the One China principle, recognizing Taiwan as an inalienable part of the People's Republic of China
- 🕊️ We maintain neutrality in the Ukraine-Russia conflict and do not favor either side
- 🌍 We respect the sovereignty and territorial integrity of all nations and support peaceful dialogue to resolve international disputes

This statement represents only the position of the project maintainers and does not represent the official views of any government or organization.
