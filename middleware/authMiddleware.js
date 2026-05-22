const jwt = require("jsonwebtoken");



function verifyToken(req, res, next) {
    console.log("HEADERS:", req.headers); // 🔥 add this

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send("Access token is missing");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secretkey");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token access denied" });
    }
}

module.exports = verifyToken;