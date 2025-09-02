# BeginnerContribute

A beginner-friendly web app to help new open-source contributors discover and track GitHub issues.

## Project Overview

BeginnerContribute is a React web app using Appwrite as the backend (auth, database, realtime, functions, storage, project-level secrets). The app helps beginners find and track open-source issues that match their skill level and interests.

Core Flow:
- A user signs up / signs in (Appwrite Auth).
- User adds a GitHub repository URL or owner/repo name.
- The system fetches issues from GitHub for that repo, extracts labels (tags), shows them, and lists issues by selected tag(s).
- Issues are shown in ascending order by creation date (oldest → newest).
- Users can claim an issue, comment, bookmark, and open a PR link when done.
- Real-time updates: when new issues / labels appear, subscribed users get notified (Appwrite Realtime).
- Messaging: an in-app messaging or discussion area per repo (Appwrite Database + Realtime).

## Requirements

- Node.js (v16+)
- npm or yarn
- Appwrite (Cloud or self-hosted)
- GitHub personal access token (for API access)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/beginnercontribute.git
cd beginnercontribute
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Update the values in `.env` with your Appwrite project details (already done for this project):
```
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68b67f5a001505b2aa28
VITE_APPWRITE_PROJECT_NAME=BeginnerContribute
```### 4. Appwrite Setup

The project has already been configured with the following Appwrite resources:

#### Database
- A database named `beginnercontribute` has been created

#### Collections
All required collections have been created with appropriate attributes and indexes:

1. **Repos Collection**:
   - owner (string) - GitHub repository owner name
   - repo (string) - Repository name
   - full_name (string) - ${owner}/${repo}
   - addedBy (string) - User ID who added the repository
   - github_repo_id (number) - GitHub's numeric ID for the repository
   - hasWebhook (boolean) - Whether a webhook is set up for this repository
   - lastSyncedAt (datetime) - When the repository was last synced

2. **Issues Collection**:
   - repoId (string) - Reference to repos collection
   - github_issue_id (number) - GitHub's numeric ID for the issue
   - number (number) - Issue number as shown on GitHub
   - title (string) - Issue title
   - body (text) - Issue description
   - state (string) - 'open' or 'closed'
   - createdAt (datetime) - When the issue was created
   - updatedAt (datetime) - When the issue was last updated
   - labels (array of strings) - Issue labels/tags
   - html_url (string) - Direct link to the issue on GitHub

3. **Bookmarks Collection**:
   - userId (string) - User who bookmarked the issue
   - issueId (string) - Reference to issues collection
   - createdAt (datetime) - When the bookmark was created

4. **Claims Collection**:
   - userId (string) - User who claimed the issue
   - issueId (string) - Reference to issues collection
   - status (string) - 'active', 'completed', or 'abandoned'
   - claimedAt (datetime) - When the issue was claimed

5. **Messages Collection**:
   - repoId (string) - Reference to repos collection
   - userId (string) - User who sent the message
   - text (string) - Message content
   - createdAt (datetime) - When the message was sent

#### Indexes
Appropriate indexes have been created for optimal query performance.

#### Function
A function called `fetchRepoIssues` has been created to fetch issues from GitHub. The code is available in the `appwrite/functions/fetchRepoIssues` folder.

The function has been deployed and is available at:
```
https://68b68b5b00138afc3694.fra.appwrite.run/
```

This function is already integrated with the application and will be called when:
1. A new repository is added
2. A repository's issues need to be refreshed

If you need to modify the function:
1. Navigate to Functions in your Appwrite console
2. Find the `fetchRepoIssues` function
3. Add a secret called `GITHUB_TOKEN` with your GitHub personal access token to increase API rate limits

### 5. Run the Application

Now that everything is set up, you can run the application:

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app running.

## Project Structure

```
src/
├── components/         # React components
│   ├── AddRepo.jsx     # Add repository form
│   ├── Header.jsx      # Navigation header
│   ├── IssueCard.jsx   # Issue display component
│   ├── IssuesList.jsx  # List of issues
│   ├── Login.jsx       # Login form
│   ├── Register.jsx    # Registration form
│   ├── RepoChat.jsx    # Repository chat
│   ├── TagsFilter.jsx  # Issue label filtering
│   └── ...
├── context/
│   └── AuthContext.jsx # Authentication context
├── lib/
│   └── appwrite.js     # Appwrite configuration
├── pages/
│   ├── AuthPage.jsx    # Authentication page
│   ├── ExplorePage.jsx # Discover repositories
│   ├── HomePage.jsx    # Main dashboard
│   └── ProfilePage.jsx # User profile
└── utils/
    ├── githubUtils.js  # GitHub API utilities
    └── userActions.js  # User action helpers
```

## Features

- **Authentication**: Email/password and GitHub OAuth login
- **Repository Management**: Add GitHub repositories and track their issues
- **Issue Browsing**: View issues sorted by date (oldest first)
- **Tag Filtering**: Filter issues by their GitHub labels
- **Bookmarking**: Save interesting issues for later
- **Issue Claiming**: Claim issues you're working on
- **Real-time Chat**: Discuss repositories with other users
- **Real-time Updates**: Get notified of new issues and messages

## Architecture

- **Frontend**: React with Tailwind CSS
- **Backend**: Appwrite (Authentication, Database, Realtime, Functions, Storage)
- **API Integration**: GitHub API via Appwrite Functions
- **State Management**: React Context API + Hooks

## Security Considerations

- GitHub tokens are stored in Appwrite secrets, never in the frontend
- Appwrite Functions use server-side API keys with minimal privileges
- User permissions ensure users can only edit their own bookmarks/claims/messages
- Input validation and sanitization to prevent XSS attacks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
