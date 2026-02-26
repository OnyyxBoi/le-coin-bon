import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ message: 'OK' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(3000, () => {
  console.log('Backend listening on port 3000');
});