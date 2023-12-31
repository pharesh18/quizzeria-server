const { quizzes, questions, users } = require('../library/schema.js');

// const addQuiz = async (req, res) => {
//     let body = {
//         user_id: req.headers._id,
//         category: req.body.category,
//         difficulty: req.body.difficulty,
//         type: req.body.type,
//         score: req.body.score,
//         total_questions: req.body.total_questions,
//         quiz: req.body.quiz,
//     }
//     console.log(body);

//     let quizData = new quizzes(body);
//     return await quizData.save().then(async (result) => {
//         console.log(result);
//         res.send({ error: false, message: 'success', data: result });
//     }).catch((err) => {
//         console.log(err);
//         res.send({ err: true, message: 'something_broken' });
//     });
// };

const addQuiz = async (req, res) => {
    let body = {
        user_id: req.headers._id,
        category: req.body.category,
        difficulty: req.body.difficulty,
        type: req.body.type,
        score: req.body.score,
        total_questions: req.body.total_questions,
        quiz: req.body.quiz,
    }

    let quizData = new quizzes(body);
    return await quizData.save().then(async (result) => {
        let fullQuiz = [];
        let singleQuiz = [];
        if (result) {
            for (var j = 0; j < body?.quiz?.length; j++) {
                let quizResponse = await questions.find({ _id: body?.quiz[j]?.que_id });
                let data = {
                    que_id: quizResponse[0]?._id,
                    // category: quizResponse[0]?.category,
                    correct_answer: quizResponse[0]?.correct_answer,
                    // difficulty: quizResponse[0]?.difficulty,
                    question: quizResponse[0]?.question,
                    // type: quizResponse[0]?.type,
                    choices: [...quizResponse[0]?.choices],
                    user_answer: body?.quiz[j]?.user_answer,
                }
                singleQuiz.push(data);
            }
            fullQuiz.push({
                quiz_id: result?._id,
                category: result?.category,
                difficulty: result?.difficulty,
                type: result?.type,
                score: result?.score,
                total_questions: result?.total_questions,
                quiz: singleQuiz
            });
        }
        console.log(fullQuiz);
        res.send({ error: false, message: 'success', data: fullQuiz });
    }).catch((err) => {
        console.log(err);
        res.send({ err: true, message: 'something_broken' });
    });
};

const getQuizzes = async (req, res) => {
    var allQuiz = [];
    return await quizzes.find({ user_id: req.headers._id }).then(async (result) => {
        if (result?.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var singleQuiz = [];
                for (var j = 0; j < result[i]?.quiz?.length; j++) {
                    let quizData = await questions.find({ _id: result[i]?.quiz[j]?.que_id });
                    let body = {
                        que_id: quizData[0]?._id,
                        // category: quizData[0]?.category,
                        correct_answer: quizData[0]?.correct_answer,
                        // difficulty: quizData[0]?.difficulty,
                        question: quizData[0]?.question,
                        // type: quizData[0]?.type,
                        choices: [...quizData[0]?.choices],
                        user_answer: result[i]?.quiz[j]?.user_answer,
                    }
                    singleQuiz.push(body);
                }
                allQuiz.push({
                    quiz_id: result[i]?._id,
                    category: result[i]?.category,
                    difficulty: result[i]?.difficulty,
                    type: result[i]?.type,
                    score: result[i]?.score,
                    total_questions: result[i]?.total_questions,
                    quiz: singleQuiz
                });
            }
        }
        res.send({ error: false, message: 'success', data: allQuiz });
        // res.send({ error: false, message: 'success', data: allQuiz });
    }).catch((err) => {
        console.log(err);
        res.send({ err: true, message: 'something_broken' });
    });
};

// quizzes.aggregate([
//     {
//         $match: {
//             category: category,
//             type: type,
//         }
//     },
//     {
//         $sort: {
//             score: -1
//         }
//     },
//     {
//         $group: {
//             _id: {
//                 category: "$category",
//                 difficulty: "$difficulty"
//             },
//             maxScoreDocument: { $first: "$$ROOT" }
//         }
//     },
//     {
//         $replaceRoot: {
//             newRoot: "$maxScoreDocument"
//         }
//     }
// ]

// const getLeaderboardData = async (req, res) => {
//     const { category, difficulty, type } = req.body;
//     var returnData = [];
//     if (difficulty === "All") {
//         const difficultyArr = ['easy', 'medium', 'hard'];
//         for (var i = 0; i < difficultyArr.length; i++) {
//             quizzes.find({ category: category, difficulty: difficultyArr[i], type: type }).sort({ score: -1 }).limit(1).then(async (res) => {
//                 if (res) {
//                     const userData = await users.find({ _id: res[0]?.user_id });
//                     const data = {
//                         _id: res[0]?._id,
//                         user_id: userData[0]?._id,
//                         fname: userData[0]?.fname,
//                         lname: userData[0]?.lname,
//                         email: userData[0]?.email,
//                         category: res[0]?.category,
//                         difficulty: res[0]?.difficulty,
//                         type: res[0]?.type,
//                         score: res[0]?.score,
//                         total_questions: res[0]?.total_questions,
//                     }
//                     returnData.push(data);
//                 }
//             }).catch(err => {
//                 res.send({ error: true, message: err.message });
//             });
//         }
//         res.send({ error: false, message: 'success', data: returnData });
//     } else {
//         return await quizzes.find({ category: category, difficulty: difficulty, type: type }).sort({ score: -1 }).limit(1).then(data => {
//             // delete data._doc['quiz'];
//             // console.log(data);
//             res.send({ error: false, data: data });
//         }).catch(err => {
//             res.send({ error: true, message: err.message });
//         })
//     }
// };

const getLeaderboardData = async (req, res) => {
    const { category, difficulty, type } = req.body;
    var returnData = [];

    if (difficulty === "All") {
        const difficultyArr = ['easy', 'medium', 'hard'];
        const promises = [];

        for (const diff of difficultyArr) {
            try {
                const highestMarks = await quizzes.find({ category, difficulty: diff, type }).sort({ score: -1 }).limit(1);

                if (highestMarks?.length > 0) {
                    const resArray = await quizzes.find({ category, difficulty: diff, type, score: highestMarks[0]?.score });

                    if (resArray.length > 0) {
                        const userData = await users.find({ _id: resArray[0]?.user_id });
                        const data = {
                            _id: resArray[0]?._id,
                            user_id: userData[0]?._id,
                            fname: userData[0]?.fname,
                            lname: userData[0]?.lname,
                            email: userData[0]?.email,
                            category: resArray[0]?.category,
                            difficulty: resArray[0]?.difficulty,
                            type: resArray[0]?.type,
                            score: resArray[0]?.score,
                            total_questions: resArray[0]?.total_questions,
                        };
                        returnData.push(data);
                    }
                }
            } catch (err) {
                throw err;
            }
        }

        try {
            res.send({ error: false, message: 'success', data: returnData });
        } catch (err) {
            res.send({ error: true, message: err.message });
        }
    } else {
        try {
            const highestMarks = await quizzes.find({ category, difficulty, type }).sort({ score: -1 }).limit(1);

            if (highestMarks.length > 0) {
                const data = await quizzes.find({ category, difficulty, type, score: highestMarks[0]?.score });
                const userData = [];

                for (const quiz of data) {
                    const user = await users.find({ _id: quiz.user_id });
                    userData.push({
                        _id: quiz._id,
                        user_id: user[0]?._id,
                        fname: user[0]?.fname,
                        lname: user[0]?.lname,
                        email: user[0]?.email,
                        category: quiz.category,
                        difficulty: quiz.difficulty,
                        type: quiz.type,
                        score: quiz.score,
                        total_questions: quiz.total_questions,
                    });
                }

                res.send({ error: false, data: userData });
            } else {
                res.send({ error: false, data: [] });
            }
        } catch (err) {
            res.send({ error: true, message: err.message });
        }
    }
};


// const getLeaderboardData = async (req, res) => {
//     const { category, difficulty, type } = req.body;
//     var returnData = [];

//     if (difficulty === "All") {
//         const difficultyArr = ['easy', 'medium', 'hard'];
//         const promises = difficultyArr.map(async (diff) => {
//             try {
//                 const highestMarks = await quizzes.find({ category, difficulty: diff, type }).sort({ score: -1 }).limit(1);
//                 if (highestMarks?.length > 0) {
//                     const resArray = await quizzes.find({ category, difficulty: diff, type, score: highestMarks[0]?.score });
//                     if (resArray.length > 0) {
//                         const userData = await users.find({ _id: resArray[0]?.user_id });
//                         const data = {
//                             _id: resArray[0]?._id,
//                             user_id: userData[0]?._id,
//                             fname: userData[0]?.fname,
//                             lname: userData[0]?.lname,
//                             email: userData[0]?.email,
//                             category: resArray[0]?.category,
//                             difficulty: resArray[0]?.difficulty,
//                             type: resArray[0]?.type,
//                             score: resArray[0]?.score,
//                             total_questions: resArray[0]?.total_questions,
//                         };
//                         return data;
//                     }
//                 }
//             } catch (err) {
//                 throw err;
//             }
//         });

//         try {
//             returnData = await Promise.all(promises);
//             res.send({ error: false, message: 'success', data: returnData });
//         } catch (err) {
//             res.send({ error: true, message: err.message });
//         }
//     } else {
//         try {
//             const highestMarks = await quizzes.find({ category, difficulty, type }).sort({ score: -1 }).limit(1);

//             if (highestMarks.length > 0) {
//                 const data = await quizzes.find({ category, difficulty, type, score: highestMarks[0]?.score });

//                 const userDataPromises = data.map(async (quiz) => {
//                     const userData = await users.find({ _id: quiz.user_id });
//                     return {
//                         _id: quiz._id,
//                         user_id: userData[0]?._id,
//                         fname: userData[0]?.fname,
//                         lname: userData[0]?.lname,
//                         email: userData[0]?.email,
//                         category: quiz.category,
//                         difficulty: quiz.difficulty,
//                         type: quiz.type,
//                         score: quiz.score,
//                         total_questions: quiz.total_questions,
//                     };
//                 });

//                 const userData = await Promise.all(userDataPromises);

//                 res.send({ error: false, data: userData });
//             } else {
//                 res.send({ error: false, data: [] });
//             }
//         } catch (err) {
//             res.send({ error: true, message: err.message });
//         }
//     }

//  else {
//     try {
//         // const data = await quizzes.find({ category, difficulty, type }).sort({ score: -1 }).limit(1);
//         const highestMarks = await quizzes.find({ category, difficulty, type }).sort({ score: -1 }).limit(1);
//         await quizzes.find({ category, difficulty, type, score: highestMarks[0]?.score }).then(async (data) => {
//             if (data) {
//                 for (var i = 0; i < data.length; i++) {
//                     const userData = await users.find({ _id: data[0]?.user_id });
//                     const returnArray = {
//                         _id: data[0]?._id,
//                         user_id: userData[0]?._id,
//                         fname: userData[0]?.fname,
//                         lname: userData[0]?.lname,
//                         email: userData[0]?.email,
//                         category: data[0]?.category,
//                         difficulty: data[0]?.difficulty,
//                         type: data[0]?.type,
//                         score: data[0]?.score,
//                         total_questions: data[0]?.total_questions,
//                     };
//                     console.log(returnArray);
//                     returnData.push(returnArray);
//                 }
//             }
//             res.send({ error: false, returnData });
//         });

//     } catch (err) {
//         res.send({ error: true, message: err.message });
//     }
// }
// };



module.exports = { addQuiz, getQuizzes, getLeaderboardData };