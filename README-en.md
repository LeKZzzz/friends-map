# 🗺️ Friends Map

[中文](README.md) | [English](#project-overview)

## 🌟 Project Overview

**Friends Map** is a dynamic web application built with React and TypeScript that helps users visualize the distribution of friends on world maps and China maps. It supports precise positioning based on countries, provinces, cities, and detailed addresses.

![preview](image/preview.png)

## ✨ Features

- 🌍 **World Map**: Displays global view with friend location markers
- 🇨🇳 **China Map**: Provides detailed China view with specific friend markers
- 📍 **Friend Markers**: Each friend is represented by a map marker showing their location
- 💬 **Friend Information**: Hover markers for brief info, click markers for detailed information
- 📱 **Responsive Design**: Supports desktop and mobile devices
- 👤 **Gravatar Avatars**: Uses Gravatar monsterid as default avatars

## 🛠️ Tech Stack

- ⚛️ **React + TypeScript**: Modern frontend framework
- 🗺️ **Leaflet**: Open-source mapping library
- 🔧 **React-Leaflet**: React wrapper for Leaflet
- 🌐 **OpenStreetMap**: Open-source map data

## 📁 Project Structure

```
friends-map
├── src
│   ├── components
│   │   ├── WorldMap.tsx          # 🌍 World map component
│   │   ├── ChinaMap.tsx          # 🇨🇳 China map component
│   │   ├── FriendMarker.tsx      # 📍 Friend marker component
│   │   └── FriendInfo.tsx        # 💬 Friend info popup component
│   ├── data
│   │   └── friends.json          # 📊 Friends data
│   ├── types
│   │   ├── index.ts             # 🔤 TypeScript type definitions
│   │   └── json.d.ts            # 📄 JSON module type declarations
│   ├── utils
│   │   └── mapUtils.ts          # 🔧 Map utility functions
│   ├── App.tsx                  # 🏠 Main application component
│   ├── App.css                  # 🎨 Application styles
│   ├── index.tsx                # 🚀 Application entry point
│   └── index.css                # 🌐 Global styles
├── public
│   └── index.html               # 📝 HTML template
├── package.json                 # 📦 Project configuration and dependencies
├── tsconfig.json               # ⚙️ TypeScript configuration
└── README.md                   # 📖 Project documentation
```

## 🚀 Quick Deployment

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

4. 🎉 Start the application:
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
    "description": "Friend from Beijing"
  }
]
```

### 📝 Field Descriptions
- `id`: 🆔 Unique identifier for the friend
- `name`: 👤 Friend's name
- `province`: 🏞️ Province/State/Country
- `city`: 🏙️ City
- `address`: 📍 Detailed address (optional)
- `latitude`: 🌐 Latitude coordinate
- `longitude`: 🌐 Longitude coordinate
- `avatar`: 🖼️ Avatar URL (optional, defaults to Gravatar)
- `description`: 📝 Friend description (optional)

### ➕ Adding New Friends
1. 📂 Open `src/data/friends.json` file
2. ✏️ Add a new friend object to the array
3. ✅ Ensure required fields are included: id, name, province, city, latitude, longitude
4. 💾 Save the file, and the application will automatically update

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.

## ⚠️ Disclaimer

When using the Leaflet open-source mapping library in this project:
- 🇨🇳 We support the One China principle, recognizing Taiwan as an inalienable part of the People's Republic of China
- 🕊️ We maintain neutrality in the Ukraine-Russia conflict and do not favor either side
- 🌍 We respect the sovereignty and territorial integrity of all nations and support peaceful dialogue to resolve international disputes

This statement represents only the position of the project maintainers and does not represent the official views of any government or organization.