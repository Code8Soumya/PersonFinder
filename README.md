# Find Person Application

This is a full-stack web application that allows users to add information about individuals, including their photos, and then find these individuals by uploading a photo for matching. The application uses Node.js, Express, EJS for templating, MySQL for database storage, Google Vertex AI for image embedding, and Pinecone for vector similarity search.

## Features

-   **Add Person**: Users can add a new person with details like name, email, gender, age, and a photo.
-   **Find Person**: Users can upload a photo, and the application will search for similar faces in the database.
-   **Image Embedding**: Uses Google Vertex AI to generate embeddings for uploaded photos.
-   **Vector Search**: Uses Pinecone to store and search for similar image embeddings.

## Project Structure

```
.
├── .env.example        # Example environment variables
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── app.js              # Main application file (Express server setup)
├── commands.txt        # Useful CLI commands
├── database.sql        # SQL schema for the database
├── package-lock.json   # Records the exact versions of dependencies
├── package.json        # Project metadata and dependencies
├── README.md           # This file
├── config/
│   └── database.js     # Database connection configuration (MySQL)
├── controllers/
│   └── personController.js # Handles business logic for person-related operations
├── middleware/
│   └── uploadMiddleware.js # Multer configuration for file uploads
├── models/
│   ├── person.js       # Database model for 'person' table
│   └── photo.js        # Database model for 'photo' table
├── public/
│   ├── css/
│   │   └── style.css   # Custom CSS styles
│   └── scripts/
│       └── index.js    # Frontend JavaScript for DOM manipulation and API calls
├── routes/
│   └── personRoutes.js # Defines API routes for person-related actions
├── services/
│   ├── googleEmbedding.js # Service for generating image embeddings via Google Vertex AI
│   └── pineconeService.js # Service for interacting with Pinecone (upserting and querying embeddings)
├── utils/
│   └── path.js         # Utility for resolving project root directory
└── views/
    ├── index.ejs       # Main page template
    └── layouts/
        ├── end.ejs     # Closing HTML tags and script includes
        ├── head.ejs    # HTML head section (metadata, CSS links)
        └── nav.ejs     # Navigation bar template
```

## Prerequisites

-   Node.js (v18.x or later recommended)
-   npm (Node Package Manager)
-   MySQL Server
-   Access to Google Cloud Platform (for Vertex AI)
-   Access to Pinecone (for vector database)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd find-person
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the database:**

    -   Ensure your MySQL server is running.
    -   Create a database (e.g., `persondb`).
    -   Execute the `database.sql` script to create the necessary tables:
        ```sql
        -- Example using MySQL CLI:
        -- mysql -u your_mysql_user -p your_database_name < database.sql
        ```

4.  **Configure Environment Variables:**

    -   Create a `.env` file in the root directory by copying `.env.example`.
    -   Fill in the required values:

        ```env
        PORT=3000

        # Database Configuration
        DB_HOST=
        DB_PORT=
        DB_USER=
        DB_PASSWORD=
        DB_NAME=

        # Google Cloud Vertex AI Configuration
        GOOGLE_PROJECT_ID=
        GOOGLE_PROJECT_LOCATION= # e.g., us-central1

        # Pinecone Configuration
        PINECONE_API_KEY=
        PINECONE_INDEX_NAME=
        ```

    -   **Important**: For Google Cloud, ensure you have authenticated your environment. This might involve setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key JSON file.

5.  **Start the application:**
    ```bash
    npm start
    ```
    Or for development with automatic restarts:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## API Endpoints

-   `POST /person/add`: Adds a new person.
    -   **Request Body**: `multipart/form-data`
        -   `name` (String)
        -   `email` (String)
        -   `gender` (String)
        -   `age` (Number)
        -   `photo` (File) - Single image file.
    -   **Response**: JSON object with success message.
-   `POST /person/find`: Finds a person by photo.
    -   **Request Body**: `multipart/form-data`
        -   `photo` (File) - Single image file to search with.
    -   **Response**: JSON object with matching person details and similarity scores.

## Key Technologies

-   **Backend**: Node.js, Express.js
-   **Frontend**: EJS (Embedded JavaScript templates), Tailwind CSS, Vanilla JavaScript
-   **Database**: MySQL
-   **Image Embedding**: Google Cloud Vertex AI (Multimodal Embedding API)
-   **Vector Database**: Pinecone
-   **File Uploads**: Multer

## How It Works

1.  **Adding a Person**:

    -   The user fills out a form with person details and uploads a photo.
    -   The backend receives the data.
    -   The person's details are saved to the MySQL `person` table.
    -   The uploaded photo is saved as a BLOB in the MySQL `photo` table, linked to the person.
    -   The photo is sent to Google Vertex AI to generate a numerical embedding (a vector representing the image's features).
    -   This embedding, along with the `photo_id`, is upserted into a Pinecone index.

2.  **Finding a Person**:
    -   The user uploads a photo they want to use for searching.
    -   The backend receives the photo.
    -   The uploaded photo is sent to Google Vertex AI to generate its embedding.
    -   This new embedding is used to query the Pinecone index. Pinecone returns the IDs of the most similar photo embeddings already stored.
    -   The application retrieves the `photo_id`(s) from Pinecone.
    -   Using these `photo_id`(s), the application looks up the corresponding `person_id` from the `photo` table in MySQL.
    -   Finally, it retrieves the full details of the matched person(s) from the `person` table and displays them to the user along with the original photo and similarity score.

## Logging

The application includes console logging at various stages of request processing, database interactions, and external service calls (Google Vertex AI, Pinecone). This helps in debugging and monitoring the application's flow. Log messages are prefixed with the filename (e.g., `[personController.js]`) for easier identification of the log source.
