# ZKSub - Content Subscription Platform

ZKSub is a decentralized content subscription platform built with React, TypeScript, Vite, and Tailwind CSS for the frontend, and Express with TypeScript for the backend. It integrates with the INTMAX network for secure payments in ETH, allowing creators to upload content and subscribers to pay for access using Metamask.

## Features
- **Creator Dashboard**: Upload content (images, videos, audio, PDFs) with a name, description, and price ($0.05, $0.25, $1 per day). Content is displayed in a modal, with options to view or delete uploaded content.
- **Subscriber Dashboard**: Browse available content, subscribe using ETH payments, and view subscribed content.
- **Persistent Storage**: Content metadata is stored in `server/contents.json`, and files are saved in `client/public`.
- **Styling**: Tailwind CSS for a modern, responsive UI.
- **Payment System**: Uses `intmax2-client-sdk` for ETH transactions (1 ETH = $2500) on the INTMAX testnet.

## Prerequisites
- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Metamask**: Configured for the INTMAX testnet with sufficient ETH
- **Git**: For cloning the repository

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd zksub
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd ../server
   npm install
   npm install express-fileupload uuid cors
   npm install --save-dev @types/express-fileupload @types/cors
   ```

4. **Configure Environment Variables**:
   - Create a `server/.env` file:
     ```env
     ETH_PRIVATE_KEY="0x..." # Your INTMAX testnet private key
     L1_RPC_URL="https://sepolia.gateway.tenderly.co" # INTMAX testnet RPC URL
     ```

## Running the Project

1. **Start the Backend**:
   ```bash
   cd server
   npm start
   ```
   The backend runs on `http://localhost:3000`.

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

3. **Access the Application**:
   - Open `http://localhost:5173` in your browser.
   - Connect Metamask to the INTMAX testnet.
   - Initialize the client, log in, and use the Creator or Subscriber Dashboard.

## Usage
- **Creators**:
  - Click "Upload New Content" to open a modal and upload content with a name, description, file, and price.
  - Use "View My Contents" to see uploaded content and delete if needed.
  - A disabled "+18 Content" button is included for future use.
- **Subscribers**:
  - Browse available content in the Subscriber Dashboard.
  - Subscribe by paying in ETH (prices converted at 1 ETH = $2500).
  - View subscribed content in an iframe.
- **Persistence**: Uploaded files are stored in `client/public`, and metadata is saved in `server/contents.json`.

## Troubleshooting
- **CORS Errors**: Ensure the backend is running on `http://localhost:3000` and CORS is configured correctly.
- **Payment Validation**: Verify `ETH_PRIVATE_KEY` and `L1_RPC_URL` in `server/.env`. Check Metamask for sufficient ETH.
- **File Persistence**: Ensure `client/public` exists and is writable. Check `server/contents.json` for content metadata.

## Dependencies
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Axios, `intmax2-client-sdk`
- **Backend**: Express, TypeScript, `express-fileupload`, `uuid`, `cors`, `intmax2-server-sdk`

## Notes
- The project uses the INTMAX testnet for payments. Ensure Metamask is configured correctly.
- Content prices are in USD but converted to ETH (1 ETH = $2500) for transactions.
- For production, consider using a database instead of `contents.json` and secure file storage.