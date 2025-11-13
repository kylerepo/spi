# Mobile App Deployment Guide

This guide provides a high-level overview of the process for building the React Native Expo application and preparing it for submission to the Apple App Store and Google Play Store.

## Key Concepts

*   **Vercel is for Web, Not Mobile:** Vercel is used to deploy the web application (`client/`) part of this project. It **cannot** be used to deploy the native mobile app (`client-mobile/`).
*   **Expo Application Services (EAS):** To build and deploy a React Native Expo app, you use a service called **EAS (Expo Application Services)**. EAS handles the entire build process in the cloud, creating the `.ipa` (for iOS) and `.apk`/`.aab` (for Android) files that you submit to the app stores.
*   **App Stores:** The final app packages are submitted to the **Apple App Store** (for iOS users) and the **Google Play Store** (for Android users). This is how your users will download and install the app.

## High-Level Deployment Steps

### 1. Set Up Your Accounts

Before you can build your app, you need to create accounts with a few services:

*   **Expo Account:** [Create an account on expo.dev](https://expo.dev/signup). This is required to use EAS.
*   **Apple Developer Account:** To distribute an app on the App Store, you need to be enrolled in the [Apple Developer Program](https://developer.apple.com/programs/enroll/).
*   **Google Play Developer Account:** To distribute an app on the Play Store, you need a [Google Play Console](https://play.google.com/console/signup/) account.

### 2. Configure Your Project for EAS

1.  **Install the EAS CLI:**
    Open your terminal and install the EAS command-line tool globally:
    ```bash
    npm install -g eas-cli
    ```

2.  **Log in to Your Expo Account:**
    In your terminal, log in to the Expo account you created:
    ```bash
    eas login
    ```

3.  **Configure the Project:**
    Navigate to the mobile app directory and configure it for EAS. The command will help you create the `eas.json` file, which defines your build profiles.
    ```bash
    cd client-mobile
    eas build:configure
    ```
    You will be prompted to set up profiles for both Android and iOS.

### 3. Run the Build

Once configured, you can start a build for a specific platform. EAS will upload your code, build it in the cloud, and provide you with a link to download the finished app file.

*   **To build for Android:**
    ```bash
    eas build --platform android
    ```

*   **To build for iOS:**
    ```bash
    eas build --platform ios
    ```

*   **To build for both:**
    ```bash
    eas build --all
    ```

### 4. Submit to the App Stores

After the build is complete, EAS will give you a downloadable link for your app file (`.aab` for Android, `.ipa` for iOS). The next step is to upload this file to the respective app stores.

*   **Using EAS Submit:** The EAS CLI also provides a command to automate the submission process, which is highly recommended.
    ```bash
    # For Android
    eas submit --platform android

    # For iOS
    eas submit --platform ios
    ```
*   **Manual Upload:** Alternatively, you can download the files and manually upload them through the [Apple App Store Connect](https://appstoreconnect.apple.com/) and [Google Play Console](https://play.google.com/console/) dashboards.

This is a high-level guide. The official [Expo Documentation](https://docs.expo.dev/build/introduction/) provides much more detailed information on each of these steps, including how to manage app signing credentials and configure advanced build settings.
