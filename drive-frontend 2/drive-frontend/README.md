# Drive Frontend (React + Vite)

Frontend for your Spring Boot `Drive-Backend` project, matched to your `FileController`.

## Look and feel

- Google Drive style layout: sidebar, rounded content panel, modern search bar and New/Upload button.
- Light and dark theme (moon/sun button in the top right). It follows your system theme the first time
  and remembers your choice after that.
- File cards with colour-coded icons by file type, and real thumbnails for images.
- Hover actions, selected-file highlight (click a file; Esc clears it), grid and list view.
- Responsive: full sidebar on desktop, icon rail on tablet, slide-in menu on phones.
- Sidebar items "Shared with me", "Recent", "Starred" and "Trash" are shown as "Soon": they need
  endpoints your backend does not have yet.

Note: image thumbnails load the image itself from the download endpoint, so folders with many large
photos will load slowly until the backend can serve smaller previews.

## Run it

1. Start the backend (Spring Boot on port 8080, MySQL running, database `drive_db`).
2. In this folder (it must contain `package.json`):

```
npm install     (only the first time)
npm run dev
```

3. Open http://localhost:3000

The frontend **must run on port 3000**, because your controller has
`@CrossOrigin(origins = "http://localhost:3000")`. If port 3000 is busy, `npm run dev` stops with an
error instead of using another port (which the backend would reject).

## What it does

| Feature | How it works |
| --- | --- |
| Upload | Button (New → File upload) or drag and drop, several files at once. Warns before replacing a file with the same name. |
| Download, delete | Calls your backend. |
| Preview | Click a file. Images, PDFs and text files open in a viewer. Other types offer a download. |
| Search | By file name. |
| Filter | By type: images, PDFs, documents, spreadsheets, videos, audio, archives. |
| Sort | By name, date uploaded or size, ascending or descending. |
| Grid / list view | Switch from the top bar. Your choice is remembered. |
| Dark mode | Moon / sun button. Follows your system theme the first time, then remembers. |
| Sidebar | My Drive, Recent, Starred, Trash and a storage bar. On phones it becomes a slide-in menu. |
| Recent | The 50 most recently uploaded files. |
| Starred | Click the star on a file. |
| Trash | "Move to trash" can be undone or restored. "Delete forever" really deletes the file on the server. |

### Saved in the browser only

Starred files, Trash and your view/sort/theme choices are stored in this browser (`localStorage`),
because the backend has no such features. They do not follow you to another browser or computer.
Files in Trash still exist on the server (and count towards the storage bar) until you delete them forever.

The storage bar shows the total size of your files against a **15 GB display limit** set in
`src/utils.js` (`STORAGE_LIMIT`). The backend does not enforce a limit.

## Endpoints it calls (from your FileController)

| Action   | Request                                              |
| -------- | ---------------------------------------------------- |
| List     | `GET /api/files/list?parentFolderId=`                |
| Upload   | `POST /api/files/upload` (multipart: `file`, `parentFolderId`) |
| Download / preview | `GET /api/files/download/{id}`             |
| Delete   | `DELETE /api/files/delete/{id}`                      |

All of them are in one file: `src/api.js`.

## Not available yet (needs new backend code)

- **Shared with me, sharing, login, registration, private files.** Your backend has no users.
- **Create folder, rename, move.** Hidden for now. Your `FileEntity` already has `parentFolderId`, so
  folders only need new endpoints in Java. After adding them, open `src/api.js`, set
  `FEATURES.createFolder` and/or `FEATURES.rename` to `true`, and check the paths in `ENDPOINTS`.
  Folders are recognised when an item's `type` is `"folder"`. (Moving files would need a new button too.)

## Production build

```
npm run build
```

Set `VITE_API_URL=https://your-server.com/api` before building if the backend is on another
domain, and add that frontend origin to `@CrossOrigin` in the controller.
