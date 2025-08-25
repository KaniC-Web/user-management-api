// If using modules, uncomment and use require instead
// const {isValidEmail} = require('./validation');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTests() {
  try {
    assert(isValidEmail('user@example.com') === true, 'Expected valid email to return true');
    console.log('Test 1 passed: Valid email');

    assert(isValidEmail('not-an-email') === false, 'Expected invalid email to return false');
    console.log('Test 2 passed: Invalid email');

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
