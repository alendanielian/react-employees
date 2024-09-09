const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (userId, secret) => {
  return jwt.sign({ id: userId }, secret, { expiresIn: "30m" });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Пожалуйста, заполните обязательные поля" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const isPasswordCorrect =
      user && (await bcrypt.compare(password, user.password));

    const secret = process.env.JWT_SECRET;

    if (user && isPasswordCorrect && secret) {
      const token = generateToken(user.id, secret);

      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        token,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Неверно введен логин или пароль" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ошибка сервера", error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Пожалуйста, заполните обязательные поля" });
    }

    const registered = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (registered) {
      return res
        .status(400)
        .json({ message: "Пользователь с такиме email уже существует" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const secret = process.env.JWT_SECRET;

    if (user && secret) {
      const token = generateToken(user.id, secret);

      res.status(201).json({
        id: user.id,
        email: user.email,
        name,
        token,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Не удалось создать пользователя" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ошибка сервера", error: error.message });
  }
};

const current = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ошибка сервера", error: error.message });
  }
};

module.exports = {
  login,
  register,
  current,
};
