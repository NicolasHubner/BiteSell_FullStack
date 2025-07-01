🔧 Backend (Node.js)
Refactor blocking I/O
- src/routes/items.js uses fs.readFileSync. Replace with non‑blocking async operations.(Check)

*-Made file operations async with better error handling and cleaner code.*

*-Post operation had to modify to follow async/await pattern to wait for the file write to complete*

Performance
- GET /api/stats recalculates stats on every request. Cache results, watch file changes, or introduce a smarter strategy.(Check)

*-I've added a cache to the stats endpoint to avoid recalculating stats on every request. I've also added a watch file to invalidate the cache when the data file changes.*

*-In a production environment, I would use a more advanced caching strategy, such as Redis or Memcached.*

Testing
- Add unit tests (Jest) for items routes (happy path + error cases).

💻 Frontend (React)
Memory Leak
- Items.js leaks memory if the component unmounts before fetch completes. Fix it.(Check)

*-So I took of the fetch from the useEffect and created a new function that is called searchItems and it's called in the useEffect when the component is mounted and when search changes.*

Pagination & Search
- Implement paginated list with server‑side search (q param). Contribute to both client and server.(Check)

*-I've added the pagination and search functionality to the backend and the frontend, only something basics.*

Performance
- The list can grow large. Integrate virtualization (e.g., react-window) to keep UI smooth.(Check)

*-I've added virtualization to the list to keep the UI smooth.*

UI/UX Polish(Check)
- Feel free to enhance styling, accessibility, and add loading/skeleton states.

*-I've added loading and skeleton states to the list to keep the UI smooth.*


Comments:

*-Not using type script was a bit of a challenge, because helps a lot to avoid some mistakes.*

*-I handle this little project with a bit of a rush, so some things could be better.*

*-In all the things that I work I try to make the best possible code, but I know that I can always improve.*
