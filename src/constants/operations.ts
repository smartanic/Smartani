export const OperationStatus = {
    success: 1,
    
    //repo
    repoError: -1,
    repoErrorModelNotFound: -4,
    repoErrorModelExist: -10,
    
    cloudStorageError: -2,
    cloudMessagingError: -3,

    unauthorizedAccess: -5,
    fieldValidationError: -6,
    sendEmailError: -7,

    //auth
    authInvalidCredential: -8,
    authServiceError: -9,
    authUnverified: -14,

    //signUp
    signUpErrorInvalidData: -11,
    verificationCodeInvalid: -12,

    //jwt
    jwtGenerateError: -13,

    //edge server
    addDeviceError: -18,
    updateDeviceError: -180,
    generateEdgeDeviceConfigError: -181,
    deviceRestartError: -182,
    deviceStartError: -183,
    deleteDeviceError: -184,
    invitationCodeInvalid: -185,
    invitationCodeExpired: -186,

    //mqtt
    mqttPublishError: -19,
    mqttSubscribeError: -20,

    //notification
    invalidEdgeToken: -122,

    //
    invalidDateRange: -133
}
