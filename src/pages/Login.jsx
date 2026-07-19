import "./Login.css";

function Login({ onNext }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <section className="page login">
      <h1 className="login__heading">Log In</h1>
      <form className="login__card" onSubmit={handleSubmit}>
        <h2>Welcome Explorer!</h2>
        <label className="login__field">
          Explorer Name
          <input type="text" placeholder="Enter your name" />
        </label>
        <label className="login__field">
          Secret Code
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="submit" className="btn btn--primary btn--block">
          Log In
        </button>
        <button type="button" className="btn btn--outline btn--block">
          Create Account
        </button>
      </form>
    </section>
  );
}

export default Login;
