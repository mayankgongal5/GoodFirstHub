# Setting Up GitHub OAuth Login with Appwrite

This guide will help you set up GitHub OAuth login for your GoodFirstHub application.

## 1. Create a GitHub OAuth App

1. Go to your GitHub account settings: https://github.com/settings/developers
2. Click on "OAuth Apps" and then "New OAuth App"
3. Fill in the application details:
   - **Application name**: GoodFirstHub
   - **Homepage URL**: Your application's homepage URL (e.g., http://localhost:5173 for development)
   - **Application description**: (Optional) A description of your application
   - **Authorization callback URL**: Your Appwrite endpoint callback URL. It should be:
     ```
     https://<YOUR_APPWRITE_HOSTNAME>/v1/account/sessions/oauth2/callback/<PROVIDER_NAME>/<PROJECT_ID>
     ```
     For cloud-hosted Appwrite, it would look like:
     ```
     https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/<YOUR_PROJECT_ID>
     ```
4. Click "Register application"
5. After registration, you'll see your Client ID and you can generate a Client Secret

## 2. Configure OAuth in Appwrite Console

1. Go to your Appwrite Console
2. Navigate to your project
3. Go to "Auth" > "OAuth2 Providers"
4. Find GitHub in the list and click "Configure"
5. Enter the Client ID and Client Secret from your GitHub OAuth App
6. Enable the provider
7. Save your changes

## 3. Update Your Environment Variables

Make sure you have a `.env` file with the following variables:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
```

Replace `your-project-id-here` with your actual Appwrite Project ID.

## 4. Testing GitHub OAuth Login

1. Start your application
2. Click on the "Continue with GitHub" button
3. You should be redirected to GitHub for authentication
4. After authenticating, you'll be redirected back to your application and logged in

## Troubleshooting

If you encounter issues with the OAuth login:

1. Check the browser console for errors
2. Verify that the redirect URLs are correctly configured
3. Make sure your GitHub OAuth App is properly set up
4. Confirm that the provider is enabled in the Appwrite Console

Remember that for local testing, you'll need to use localhost URLs, and for production, you'll need to update the URLs accordingly.
