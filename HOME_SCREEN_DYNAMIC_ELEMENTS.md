# Home Screen – Dynamic Elements (Backend Status)

Elements that should be dynamic (backend-managed) on the Home screen, and whether the backend is implemented and wired in the app.

---

## 1. Header / Top section

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Delivery type label** (e.g. "Delivery to Home") | Yes | ✅ Implemented | ✅ Yes | From `HomeConfig.deliveryTypeLabel` via `/home` payload. Fallback: "Delivery to Home". |
| **Delivery address** (e.g. "Vasantha Bhavan Hotel, 3rd floor...") | Yes | ✅ Implemented | ❌ No | Backend has **addresses** API (`/addresses`, default address). Home screen currently uses a **hardcoded** address string; not fetched from user profile/default address. |
| **Search bar placeholder** (e.g. "Search for 'Dal'") | Yes | ✅ Implemented | ✅ Yes | From `HomeConfig.searchPlaceholder` via `/home` payload. Fallback: `Search for "Dal"`. |
| **Profile icon** | N/A | — | — | Navigates to Settings; user-specific but no “dynamic content” on the Home tile itself. |

---

## 2. Video / Hero area

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Hero video** (URL, show/hide) | Yes | ✅ Implemented | ❌ No | `HomeConfig.heroVideoUrl` exists in backend. App uses a **local asset** only (`homepage_video.mp4`); does not use `config.heroVideoUrl`. |

---

## 3. Category section (“Grocery & Kitchen”)

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Section title** (e.g. "Grocery & Kitchen") | Yes | ⚠️ Partial | ❌ No | No dedicated field in home payload. Could be driven by `HomeConfig` or first section; currently **hardcoded** default in `CategorySection`. |
| **Category list** (order, count) | Yes | ✅ Implemented | ✅ Yes | From `homeData.categories` (backend: `Category` model, `order`, `isActive`). |
| **Category names** | Yes | ✅ Implemented | ✅ Yes | From same payload; backend has `name`, `slug`. |
| **Category images** | Yes | ✅ Implemented | ⚠️ Partial | Backend returns `imageUrl` per category. Frontend expects `image` (e.g. `{ uri: imageUrl }`). Ensure payload or `CategorySection` maps `imageUrl` → `image` for `CategoryCard`. |

---

## 4. Banners (below categories)

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Hero banners** (carousel) | Yes | ✅ Implemented | ✅ Yes | From `homeData.heroBanners` (slot `hero`). Backend: `Banner` model with `imageUrl`, `link`, `order`. |
| **Banner images** | Yes | ✅ Implemented | ⚠️ Partial | Backend returns `imageUrl`. Ensure each banner is rendered as `{ uri: imageUrl }` (or equivalent) in `Banner` component. |
| **Mid banners** | Yes | ✅ Implemented | ⚠️ Check | Returned in payload as `midBanners`; confirm they are used in a section (e.g. second carousel or strip). |

---

## 5. Deals / Wellbeing / Lifestyle / Promo blocks

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Deals section** (title, products) | Yes | ✅ Implemented | ✅ Yes | From `homeData.sections.deals` (title + products). |
| **Wellbeing section** | Yes | ✅ Implemented | ✅ Yes | From `homeData.sections.wellbeing`. |
| **Lifestyle section** | Yes | ✅ Implemented | ✅ Yes | From `homeData.lifestyle` (backend: `LifestyleItem`). |
| **Greens banner / Section image** | Yes | ✅ Implemented | ✅ Yes | From `homeData.promoBlocks` (e.g. `greens_banner`, `section_image`). Backend: `PromoBlock` with `imageUrl`, `link`. |

---

## 6. Bottom navigation (HOME, CATEGORY, CART)

| Element | Should be dynamic? | Backend status | App wired? | Notes |
|--------|--------------------|----------------|------------|--------|
| **Tabs and labels** | Usually static | — | — | Typically fixed in app; rarely backend-driven. |

---

## Summary: what to fix or add

1. **Delivery address** – Backend has addresses API. **Wire it:** On Home load (or when opening location selector), fetch user addresses / default address and pass the selected or default address into `TopSection` instead of the hardcoded string.
2. **Hero video** – Backend has `HomeConfig.heroVideoUrl`. **Wire it:** In `TopSection`, when `config.heroVideoUrl` is present, use it as the video source (e.g. `{ uri: config.heroVideoUrl }`); otherwise keep local asset or placeholder.
3. **Category section title** – **Optional:** Add a field (e.g. in `HomeConfig` or first section) and pass it into `CategorySection` so “Grocery & Kitchen” is configurable.
4. **Category / banner images** – Backend sends `imageUrl`. **Verify:** Ensure all places that render categories and banners map `imageUrl` to the format expected by `Image` (e.g. `{ uri: imageUrl }`).

---

## Backend references (customer-backend)

- **Home payload:** `GET /api/v1/customer/home` → `homeController.getHome` → `homeService.getHomePayload()`.
- **Models:** `HomeConfig`, `Category`, `Banner`, `HomeSection`, `Product`, `LifestyleItem`, `PromoBlock`.
- **User addresses:** `GET /api/v1/customer/addresses` (and default) for delivery address.
- **Admin:** Home config, categories, banners, and sections are manageable via admin routes (e.g. home admin).
