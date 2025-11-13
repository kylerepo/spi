# How to Test the Mobile App Locally

This guide provides step-by-step instructions to run the React Native Expo application on your local machine and test it using the Expo Go app on your mobile device.

## Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js (LTS version) and npm installed on your computer. You can download them from [nodejs.org](https://nodejs.org/).
2.  **Expo Go App:** Install the **Expo Go** application on your physical iOS or Android device.
    *   [Download for iOS](https://apps.apple.com/us/app/expo-go/id982107779)
    *   [Download for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
3.  **Supabase Backend:** The application requires the Supabase backend to be running. Make sure you have the backend set up and the necessary environment variables (like `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are present in the root `.env` file of the repository.

## Running the App

1.  **Navigate to the Mobile App Directory:**
    Open your terminal and change into the mobile app's directory:
    ```bash
    cd client-mobile
    ```

2.  **Install Dependencies:**
    If you haven't installed the dependencies yet, run the following command. This will download all the necessary packages for the app to run.
    ```bash
    npm install
    ```

3.  **Start the Expo Development Server:**
    Now, start the Expo development server by running:
    ```bash
    npx expo start
    ```

4.  **Connect with Expo Go:**
    *   Once the server is running, it will display a **QR code** in your terminal.
    *   Ensure your mobile device is connected to the **same Wi-Fi network** as your computer.
    *   Open the Expo Go app on your device.
    *   On the "Home" tab (iOS) or "Projects" tab (Android), tap **"Scan QR Code"**.
    *   Point your device's camera at the QR code in your terminal.

5.  **Testing:**
    *   The app will now bundle and load on your device. This might take a few moments the first time.
    *   You can now interact with the app on your device just like a real user would.
    *   Any changes you make to the source code in the `client-mobile/` directory will automatically reload the app on your device, allowing you to see your changes instantly.

## Troubleshooting

*   **Connection Issues:** If you can't connect, ensure your computer and phone are on the same local network and that no firewall is blocking the connection.
*   **Missing Dependencies:** If you encounter errors about missing modules, stop the server (`Ctrl + C`) and try running `npm install` again.
*   **Outdated Expo Go App:** Make sure your Expo Go app is updated to the latest version from the App Store or Play Store.
