Deployed link:
codykletter.me
Project Description:
My project is a social media app (“DALI Social”) to help DALI members connect with one another, learn about each other’s interests, find out similarities (in location, hobbies, roles, etc.), and post about what each other are up to. You can find fellow members by name or role, share project updates and like others, look at DALI member hometowns on a map, and see recommended connections with other members that are similar to you.
Video demo:
https://www.loom.com/share/c41e8e795c664536b3156a9d1a8cf2a9
Setup instructions for running locally:
Backend commands:
cd server
npm install
npm run seed  # Loads initial member data
npm run dev   # Starts server on port 4000
Frontend commands:
cd client
npm install
npm run dev   # Starts React app on port 5173
Learning Journey
As an aspiring entrepreneur, I figured that having a background in full-stack development would serve me well. I decided to tackle the DALI Social Media Challenge, because the general requirements were somewhat defined but still had flexibility, like many DALI projects will be as a full-stack engineer. The features of the social media app will allow DALI members to get to know one another better, update each other on projects, and find out which members live near them. I think especially when the Lab has so many members, finding out these similarities will really help the lab connect and form stronger bonds.
I learned so many new technologies in building this project. I had never worked with Node.js, Express, Heroku, Netlify, I had barely worked in MongoDB, and also learning HTML, JavaScript, and CSS were all really interesting. I enjoyed auditing the CS52 class through cs52.me and learning how to truly build websites and software from the backend all the way to the frontend and deployment.
Technical Rationale
I decided to use the MERN data structure, as well as Heroku and Netlify deployment because the DALI website said that these are the frameworks and stacks that are used in the lab. I used a REST API for the backend, as the assignment suggested, creating a clear separation between the UI and the backend data management needed.
I have the following endpoints:
Members - handles retrieving member profiles, filtering by role, and calculating “similar” members using a custom scoring algorithm
Posts - Creates a social feed with GET POST and DELETE operations and a specific PUT operation to toggle likes
Stats - Collects data for visualizations (not necessarily in UI), returning counts for roles, majors, class-years, and home-states
When researching REST APIs, I learned that while this structure is helpful for abstracting the UI and backend, it leads to multiple separate network requests for different elements of the UI, which can lead to “over-fetching” or “under-fetching.” Still, I thought this tradeoff was worthwhile.
The most technical bug was being able to plot user home cities and states on a map based off their profile data using an existing dataset and not APIs like google maps. I did this by having a script to load my large dataset of uscities into a Map, then cleaning strings and removing spaces to normalize the input data to successfully lookup latitude and longitude in a O(1) manner. However, I knew that many cities would not be in my dataset, and I coded a fallback strategy of latitude and longitude for given states, so that users would still be plotted in their state (if not their city) on the DALI map.
AI Usage
I actually tinkered with a variety of AI tools in building this project to see which workflow was most optimal. In VSCode, I used Microsoft Copilot with Claude, and I also used CodeX both in the IDE and through the website. I also tried using ChatGPT externally by copy-pasting code back and forth occasionally. Beforehand, I looked at the DALI regulations on AI, and I made sure that it was acceptable as long as AI was cited, which I did. 
For example, I would give a prompt to have Claude (or another AI) generate a functional UI with different panels, a landing page, etc. However, I wanted to make sure that the UI matched DALI’s colors, so I manually added these colors into the CSS styling pages so that it would stay consisted with DALI’s general color layout. I decided that Copilot and CodeX were my favorite AI tools, as they were integrated into the IDE and were the most efficient.

Overall, I really enjoyed learning all about full-stack development and deployment and I am excited to share my finished project with you all!
