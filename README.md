# Automated Banking System - Frontend

A React-based frontend application for the Automated Banking System.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload when you make changes.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run build`
Builds the app for production to the `build` folder.

#### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**

## Project Structure

```
src/
├── App.js           # Main App component
├── App.css          # App styles
├── index.js         # Entry point
└── index.css        # Global styles

public/
└── index.html       # HTML template
```

## Environment Variables

Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

## Learn More

- [Create React App documentation](https://create-react-app.dev)
- [React documentation](https://reactjs.org)
