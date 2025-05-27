# QuizFrenzy

**AI-Powered Web Quiz Platform**

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/quizfrenzy/ci.yml?branch=main)](https://github.com/your-org/quizfrenzy/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/your-org/quizfrenzy)](https://coveralls.io/github/your-org/quizfrenzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

* [Live Demo & Source Code](#live-demo--source-code)  
* [Description](#description)  
* [Features](#features)  
* [Tech Stack & Languages](#tech-stack--languages)  
* [Installation](#installation)  
* [Usage](#usage)  
* [Documentation](#documentation)  
* [Demo Video](#demo-video)  
* [Team](#team)  
* [License](#license)  

---

## Live Demo & Source Code

- **Live Demo:** https://quizfrenzy.vercel.app  
- **Source Code:** https://github.com/your-org/quizfrenzy  

---

## Description

QuizFrenzy is a dynamic, AI-driven web quiz platform built using Next.js, Tailwind CSS, MongoDB Atlas, and deployed on Vercel. Developed as our Software Engineering capstone at FAST-NUCES Karachi, it features guided user tours, a dedicated Help Center & Q&A page, custom error pages, theme consistency, real-time leaderboards, and gamified rewards.

---

## Features

- **AI-Generated Quizzes** via ChatGPT-4 API  
- **Custom Quiz Builder**: MCQs, short-answer, ranking & image-based questions  
- **Real-Time Leaderboards** with WebSocket updates  
- **Scoring & Answer Review** to uphold academic integrity  
- **Gamification**: points, badges & rewards  
- **Avatars**: Dicebear-powered customizable profiles  
- **Caching & Rate Limiting**: Redis-backed (<100 ms loads) + API guardrails  
- **Responsive UI**: Tailwind CSS for mobile & desktop  
- **Onboarding & Help Center**: Intro.js guided tours + Q&A page  
- **Custom Error Pages** (404, 500, etc.) for a polished UX  
- **Testing & DevOps**:  
  - Jest unit & integration tests (100 % coverage)  
  - Dockerized services + GitHub Actions CI/CD  
- **Deployment**: Vercel frontend & MongoDB Atlas + Redis backend  

---

## Tech Stack & Languages

- **Languages:** JavaScript (ES2021+), TypeScript (where applicable)  
- **Frontend:** Next.js, React, Tailwind CSS  
- **Backend:** Next.js API routes (Node.js)  
- **Database:** MongoDB Atlas  
- **Cache & Rate Limit:** Redis  
- **CI/CD & Containerization:** GitHub Actions, Docker  
- **Hosting:** Vercel  

---

## Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/quizfrenzy.git
   cd quizfrenzy
2. **Install dependencies**
   npm install

3.cp .env.example .env
  then edit .env with your credentials:
  MONGODB_URI=your-atlas-uri
  REDIS_URL=redis://localhost:6379
  NEXT_PUBLIC_CHATGPT_API_KEY=your-chatgpt-key


## Documentation
**Full project documentation, including SRS and SDS, can be found here:**



## Demo Video

A video demonstration of Smart Qwirkle :

Click on the picture to view demo

[![Demo Video](demo-thumbnail.jpg)](https://drive.google.com/drive/u/1/folders/1rkESXQEvq4FB7XOKJJN-vcRN4YvsS2Qv)



---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
