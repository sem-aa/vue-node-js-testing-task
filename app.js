const exp = require("constants");
const express = require("express");
const path = require("path");
const { v4 } = require("uuid");
const app = express();

const PORT = process.env.PORT || 3000;

let POINTS = [];

app.use(express.json());

app.get("/api/points", (req, res) => {
  res.status(200).json(POINTS);
});

app.post("/api/points", (req, res) => {
  const { ...coordinate } = req.body;
  let x = Object.keys(coordinate).length - 1;
  let arrDistance = [];
  let distance = null;

  for (i = 0; i < x; i += 1) {
    const lat1 = convertToRadians(Number(coordinate[i].lat));
    const lon1 = convertToRadians(Number(coordinate[i].lng));
    const lat2 = convertToRadians(Number(coordinate[i + 1].lat));
    const lon2 = convertToRadians(Number(coordinate[i + 1].lng));
    const distance = findDistance(lat1, lon1, lat2, lon2);

    arrDistance.push(distance);
  }

  if (arrDistance.length > 1) {
    arrDistance.reduce((a, b) => (distance = a + b));
  } else {
    distance = arrDistance[0];
  }

  const point = {
    ...coordinate,
    id: v4(),
    distance,
  };
  POINTS.push(point);
  res.status(201).json(point);
});

app.delete("/api/points/:id", (req, res) => {
  POINTS = POINTS.filter((point) => point.id !== req.params.id);
  res.status(200).json({ message: "Point delete" });
});

app.use(express.static(path.resolve(__dirname,  "client")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname,  "client", "index.html"));
});

app.listen(PORT, () => console.log(`server has been started on ${PORT}`));

// преобразовывает градусы в радианы
function convertToRadians(coordinate) {
  const radian = coordinate * (Math.PI / 180);
  return radian;
}

// рассчтитывает дистанцию между координатами
function findDistance(lat1, lon1, lat2, lon2) {
  // Радиус земли
  const R = 6372.795;

  const distance =
    R *
    Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    );
  return Math.round(distance);
}
