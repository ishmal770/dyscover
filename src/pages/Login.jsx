// Onboarding login slide. There's no real auth backend - submitting the
// form (with any or no input) just advances to the next slide. The explorer
// name, if typed, becomes the name on the child's account.
import { useRef } from "react";
import GuideBubble from "../components/GuideBubble";
import { useProgress } from "../context/ProgressContext";
import "./Login.css";

function Login({ onNext }) {
  const { setName } = useProgress();
  const nameRef = useRef(null);

  const proceed = () => {
    setName(nameRef.current?.value || "");
    onNext();
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // stop the browser's native form submit/reload
    proceed();
  };

  return (
    <section className="page login">
      <h1 className="login__heading">Log In</h1>
      <form className="login__card" onSubmit={handleSubmit}>
        <h2>Welcome Explorer!</h2>
        <label className="login__field">
          Explorer Name
          <input type="text" placeholder="Enter your name" ref={nameRef} maxLength={16} />
        </label>
        <label className="login__field">
          Secret Code
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="submit" className="btn btn--primary btn--block">
          Log In
        </button>
        {/* No real accounts exist yet, so this just continues into the app
            like Log In does - it's no longer a dead click either way. */}
        <button type="button" className="btn btn--outline btn--block" onClick={proceed}>
          Create Account
        </button>
      </form>
      <GuideBubble
        fixedCharacter="sloth"
        instructions="Type your explorer name and your secret code. Then tap Log In. If you are new, tap Create Account."
        message="Tell me your explorer name and secret code, then tap Log In. New here? Tap Create Account!"
      />
    </section>
  );
}

export default Login;
