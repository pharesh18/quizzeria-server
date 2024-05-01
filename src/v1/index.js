const express = require('express');
const { validateSchema, checkAccess } = require('./library/controlAccess.js');
const app = express();

const userRoutes = require('./routes/userRoutes.js');
const questionRoutes = require('./routes/questionRoutes.js');
const quizRoutes = require('./routes/quizRoutes.js');
const { users, quizzes, questions } = require('./library/schema.js');

require('./library/db.js');
app.use(validateSchema);
app.use(checkAccess);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);


// const check = async () => {
//     try {
//         // await questions.updateMany(
//         //     {
//         //       choices: ["False", "True"]
//         //     },
//         //     {
//         //       $set: {
//         //         "choices.$[element]": "True",
//         //         "choices.$[element2]": "False"
//         //       }
//         //     },
//         //     {
//         //       arrayFilters: [
//         //         { "element": "False" },
//         //         { "element2": "True" }
//         //       ]
//         //     }
//         // );
//         // console.log("Documents updated successfully.");
        
//         // If you want to verify the changes, you can uncomment the following code
//         const data = await questions.find({ "choices": ["False", "True"] });
//         console.log(data);
//     } catch (error) {
//         console.error("Error updating documents:", error);
//     }
// }

// check();


module.exports = app;