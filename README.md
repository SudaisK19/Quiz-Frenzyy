# QuizFrenzy

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/quizfrenzy/ci.yml?branch=main)](https://github.com/your-org/quizfrenzy/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/your-org/quizfrenzy)](https://coveralls.io/github/your-org/quizfrenzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **QuizFrenzy**  
> A dynamic, AI-powered web quiz platform built with Next.js, Tailwind CSS, MongoDB Atlas, and deployed on Vercel.  
> Developed as part of our Software Engineering course at FAST-NUCES Karachi by a three-person team—myself alongside Azka Sahar Shaikh and Sumaiya Waheed.  

---

## 📑 Table of Contents

1. [Introduction](#introduction)  
2. [Demo & Video Guide](#demo--video-guide)  
3. [Features](#features)  
4. [Tech Stack](#tech-stack)  
5. [Architecture](#architecture)  
6. [Getting Started](#getting-started)  
   1. [Prerequisites](#prerequisites)  
   2. [Installation](#installation)  
   3. [Configuration](#configuration)  
   4. [Running Locally](#running-locally)  
7. [Testing](#testing)  
8. [Deployment](#deployment)  
9. [Updating the Demo Video](#updating-the-demo-video)  
10. [Contributing](#contributing)  
11. [License](#license)  
12. [Contact](#contact)  

---

## 📝 Introduction

QuizFrenzy is our capstone project for the Software Engineering course at FAST-NUCES Karachi. It leverages the ChatGPT-4 API for AI-generated quizzes, supports multiple question types (MCQs, short answer, ranking, images), and delivers real-time leaderboards, points, and badges to gamify learning. Best practices—guided onboarding tours, a Help Center/Q&A page, custom error pages, theme consistency, Jest testing, and CI/CD—are baked in for a polished, production-ready experience.

---

## 🎬 Demo & Video Guide

[![Watch the Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtu.be/YOUR_VIDEO_ID)  
_Click the thumbnail above or visit https://youtu.be/YOUR_VIDEO_ID to watch a 2-minute walkthrough._

**How to Update the Demo Video**  
1. Record your new walkthrough with Loom, OBS, etc.  
2. Upload to YouTube as Public or Unlisted.  
3. Copy the new `VIDEO_ID` from the share link (`youtu.be/VIDEO_ID`).  
4. Replace `YOUR_VIDEO_ID` in this README’s Demo section.  
5. Commit & push to GitHub—your README will update automatically.

---

## ✨ Features

- **AI-Generated Quizzes** via ChatGPT-4 API  
- **Custom Quiz Builder**: MCQs, short-answer, ranking & image-based questions  
- **Real-Time Leaderboards** with WebSocket updates  
- **Scoring & Answer Review** to uphold academic integrity  
- **Gamification**: points, badges 🏅 & rewards  
- **Avatars**: Dicebear-powered customizable profiles 🧑‍🎨  
- **Caching & Rate Limiting**: Redis-backed (<100 ms loads) + API guardrails  
- **Responsive UI** with Tailwind CSS for mobile & desktop  
- **Onboarding & Help Center**: Intro.js guided tours + Q&A page  
- **Custom Error Pages** (404, 500, etc.) for a polished UX  
- **Testing & DevOps**  
  - Jest unit & integration tests (100% coverage)  
  - Dockerized services + GitHub Actions CI/CD  
- **Deployment**: Vercel frontend & MongoDB Atlas backend  

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS  
- **Backend**: Next.js API routes, Node.js  
- **Database**: MongoDB Atlas  
- **Caching & Rate Limiting**: Redis  
- **CI/CD**: GitHub Actions, Docker  
- **Hosting**: Vercel  

---

## 🏗️ Architecture

```text
[Browser] ↔ Next.js (SSR/CSR) ↔ API Routes ↔ MongoDB Atlas
                            ↕
                          Redis (Cache & Rate Limit)
