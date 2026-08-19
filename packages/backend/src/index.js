const app = require('./app');

const PORT = process.env.PORT || 3001;

// Server startup log - intentional for operational visibility
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
