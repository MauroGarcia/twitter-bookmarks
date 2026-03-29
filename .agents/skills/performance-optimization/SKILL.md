---
name: performance-optimization
description: Diagnose and improve application performance across frontend, bundle size, images, and backend query bottlenecks. Use this skill when the user reports slow page loads, sluggish rendering, large bundles, or inefficient data access.
license: Complete terms in LICENSE.txt
---

## Performance Optimization

### When to use this skill
- **Slow page loads**: low Lighthouse score
- **Slow rendering**: delayed user interactions
- **Large bundle size**: increased download time
- **Slow queries**: database bottlenecks

### Instructions

**Step 1: Measure performance**

Lighthouse (Chrome DevTools):
```bash
npm install -g lighthouse
lighthouse https://example.com --view
lighthouse https://example.com --output=json --output-path=./report.json
```

Measure Web Vitals (React) using getCLS, getFID, getFCP, getLCP, getTTFB functions from 'web-vitals' library.

**Step 2: Optimize React**

- React.memo: prevents unnecessary child re-renders when parent updates
- useMemo & useCallback: memoize expensive computations and callbacks
- Lazy Loading & Code Splitting: use React.lazy() with Suspense for route-based and component-based splitting

**Step 3: Optimize bundle size**

- Webpack Bundle Analyzer: visualize bundle composition
- Tree Shaking: "import only what you need" instead of entire libraries
- Dynamic Imports: load code on-demand

**Step 4: Optimize images**

- Next.js Image component with priority, placeholder, and sizes attributes
- Use WebP format with fallback sources

**Step 5: Optimize database queries**

- Fix N+1 queries using JOIN or include relations
- Add database indexes on frequently queried columns
- Implement Redis caching with TTL expiration

### Performance optimization checklist

**Frontend:**
- Prevent unnecessary re-renders with React.memo
- Use useMemo/useCallback appropriately
- Lazy loading & Code splitting
- Optimize images
- Analyze and reduce bundle size

**Backend:**
- Remove N+1 queries
- Add database indexes
- Redis caching
- Compress API responses (gzip)
- Use a CDN

**Measurement:**
- Lighthouse score 90+
- LCP < 2.5s, FID < 100ms, CLS < 0.1
