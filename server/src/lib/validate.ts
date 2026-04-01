import joi from "joi";

function validateRegister(data: {
  email: string;
  name: string;
  password: string;
}) {
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().lowercase().trim().required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
}

function validateLogin(data: { email: string; password: string }) {
  const schema = joi.object({
    email: joi.string().email().lowercase().trim().required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
}

export { validateRegister, validateLogin };
