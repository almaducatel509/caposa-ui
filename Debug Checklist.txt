Here’s a **Debug Checklist** you can paste right after the note in your `README.md`:

---

## 🛠 Debug Checklist – Auth + API Data Not Loading

If data from `/members`, `/employees`, `/branches` etc. isn’t showing:

1. **Check if token exists**

   * Open DevTools → Application → Local Storage
   * Look for `token` key.
   * If missing → log in again.

2. **Check if token expired**

   * Copy the token to [jwt.io](https://jwt.io).
   * Look for `"exp"` field — must be a future timestamp.
   * If expired → log in again or use `/api/token/refresh/`.

3. **Verify request headers**

   * Open DevTools → Network tab.
   * Click on the failing request (e.g., `/members/`).
   * Under “Headers” check:

     ```
     Authorization: Bearer <access_token>
     ```

     If missing → interceptor may not be running.

4. **Check the endpoint URL**

   * Confirm `NEXT_PUBLIC_BASE_ROUTE` in `.env.local` matches your backend API base URL and ends with `/api/`.
   * Restart dev server after `.env` changes.

5. **Look at server response**

   * In Network tab, check “Response” of failing request.
   * Common cases:

     * `401 Unauthorized` → token invalid or expired.
     * `403 Forbidden` → token valid but user lacks permission.
     * `404 Not Found` → wrong endpoint or missing trailing slash in URL.

6. **Console logs**

   * In dev mode, our `axiosInstance` logs all requests and responses.
   * Read the request + response log before and after the error.

