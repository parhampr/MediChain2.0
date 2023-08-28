## Medichain-Backend

### Installation

- Add .env file to the root folder. Open [Environment Vars](./env.md) to view all required variables.
- Install all dependencies using `npm i`

### Run

There are 3 ways to run the application. Use method 3 for development

1. Changes are not watched [Run Build & Start]

```
npm run build
npm start
```

2. Changes are not watched [Run without build]

```
npx tsx src/index.ts
```

3. Changes are watched (Recommended for Dev)

```
npm run dev
```
