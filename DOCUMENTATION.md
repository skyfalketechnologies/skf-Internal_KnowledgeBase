# Skyfalke Internal Knowledge Base — Documentation

## Overview
A private internal dashboard for storing, organising, and searching company SOPs and documentation. Only authorised users can access it.

## Getting Started

### Login
Navigate to the app URL. Enter your email and password to sign in. Contact your administrator if you don't have credentials.

## Features & How to Use

### Documents
The core of the system. A document contains a title, content written in markdown, a category, tags, and optional file attachments.

**To create a document:**
1. Click **New Doc** in the sidebar
2. Enter a title
3. Select a category from the dropdown
4. Add tags — type a word and press Enter to add each tag
5. Write your content in the markdown editor
6. Attach files if needed by clicking the attachment area
7. Click **Save Document**

**To view a document:**
- Click any document title from the Documents or Home page

**To edit a document:**
- Open the document and click **Edit**, or click **Edit** directly from the Documents list

**To delete a document:**
- Open the document and click **Delete**, or click **Delete** from the Documents list

---

### Categories
Categories group related documents together. Each category has a name, optional description, and a colour for visual identification.

**To create a category:**
1. Click **Categories** in the sidebar
2. Enter a name and optional description
3. Pick a colour
4. Click **Create**

**To filter documents by category:**
- Go to **Documents** and click any category tab at the top
- Or click a category name from the Home page

### Tags
Tags are labels attached to documents for quick filtering and discovery.

**To add tags to a document:**
- In the New Doc or Edit page, click the tags field, type a word and press **Enter** or **comma**
- Remove a tag by clicking the **×** next to it

**To filter by tag:**
- Click any tag shown on a document card or document view page
- This opens Search filtered by that tag

---

### Search
Search finds documents across title, content, category and tags simultaneously.

**To search:**
1. Click **Search** in the sidebar
2. Type any keyword
3. Results appear instantly with matching terms highlighted in yellow

---

### File Attachments
Files of any type can be attached to a document — PDFs, images, Word documents, spreadsheets etc.

**To attach files:**
- In the New Doc or Edit page, click the attachment area and select your files
- Attached files are listed at the bottom of the document view page
- Click any attachment to download or open it

---

### Markdown Guide
The document editor uses Markdown for formatting. Use the toolbar buttons or type syntax directly.

| Element | Syntax |
|---|---|
| Heading 1 | `# Heading` |
| Heading 2 | `## Heading` |
| Bold | `**bold**` |
| Italic | `*italic*` |
| Bullet list | `- item` |
| Numbered list | `1. item` |
| Inline code | `` `code` `` |
| Code block | ` ```code``` ` |
| Blockquote | `> quote` |
| Link | `[text](url)` |
| Horizontal line | `---` |

---

## Roles & Access
Currently single-user. Only accounts created by the administrator in Firebase Authentication can log in. There is no self-registration.

---

## Tech Stack
- React  + Vite
- Tailwind CSS
- Firebase Firestore — database
- Firebase Auth — authentication
- Firebase Storage — file attachments
- React Router v6 — navigation
- @uiw/react-md-editor — markdown editor
- react-markdown — markdown renderer
