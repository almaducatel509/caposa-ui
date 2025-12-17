# Next.js SSR/Client-Side Development Notes

## 🚨 Critical Rules to Remember

### 1. Browser APIs Don't Exist on Server
**NEVER directly use these without checks:**
```javascript
// ❌ WRONG - Will break SSR
localStorage.getItem('token')
sessionStorage.setItem('data', value)
window.location.href = '/page'
document.querySelector('.element')
navigator.userAgent

// ✅ CORRECT - Always check first
if (typeof window !== 'undefined') {
  localStorage.getItem('token')
  window.location.href = '/page'
}
```

### 2. Common SSR Pitfalls to Avoid

#### Authentication/Tokens
```javascript
// ❌ BAD
const token = localStorage.getItem('token') // Crashes on server

// ✅ GOOD
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}
```

#### Axios Interceptors
```javascript
// ❌ BAD - Will fail during SSR
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') // Server crash!
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// ✅ GOOD - Client-side check
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
```

#### Component Hydration
```javascript
// ❌ BAD - Hydration mismatch
export default function Component() {
  const [user, setUser] = useState(localStorage.getItem('user'))
  return <div>{user}</div>
}

// ✅ GOOD - Prevent hydration issues
export default function Component() {
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setUser(localStorage.getItem('user'))
  }, [])
  
  if (!mounted) return null
  return <div>{user}</div>
}
```

### 3. Quick Fix Patterns

#### Pattern 1: The Safety Check
```javascript
const safeFunction = () => {
  if (typeof window === 'undefined') return // Server-side: do nothing
  
  // Client-side code here
  localStorage.setItem('key', 'value')
}
```

#### Pattern 2: The useEffect Hook
```javascript
useEffect(() => {
  // Always runs on client-side only
  const token = localStorage.getItem('token')
  if (token) {
    // Do something with token
  }
}, [])
```

#### Pattern 3: The Mounted State
```javascript
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null // Prevent hydration mismatch
```

### 4. Environment Detection Cheat Sheet

```javascript
// Check if running on client
if (typeof window !== 'undefined') { /* client code */ }

// Check if running on server
if (typeof window === 'undefined') { /* server code */ }

// React way (in components)
useEffect(() => {
  // This always runs on client
}, [])
```

### 5. Common Error Messages That Mean SSR Issues

- ❌ "localStorage is not defined"
- ❌ "window is not defined"
- ❌ "document is not defined"
- ❌ "ReferenceError: navigator is not defined"
- ❌ "Hydration failed because the initial UI does not match"

**Solution:** Add `typeof window !== 'undefined'` checks!

### 6. Best Practices Checklist

- ✅ Always check `typeof window !== 'undefined'` before browser APIs
- ✅ Use `useEffect` for client-side only logic
- ✅ Handle hydration mismatches with mounted state
- ✅ Test your app with JavaScript disabled to catch SSR issues
- ✅ Use Next.js `dynamic` imports with `ssr: false` for client-only components
- ✅ Remember: Server renders first, then client hydrates

### 7. Quick Debug Tips

```javascript
// Add this to see where code is running
console.log('Running on:', typeof window !== 'undefined' ? 'CLIENT' : 'SERVER')

// Use this pattern for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:', {
    isClient: typeof window !== 'undefined',
    hasLocalStorage: typeof localStorage !== 'undefined'
  })
}
```

## 📝 Memory Aids

**"If it touches the browser, check the window!"**
**"useEffect = client-side effect"**
**"SSR = Server-Side Rendering = No browser APIs"**

---

*Keep this handy and check it whenever you're working with authentication, storage, or browser APIs in Next.js!*
# Next.js SSR/Client-Side Development Notes

## 🚨 Critical Rules to Remember

### 1. Browser APIs Don't Exist on Server
**NEVER directly use these without checks:**
```javascript
// ❌ WRONG - Will break SSR
localStorage.getItem('token')
sessionStorage.setItem('data', value)
window.location.href = '/page'
document.querySelector('.element')
navigator.userAgent

// ✅ CORRECT - Always check first
if (typeof window !== 'undefined') {
  localStorage.getItem('token')
  window.location.href = '/page'
}
```

### 2. Common SSR Pitfalls to Avoid

#### Authentication/Tokens
```javascript
// ❌ BAD - Will crash on server
const token = localStorage.getItem('token') 

export async function login(username, password) {
  const res = await api.post('/login', { username, password })
  localStorage.setItem('token', res.data.token) // Server crash!
  return res.data
}

// ✅ GOOD - Always check environment first
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export async function login(username, password) {
  if (typeof window === 'undefined') {
    throw new Error('Login can only be called on client side')
  }
  
  const res = await api.post('/login', { username, password })
  localStorage.setItem('token', res.data.token) // Safe now!
  return res.data
}
```

#### Axios Interceptors
```javascript
// ❌ BAD - Will fail during SSR
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') // Server crash!
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// ✅ GOOD - Client-side check
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
```

#### Component Hydration
```javascript
// ❌ BAD - Hydration mismatch
export default function Component() {
  const [user, setUser] = useState(localStorage.getItem('user'))
  return <div>{user}</div>
}

// ✅ GOOD - Prevent hydration issues
export default function Component() {
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setUser(localStorage.getItem('user'))
  }, [])
  
  if (!mounted) return null
  return <div>{user}</div>
}
```

### 3. Quick Fix Patterns

#### Pattern 1: The Safety Check
```javascript
const safeFunction = () => {
  if (typeof window === 'undefined') return // Server-side: do nothing
  
  // Client-side code here
  localStorage.setItem('key', 'value')
}
```

#### Pattern 2: The useEffect Hook
```javascript
useEffect(() => {
  // Always runs on client-side only
  const token = localStorage.getItem('token')
  if (token) {
    // Do something with token
  }
}, [])
```

#### Pattern 3: The Mounted State
```javascript
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null // Prevent hydration mismatch
```

### 4. Environment Detection Cheat Sheet

```javascript
// Check if running on client
if (typeof window !== 'undefined') { /* client code */ }

// Check if running on server
if (typeof window === 'undefined') { /* server code */ }

// React way (in components)
useEffect(() => {
  // This always runs on client
}, [])
```

### 5. Common Error Messages That Mean SSR Issues

- ❌ "localStorage is not defined"
- ❌ "window is not defined"
- ❌ "document is not defined"
- ❌ "ReferenceError: navigator is not defined"
- ❌ "Hydration failed because the initial UI does not match"

**Solution:** Add `typeof window !== 'undefined'` checks!

### 6. Best Practices Checklist

- ✅ Always check `typeof window !== 'undefined'` before browser APIs
- ✅ Use `useEffect` for client-side only logic
- ✅ Handle hydration mismatches with mounted state
- ✅ Test your app with JavaScript disabled to catch SSR issues
- ✅ Use Next.js `dynamic` imports with `ssr: false` for client-only components
- ✅ Remember: Server renders first, then client hydrates

### 7. Quick Debug Tips

```javascript
// Add this to see where code is running
console.log('Running on:', typeof window !== 'undefined' ? 'CLIENT' : 'SERVER')

// Use this pattern for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:', {
    isClient: typeof window !== 'undefined',
    hasLocalStorage: typeof localStorage !== 'undefined'
  })
}
```

## 📝 Memory Aids

**"If it touches the browser, check the window!"**
**"useEffect = client-side effect"**
**"SSR = Server-Side Rendering = No browser APIs"**

---

*Keep this handy and check it whenever you're working with authentication, storage, or browser APIs in Next.js!*