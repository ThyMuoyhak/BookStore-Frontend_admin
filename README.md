# Book Store — Admin Frontend

Admin dashboard for the Book Store app, built with **React.js** and styled with the
**Tailwind CSS CDN**. Connects to the FastAPI backend in `../backend`.

## Features

- 🔐 **Admin login** — same JWT auth as the storefront (`POST /api/auth/login`)
- 📊 **Dashboard** — stats (books, categories, sales, images) + latest books
- 📚 **Books** — search, filter by category, paginated table, edit / delete
- ➕ **Add / Edit book** — title, category, description, price, discount price, multiple images
  (pick which image is primary)
- 💾 **Backup database** — downloads every book as a JSON file
- 📥 **Import database** — upload a JSON backup and create the books (title duplicates skipped)

## Prerequisites

1. The backend must be running (see `../backend/README.md`):

   ```bash
   cd ../backend
   python -m uvicorn app.main:app --reload
   ```

2. **Node.js** (v18+ recommended) with npm.

## Setup & run

```bash
npm install
npm start
```

Open [http://localhost:3001](http://localhost:3001).

## CORS

The admin runs on port **3001**. Make sure `http://localhost:3001` is listed in
`CORS_ORIGINS` in `backend/.env` (it has been added for you):

```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8000
```

## Production build

```bash
npm run build
```

Output goes to `build/`.

## API endpoints used

| Method | Endpoint          | Purpose                          |
| ------ | ----------------- | -------------------------------- |
| POST   | `/api/auth/login` | Sign in (JWT token)              |
| GET    | `/api/auth/me`    | Current user                     |
| GET    | `/api/books`      | List books (search/filter/page)  |
| GET    | `/api/books/{id}` | Get a single book                |
| POST   | `/api/books`      | Create a book                    |
| PUT    | `/api/books/{id}` | Update a book                    |
| DELETE | `/api/books/{id}` | Delete a book                    |

## How Backup / Import works

- **Backup** pages through `GET /api/books` until it has fetched the entire catalog, then
  downloads `bookstore-backup-<timestamp>.json`.
- **Import** accepts either a plain array of books or a backup object `{ books: [...] }`.
  Each item needs at least `title` and `category`. Books whose title already exists in the
  store are skipped, and a summary (imported / skipped / failed) is shown afterwards.

> Both features run entirely through the existing public API — no extra backend endpoint is
> required.


### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
