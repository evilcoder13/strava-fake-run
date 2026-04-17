# StravaFakeRun 🏃‍♂️🚴‍♂️

**StravaFakeRun** is a premium, privacy-first web utility designed to help athletes and developers generate realistic synthetic workout data. Whether you need to simulate a route for testing, restore a lost activity, or experiment with biometric models, StravaFakeRun provides the tools to create "human-feeling" GPX and TCX files that look authentic on platforms like Strava.

## ✨ Features

- **🗺️ Interactive Map Plotting**: Click to add waypoints; our OSRM integration automatically snaps your route to the nearest roads and trails.
- **💓 Realistic Biometrics**: Generates dynamic Heart Rate and Cadence based on:
  - **Sport Profiles**: Running, Cycling, Walking, and Hiking.
  - **Gradient Awareness**: Biometrics respond naturally to elevation changes (higher HR on climbs).
  - **Pacing Noise**: Optional "Human Noise" simulates natural fluctuations in pace and heart rate.
- **🌍 Global Search & Geolocation**: Instantly find any address via OpenStreetMap Nominatim or hop to your current location.
- **🔗 Instant Route Sharing**: Your entire route and configuration are serialized into the URL. Just copy and share the link; no database required.
- **📊 Live Preview**: Analyze your generated pace and heart rate charts before downloading.
- **💾 Dual Export**: Download your activities as standardized **GPX** or **TCX** files.
- **🛡️ Privacy First**: Everything happens in your browser. No data is sent to a server, and no account is required.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/evilcoder13/stravafakerun.git
   cd stravafakerun
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **[Next.js](https://nextjs.org/)** - Fast, React-based web framework.
- **[Leaflet](https://leafletjs.org/)** - For the interactive map experience.
- **[OSRM](http://project-osrm.org/)** - High-performance road snapping and routing.
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management.
- **[Tailwind CSS](https://tailwindcss.com/)** - Premium, responsive styling.
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent iconography.
- **[Recharts](https://recharts.org/)** - Interactive data visualization.

## 📖 How It Works

1. **Plot**: Click points on the map to define your path. You can drag markers to refine the route.
2. **Configure**: Set your start date, time, and target effort (Pace or Speed).
3. **Brain**: Our simulation engine interpolates the path, fetches global elevation data, and calculates biometrics point-by-point.
4. **Export**: Click "Generate" then download your file.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗺️ Map Data & Precision Disclaimer

StravaFakeRun uses map data provided by **[OpenStreetMap](https://www.openstreetmap.org/)** and routing services from **[OSRM](http://project-osrm.org/)**. Please be aware:

- **Data Ownership**: All map tiles and geographic data are property of OpenStreetMap contributors.
- **Precision**: Map data, road snapping, and elevation profiles are provided for simulation purposes only. They may not reflect real-world conditions, current road closures, or exact GPS precision.
- **Content**: The developers of StravaFakeRun do not control the accuracy or completeness of the underlying map content.

## ☕ Support

If you're happy with this project, you can always make me happier by contributing above or by buying me some beers at:

👉 [**paypal.me/evilcoder13**](http://paypal.me/evilcoder13)

---

*Disclaimer: This tool is intended for testing and personal use. Use synthetic data responsibly.*
