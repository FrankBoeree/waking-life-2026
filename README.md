# Festival Timetable PWA - Offline First

A Progressive Web App (PWA) for the Waking Life Festival 2026 (16-22 juni 2026) that works completely offline. All data is stored locally and the app continues to function without an internet connection.

## 🚀 Features

### Offline Functionality
- **Fully offline working**: All data is stored locally
- **Service Worker**: Caches all assets and data for offline use
- **IndexedDB**: Fast local storage for large datasets
- **Automatic synchronization**: Data is saved as soon as you're online
- **Offline status indicator**: See when you're offline

### PWA Features
- **Installable**: Add to home screen
- **App-like experience**: Full screen without browser UI
- **Push notifications**: (Future feature)
- **Background sync**: (Future feature)

### Festival Features
- **Timetable view**: View all performances by day and stage
- **Lineup view**: Overview of all artists
- **Favorites**: Mark your favorite artists
- **Artist details**: More information about artists
- **Offline favorites**: Changes are saved locally

## 📱 Installation

### For Users
1. Open the app in your browser
2. Click "Install App" when the prompt appears
3. Or use your browser's menu to install the app
4. The app is now available on your home screen

### For Developers
```bash
# Clone the repository
git clone [repository-url]
cd festival-timetable-pwa

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🛠 Technical Details

### Offline Storage
- **IndexedDB**: For large datasets (timetable, artist details)
- **localStorage**: For small data (favorites)
- **Service Worker Cache**: For assets and API responses

### Data Flow
1. **First load**: Data is imported and stored in IndexedDB
2. **Offline use**: Data is loaded from IndexedDB
3. **Online synchronization**: New data is downloaded and stored
4. **Favorites**: Are saved directly in localStorage and IndexedDB

### Service Worker
- **Cache Strategy**: Cache-first for static assets
- **Network Fallback**: Try network, fall back to cache
- **Background Sync**: For future offline actions

## 📊 Data Structure

### Timetable Data
```typescript
interface Artist {
  id: string
  name: string
  startTime: string
  endTime: string
  stage: string
  day: string
}
```

### Artist Details
```typescript
interface ArtistDetail {
  id: string
  name: string
  image?: string
  description?: string
  genre?: string
  country?: string
}
```

### Offline Data
```typescript
interface OfflineData {
  timetable: Artist[]
  artistDetails: ArtistDetail[]
  favorites: string[]
  lastSync: number
  version: string
}
```

## 🔧 Configuration

### Service Worker
The service worker is automatically registered and cached:
- Static assets (HTML, CSS, JS, images)
- API responses
- Offline fallback page

### PWA Manifest
- App name and description
- Icons for different sizes
- Theme colors
- Display mode (standalone)
- Shortcuts for quick access

## 📱 Browser Support

### Required
- Service Workers
- IndexedDB
- localStorage
- Fetch API

### Supported Browsers
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

## 🚨 Troubleshooting

### App doesn't work offline
1. Check if Service Worker is registered
2. Open DevTools > Application > Service Workers
3. Check if IndexedDB data is present

### Favorites disappear
1. Check localStorage in DevTools
2. Check IndexedDB in DevTools > Application > Storage
3. Data is stored in both locations

### Installation doesn't work
1. Check if HTTPS is used (required for PWA)
2. Check if manifest.json is correct
3. Check browser support

## 🔮 Future Features

- [ ] Push notifications for favorite artists
- [ ] Background sync for offline changes
- [ ] Offline maps and navigation
- [ ] Social features (sharing favorites)
- [ ] Offline photos and media
- [ ] Real-time updates when online

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

For questions or problems:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Contact via [email] 
