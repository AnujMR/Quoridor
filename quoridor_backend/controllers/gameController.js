// Just basic test functions

exports.createGame = (req, res) => {
  res.json({ message: "Create game API working" });
};

exports.getGame = (req, res) => {
  res.json({ message: "Get game API working" });
};

exports.makeMove = (req, res) => {
  res.json({ message: "Move API working" });
};