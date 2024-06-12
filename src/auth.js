const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret';

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
    if (err) {
      return res.status(500).send('Error registering user');
    }
    const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ auth: true, token });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).send('Error on the server.');
    }
    if (!user) {
      return res.status(404).send('No user found.');
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ auth: true, token });
  });
});

// Profile setup route
router.post('/profile/setup', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    const { interests, description } = req.body;
    db.run('UPDATE users SET interests = ?, description = ? WHERE id = ?', [interests, description, decoded.id], function(err) {
      if (err) {
        return res.status(500).send('Error updating profile');
      }
      res.status(200).send({ message: 'Profile updated successfully' });
    });
  });
});

module.exports = router;
