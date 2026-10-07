import express from "express";

const app = express();
const port = 3000;

app.get("/", (_request, response) => {
  response.json({
    message: "Capy-Happy-Family API is running!",
  });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
