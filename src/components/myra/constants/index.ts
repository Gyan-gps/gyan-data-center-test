export const firebaseErrorMessages: Record<string, string> = {
  // General Errors
  'auth/internal-error': 'An internal error occurred; please try again later.',
  'auth/network-request-failed':
    'A network error (such as timeout, interrupted connection, or unreachable host) has occurred. Please check your internet connection.',
  'auth/invalid-argument':
    'An invalid argument was provided to an Authentication method. Please check the provided data.',
  'auth/invalid-api-key':
    'Your API key is invalid. Please ensure your Firebase project configuration is correct.',
  'auth/too-many-requests':
    'Access to this account has been temporarily disabled due to many failed login attempts. You can restore it by resetting your password or try again later.',
  'auth/operation-not-allowed':
    'This operation is not allowed. You may need to enable the specific authentication provider in your Firebase project settings (e.g., Email/Password, Google).',
  'auth/project-not-found':
    'No Firebase project was found for the credential used to initialize the Admin SDKs.',
  'auth/unauthorized-domain':
    "The domain of your application is not authorized to perform this operation. Please add your domain to the Firebase Console's authorized domains list.",
  'auth/user-token-expired':
    'Your user token has expired. Please sign in again.', // Similar to id-token-expired but for older contexts

  // Popup/Redirect Specific Errors (Web SDK)
  'auth/popup-closed-by-user':
    'The authentication popup was closed by the user before the operation could be finalized.',
  'auth/popup-blocked':
    'The authentication popup was blocked by the browser. Please allow popups for this site.',
  'auth/cancelled-popup-request':
    'This authentication operation was cancelled because another conflicting popup request was already in progress.',
  'auth/auth-domain-config-required':
    'The authDomain configuration parameter is required.',
  'auth/operation-not-supported-in-this-environment':
    'This operation is not supported in the environment this application is running on. "location.protocol" must be http or https.',

  // Email/Password Specific Errors
  'auth/invalid-email': 'The email address is badly formatted or invalid.',
  'auth/wrong-password':
    'The password is invalid or the user does not have a password set.',
  'auth/user-not-found':
    'There is no user record corresponding to this identifier. The user may have been deleted.',
  'auth/email-already-in-use':
    'The email address is already in use by another account.',
  'auth/weak-password':
    'The password provided is too weak. Please choose a stronger password (at least 6 characters).',
  'auth/user-disabled':
    'The user account has been disabled by an administrator.',

  // Credential-based/Linking Errors (e.g., Google, Facebook, Phone, Reauthentication)
  'auth/invalid-credential':
    'The provided credential is malformed, has expired, or is invalid.',
  'auth/account-exists-with-different-credential':
    'An account already exists with the same email address but different sign-in credentials. Please sign in using the other provider.',
  'auth/requires-recent-login':
    'This sensitive operation requires recent authentication. Please sign in again before retrying this request.',
  'auth/credential-already-in-use':
    'The provided credential has already been linked to another Firebase user account.',
  'auth/provider-already-linked':
    'This account is already linked to the specified provider.',
  'auth/user-mismatch':
    'The credential provided does not correspond to the currently signed-in user.',

  // Phone Authentication Specific Errors
  'auth/invalid-phone-number':
    'The phone number provided is invalid. Please use a valid E.164 format.',
  'auth/missing-phone-number':
    'A phone number must be provided for phone authentication.',
  'auth/invalid-verification-code':
    'The SMS verification code is invalid or has expired.',
  'auth/missing-verification-code': 'A verification code must be provided.',
  'auth/invalid-verification-id': 'The verification ID used is invalid.',
  'auth/missing-verification-id': 'A verification ID must be provided.',
  'auth/code-expired': 'The SMS code has expired. Please request a new one.',
  'auth/quota-exceeded':
    'The SMS sending quota for this project has been exceeded.',
  'auth/captcha-check-failed':
    'The reCAPTCHA response token is invalid, expired, or the domain is not whitelisted.',
  'auth/phone-number-already-exists':
    'This phone number is already in use by another account.',

  // Custom Token Errors
  'auth/invalid-custom-token':
    'The custom token format is incorrect or invalid.',
  'auth/custom-token-mismatch':
    'The custom token is for a different Firebase App or project.',

  // Email Action Link Errors (e.g., password reset, email verification, email link sign-in)
  'auth/expired-action-code':
    'The action code (e.g., password reset link) has expired.',
  'auth/invalid-action-code':
    'The action code is invalid. This can happen if the code is malformed, has already been used, or has expired.',
  'auth/invalid-message-payload':
    'The message payload provided for the email action is invalid.',
  'auth/missing-continue-uri':
    'A valid continue URL must be provided in the request.',
  'auth/invalid-continue-uri': 'The provided continue URL is invalid.',
  'auth/unauthorized-continue-uri':
    'The domain of the continue URL is not whitelisted in the Firebase console.',

  // Admin SDK Specific Errors (when performing backend operations)
  'auth/uid-already-exists':
    'The provided UID is already in use by an existing user.',
  'auth/email-already-exists':
    'The provided email is already in use by an existing user.', // Duplicated for clarity, as it can occur in both client and admin contexts
  'auth/invalid-uid':
    'The provided UID is invalid. It must be a non-empty string with at most 128 characters.',
  'auth/invalid-display-name':
    'The provided display name is invalid. It must be a non-empty string.',
  'auth/invalid-photo-url':
    'The provided photo URL is invalid. It must be a string URL.',
  'auth/invalid-password-hash': 'The password hash provided is invalid.',
  'auth/invalid-password-salt': 'The password salt provided is invalid.',
  'auth/invalid-hash-algorithm':
    'The hash algorithm specified is not supported.',
  'auth/invalid-hash-block-size': 'The hash block size is invalid.',
  'auth/invalid-hash-derived-key-length':
    'The hash derived key length is invalid.',
  'auth/invalid-hash-key': 'The hash key must a valid byte buffer.',
  'auth/invalid-hash-memory-cost':
    'The hash memory cost must be a valid number.',
  'auth/invalid-hash-parallelization':
    'The hash parallelization parameter is invalid.',
  'auth/invalid-hash-rounds': 'The hash rounds value is invalid.',
  'auth/invalid-hash-salt-separator':
    'The hashing algorithm salt separator field must be a valid byte buffer.',
  'auth/invalid-id-token':
    'The provided ID token is not a valid Firebase ID token.',
  'auth/invalid-last-sign-in-time':
    'The last sign-in time for the user record is invalid. It must be a valid UTC date string.',
  'auth/invalid-email-verified':
    'The "emailVerified" value must be true or false.',
  'auth/invalid-disabled-field':
    'The "disabled" value for the user property is invalid. It must be a boolean.',
  'auth/invalid-provider-data':
    'The providerData must be a valid array of UserInfo objects.',
  'auth/invalid-provider-id':
    'The providerId must be a valid supported provider identifier string.',
  'auth/invalid-oauth-responsetype':
    'Only exactly one OAuth responseType should be set to true.',
  'auth/invalid-session-cookie-duration':
    'The session cookie duration must be a valid number in milliseconds between 5 minutes and 2 weeks.',
  'auth/invalid-user-import': 'The user record to import is invalid.',
  'auth/maximum-user-count-exceeded':
    'The maximum allowed number of users to import has been exceeded.',
  'auth/missing-hash-algorithm':
    'The hashing algorithm is missing for password-hashed user imports.',
  'auth/reserved-claims':
    'One or more custom user claims provided to setCustomUserClaims() are reserved. For example, OIDC specific claims should not be used.',
  'auth/invalid-claims': 'One or more custom claims are invalid.',
  'auth/claims-too-large':
    'The custom claims payload exceeds the maximum allowed size of 1000 bytes.',
  'auth/invalid-page-token':
    'The provided next page token in listUsers() is invalid. It must be a valid non-empty string.',
  'auth/missing-ios-bundle-id':
    'An iOS bundle ID is required for dynamic links or certain email actions.',
  'auth/missing-android-pkg-name':
    'An Android Package Name must be provided if the Android App is required to be installed.',
  'auth/missing-oauth-client-secret':
    'The OAuth configuration client secret is required to enable OIDC code flow.',
  'auth/missing-uid': 'A UID identifier is required for the current operation.',

  // Multi-factor Authentication (MFA) Specific Errors
  'auth/multi-factor-auth-required':
    'Multi-factor authentication is required to complete sign-in.',
  'auth/multi-factor-info-not-found':
    'The user does not have a second factor matching the identifier provided.',
  'auth/missing-multi-factor-info': 'No second factor identifier was provided.',
  'auth/invalid-multi-factor-session':
    'The request does not contain valid proof of successful first factor sign-in.',
  'auth/missing-multi-factor-session':
    'The request is missing proof of first factor successful sign-in.',
  'auth/second-factor-already-in-use':
    'The second factor is already enrolled on this account.',
  'auth/maximum-second-factor-count-exceeded':
    'The maximum allowed number of second factors on a user has been exceeded.',
  'auth/unsupported-first-factor':
    'Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.',
  'auth/email-change-needs-verification':
    'Multi-factor users must always have a verified email when changing their email address.'
}
