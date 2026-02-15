import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`Productivity Service running on port ${port}`);
});

export default app;
