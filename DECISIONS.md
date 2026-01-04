# Architectural Decisions & Design Approach

This document outlines the key technical decisions made during the development of the Docket Chat Frontend application. The goal is to provide context for future developers and explain the reasoning behind our architectural choices.

## Why Angular 21?

When we started this project, we needed a robust, enterprise-grade framework that could handle real-time communication while maintaining clean separation of concerns. Angular 21 was the natural choice for several reasons:

1. **Standalone Components**: Angular 21's standalone component architecture eliminates the need for NgModules, making the codebase easier to understand and maintain. Each component is self-contained with its own dependencies.

2. **Strong TypeScript Support**: Healthcare applications demand type safety. Angular's deep integration with TypeScript helps us catch errors at compile-time rather than runtime, which is critical when dealing with patient data.

3. **Built-in Dependency Injection**: The DI system makes it easy to inject services like authentication, socket management, and API calls throughout the application.

4. **Performance**: The latest version includes significant performance improvements, signal-based reactivity, and better build optimization.

## Application Architecture

### Route-Based Code Splitting

We implemented lazy loading for all major routes. Here's why:

```typescript
loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
```

Instead of loading everything upfront, we split the application into chunks that load on-demand. This was crucial because:

- **Initial Load Time**: Most users will only see the login page initially. Why load the entire chat module when they haven't authenticated yet?
- **Mobile Users**: Many healthcare workers access this on mobile devices with limited bandwidth. Lazy loading ensures they download only what they need.
- **Future Scalability**: As we add more features (telemedicine, file sharing, prescription management), the bundle size won't bloat the initial load.

### Role-Based Architecture

Early on, we had to decide: should we have separate applications for doctors and patients, or one unified app with role-based routing?

We chose the unified approach with role guards:

```typescript
canActivate: [authGuard, roleGuard('patient')]
```

**Why?**

- **Code Reusability**: Both doctors and patients use the same chat component, authentication logic, and API services.
- **Easier Deployment**: One deployment pipeline instead of two separate applications.
- **Shared Business Logic**: Authentication, Socket.io connections, and API interceptors are shared across roles.
- **Simpler Maintenance**: Bug fixes and security updates apply to both user types simultaneously.

The trade-off is slightly more complex routing logic, but the benefits far outweigh the cost.

### State Management Decision

One of our biggest decisions was whether to use NgRx, Akita, or stick with service-based state management using RxJS.

**We chose RxJS services** for now. Here's the reasoning:

- **Simplicity**: For MVP, we don't have complex state dependencies. Adding NgRx would be premature optimization.
- **Learning Curve**: Not all team members are familiar with Redux patterns. RxJS subjects and observables are standard Angular knowledge.
- **Small State Surface**: We're managing:
  - User authentication state
  - Chat messages (real-time, mostly from Socket.io)
  - Onboarding progress
  
  None of these require complex state transitions or time-travel debugging.

**Future Consideration**: If we add features like offline mode, optimistic updates, or complex data synchronization, we'll revisit this and potentially migrate to a more robust state management solution.

## Real-Time Communication with Socket.io

### Why Socket.io Instead of WebSockets?

We considered pure WebSockets, but Socket.io won because:

1. **Automatic Reconnection**: Healthcare workers might move between WiFi and cellular. Socket.io handles reconnection logic automatically.
2. **Fallback Support**: In restrictive hospital networks, WebSocket connections might be blocked. Socket.io falls back to long-polling.
3. **Room Management**: Built-in room/namespace support makes it trivial to implement private doctor-patient chat rooms.
4. **Event-Based**: The event emitter pattern feels natural in Angular with RxJS.

### Integration Pattern

```typescript
socket.io-client: ^4.8.3
```

We wrapped Socket.io in an Angular service to:
- Manage connection lifecycle
- Provide RxJS observables for incoming messages
- Handle reconnection within Angular's zone for proper change detection
- Centralize error handling

This abstraction means components don't directly interact with Socket.io—they subscribe to message streams from our service.

## Authentication & Security

### Guard Strategy

We implemented two layers of guards:

1. **authGuard**: Checks if the user is authenticated
2. **roleGuard**: Validates user role for specific routes

This separation of concerns means:
- We can reuse authGuard across all protected routes
- Role logic is encapsulated and testable
- Easy to extend with new roles (admin, nurse, etc.)

### Token Management

We store JWT tokens in localStorage (not sessionStorage or cookies). This was debated, but here's why:

**Pros**:
- Persists across browser tabs
- Users stay logged in after closing/reopening browser
- Easier to implement for MVP

**Cons**:
- Vulnerable to XSS attacks
- Can't be marked as HttpOnly

**Mitigation**:
- Short token expiration (we'll implement refresh tokens)
- Strict CSP headers
- Planning to add refresh token rotation

For v2, we're considering migrating to httpOnly cookies with a separate refresh token strategy.

## Patient Onboarding Flow

The onboarding module deserves special attention. We built it as a separate feature because:

1. **First Impressions Matter**: New patients need a smooth onboarding experience. A dedicated flow ensures we can optimize without affecting other features.

2. **Data Collection**: We need to collect medical history, allergies, current medications, and insurance information. Breaking this into steps prevents form fatigue.

3. **Conditional Logic**: Some onboarding steps depend on previous answers (e.g., "Do you have allergies?" → Show allergy input). A dedicated module handles this complexity.

4. **Progress Tracking**: Patients might not complete onboarding in one session. We track progress on the backend and resume where they left off.

## Testing Strategy

We chose **Vitest** over Karma/Jasmine:

```json
"vitest": "^4.0.8"
```

**Reasoning**:
- **Speed**: Vitest is significantly faster than Karma. Our test suite runs in seconds, not minutes.
- **Modern Tooling**: Uses Vite under the hood, which aligns with modern JavaScript tooling.
- **Better DX**: Watch mode, parallel test execution, and better error messages.
- **Future-Proof**: Angular is moving away from Karma. Vitest is the recommended path forward.

## Styling Approach

We consciously avoided CSS frameworks like Bootstrap or Tailwind for the MVP. Instead, we're using vanilla CSS.

**Why?**

- **Bundle Size**: No need to ship megabytes of unused CSS.
- **Design Flexibility**: Healthcare UI often has specific accessibility requirements that don't map well to pre-built components.
- **Learning**: The team knows CSS well. Adding a framework would slow initial development.

**Caveat**: As the UI grows, we might introduce a lightweight design system or CSS-in-JS solution. But for now, keeping it simple works.

## Environment Configuration

Using `.env` files is straightforward but has limitations:

```env
API_URL=http://localhost:3000/api
```

**Current Approach**:
- `.env` for local development
- Environment-specific files for staging/production

**Known Issues**:
- `.env` files need to be created manually (not in git for security)
- Angular's environment system is separate from `.env` (we bridge this in `environment.ts`)

**Future Plan**:
- Move toward container-based config (12-factor app)
- Use ConfigMaps/Secrets in Kubernetes for production

## Code Organization

Our folder structure follows Angular best practices with feature modules:

```
app/
├── auth/       # Everything authentication-related
├── chat/       # Chat functionality
├── dashboard/  # Dashboards for different roles  
└── onboarding/ # Patient onboarding flow
```

**Philosophy**: Features are self-contained. If we need to delete onboarding or replace chat with a third-party solution, we can do so with minimal impact on other modules.

## Performance Optimizations

1. **Lazy Loading**: Already covered, but worth emphasizing. Every major route is lazy-loaded.

2. **OnPush Change Detection**: We plan to use `ChangeDetectionStrategy.OnPush` for components that don't need constant change detection. This is a planned optimization for v1.1.

3. **TrackBy Functions**: For chat message lists, we use trackBy functions to minimize DOM manipulation when new messages arrive.

4. **Image Optimization**: User avatars and medical images will use the `<img loading="lazy">` attribute and WebP format.

## What We Deliberately Didn't Do (And Why)

### No Server-Side Rendering (SSR)
This is a dashboard application behind authentication. There's no SEO benefit, and SSR adds complexity we don't need.

### No Progressive Web App (PWA)
We considered it, but:
- Healthcare data offline is a security concern
- Push notifications require careful HIPAA consideration
- We'll add PWA features in v2 if there's strong user demand

### No Internationalization (i18n)
MVP is English-only. We have the infrastructure to add i18n, but it's not a priority until we expand to non-English markets.

## Dependencies Philosophy

We try to keep dependencies minimal:

- **No jQuery**: It's 2026, we don't need it.
- **No Lodash**: Native JavaScript and TypeScript utilities are sufficient.
- **No Moment.js**: We use the native `Date` API and plan to add `date-fns` only if needed.

The rule: Every dependency is a liability. We add them only when they provide clear value.

## Accessibility Considerations

This is a work in progress, but our commitments:

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast ratios meeting WCAG AA
- Screen reader testing (planned for v1.1)

Healthcare applications serve diverse users, including those with disabilities. This isn't optional.

## Monitoring & Error Handling

Currently minimal, but planned:

- Frontend error tracking (considering Sentry)
- Performance monitoring (Web Vitals)
- User session recording (with privacy controls)
- Chat delivery receipts and failure handling

## Conclusion

These decisions reflect our current understanding and priorities. As the application evolves, we'll revisit and update this document. The key is to remain pragmatic: solve today's problems with solutions that don't preclude tomorrow's changes.

When in doubt, we optimize for:
1. **Security**: Patient data is sacred
2. **Simplicity**: Complex code is buggy code
3. **Performance**: Healthcare workers are busy; every second counts
4. **Maintainability**: We're building for the long term

---

**Last Updated**: January 2026  
**Version**: 0.0.0  
**Contributors**: Development Team
