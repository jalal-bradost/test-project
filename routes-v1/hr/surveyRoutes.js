const {
    surveyCreationValidationRules, surveyModificationValidationRules,
    surveyRetrievalValidationRules
} = require("../../validations/hr/surveyValidations");
const {
    createSurvey,
    retrieveAllSurveys,
    retrieveSurvey,
    updateSurvey,
    submitSurvey,
    retrieveSurveyStats,
    deleteSurvey,
    retrieveSelfSurveys
} = require("../../controllers/hr/surveyController");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const {validate} = require("../../validations/validation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express")

router.post(`/v1/surveys`, requirePermissions([permissionsMap.humanResources]), surveyCreationValidationRules(), validate, createSurvey);
router.put(`/v1/surveys/:surveyId`, requirePermissions([permissionsMap.humanResources]), surveyModificationValidationRules(), validate, updateSurvey);
router.delete(`/v1/surveys/:surveyId`, requirePermissions([permissionsMap.humanResources]), surveyRetrievalValidationRules(), validate, deleteSurvey);
router.get(`/v1/surveys`, requirePermissions([permissionsMap.humanResources]), retrieveAllSurveys);
router.get(`/v1/surveys/:surveyId`, requirePermissions([permissionsMap.humanResources]), surveyRetrievalValidationRules(), validate, retrieveSurvey);
router.post(`/v1/surveys/:surveyId/response`, isAuthenticated, surveyRetrievalValidationRules(), validate, submitSurvey);
router.get(`/v1/surveys/:surveyId/stats`, requirePermissions([permissionsMap.humanResources]), surveyRetrievalValidationRules(), validate, retrieveSurveyStats);
router.get(`/v1/surveys/self`, isAuthenticated, retrieveSelfSurveys);
