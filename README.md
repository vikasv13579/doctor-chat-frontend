# Docket Chat Frontend

A modern real-time chat application built with Angular 21 that connects patients with doctors. This application provides a comprehensive healthcare communication platform with role-based access control, patient onboarding, and real-time messaging capabilities.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access**: Separate dashboards for patients and doctors
- **Patient Onboarding**: Multi-step onboarding process for new patients
- **Real-Time Chat**: Socket.io-powered instant messaging
- **Modern UI**: Responsive design built with Angular 21

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: version 18.x or higher
- **npm**: version 11.6.2 (specified in package.json) or compatible version
- **Angular CLI**: version 21.0.4

You can verify your installations by running:

```bash
node --version
npm --version
ng version
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd docket-chat-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Angular 21.0.0
- Socket.io Client 4.8.3
- RxJS 7.8.0
- TypeScript 5.9.2

### 3. Configure Environment Variables

Create or update the `.env` file in the root directory:

```env
API_URL=http://localhost:3000/api
```

> **Note**: Make sure the backend API is running on the specified URL before starting the frontend.

### 4. Start the Development Server

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`

## 📂 Project Structure

```
docket-chat-frontend/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentication module
│   │   │   ├── login/         # Login component
│   │   │   ├── register/      # Registration component
│   │   │   ├── auth.guard.ts  # Route guard
│   │   │   └── role.guard.ts  # Role-based guard
│   │   ├── chat/              # Chat module
│   │   │   └── chat-window/   # Chat interface
│   │   ├── dashboard/         # Dashboard module
│   │   │   ├── patient-dashboard/
│   │   │   └── doctor-dashboard/
│   │   ├── onboarding/        # Patient onboarding
│   │   └── app.routes.ts      # Application routes
│   ├── environments/          # Environment configs
│   └── styles.css            # Global styles
├── public/                    # Static assets
├── .env                       # Environment variables
└── package.json              # Dependencies
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Build for production |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests with Vitest |
| `ng generate component <name>` | Generate a new component |
| `ng generate service <name>` | Generate a new service |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

This project uses [Vitest](https://vitest.dev/) as the test runner.

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, optimized for performance and speed.

## 🔐 User Roles & Routes

The application supports two user roles with protected routes:

### Patient Routes
- `/login` - Login page
- `/register` - Registration page
- `/onboarding` - Patient onboarding flow (requires auth + patient role)
- `/patient-dashboard` - Patient dashboard (requires auth + patient role)
- `/chat/:roomId` - Chat interface (requires auth)

### Doctor Routes
- `/login` - Login page
- `/doctor-dashboard` - Doctor dashboard (requires auth + doctor role)
- `/chat/:roomId` - Chat interface (requires auth)

## 🌐 Backend Integration

This frontend requires a backend API running on the configured `API_URL`. Ensure the backend server is running and accessible before starting the frontend application.

Default backend URL: `http://localhost:3000/api`

## 💡 Development Tips

1. **Hot Reload**: The development server supports hot module replacement. Changes to source files will automatically reload the browser.

2. **Code Scaffolding**: Use Angular CLI to generate new components:
   ```bash
   ng generate component my-component
   ```

3. **Prettier Integration**: The project includes Prettier configuration for consistent code formatting.

4. **Socket.io**: Real-time features use Socket.io client. Ensure the backend Socket.io server is configured correctly.

## 🐛 Troubleshooting

### Port Already in Use
If port 4200 is already in use, you can specify a different port:
```bash
ng serve --port 4201
```

### Backend Connection Issues
- Verify the backend server is running
- Check the `API_URL` in `.env` file
- Ensure CORS is properly configured on the backend

### Module Not Found Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Browser Compatibility

This application is optimized for modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests to ensure nothing breaks
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please contact the development team.

---

**Version**: 0.0.0  
**Built with**: Angular 21.0.0  
**Generated with**: Angular CLI 21.0.4
