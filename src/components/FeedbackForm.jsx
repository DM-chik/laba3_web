import { useState } from "react";
import "./FeedbackForm.css";

const MAX_MESSAGE_LENGTH = 500;

/**
 * Приводит ввод к маске +7 (XXX) XXX-XX-XX.
 * Все нецифровые символы отбрасываются, поэтому маску нельзя «сломать».
 */
function formatPhone(value) {
    let digits = value.replace(/\D/g, "");

    if (!digits) return "";

    // 8XXXXXXXXXX → 7XXXXXXXXXX
    if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
    // Если пользователь начал с 9XX..., считаем, что код страны — 7
    if (!digits.startsWith("7")) digits = `7${digits}`;

    digits = digits.slice(0, 11);
    const rest = digits.slice(1);

    let result = "+7";
    if (rest.length > 0) result += ` (${rest.slice(0, 3)}`;
    if (rest.length >= 3) result += ")";
    if (rest.length > 3) result += ` ${rest.slice(3, 6)}`;
    if (rest.length > 6) result += `-${rest.slice(6, 8)}`;
    if (rest.length > 8) result += `-${rest.slice(8, 10)}`;

    return result;
}

function FeedbackForm() {
    // --- Состояние значений полей ---
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    // Чекбокс «Хочу получить ответ» делает email обязательным
    const [wantReply, setWantReply] = useState(true);

    // --- Ошибки валидации: null, если ошибки нет ---
    const [errors, setErrors] = useState({
        name: null,
        email: null,
        phone: null,
        message: null,
    });

    // --- «Тронутые» поля: ошибки показываем только после blur ---
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phone: false,
        message: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // --- Функции валидации ---
    const validateName = (value) => {
        if (!value.trim()) return "Имя обязательно для заполнения";
        if (value.trim().length < 2) return "Минимум 2 символа";
        if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()))
            return "Только буквы, пробелы и дефис";
        return null;
    };

    const validateEmail = (value, required) => {
        if (!value.trim()) {
            return required ? "Email обязателен для получения ответа" : null;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
            return "Некорректный формат email";
        return null;
    };

    const validatePhone = (value) => {
        if (!value.trim()) return "Телефон обязателен для заполнения";
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 11)
            return "Введите номер полностью: +7 (XXX) XXX-XX-XX";
        return null;
    };

    const validateMessage = (value) => {
        if (!value.trim()) return "Сообщение обязательно для заполнения";
        if (value.trim().length < 10) return "Минимум 10 символов";
        if (value.length > MAX_MESSAGE_LENGTH)
            return `Максимум ${MAX_MESSAGE_LENGTH} символов`;
        return null;
    };

    // Валидаторы, зависящие от текущих настроек формы
    const validators = {
        name: validateName,
        email: (value) => validateEmail(value, wantReply),
        phone: validatePhone,
        message: validateMessage,
    };

    const values = { name, email, phone, message };

    // --- Обработчик изменения поля ---
    const handleChange = (field, rawValue) => {
        const value = field === "phone" ? formatPhone(rawValue) : rawValue;

        switch (field) {
            case "name":
                setName(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "phone":
                setPhone(value);
                break;
            case "message":
                setMessage(value);
                break;
            default:
                break;
        }

        // Если поле уже тронуто — валидируем на лету
        if (touched[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: validators[field](value),
            }));
        }
    };

    // --- Обработчик потери фокуса ---
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors((prev) => ({
            ...prev,
            [field]: validators[field](values[field]),
        }));
    };

    // --- Переключатель «Хочу получить ответ» ---
    const handleReplyToggle = (checked) => {
        setWantReply(checked);
        // Если email уже показывал ошибку — пересчитываем её по новому правилу
        if (touched.email) {
            setErrors((prev) => ({
                ...prev,
                email: validateEmail(email, checked),
            }));
        }
    };

    // --- Отправка формы ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            name: validateName(name),
            email: validateEmail(email, wantReply),
            phone: validatePhone(phone),
            message: validateMessage(message),
        };

        setErrors(newErrors);
        setTouched({ name: true, email: true, phone: true, message: true });

        if (Object.values(newErrors).some((err) => err !== null)) {
            return;
        }

        setIsSubmitting(true);

        // Имитация сетевого запроса
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    // --- Динамические классы поля ---
    const getInputClass = (field) => {
        const classes = ["field__input"];

        if (touched[field] && errors[field]) {
            classes.push("field__input--error");
        } else if (
            touched[field] &&
            !errors[field] &&
            values[field].trim() !== ""
        ) {
            classes.push("field__input--valid");
        }

        if (field === "message") classes.push("field__input--textarea");

        return classes.join(" ");
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setWantReply(true);
        setErrors({ name: null, email: null, phone: null, message: null });
        setTouched({
            name: false,
            email: false,
            phone: false,
            message: false,
        });
        setSubmitted(false);
    };

    // --- Экран успеха ---
    if (submitted) {
        return (
            <div className="feedback-form feedback-form--success">
                <div className="feedback-form__icon" aria-hidden="true">
                    ✓
                </div>
                <h2 className="feedback-form__title">Спасибо за обращение!</h2>
                <p className="feedback-form__text">
                    {wantReply
                        ? "Мы свяжемся с вами в ближайшее время."
                        : "Ваше сообщение отправлено."}
                </p>
                <button
                    type="button"
                    className="feedback-form__submit"
                    onClick={resetForm}
                >
                    Отправить ещё одно сообщение
                </button>
            </div>
        );
    }

    return (
        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
                <label htmlFor="name" className="field__label">
                    Имя
                </label>
                <input
                    id="name"
                    type="text"
                    className={getInputClass("name")}
                    value={name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Как к вам обращаться"
                />
                {touched.name && errors.name && (
                    <span className="field__error">{errors.name}</span>
                )}
            </div>

            <div className="field">
                <label htmlFor="email" className="field__label">
                    Email
                    {!wantReply && (
                        <span className="field__optional">
                            {" "}
                            — необязательно
                        </span>
                    )}
                </label>
                <input
                    id="email"
                    type="email"
                    className={getInputClass("email")}
                    value={email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                    <span className="field__error">{errors.email}</span>
                )}
            </div>

            <div className="field">
                <label htmlFor="phone" className="field__label">
                    Телефон
                </label>
                <input
                    id="phone"
                    type="tel"
                    className={getInputClass("phone")}
                    value={phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="+7 (___) ___-__-__"
                    inputMode="tel"
                />
                {touched.phone && errors.phone && (
                    <span className="field__error">{errors.phone}</span>
                )}
            </div>

            <div className="field">
                <label htmlFor="message" className="field__label">
                    Сообщение
                </label>
                <textarea
                    id="message"
                    className={getInputClass("message")}
                    value={message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    onBlur={() => handleBlur("message")}
                    rows={5}
                    maxLength={MAX_MESSAGE_LENGTH}
                />
                <div className="field__meta">
                    {touched.message && errors.message ? (
                        <span className="field__error">{errors.message}</span>
                    ) : (
                        <span />
                    )}
                    <span
                        className={
                            message.length > MAX_MESSAGE_LENGTH * 0.9
                                ? "field__counter field__counter--limit"
                                : "field__counter"
                        }
                    >
                        {message.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                </div>
            </div>

            <label className="checkbox">
                <input
                    type="checkbox"
                    checked={wantReply}
                    onChange={(e) => handleReplyToggle(e.target.checked)}
                />
                <span>Хочу получить ответ на email</span>
            </label>

            <button
                type="submit"
                className="feedback-form__submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Отправка…" : "Отправить"}
            </button>
        </form>
    );
}

export default FeedbackForm;
