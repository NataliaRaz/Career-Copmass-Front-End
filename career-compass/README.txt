Career Compass

📌 Description

Career Compass is a web application designed to help students and career changers explore career paths and gain hands-on insight through shadowing sessions with professionals.

With Career Compass, users can:

Explore career opportunities posted by mentors.

Bookmark roles and shadowing sessions for later.

Schedule and manage shadow sessions with mentors.

Personalize their profile with skills, interests, and preferences.

Hosts (mentors) can post opportunities and manage session schedules.

The goal is to make career exploration more accessible and interactive, bridging the gap between curiosity and real-world experience.

⚙️ Dependencies

This project is built with a modern full-stack setup:

Frontend

React + TypeScript

Tailwind CSS v4 (styling)

Vite (build tool)

Backend / Database

Supabase (Authentication, Database, Row Level Security)

PostgreSQL (via Supabase)


🚀 Setup Instructions

Follow these steps to run the project locally:

Clone the repository

git clone https://github.com/NataliaRaz/Career-Copmass-Front-End
cd career-compass


Install dependencies

npm install


Environment variables
Create a .env file in the root of the project and add your Supabase keys:

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key


Run the development server

npm run dev


The app should now be running on http://localhost:5173.