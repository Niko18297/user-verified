const catchError = require('../utils/catchError');
const { getAllServices, createServices, getOneServices, deleteServices, updateServices } = require('../services/user.services');
const EmailCode = require('../models/EmailCode');
const User = require('../models/User');

const getAll = catchError(async (req, res) => {
  const results = await getAllServices();
  return res.json(results);
});

const create = catchError(async (req, res, next) => {
  const result = await createServices({ ...req.body, password: req.hashPassword });

  req.result = result
  next()

});

const getOne = catchError(async (req, res, next) => {
  const { id } = req.params;
  const result = await getOneServices(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await deleteServices(id)
  if (!result) return res.sendStatus(404);
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { id } = req.params;

  const fieldToDelete = ['password', 'email', 'isVerified']

  fieldToDelete.forEach(field => {
    delete req.body[field]
  })

  const result = await updateServices(req.body, id)
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});


const login = catchError(async (req, res) => {
  const user = req.userlogged
  const token = req.token
  return res.json({ user, token })
})


const logged = catchError(async (req, res) => {
  const user = req.user
  return res.json(user)
})

const userVerified = catchError(async (req, res) => {
  const { code } = req.params

  const result = await EmailCode.findOne({ where: { code } })
  const user = await User.findByPk(result.userId)
  if (!user) return res.sendStatus(404)

  const userUpdate = await user.update({ isVerified: true })
  await result.destroy()

  return res.json(userUpdate)
})

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  logged,
  userVerified
}