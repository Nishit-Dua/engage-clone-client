import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "../styles/anonLogin.scss";
interface Form {
  email: string;
  name: string;
}

const AnonLogin: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    shouldFocusError: true,
  });

  const submitHandler: SubmitHandler<Form> = (data, e) => {
    console.log(data);
    e?.target.reset();
  };

  return (
    <main id="anon">
      <form onSubmit={handleSubmit(submitHandler)} noValidate>
        <input
          type="text"
          placeholder="Name"
          {...register("name", {
            required: "Enter Your Name!",
          })}
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
        <input
          type="email"
          placeholder="Email"
          {...register("email", {
            required: "Enter Your Email!",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: "Enter a valid e-mail address",
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
        <button>Join In!</button>
      </form>
    </main>
  );
};

export default AnonLogin;
