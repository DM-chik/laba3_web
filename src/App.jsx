import FeedbackForm from "./components/FeedbackForm";
import "./App.css";

function App() {
    return (
        <div className="app">
            <h1 className="app__title">Форма обратной связи</h1>
            <p className="app__subtitle">
                Поля проверяются на лету, а ошибки появляются только после того,
                как вы покинули поле.
            </p>
            <FeedbackForm />
        </div>
    );
}

export default App;
