# Next.js Starter Template

A modern, feature-rich starter template for React applications using Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ **Next.js** - React framework with server-side rendering, routing, and more
- 🔒 **TypeScript** - Type safety for better developer experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - High-quality, accessible UI components
- 📁 **Organized Folder Structure** - Clean and scalable project organization

## Getting Started

### Using GitHub Templates (Recommended)

1. Click the "Use this template" button at the top of the repository
2. Name your new repository and create it
3. Clone your new repository to your local machine
4. Install dependencies with `npm install`
5. Start the development server with `npm run dev`

### Manual Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/tox6q/template.git my-project
   ```

2. Navigate to the project directory:
   ```bash
   cd my-project
   ```

3. Remove the existing Git history and initialize a new repository:
   ```bash
   rmdir /s /q .git
   git init
   ```

4. Update the project name in `package.json`

5. Install dependencies:
   ```bash
   npm install
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to see your application

## Project Structure

```
src/
├── app/               # Next.js app directory
│   ├── layout.tsx     # Root layout component
│   └── page.tsx       # Home page
├── components/        # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utility functions and shared code
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── services/          # API services and data fetching
├── contexts/          # React context providers
└── assets/            # Static assets
```

## Customization

1. Update metadata in `src/app/layout.tsx`
2. Modify the home page in `src/app/page.tsx`
3. Add new shadcn/ui components using:
   ```bash
   npx shadcn@latest add [component-name]
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

This project is open source and available under the [MIT License](LICENSE).
