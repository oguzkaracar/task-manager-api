const app = require('./app')

require('dotenv').config()
const port = process.env.PORT


// Sunucuyu dinle...
app.listen(port, () => console.log("Server is up on port: " + port));

