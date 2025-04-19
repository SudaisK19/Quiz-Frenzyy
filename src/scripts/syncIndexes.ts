// scripts/syncIndexes.js
import { connect } from "../dbConfig/dbConfig";  // Adjust the path to your dbConfig file
import AnswerNew from "../models/answerModel";        // Adjust the path to your Answer model
import PlayerQuizNew from "../models/playerQuizModel";  // Adjust the path to your PlayerQuiz model
import QuestionNews from "../models/questionModel";    // Adjust the path to your Question model
import Quiz from "../models/quizModel";                    // Adjust the path to your Quiz model
import Session from "../models/sessionModel";              // Adjust the path to your Session model
import UserNew from "../models/userModel";              // Adjust the path to your User model

async function syncAllIndexes() {
  try {
    // Establish the database connection
    await connect();
    
    // Synchronize indexes for all models in parallel
    await Promise.all([
      AnswerNew.syncIndexes(),
      PlayerQuizNew.syncIndexes(),
      QuestionNews.syncIndexes(),
      Quiz.syncIndexes(),
      Session.syncIndexes(),
      UserNew.syncIndexes(),
    ]);
    
    console.log("Indexes synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing indexes:", error);
    process.exit(1);
  }
}

syncAllIndexes();
