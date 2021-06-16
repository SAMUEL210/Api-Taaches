const jwt = require("jsonwebtoken");
const utilities = require("../utilities/utilities");
const utilisateurModel = require("../models/utilisateur");

const createToken = (utilisateur) => {
    delete utilisateur.mp;
    const token = jwt.sign({ utilisateur }, utilities.jwt_secret_key, {
        expiresIn: "7d",
    });
    return "Bearer " + token;
};

const checkToken = (req, rep, next) => {
    let token = req.headers["x-access-token"] || req.headers["Authorization"];
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, utilities.jwt_secret_key, (err, decoded) => {
            if (err) {
                rep.send({ error: "TOKEN_PAS_VALIDE" });
            } else {
                req.decoded = decoded;

                const expiresIn = 24 * 60 * 60;
                const newToken = jwt.sign({
                        user: decoded.user,
                    },
                    utilities.jwt_secret_key, {
                        expiresIn: expiresIn,
                    }
                );

                rep.header("Authorization", "Bearer " + newToken);
                next();
            }
        });
    } else {
        rep.send({ error: "PAS DE TOKEN" });
    }
};

module.exports = {
    createToken: createToken,
    checkToken: checkToken,
};