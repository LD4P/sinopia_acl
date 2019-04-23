module.exports = {
  testUser: process.env.COGNITO_ADMIN_USER || 'sinopia-devs_client-tester',
  // override the default value for testing
  adminUsers: [
    'sinopia-devs_client-tester',
    'ndushay',
  ]
}
