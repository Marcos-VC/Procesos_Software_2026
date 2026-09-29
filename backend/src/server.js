import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Healthy Life E6 backend escuchando en http://localhost:${port}`);
});
