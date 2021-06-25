import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface Form {
  name: string;
}

const AnonLogin: FC = () => {
  const { register, handleSubmit } = useForm<Form>({
    shouldFocusError: true,
  });

  const submitHandler: SubmitHandler<Form> = (data, e) => {
    console.log(data);
    e?.target.reset();
  };

  return (
    <main>
      <form onSubmit={handleSubmit(submitHandler)}>
        <input type="text" placeholder="Name" {...register("name")} />
        <button>Anon</button>
      </form>
    </main>
  );
};

export default AnonLogin;
