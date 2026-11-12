const express = require('express');
const cors = require('cors');
const usersApiRoute = require('./controllers/recipesapi.route');

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/recipesapi', recipesApiRoute);

app.listen(9000, () => {
    console.log("Serveur démarré sur http://localhost:9000");
});