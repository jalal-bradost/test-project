const {Survey, SurveyResponse} = require("../../models");
const {Op} = require("sequelize");

const createSurvey = async (req, res) => {
    try {
        const {elements, name, description} = req.body;
        const userId = req.user.userId;
        const survey = await Survey.create({
            userId,
            name,
            description,
            elements
        });
        res.status(201).json({message: "Survey created successfully.", surveyId: survey.surveyId});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};


const updateSurvey = async (req, res) => {
    try {
        const {surveyId} = req.params;
        const {
            elements,
            name,
            description,
        } = req.body;
        const survey = await Survey.findByPk(surveyId);
        if (!survey) {
            res.status(404).json({message: "Survey not found."})
            return;
        }
        survey.name = name;
        survey.description = description;
        survey.elements = elements;
        await survey.save();
        res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

const deleteSurvey = async (req, res) => {
    try {
        const {surveyId} = req.params;
        const userId = req.user.userId;
        const survey = await Survey.findByPk(surveyId);
        if (!survey) {
            res.status(404).json({message: "Survey not found."})
            return;
        }
        await survey.destroy();
        res.status(200).json({message: "Survey deleted successfully."});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
}

const submitSurvey = async (req, res) => {
    try {
        const {surveyId} = req.params;
        const {responses, location} = req.body;
        const survey = await Survey.findByPk(surveyId);
        if (!survey) {
            res.status(404).json({message: "Survey not found."})
            return;
        }
        if (Date.now() > survey.deadline) {
            res.status(400).json({message: "Deadline has passed"});
            return;
        }
        const alreadySubmitted = await SurveyResponse.findOne({
            where: {
                surveyId: surveyId,
                userId: req.user.userId,
            }
        });
        if (alreadySubmitted) {
            res.status(400).json({message: "You have already submitted this form"});
        }
        const validate = compareForms(survey, responses)
        if (validate) {
            res.status(400).json({message: "Invalid form data", validate});
            return;
        }
        const surveyResponse = await SurveyResponse.create({
            surveyId: surveyId,
            userId: req.user.userId,
            responses,
        });
        res.status(200).json({message: "Survey form has been submitted successfully.", form: surveyResponse});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};


const compareForms = (survey, responses) => {
    for (const element of survey.elements) {
        const name = element.name;
        const response = responses.find(ans => ans.name === name);
        if (element.condition) {
            const targetResponse = responses.find(ans => ans.name === element.visibleIfName);
            if (targetResponse?.response !== element.visibleIfValue) {
                continue;
            }
        }
        if ((!response || response?.response === "") && element.isRequired) {
            return `Field ${name} is empty`;
        }
        const value = response.response;
        if (element.choices?.length < 0 && !element.choices.includes(value)) {
            return `Field ${name} has invalid choice`;
        }
        if (element.type === "rating" && isNaN(Number(value))) {
            return `Field ${name} has has a NaN response`;
        }
    }
    return null;
}


const retrieveSurvey = async (req, res) => {
    try {
        const {surveyId} = req.params;
        const survey = await Survey.findByPk(surveyId, {
            include: [
                {
                    model: SurveyResponse,
                    as: "responses",
                }]
        });
        if (!survey) {
            res.status(404).json({message: "Survey not found."})
            return;
        }
        res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

const retrieveSurveyStats = async (req, res) => {
    try {
        const {surveyId} = req.params;
        const userId = req.user?.userId;

        const survey = await Survey.findByPk(surveyId);
        if (!survey) {
            res.status(404).json({message: "Survey not found."});
            return;
        }
        const stats = {};

        // Calculate stats for each form element
        for (const element of survey.elements) {
            const name = element.name;
            const type = element.type;
            const title = element.title;

            if (type === "text") {
                stats[name] = {
                    title: title,
                    type: "text",
                    responses: survey.responses.map((response) =>
                        response.responses.find((item) => item.name === name)?.response
                    ),
                };
            } else if (type === "checkbox" || type === "dropdown" || type === "tagbox") {
                const choices = element.choices;
                const choiceStats = {};

                choices.forEach((choice) => {
                    choiceStats[choice] = 0;
                });

                survey.responses.forEach((response) => {
                    const selectedChoice = response.responses.find(
                        (item) => item.name === name
                    )?.response;
                    if (selectedChoice) {
                        choiceStats[selectedChoice]++;
                    }
                });

                stats[name] = {
                    title: title,
                    type: type,
                    choices: choiceStats,
                };
            } else if (type === "rating") {
                const ratingStats = {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                };

                survey.responses.forEach((response) => {
                    const rating = response.responses.find(
                        (item) => item.name === name
                    )?.response;
                    if (rating) {
                        ratingStats[rating]++;
                    }
                });

                stats[name] = {
                    title: title,
                    type: "rating",
                    ratings: ratingStats,
                };
            }
        }
        res.status(200).json(stats);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

const retrieveAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.findAll({
            include: [
                {
                    model: SurveyResponse,
                    as: "responses",
                }]
        });
        res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

const retrieveSelfSurveys = async (req, res) => {
    try {
        const departmentId = req.user.employee.departmentId;
        const surveys = await Survey.findAll({
            where: {
                departmentId: {
                    [Op.in]: [departmentId, null]
                },
            },
            include: [
                {
                    model: SurveyResponse,
                    as: "responses",
                    where: {
                        userId: req.user.userId
                    }
                }]
        });
        res.status(200).json(surveys);
    } catch
        (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

module.exports = {
    createSurvey,
    updateSurvey,
    deleteSurvey,
    submitSurvey,
    retrieveSurvey,
    retrieveSurveyStats,
    retrieveAllSurveys,
    retrieveSelfSurveys
};