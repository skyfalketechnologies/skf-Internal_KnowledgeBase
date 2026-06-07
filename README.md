# Skyfalke Internal Knowledge Base

A private, internal knowledge base dashboard for storing and managing company SOPs and documentation.

## Features

- **Documents** — Create, read, update and delete documents with a full markdown editor
- **Categories** — Organise documents into colour-coded categories
- **Tags** — Label documents with multiple tags for easy filtering
- **Search** — Full-text search across titles, content, categories and tags with highlighted results
- **File Attachments** — Attach and download files (PDFs, images, docs) stored in Firebase Storage
- **Authentication** — Protected by Firebase Auth — only authorised users can access

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- Firebase Firestore (database)
- Firebase Auth (authentication)
- Firebase Storage (file attachments)
- React Router v6
- @uiw/react-md-editor (markdown editor)
- react-markdown + remark-gfm (markdown renderer)

** FIREBASE CONFIG ** - INSIDE firebase.json , .env file

## Deployment

Deployed on Netlify. Connect the GitHub repository and add the environment variables in the Vercel dashboard.

## Firebase Setup

- **Firestore** — enabled in test mode (europe-west1)
- **Authentication** — Email/Password enabled
- **Storage** — enabled in test mode