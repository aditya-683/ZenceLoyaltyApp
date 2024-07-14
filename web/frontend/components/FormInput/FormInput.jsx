import { useState } from "react";
import styles from "../styles/FormInputPage.module.css";

export function FormInput(props) {
  const [focused, setFocused] = useState(false);
  const { elementType, label, errorMessage, onChange,value, id, ...inputProps } =
    props;

  const handleFocus = (e) => {
    setFocused(true);
  };

  return (
    elementType === "input" && (
      <div className={styles.formInput}>
        <label className={styles.lb}>{label}</label>
        <input
          className={styles.inpt}
          {...inputProps}
          onChange={onChange}
          onBlur={handleFocus}
          value={value}
          onFocus={() =>
            inputProps.name === "confirmPassword" && setFocused(true)
          }
          focused={focused.toString()}
        />
        <span className={styles.mySpan}>{errorMessage}</span>
      </div>
    )
  );
}

// export default FormInput;
