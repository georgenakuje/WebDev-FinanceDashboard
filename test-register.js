import { registerUser } from './server/models/Models.js'

const email = 'test@example.com'
const password = 'test123'

console.log('Attempting to register test user...')
registerUser(email, password, (err) => {
    if (err) {
        console.error('Registration failed:', err)
    } else {
        console.log('Registration successful')
    }
    process.exit()
}) 