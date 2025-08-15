📌 Project Name

Career Compass


📝 Overview

Career Compass is a platform that helps users explore career paths and book shadowing sessions with professionals.
It connects learners with industry mentors, allowing them to:
Browse and filter opportunities
Bookmark sessions for later
Schedule shadowing experiences directly through the app

🛠 Tech Stack

Frontend: React, TypeScript, Tailwind CSS (v4)
Backend: Supabase (Auth, Database, Edge Functions)
Database: PostgreSQL (via Supabase)
Other Tools: EmailJS for notifications, Vite for build tooling

⚙️ Installation & Setup
1. Clone the repository

git clone https://github.com/your-username/career-compass.git
cd career-compass

2. Install dependencies

npm install

3. Create environment variables
Create a .env file in the root folder and add:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_key

4. Start the development server

npm run dev

🚀 Usage
Sign Up / Log In – Create an account to unlock features.
Explore Opportunities – Browse by role, location, and format.
Bookmark – Save interesting sessions for later.
Schedule – Book a shadowing session with a mentor.
