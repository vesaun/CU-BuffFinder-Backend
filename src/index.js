const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
